# .eslintrc.json

```json

{
  "extends": "next/core-web-vitals",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/jsx-uses-react": "off", // For React 17+
    "react/react-in-jsx-scope": "off" // For React 17+
  }
}

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

.env.local

```

# .vscode\settings.json

```json
{
  "editor.defaultFormatter": "rvest.vs-code-prettier-eslint",
  "editor.formatOnType": false, // required
  "editor.formatOnPaste": true, // optional
  "editor.formatOnSave": true, // optional
  "editor.formatOnSaveMode": "file", // required to format on save
  "files.autoSave": "onFocusChange", // optional but recommended
  "vs-code-prettier-eslint.prettierLast": false,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "vscode.css-language-features"
  } // set as "true" to run 'prettier' last not first
}

```

# actions\actions.js

```js
"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@lib/aws-config";
import { sendNotifications } from "./pushNotifications";

//CONTACT PAGE - ADD CONTACT
export async function addContact(formData) {
  const { name, email, message } = Object.fromEntries(formData.entries());

  await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;
  revalidatePath("/contact");
}

const dynamic = "force-dynamic";

//WORDPRESS PAGE PROJECT - FETCH WORDPRESS PAGE
export async function fetchWordPressPage(slug) {
  const wpUrl = `https://${
    process.env.NEXT_PUBLIC_WP_URL
  }/${slug}?t=${new Date().getTime()}`; // Cache busting with timestamp

  const response = await fetch(wpUrl, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    console.error("Error fetching WordPress content:", response.status);
    return null;
  }

  const html = await response.text();
  return html;
}

//POST WEBHOOK - HANDLE POST WEBHOOK
export async function handlePostWebhook(formData) {
  //security check
  const secret = formData.get("secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    throw new Error("Unauthorized webhook request");
  }

  //extract of data
  const postData = {
    slug: formData.get("slug"),
    title: formData.get("title"),
    content: formData.get("content"),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${formData.get("slug")}`,
  };

  // Send notifications to all subscribers
  await sendNotifications(postData);

  // Send data to SQS for audio generation
  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(postData),
    });
    await sqsClient.send(command);
    return { success: true, message: "Audio generation queued" };
  } catch (error) {
    console.error("Error queuing message:", error);
    throw error;
  } finally {
    revalidatePath(`/posts/${postData.slug}`);
  }
}

```

# actions\pushNotifications.js

```js
"use server";

import { sql } from "@vercel/postgres";
import webpush, { supportedUrgency } from "web-push";

webpush.setVapidDetails(
  "mailto:martencarlos@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Subscribe user
export async function subscribeUser(subscription) {
  try {
    await sql`
      INSERT INTO push_subscriptions (
        endpoint,
        p256dh,
        auth
      ) VALUES (
        ${subscription.endpoint},
        ${subscription.keys.p256dh},
        ${subscription.keys.auth}
      )
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        p256dh = ${subscription.keys.p256dh},
        auth = ${subscription.keys.auth}
    `;

    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    throw new Error("Failed to subscribe to notifications");
  }
}

// Unsubscribe user
export async function unsubscribeUser(subscription) {
  try {
    await sql`
      DELETE FROM push_subscriptions 
      WHERE endpoint = ${subscription.endpoint}
    `;

    return { success: true };
  } catch (error) {
    console.error("Unsubscription error:", error);
    throw new Error("Failed to unsubscribe from notifications");
  }
}

// Send notification (used in webhook handler)
export async function sendNotifications(postData) {
  try {
    // Get all subscriptions
    const { rows: subscriptions } = await sql`
      SELECT endpoint, p256dh, auth 
      FROM push_subscriptions
    `;

    const notifications = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const payload = JSON.stringify({
          title: `New Post: ${postData.title}`,
          body: postData.content.substring(0, 100) + "...",
          tag: postData.id,
          url: `/posts/${postData.slug}`,
        });

        const options = {
          TTL: 10,
        };

        await webpush.sendNotification(pushSubscription, payload);
      } catch (error) {
        if (error.statusCode === 410) {
          // Remove invalid subscription
          await sql`
            DELETE FROM push_subscriptions 
            WHERE endpoint = ${sub.endpoint}
          `;
        }
        console.error("Error sending notification:", error);
      }
    });

    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error("Error sending notifications:", error);
    throw new Error("Failed to send notifications");
  }
}

export async function sendTestNotification(data) {
  try {
    const { rows: subscriptions } = await sql`
      SELECT endpoint, p256dh, auth 
      FROM push_subscriptions
    `;

    if (subscriptions.length === 0) {
      return {
        success: false,
        error:
          "No subscribed users found. Please subscribe to notifications first.",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL + "/posts";

    const notifications = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const payload = JSON.stringify({
          title: data.title,
          body: data.content,
          url: siteUrl,
          tag: "test-notification",
        });

        const options = {
          TTL: 60,
          urgency: "high",
        };

        await webpush.sendNotification(pushSubscription, payload, options);
      } catch (error) {
        if (error.statusCode === 410) {
          // Remove invalid subscription
          await sql`
            DELETE FROM push_subscriptions 
            WHERE endpoint = ${sub.endpoint}
          `;
        }
        throw error;
      }
    });

    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error("Error sending test notification:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
}

```

# app\(external)\wordpress\[slug]\loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainerFullPage}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(external)\wordpress\[slug]\page.jsx

```jsx
// Import the server action
import { fetchWordPressPage } from "@actions/actions";
import styles from "./page.module.css";

export default async function WordPressPage({ params }) {
  const htmlContent = await fetchWordPressPage(params.slug);

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else {
    // const updatedContent = htmlContent.replace(
    //   /https:\/\/wp\.carlosmarten\.com/g,
    //   `${process.env.HOST}/wordpress`
    // );
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }
}

```

# app\(external)\wordpress\[slug]\page.module.css

```css
.pageContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

```

# app\(external)\wordpress\loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainerFullPage}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(external)\wordpress\page.jsx

```jsx
import styles from "./page.module.css";
import { fetchWordPressPage } from "@actions/actions";
import BackButton from "@components/Article/BackButton/BackButton";

export default async function WordPress() {
  const htmlContent = await fetchWordPressPage("/");

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else {
    // console.log(htmlContent);
    // const updatedContent = htmlContent.replace(
    //   /https:\/\/wp\.carlosmarten\.com/g,
    //   `${process.env.HOST}/wordpress`
    // );
    return (
      <div className={styles.pageContainer}>
        <div className={styles.backbuttonContainer}>
          <BackButton />
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
  }
}

```

# app\(external)\wordpress\page.module.css

```css
.pageContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* min-height: calc(100vh - 178px); */
}

.backbuttonContainer{
    display: flex;
    width: 100%;
    max-width: 800px;
    padding: 20px;
    /* justify-content: center; */
}
```

# app\(official)\(private)\dashboard\contacts\loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainer}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(official)\(private)\dashboard\contacts\page.jsx

```jsx
// components/Dashboard.js

import ContactsList from "components/private/ContactsList/ContactsList";
import styles from "./page.module.css";
import { sql } from "@vercel/postgres";

export const revalidate = 0; // Disable ISR and force fresh data on every request

export default async function Contacts() {
  console.log("Dashboard - Contacts loaded");
  const res = await sql`SELECT * FROM contacts ORDER BY id DESC`;
  const contacts = res.rows;

  return (
    <div className={styles.contactsMain}>
      <h2>List of people who contacted</h2>
      <ContactsList contacts={contacts} />
    </div>
  );
}

```

# app\(official)\(private)\dashboard\contacts\page.module.css

```css
/* AdminPage.module.css */

.contactsMain {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top:40px;
}

.contactsMain h2 {
  margin-bottom: 2rem;
}


```

# app\(official)\(private)\dashboard\layout.js

```js
// app/dashboard/layout.js

import { auth } from "@actions/../auth.js"; // Import the auth middleware
import { redirect } from "next/navigation";

import styles from "./layout.module.css"; // Import your CSS module for layout
import Sidebar from "@components/private/Sidebar/Sidebar"; // Import your Sidebar component

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) redirect("/login");

  return (
    <div className={styles.layout}>
      {session && (
        <div className={styles.fullWidth}>
          <Sidebar />
          <main className={styles.mainContent}>{children}</main>
        </div>
      )}
    </div>
  );
}

```

# app\(official)\(private)\dashboard\layout.module.css

```css
/* app/dashboard/layout.module.css */

.layout {
  display: flex;
  min-height: calc(100vh - 176px) !important;
  justify-content: center;
  align-items: center;

}


.mainContent {
  /* flex: 1; */
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  /* background-color: #f4f4f4; */
}

.fullWidth {
  width: 100%;
  display: flex;

}

.error {
  font-size: 2rem;
  font-weight: bold;
  color: rgb(199, 69, 69)
}

/* Responsive Styles */
@media (max-width: 768px) {

  .fullWidth {
    flex-direction: column;
  }

}
```

# app\(official)\(private)\dashboard\page.jsx

```jsx
// components/Dashboard.js

import styles from "./page.module.css";

export default function Dashboard() {
  console.log("Dashboard loaded");

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
    </div>
  );
}

```

# app\(official)\(private)\dashboard\page.module.css

```css
/* dashboard.module.css */

.dashboard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 178px);
}

.dashboard h1 {
  margin-bottom: 1rem;
}

```

# app\(official)\(private)\dashboard\settings\page.jsx

```jsx
// components/Dashboard.js

import styles from './page.module.css';

const Settings = () => {

  console.log("Dashboard loaded");

  return (
    <div className={styles.settings}>
      <h2>Settings</h2>
    </div>
  );
};

export default Settings;

```

# app\(official)\(private)\dashboard\settings\page.module.css

```css
/* AdminPage.module.css */

.settings {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 176px);

}

.settings h1 {
  margin-bottom: 1rem;
}
```

# app\(official)\(private)\login\page.jsx

```jsx
import SignInButton from "@components/(auth)/signin-button/signin-button.jsx";
import styles from "./page.module.css";

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Please sign in with GitHub to access the dashboard
        </p>
        <SignInButton />
      </div>
    </div>
  );
}

```

# app\(official)\(private)\login\page.module.css

```css
/* admin-login.module.css */
.container {
  min-height: calc(100vh - 176px);
  display: flex;
  align-items: center;
  justify-content: center;
  
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  font-size: 1rem;
  color: #666;
  margin-bottom: 30px;
}

```

# app\(official)\(private)\unauthorized\page.jsx

```jsx
"use client"; // Client-side for App Router

import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function UnauthorizedPage() {
  const router = useRouter();
  const errorMessage = "You are not authorized to sign in.";

  return (
    <div className={styles.container}>
      <h1 className={styles.error}>Access Denied</h1>

      <p>{errorMessage}</p>

      <button className={styles.button} onClick={() => router.push("/login")}>
        {" "}
        Go back to login
      </button>
    </div>
  );
}

```

# app\(official)\(private)\unauthorized\page.module.css

```css
.container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  min-height: calc(100vh - 178px);
}

.button {
  padding: 10px 20px;
  background-color: var(--third-color);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.button:hover {
  background-color: var(--fourth-color);
  transform: translateY(-2px);
}

.error{
  font-size: 2rem;
  font-weight: bold;
  color: rgb(199, 69, 69)
}

```

# app\(official)\about\page.jsx

```jsx
// pages/about.js

"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function About() {
  console.log("About page loaded");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={`${styles.title} ${isVisible ? styles.visible : ""}`}>
        About Me
      </h1>

      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <Image
          src="/images/me.png"
          width={400}
          priority
          height={400}
          alt="Carlos Marten"
          className={styles.profilePic}
        />

        <p>
          Hi, I am Carlos Marten. Welcome to my personal blog! I am a technology
          & business consultant based in Bilbao, Spain. This site is where I
          share my thoughts, projects, and experiences.
        </p>

        <h2>What I Do</h2>

        <ul className={styles.list}>
          <li>Write blog posts about new technologies</li>
          <li>Work on projects related to web/app development</li>
          <li>Share my journey in buisness consulting services</li>
        </ul>
        <br />
        <h2>My Background</h2>
        <p>
          I have 10+ of experience in technolgy & business consulting services.
          My passion for new technologies has led me to start this blog in 2024.
          When I am not writing or providing consulting services, you can find
          me playing tennis or golf.
        </p>

        <p>
          I am an experienced business consultant and project manager with a
          strong background in financial services and digital transformation.
          Currently, I lead the Business Consulting and Functional Processes
          unit at a big and reputed consulting firm, specializing in financial
          services.
        </p>

        <p>
          I hold an Executive MBA from TUM School of Management, and prior to my
          current position, I gained extensive experience at Banco Santander
          group company: PagoNxt, where I managed digitalization projects and
          customer onboarding processes using Salesforce and other technologies.
        </p>

        <p>
          My experience also includes working as a Senior Consultant at
          Deloitte, where I focused on IT transformation and financial product
          implementation. I am fluent in four languages and hold certifications
          in agile methodologies and blockchain technologies.
        </p>

        <div className={styles.cta}>
          <Link href="/blog" className={styles.button}>
            Read My Blog
          </Link>
          <Link href="/projects" className={styles.button}>
            View My Projects
          </Link>
        </div>
      </div>

      <br />
    </div>
  );
}

```

# app\(official)\about\page.module.css

```css
/* About.module.css */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

.title {
  font-size: 2.0rem;
  /* display: flex;
  justify-content: center; */
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.content {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
}

.title.visible,
.content.visible {
  opacity: 1;
  transform: translateY(0);
}

.profilePic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: block;
}

.list {
  list-style-type: none;
  padding: 0;
}

.list li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #007bff;
}

.cta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  
  border: 1px solid rgb(223, 223, 223);
  
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #e9e9e9;
  color: rgb(34, 34, 34);
}

@media (max-width: 600px) {
  .container {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .profilePic {
    width: 100px;
    height: 100px;
  }

  .cta {
    flex-direction: column;
    align-items: center;
  }

  .button {
    width: 100%;
    text-align: center;
  }
}
```

# app\(official)\api\auth\[...nextauth]\route.js

```js
import { handlers } from "@actions/../auth.js"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers;

```

# app\(official)\api\webhook\route.js

```js
import { handlePostWebhook } from "@actions/actions";

export async function POST(request) {
  const formData = await request.formData();

  try {
    await handlePostWebhook(formData);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

```

# app\(official)\blog\page.jsx

```jsx
import styles from "./page.module.css";
import BlogContent from "components/Blog/BlogContent/BlogContent";

import PushNotification from "@components/PushNotification/PushNotification";
import NotificationTest from "@components/NotificationTest/NotificationTest";
// import NotificationSubscriber from "@components/NotificationSubscriber";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

async function getCategories() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

export default async function Blog() {
  console.log("Blog page loaded");

  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div className={styles.blogMain}>
      <div className={styles.blogHeader}>
        <h2 className={styles.blogTitle}>
          Insights on Technology, Consulting, and Digital Transformation.
        </h2>
        {/* <p className={styles.subTitle}>x</p> */}
        <p className={styles.blogDescription}>
          Explore in-depth articles on the latest in IT consulting, cutting-edge
          technologies, and digital strategies that drive business success. From
          Salesforce CRM solutions to operations and management insights, this
          blog offers practical tips, expert analysis, and the latest trends
          shaping the future of the industry.
        </p>
        <PushNotification />
        {/* <NotificationTest />*/}
      </div>
      <BlogContent posts={posts} categories={categories} />
    </div>
  );
}

```

# app\(official)\blog\page.module.css

```css

.blogMain{
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    margin: 0px 10px 0px 10px;
    min-height: calc(100vh - 176px);
}

.blogHeader{
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    justify-content: center;
    line-height: 1.5;
    max-width: 600px;
    gap: 10px;
    margin: 00px 0px;
    padding: 20px;
}

.blogTitle {
  font-size: 24px;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 5px;
  font-weight: bold;
}

.subTitle {
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  margin-top: 0px;
  margin-bottom: 20px;
}

.blogDescription{
    font-size: 16px;
    /* text-align: center; */
    text-align: justify;
    margin-top: 0px;
    margin-bottom: 20px;
}
```

# app\(official)\categories\[slug]\Loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainer}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(official)\categories\[slug]\page.jsx

```jsx
"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Card from "components/Article/PostCard/PostCard";
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
const siteUrl = process.env.NEXT_PUBLIC_WP_URL;

async function getCategories() {
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`);
  return res.json();
}

// Function to get the ID by category name
const getCategoryIdByName = async (categoriesArray, categoryName) => {
  const category = categoriesArray.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category ? category.id : null; // Return ID or null if not found
};

async function getCategoryPosts(categoryId) {
  const res = await fetch(
    `https://${siteUrl}/wp-json/wp/v2/posts?categories=${categoryId}`
  );
  return res.json();
}

export default function Categories({ params }) {
  const category = params.slug;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const categoriesArray = await getCategories();
      const categoryId = await getCategoryIdByName(categoriesArray, category);
      const posts = await getCategoryPosts(categoryId);
      setPosts(posts);
      setLoading(false);
    }
    fetchData();
  }, [category]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className={styles.one_column}>
      <div className={styles.blogHeader}>
        <h1 className={styles.h1}>Category: </h1>
        <h2 className={styles.pill}>{category}</h2>
      </div>
      <ul className={styles.ul}>
        {posts &&
          posts.map((post) => (
            <li className={styles.li} key={post.id}>
              <Card post={post} />
            </li>
          ))}
      </ul>
    </div>
  );
}

```

# app\(official)\categories\[slug]\page.module.css

```css
/* Center the main container */
.one_column {
  display: flex;
  flex-direction: column;
  /* Align items vertically */
  align-items: center;
  padding: 30px 0px;
  /* justify-content: center; */
  min-height: calc(100vh - 178px);
  padding: 2rem;
}

.loadingContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 177px);
}

.blogHeader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0px
}

.pill {
  background-color: var(--third-color);
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 14px;
  color: whitesmoke
}

/* Style for the heading */
.h1 {
  font-size: 2em;
  /* Font size for the heading */

}

/* Style for the unordered list */
.ul {
  list-style-type: none;
  /* Remove default bullet points */
  width: 100%;
  /* Full width of the parent container */
  max-width: 750px;
  /* Optional: limit the max width */
  padding: 0;
  /* Remove default padding */
}

@media (max-width: 768px) {
  .one_column {
    padding: 10px;
  }
}
```

# app\(official)\contact\page.jsx

```jsx
// app/contact/page.js
import ContactForm from "components/Contact/ContactForm/ContactForm";
import styles from "./page.module.css";

export default function ContactPage() {
  console.log("Contact page loaded");
  return (
    <div className={styles.contactPage}>
      <ContactForm />
    </div>
  );
}

```

# app\(official)\contact\page.module.css

```css
.contactPage {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 176px);
}

.container{
max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(131, 131, 131, 0.3);
  border-radius: 8px;
  /* background-color: #ffffff; */
}

.title {
  /* font-size: 2.5rem; */
  margin-bottom: 1rem;
  
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  
  text-align: center;
}

@media screen and (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 0 10px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
```

# app\(official)\error.js

```js
// app/error.js
'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

# app\(official)\layout.js

```js
import Navbar from "@components/Navbar/Navbar";
import Footer from "@components/Footer/Footer";

export default function OfficialLayout({ children }) {
  console.log("official layout loaded");
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

```

# app\(official)\noloading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainer}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(official)\not-found.js

```js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./not-found.module.css";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.notfoundcontainer}>
      <h2>Not Found: {pathname} </h2>
      <p>Could not find requested resource</p>
      <button
        className={styles.allpostsbutton}
        onClick={() => router.push("/blog")}
      >
        View all posts
      </button>
    </div>
  );
}

```

# app\(official)\not-found.module.css

```css
.notfoundcontainer{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 178px);
    width: 100%;
    gap: 20px;
}

.allpostsbutton{
    padding: 10px 20px;
    cursor: pointer;
    background-color: var(--third-color);
    color: white;
    border: none;
    border-radius: 5px;
}
.allpostsbutton:hover{
    background-color: var(--fourth-color);
}
```

# app\(official)\page.js

```js
import styles from "./page.module.css";
import PostList from "components/Article/PostList/PostList";
import Hero from "components/Hero/Hero";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

  try {
    console.log("Home page loaded");
    return (
      <main className={styles.main}>
        <Hero />
        <PostList posts={posts} selectedCategory={null} searchQuery={null} />
      </main>
    );
  } catch (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>Failed to load the blog posts. Please try again later.</p>
      </div>
    );
  }
}

```

# app\(official)\page.module.css

```css
.main{
    display: flex;
    /* justify-content: center; */
    flex-direction: column;
    margin:10px;
    align-items: center;
    min-height: calc(100vh - 192px);
    /* background-color: #f5f5f5; */
}
```

# app\(official)\posts\[slug]\Loading.js

```js
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainer}>
      <LoadingComponent />
    </div>
  );
}

```

# app\(official)\posts\[slug]\not-found.js

```js
// app/not-found.js
import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.message}>
          Oops! The post you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className={styles.button}>
          Return Home
        </Link>
      </div>
    </div>
  );
}


```

# app\(official)\posts\[slug]\not-found.module.css

```css
/* not-found.module.css */

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 180px);
  font-family: "Inter", sans-serif;
}

.content {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(138, 138, 138, 0.5),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 28rem;
  width: 90%;
}

.title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--third-color);
  margin: 0;
  animation: pulse 2s infinite;
}

.subtitle {
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

.message {

  margin-bottom: 2rem;
}

.button {
  display: inline-block;
  background-color: var(--third-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: var(--fourth-color);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 640px) {
  .title {
    font-size: 4rem;
  }

  .subtitle {
    font-size: 1.25rem;
  }
}

```

# app\(official)\posts\[slug]\page.js

```js
// app/posts/[slug]/page.js
import { notFound } from "next/navigation";
import Post from "components/Article/Post/Post";
import styles from "./page.module.css";
import BackButton from "components/Article/BackButton/BackButton";

import { s3Client } from "@lib/aws-config";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function getAudioUrl(postId) {
  try {
    // Check if audio file exists
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `audio/${postId}.mp3`,
    });

    try {
      await s3Client.send(headCommand);
    } catch (error) {
      if (error.name === "NotFound") {
        return null;
      }
      throw error;
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `audio/${postId}.mp3`,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  } catch (error) {
    console.error("Error getting audio URL:", error);
    return null;
  }
}

async function getPost(slug) {
  console.log("fetching post loaded");
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(
    `https://${siteUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch post. Status: ${res.status}`);
  }

  const posts = await res.json();

  if (posts.length === 0) {
    notFound();
  }

  const post = posts[0];

  return {
    title: post.title.rendered,
    content: post.content.rendered,
    author: post._embedded["author"][0].name,
    featuredImage: post._embedded["wp:featuredmedia"]?.[0]?.source_url,
    create_date: new Date(post.date),
    last_modified: new Date(post.modified),
    pinned: post.sticky,
    categories:
      post._embedded?.["wp:term"]?.[0]?.map((category) => category.name) || [],
    tags: post._embedded["wp:term"]
      .flat()
      .filter((term) => term.taxonomy === "post_tag")
      .map((tag) => tag.name),
  };
}

export default async function BlogPost({ params }) {
  console.log("BlogPost loaded");

  const [post, audioUrl] = await Promise.all([
    getPost(params.slug), // Your existing post fetching function
    getAudioUrl(params.slug),
  ]);

  if (!post) {
    <div>Post not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.backbuttonContainer}>
        <BackButton />
      </div>
      <Post post={post} audioUrl={audioUrl} />
    </div>
  );
}

```

# app\(official)\posts\[slug]\page.module.css

```css
.container{
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 180px);
    /* justify-content: center; */
    align-items: center;
}

.backbuttonContainer{
    display: flex;
    width: 100%;
    max-width: 800px;
    padding: 20px;
    /* justify-content: center; */
}


```

# app\(official)\projects\page.jsx

```jsx
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const projects = [
  {
    id: 1,
    name: "Holiday booking project",
    image: "/images/feature_holiday.png",
    url: "https://tadelfia.carlosmarten.com/",
  },
  {
    id: 2,
    name: "E-commerce project",
    image: "/images/feature_webframe.png",
    url: "https://webframe.carlosmarten.com/",
  },
  {
    id: 3,
    name: "Blog project",
    image: "/images/feature_blog.png",
    url: "https://project-blog.carlosmarten.com/",
  },
  {
    id: 4,
    name: "Wordpress pages",
    image:
      "https://rocketmedia.b-cdn.net/wp-content/uploads/2021/11/wordpress-ventajas-banner.png",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/wordpress/`,
  },
];

const ProjectCard = ({ project }) => (
  <Link href={project.url} passHref>
    <div className={styles.projectCard}>
      <Image
        priority
        src={project.image}
        width={200}
        height={200}
        alt={project.name}
        className={styles.projectImage}
      />
      <h2 className={styles.projectName}>{project.name}</h2>
    </div>
  </Link>
);

export default function ProjectsPage() {
  console.log("Projects page loaded");
  return (
    <div className={styles.projectsContainer}>
      <h1 className={styles.pageTitle}>Web Projects</h1>
      <br />
      <h2 className={styles.pageSubTitle}>
        Explore the latest web implementations
      </h2>

      <div className={styles.pageDescription}>
        <p>
          Here, I showcase some of the key projects I have worked on,
          highlighting my experience and skills in web development.
        </p>
        <br />
        <p>
          From a dynamic holiday booking platform to an intuitive e-commerce
          site, and a versatile blog, each project reflects my focus on creating
          functional, user-friendly solutions.
        </p>
        <br />
        <p>
          Explore these projects to see the blend of creativity and technology
          that drives my work.
        </p>
      </div>

      <div className={styles.projectGrid}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <br />
      <br />
    </div>
  );
}

```

# app\(official)\projects\page.module.css

```css
.projectsContainer {
  max-width: 1200px;
  min-height: calc(100vh - 180px);
  margin: 0 auto;
  padding: 2rem;
}

.pageTitle {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 10px;
}
.pageSubTitle{
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.pageDescription{
  /* font-size: 1.25rem; */
  max-width: 700px;
  margin: 20px auto;
}

.projectGrid {
  display: grid;
  margin-top: 60px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.projectCard {
 
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(97, 97, 97, 0.568);
  overflow: hidden;
  transition: transform 0.3s ease-in-out;
}

.projectCard:hover {
  transform: translateY(-5px);
}

.projectImage {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.projectName {
  font-size: 1.25rem;
  padding: 1rem;
  text-align: center;
  color: inherit;
}
```

# app\favicon.ico

This is a binary file of the type: Binary

# app\globals.css

```css
:root {
  --background: #ffffff;
  --background-dark: #1a1a1a;
  --foreground: #171717;

  --first-color: #e8f1fa;
  --second-color: #DBE2EF;
  --third-color: #3F72AF;
  --fourth-color: #112D4E;

  /* sidebar */
  --logout-bg-color: #e63946;
  --logout-hover-color: #d62839;
  --active-link-color: #0070f3;
  --hover-link-color: #0070f3;

  --text-primary: #333333;
  --primary-color: #3F72AF;
  --hover-background: rgba(0, 0, 0, 0.05);
  --hover-background-dark: rgba(255, 255, 255, 0.1);
}



::selection {
  background: rgb(249, 255, 196)
}

.dark ::selection {
  background-color: rgb(61, 66, 12)
}

[class="dark"] {
  --background: #1d1d1d;
  --foreground: #ededed;
}

html {
  overflow-y: scroll;
  -webkit-tap-highlight-color: transparent;
}

html {
  color-scheme: light;
}




html.dark {
  color-scheme: dark;
}


html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Arial, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0px !important;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}


/* Typography Wordpress Post */

ol,
ul {
  padding-left: 20px;
  /* Adjust the value as needed */
}

h3 {
  margin-top: 30px;
  margin-bottom: 10px;
}

p {
  margin-top: 15px;
  margin-bottom: 15px;
}

hr {
  margin: 30px auto;

  border: 0;
  width: 50%;
  border-top: 1px solid var(--foreground);
}

/* Smooth transition for theme changes */
body {
  transition: color 0.3s ease, background-color 0.3s ease;
}
```

# app\layout.js

```js
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@providers/theme-provider";
import "./globals.css";

import { AudioProvider } from "@context/AudioContext";
import GlobalAudioPlayer from "@components/Article/AudioPlayer/GlobalAudioPlayer";

export const metadata = {
  title: "Carlos Marten",
  description: "Technology meets business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  WebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Carlos Marten",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  console.log("RootLayout loaded");
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider>
          <AudioProvider>
            {children}
            <GlobalAudioPlayer />
          </AudioProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

```

# app\manifest.json

```json
{
  "name": "Carlos Marten",
  "short_name": "carlosmarten",
  "description": "Technology meets business",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "any",
  "categories": ["business", "technology"],
  "prefer_related_applications": false,
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "48x48",
      "type": "image/x-icon"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Blog",
      "url": "/blog",
      "icons": [
        {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "related_applications": [],
  "handle_links": "preferred"
}

```

# auth.js

```js
import NextAuth from "next-auth";
import Github from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Github],
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // restricted to admin users
      const allowedEmail = process.env.AUTH_ADMIN_EMAIL;

      if (user.email === allowedEmail) {
        return true; // Allow sign-in
      }
      return "/unauthorized"; // Reject all other users
    },
  },
});

```

# components\(auth)\signin-button\signin-button.jsx

```jsx
"use client";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import styles from "./signin-button.module.css";

export default function SignInButton() {
  return (
    <button
      className={styles.signinbutton}
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
    >
      <FaGithub className={styles.icon} /> {/* GitHub Icon */}
      Sign In with GitHub
    </button>
  );
}

```

# components\(auth)\signin-button\signin-button.module.css

```css
/* signin-button.module.css */
.signinbutton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #24292e; /* GitHub black */
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.signinbutton:hover {
  background-color: #333;
}

.icon {
  margin-right: 8px; /* Space between the icon and text */
  font-size: 1.5rem;
}

```

# components\(auth)\signout-button\signout-button.jsx

```jsx
"use client"; // This is a client component
import { signOut } from "next-auth/react";
import styles from "@components/private/Sidebar/sidebar.module.css";

export default function SignOutButton() {
  return (
    <button
      className={styles.logout}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </button>
  );
}

```

# components\(aux)\LoadingComponent\LoadingComponent.jsx

```jsx
import styles from "./loadingcomponent.module.css";


export default function LoadingComponent() {
  console.log("Loading component loaded");
  return (
    <div className={styles.loader}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );
}

```

# components\(aux)\LoadingComponent\loadingcomponent.module.css

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    background-color: var(--third-color);
  }
  50% {
    transform: translateY(-15px);
    background-color: var(--second-color);
  }
}

.loadingContainer{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 178px);
}

.loadingContainerFullPage{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.loader {
  display: flex;
  justify-content: center;
  margin: 40px;
}

.dot {
  width: 12px;
  height: 12px;
  margin: 0 5px;
  border-radius: 50%;
  background-color: var(--first-color);
  animation: bounce 0.6s infinite alternate;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

```

# components\(aux)\SkeletonLoader\SkeletonLoader.jsx

```jsx
// SkeletonLoader.js
"use client";
import styles from "./SkeletonLoader.module.css"; // Adjust the path as needed
import { useTheme } from "next-themes";

const SkeletonLoader = () => {
  console.log("SkeletonLoader loaded");
  const { resolvedTheme } = useTheme();
  return (
    <div
      className={`${styles.skeletonContainer} ${
        resolvedTheme === "dark" ? styles.darkMode : styles.lightMode
      }`}
    ></div>
  );
};

export default SkeletonLoader;

```

# components\(aux)\SkeletonLoader\SkeletonLoader.module.css

```css
/* SkeletonLoader.module.css */
.skeletonContainer {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  max-width: 700px;
  width: 90vw;
  height: 150px;
  padding: 20px;
  margin: 10px auto;
  border-radius: 4px;
}

/* .lightMode {
  background-color: #f0f0f0;
  color: #333;
} */
.lightMode.skeletonContainer {
  animation: pulseLight 1.5s infinite ease-in-out;
}

/* .darkMode {
  background-color: #333;
  color: #f0f0f0;
} */
.darkMode.skeletonContainer {
  animation: pulseDark 1.5s infinite ease-in-out;
}

/* .skeletonTitle {
  height: 20px;
  width: 80%;
  background-color: #e0e0e0;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeletonExcerpt {
  height: 16px;
  width: 100%;
  background-color: #e0e0e0;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeletonImage {
  height: 200px;
  background-color: #e0e0e0;
  border-radius: 4px;
} */

@keyframes pulseLight {
  0% {
    background-color: #e0e0e0;
  }
  50% {
    background-color: #d0d0d0;
  }
  100% {
    background-color: #e0e0e0;
  }
}

@keyframes pulseDark {
  0% {
    background-color: #333;
  }
  50% {
    background-color: #444;
  }
  100% {
    background-color: #333;
  }
}

```

# components\Article\AudioPlayer\AudioPlayer.jsx

```jsx
"use client";

import { FaHeadphones } from "react-icons/fa";
import { useAudio } from "@context/AudioContext";
import styles from "./AudioPlayer.module.css";

const AudioPlayer = ({ audioUrl }) => {
  const { audioState, startPlaying, stopPlaying } = useAudio();

  const isThisAudioPlaying =
    audioState.isPlaying && audioState.audioUrl === audioUrl;

  const togglePlay = () => {
    if (audioState.audioUrl !== audioUrl) {
      startPlaying(audioUrl);
    } else if (isThisAudioPlaying) {
      stopPlaying();
    } else {
      startPlaying(audioUrl);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className={styles.initialButton} onClick={togglePlay}>
      <FaHeadphones className={styles.icon} />
      <span className={styles.text}>
        {isThisAudioPlaying ? "Listening" : "Listen to the article"}
      </span>
    </div>
  );
};

export default AudioPlayer;

```

# components\Article\AudioPlayer\AudioPlayer.module.css

```css
.initialButton {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.initialButton:hover {
  color: var(--third-color);
}

.playerCard {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  z-index: 50;
}



.playerContent {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mainControls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.secondaryControls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.playButton,
.iconButton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 9999px;
  border: none;
  color: #333;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.playButton:hover,
.iconButton:hover {
  background-color: #f3f4f6;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.time {
  font-size: 0.875rem;
  color: #666;
}

.sliders {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progressSlider,
.volumeSlider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
}

.volumeSlider {
  width: 6rem;
}

.progressSlider::-webkit-slider-thumb,
.volumeSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.progressSlider::-webkit-slider-thumb:hover,
.volumeSlider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.optionsWrapper {
  position: relative;
}

.optionsMenu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 172px;
}

.optionItem {
  display: flex;
  justify-content: space-around;
  width: 100%;
  color: #333;
  padding: 0.5rem;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
}

.optionItem:hover {
  background-color: #f3f4f6;
}

.text {
  font-size: 0.875rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .playerCard {
    left: auto;
    width: 24rem;
  }
}
```

# components\Article\AudioPlayer\GlobalAudioPlayer.jsx

```jsx
"use client";

import { useRef, useEffect, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaEllipsisV,
  FaTimes,
} from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { useAudio } from "@context/AudioContext";
import styles from "./AudioPlayer.module.css";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

const GlobalAudioPlayer = () => {
  const {
    audioState,
    stopPlaying,
    closePlayer,
    updateCurrentTime,
    setAudioState,
  } = useAudio();
  const audioRef = useRef(null);
  const [currentSpeedIndex, setCurrentSpeedIndex] = useState(2); // Default 1x speed (index 2)

  useEffect(() => {
    if (audioRef.current) {
      if (audioState.isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioState.isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioState.currentTime;
    }
  }, [audioState.audioUrl]);

  const togglePlay = () => {
    setAudioState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      updateCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioState((prev) => ({
        ...prev,
        duration: audioRef.current.duration,
      }));
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * audioState.duration;
      audioRef.current.currentTime = newTime;
      updateCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const isMuted = audioRef.current.volume === 0;
      audioRef.current.volume = isMuted ? 1 : 0;
      setAudioState((prev) => ({
        ...prev,
        isMuted: !isMuted,
      }));
    }
  };

  const changePlaybackSpeed = () => {
    if (audioRef.current) {
      const nextIndex = (currentSpeedIndex + 1) % PLAYBACK_SPEEDS.length;
      setCurrentSpeedIndex(nextIndex);
      audioRef.current.playbackRate = PLAYBACK_SPEEDS[nextIndex];
    }
  };

  const handleDownload = () => {
    // Create a temporary anchor element
    const anchor = document.createElement("a");
    anchor.href = audioState.audioUrl;

    // Extract filename from URL or use a default name
    const filename = audioState.audioUrl.split("/").pop() || "audio.mp3";
    anchor.download = filename;

    // Trigger download
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Close options menu after download starts
    setAudioState((prev) => ({ ...prev, showOptions: false }));
  };

  if (!audioState.isPlayerVisible) return null;

  return (
    <div className={styles.playerCard}>
      <div className={styles.playerContent}>
        <div className={styles.controls}>
          <div className={styles.mainControls}>
            <button onClick={togglePlay} className={styles.playButton}>
              {audioState.isPlaying ? (
                <FaPause className={styles.icon} />
              ) : (
                <FaPlay className={styles.icon} />
              )}
            </button>
            <div className={styles.time}>
              {formatTime(audioState.currentTime)} /{" "}
              {formatTime(audioState.duration || 0)}
            </div>
          </div>

          <div className={styles.secondaryControls}>
            <button onClick={toggleMute} className={styles.iconButton}>
              {audioState.isMuted ? (
                <FaVolumeMute className={styles.icon} />
              ) : (
                <FaVolumeUp className={styles.icon} />
              )}
            </button>

            <div className={styles.optionsWrapper}>
              <button
                onClick={() =>
                  setAudioState((prev) => ({
                    ...prev,
                    showOptions: !prev.showOptions,
                  }))
                }
                className={styles.iconButton}
              >
                <FaEllipsisV className={styles.icon} />
              </button>
              {audioState.showOptions && (
                <div className={styles.optionsMenu}>
                  <button
                    className={styles.optionItem}
                    onClick={changePlaybackSpeed}
                  >
                    <span>Playback Speed:</span>
                    <span className={styles.icon}>
                      {PLAYBACK_SPEEDS[currentSpeedIndex]}x
                    </span>
                  </button>
                  <button
                    className={styles.optionItem}
                    onClick={handleDownload}
                  >
                    <span>Download Audio </span>
                    <MdFileDownload className={styles.icon} />
                  </button>
                </div>
              )}
            </div>

            <button onClick={closePlayer} className={styles.iconButton}>
              <FaTimes className={styles.icon} />
            </button>
          </div>
        </div>

        <div className={styles.sliders}>
          <input
            type="range"
            value={
              (audioState.currentTime / (audioState.duration || 1)) * 100 || 0
            }
            onChange={handleSeek}
            className={styles.progressSlider}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioState.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={stopPlaying}
      />
    </div>
  );
};

export default GlobalAudioPlayer;

```

# components\Article\BackButton\BackButton.jsx

```jsx
"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import styles from "./backbutton.module.css";

export default function BackButton() {
  console.log("BackButton loaded");
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/blog");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`${styles.backButton} ${
        resolvedTheme === "dark" ? styles.darkMode : styles.lightMode
      }`}
    >
      &larr; Back
    </button>
  );
}

```

# components\Article\BackButton\backbutton.module.css

```css
.backButton {
  padding: 10px 15px;
  /* margin-bottom: 20px; */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.lightMode {
  background-color: #f0f0f0;
  color: #333;
}

.lightMode:hover {
  background-color: #e0e0e0;
}

.darkMode {
  background-color: #333;
  color: #f0f0f0;
}

.darkMode:hover {
  background-color: #444;
}
```

# components\Article\Post\Loading.js

```js
import LoadingComponent from "components/(aux)/LoadingComponent/LoadingComponent";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <>
      <LoadingComponent />
    </>
  );
}

```

# components\Article\Post\Post.jsx

```jsx
"use client";

import styles from "./post.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaClock, FaUser, FaCalendar, FaChevronUp } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import AudioPlayer from "@components/Article/AudioPlayer/AudioPlayer";

function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function Post({ post, audioUrl }) {
  const { resolvedTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const time = calculateReadingTime(post.content);
    setTime(time);
  }, [post.content]);

  // Initial skeleton loading state
  if (!mounted) {
    return (
      <div className={styles.container}>
        <article className={styles.article}></article>
      </div>
    );
  }

  try {
    return (
      <div
        className={`${styles.container} ${
          resolvedTheme === "dark" ? styles.dark : ""
        }`}
      >
        <div
          className={styles.progressBar}
          style={{ width: `${scrollProgress}%` }}
        ></div>
        <article className={styles.article}>
          {post.featuredImage && (
            <div className={styles.featuredImageContainer}>
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={75}
                priority={true}
                className={styles.featuredImage}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHSIeHx8dIigjJCUmJSQkIistLjIyLS4rNTs7OjU+QUJBQkFCQUFBQUFBQUH/2wBDABUXFx4ZHiMeHiNBLSUtQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          {audioUrl && (
            <div className={styles.audioPlayer}>
              <AudioPlayer audioUrl={audioUrl} />
            </div>
          )}

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.postMeta}>
            <div className={styles.authorDateInfo}>
              <div className={styles.authorInfo}>
                <span className={styles.metaLabel}>
                  <FaUser aria-hidden="true" className={styles.icon} />
                  {post.author}
                </span>
              </div>
              <div className={styles.timeInfo}>
                <span className={styles.metaLabel}>
                  <FaClock aria-hidden="true" className={styles.icon} />
                  {time} min read
                </span>
              </div>
              <div className={styles.dateInfo}>
                <span className={styles.metaLabel}>
                  <FaCalendar aria-hidden="true" className={styles.icon} />
                  {post.last_modified.toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>
            <div className={styles.categories}>
              <span className={styles.metaCategories}>Categories:</span>
              <div className={styles.pillContainer}>
                {post.categories.map((category, index) => (
                  <Link
                    key={index}
                    href={`/categories/${category}`}
                    className={styles.categoryLink}
                  >
                    <span className={styles.pill}>{category}</span>
                  </Link>
                ))}
              </div>
            </div>
            {post.pinned && <p className={styles.pinnedPost}>Pinned Post</p>}
          </div>

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <button
            className={styles.scrollToTopButton}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <FaChevronUp aria-hidden="true" />
          </button>
        </article>
      </div>
    );
  } catch (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error</h1>
          <p>Failed to load the blog post. Please try again later.</p>
        </div>
      </div>
    );
  }
}

```

# components\Article\Post\post.module.css

```css
.container {
  max-width: 800px;
  /* margin: 0 auto; */
  padding: 20px;

  line-height: 1.5;
  /* color: #333; */

}

.progressBar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background-color: var(--third-color);
  z-index: 1000;
  transition: width 0.3s ease;
}

.article {
  position: relative;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.container.dark .article {
  box-shadow: 0 3px 5px rgba(255, 255, 255, 0.3);
}

.featuredImageContainer {
  position: relative;
  width: 100%;
  height: 400px;
}

.featuredImage {
  object-position: center;
}

.content figure {
  display: flex;
  justify-content: center;
}

.content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 20px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.content img:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 2.5rem;
  margin: 0px 20px 20px 20px;
  color: var(--fourth-color);
}

.container.dark .title {
  color: var(--second-color);
}

.postMeta {
  margin-right: 30px;
  margin-left: 30px;
  font-size: 0.9rem;
}

.authorDateInfo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.authorInfo,
.dateInfo {
  flex: 1;
}

.icon {
  margin-right: 5px;
}

.timeInfo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dateInfo {
  display: flex;
  justify-content: right;
  align-items: center;
}

.metaLabel {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: var(--third-color);
}

.metaÇategories {
  font-weight: bold;
  margin-right: 5px;
  margin-top: 4px;
  color: var(--third-color);
}



.metaValue {
  color: #7f8c8d;
}

.container.dark .metaValue {
  color: rgb(235, 235, 235);
}

.categories {
  display: flex;
  align-items: center;
  justify-content: center;


}


.pillContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.pill {
  background-color: var(--second-color);
  /* color: #3498db; */
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  display: inline-block;
}

.pill:hover {
  background-color: var(--third-color);
  /* color: #2980b9; */
  transition: background-color 0.3s ease;
  color: var(--background);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.container.dark .pill {
  background-color: var(--fourth-color);
  color: white !important;
}

.container.dark .pill:hover {
  background-color: var(--third-color);
}

.pinnedPost {
  font-weight: bold;
  color: var(--fourth-color);
  margin-top: 10px;
}

.content {
  font-size: 1.1rem;
  padding: 30px;
}


.scrollToTopButton {
  position: absolute;
  opacity: 0.8;
  bottom: 50px;
  right: 50px;
  background-color: var(--third-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  padding: 15px 15px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  z-index: 1000;
}

.scrollToTopButton:hover {
  background-color: #155574;
}

.audioPlayer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  transition: color 0.2s ease;
}

@media (max-width: 600px) {
  .container {
    padding: 0px;
  }

  .featuredImageContainer {
    height: 250px;
  }

  .title {
    font-size: 2rem;
    /* margin: 20px 20px 15px; */
  }

  .content {
    font-size: 1rem;
    padding: 20px;
  }

  .postMeta {
    padding: 15px 20px;
    font-size: small;
    margin: 0px;
  }

  .authorDateInfo {
    /* flex-direction: column; */
    gap: 10px;
  }

  .dateInfo {
    /* flex-direction: column; */
    gap: 5px;
  }

  .scrollToTopButton {
    display: flex;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    font-size: 40px;
  }
}
```

# components\Article\PostCard\PostCard.jsx

```jsx
"use client";

import Link from "next/link";
import styles from "./postcard.module.css";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function PostCard({ post }) {
  console.log("Post Card loaded");
  const { resolvedTheme } = useTheme();

  const createDate = new Date(post.date).toLocaleDateString();

  const categories =
    post._embedded?.["wp:term"]?.[0]?.map((category) => category.name) || [];

  // const tags = post._embedded["wp:term"]
  //   .flat()
  //   .filter((term) => term.taxonomy === "post_tag")
  //   .map((tag) => tag.name);

  // const author = post._embedded["author"][0].name;

  const featuredMediaLink =
    post._embedded?.["wp:featuredmedia"]?.[0]?.link || "";

  return (
    <div
      className={`${styles.card} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      {post._embedded && (
        <Image
          src={featuredMediaLink}
          alt={post.title.rendered}
          width={100}
          height={100}
          priority
          className={styles.card_image}
        />
      )}
      <div className={styles.card_info}>
        <Link href={`/posts/${post.slug}`}>
          <h2 className={styles.card_title}>{post.title.rendered}</h2>
        </Link>
        <p
          className={styles.card_excerpt}
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        ></p>
        <div className={styles.card_taxonomies}>
          <div className={styles.card_categories}>
            {categories.map((category) => (
              <Link key={category} href={`/categories/${category}`}>
                <span key={category} className={styles.card_tag}>
                  {category}
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.card_meta}>
            {/*<p className={styles.card_author}>By {author}</p>*/}
            <p className={styles.card_date} suppressHydrationWarning>
              Created on {createDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

```

# components\Article\PostCard\postcard.module.css

```css
/* General card style */
.card {
  display: flex;
  gap: 20px;
  max-width: 750px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(63, 63, 63, 0.4);
  /* background-color: white; */
  transition: box-shadow 0.3s, transform 0.3s;
  font-family: Arial, sans-serif;
}

.card_image {
  width: 100px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

/* Title style within the card */
.card_title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  /* color: #333; */
}

.card_excerpt {
  font-size: 1rem;
  margin-bottom: 15px;
  margin-top: 0px;
  color: #8f8f8f;
}

.card_excerpt p {
  margin: 0px;
}

.card:hover .card_title {
  color: var(--third-color);
}

.card.dark:hover .card_title {
  color: var(--second-color);
}

/* Meta information style */

.card_info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.card_meta {
  font-size: 0.9rem;
  color: #bbb;
  text-align: right;
}

.card_author {
  font-weight: bold;
  margin-bottom: 5px;
}

.card_date {
  font-style: italic;
  font-size: small;
  margin: 0;
}

/* Taxonomies style */
.card_taxonomies {
  display: flex;
  align-items: center;
}

.card_categories {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 5px;
}

.card_tag {
  font-size: 0.8rem;
  background-color: var(--first-color);
  /* color: #333; */
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
}

.card_tag:hover {
  /* transform: scale(1.1); */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: var(--third-color);
  color: var(--background);
  transition: background-color 0.3s, color 0.3s, transform 0.3s;
}

.card.dark .card_tag {
  background-color: var(--third-color);
}

/* Hover effect for the card */
.card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  /* transform: translateY(-3px); */
}

/* Add a subtle hover effect for the link */
.card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

@media (max-width: 600px) {

  .card_excerpt {
    display: none;
  }
}
```

# components\Article\PostList\Loading.js

```js
import LoadingComponent from "components/(aux)/LoadingComponent/LoadingComponent";
import styles from "./postlist.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <>
      <LoadingComponent />
    </>
  );
}

```

# components\Article\PostList\PostList.jsx

```jsx
"use client";
import { useState, useEffect } from "react";
import Card from "components/Article/PostCard/PostCard";
import SkeletonLoader from "components/(aux)/SkeletonLoader/SkeletonLoader";
import styles from "./postlist.module.css";

const POSTS_PER_PAGE = 6; // Adjust this number as needed

export default function PostList({ posts, selectedCategory, searchQuery }) {
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page when filters change

    if (selectedCategory || searchQuery) {
      const filtered = posts.filter((post) => {
        const matchesCategory =
          !selectedCategory || post.categories.includes(selectedCategory);
        const matchesSearch =
          !searchQuery ||
          post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
    setIsLoading(false);
  }, [posts, selectedCategory, searchQuery]);

  if (!mounted) {
    return <div className={styles.one_column}>{/* Initial content */}</div>;
  }

  // Pagination calculations
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setIsLoading(true);
    setCurrentPage(pageNumber);
    // window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsLoading(false), 300);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (!posts || posts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    );
  }

  if (filteredPosts.length === 0 && (selectedCategory || searchQuery)) {
    return (
      <div className={styles.one_column}>
        <p className={styles.noPosts}>
          No posts found for the selected category or search query.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.one_column}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.postsInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of{" "}
            {totalPosts} posts
          </div>

          <ul className={styles.ul}>
            {currentPosts.map((post) => (
              <li className={styles.li} key={post.id}>
                <Card post={post} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pageButton} ${
                  currentPage === 1 ? styles.disabled : ""
                }`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {getPageNumbers().map((number) => (
                <button
                  key={number}
                  className={`${styles.pageButton} ${
                    currentPage === number ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className={`${styles.pageButton} ${
                  currentPage === totalPages ? styles.disabled : ""
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

```

# components\Article\PostList\postlist.module.css

```css
/* PostList.module.css */
/* Center the main container */
.one_column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Style for the heading */
.h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

/* Style for the unordered list */
.ul {
  list-style-type: none;
  width: 100%;
  max-width: 750px;
  padding: 0;
}

/* Style for list items */
.li {
  margin-bottom: 15px;
}

.loadingContainer {
  margin: 40px auto;
  width: 100%;
  max-width: 750px;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
  width: 100%;
  max-width: 750px;
}

.pageButton {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pageButton:hover:not(.disabled) {
  background: var(--third-color);
  color:white;
  border-color: var(--third-color);
}

.pageButton.active {
  background: var(--third-color);
  color: white;
  border-color: var(--third-color);
}

.pageButton.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f7fafc;
}

.postsInfo {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  width: 100%;
  max-width: 750px;
  margin-bottom: 1rem;
}

.noPosts {
  text-align: center;
  color: #666;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 750px;
}

@media screen and (max-width: 700px) {
  .one_column {
    padding: 0px;
  }

  .pagination {
    padding: 0 1rem;
    gap: 0.25rem;
  }

  .pageButton {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}
```

# components\Blog\BlogContent\BlogContent.jsx

```jsx
"use client";
import { useState } from "react";

import PostList from "components/Article/PostList/PostList";
import CategoryList from "components/Blog/CategoryList/CategoryList";
import SearchBar from "components/Blog/SearchBar/SearchBar";

export default function Blog({ posts, categories }) {
  console.log("Blog Content loaded");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <SearchBar onSearch={setSearchQuery} />
      <CategoryList
        categories={categories}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      <PostList
        posts={posts}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />
    </>
  );
}

```

# components\Blog\BlogContent\blogcontent.module.css

```css

```

# components\Blog\CategoryList\CategoryList.jsx

```jsx
"use client";

import styles from "./categorylist.module.css";

export default function CategoryList({
  categories,
  onSelectCategory,
  selectedCategory,
}) {
  console.log("CategoryList loaded" + "- ID: " + selectedCategory);

  if (!categories) {
    return null;
  }

  return (
    <div className={styles.categoryList}>
      <h2>Categories</h2>
      <br />
      <ul>
        <li key="all">
          <button
            className={selectedCategory === null ? styles.active : ""}
            onClick={() => onSelectCategory(null)}
          >
            All
          </button>
        </li>
        {categories.map(
          (category) =>
            category.name !== "Uncategorized" && (
              <li key={category.id}>
                <button
                  className={
                    selectedCategory === category.id ? styles.active : ""
                  }
                  onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </button>
              </li>
            )
        )}
      </ul>
    </div>
  );
}

```

# components\Blog\CategoryList\categorylist.module.css

```css
.categoryList {
  margin: 20px 0;
  padding: 20px;
  min-height: 130px;
}

.categoryList h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.categoryList ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style-type: none;
  padding: 0;
}

.categoryList li {
  margin: 0;
}

.categoryList button {
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.categoryList button:hover {
  background-color: #e0e0e0;
}

.categoryList button.active {
  background-color: var(--third-color);
  color: white;
}

/* Add a subtle pulse animation for active pills */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

.categoryList button.active {
  animation: pulse 2s infinite;
}
```

# components\Blog\CategoryList\Loading.js

```js
import LoadingComponent from "components/(aux)/LoadingComponent/LoadingComponent";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <>
      <LoadingComponent />
    </>
  );
}

```

# components\Blog\SearchBar\SearchBar.jsx

```jsx
"use client";
import { useState } from "react";
import styles from "./searchbar.module.css";

export default function SearchBar({ onSearch }) {
  console.log("SearchBar loaded");
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
}

```

# components\Blog\SearchBar\searchbar.module.css

```css
.searchBar {
  margin: 20px 0;
  padding: 20px;
  width: 100%;
  max-width: 600px;
}

.searchBar input {
  width: 100%;
  padding: 12px 20px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.searchBar input:focus {
  outline: none;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  border-color: var(--third-color);
}

.searchBar input::placeholder {
  color: #aaa;
}
```

# components\Contact\ContactForm\contact.module.css

```css
/* contact.module.css */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 178px);
  padding: 20px;
}

.form {
  /* background-color: #fff; */
  padding: 40px;
  /* border-radius: 16px; */
  /* box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1); */
  width: 100%;
  max-width: 600px;
  transition: all 0.3s ease;
}

.title {
  /* font-size: 2.5rem; */
  margin-bottom: 30px;

  text-align: center;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.formGroup {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 15px;
  color: #b7b7b7;
  font-size: 1.2rem;
}

.input,
.textarea {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 1rem;
  /* background-color: #f9f9f9; */
  transition: all 0.3s ease;
}



.input:focus,
.textarea:focus {
  border-color: var(--third-color);
  outline: none;
  /* background-color: #fff; */
  box-shadow: 0 0 10px var(--first-color);
  animation: pulse 2s infinite;
}

.textarea {
  height: 120px;
  resize: none;
}

.button {
  width: 100%;
  padding: 14px;
  margin-top: 30px;
  background-color: var(--third-color);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.button:hover {
  background-color: var(--fourth-color);
  transform: translateY(-2px);
}

.button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.successMessage,
.errorMessage {
  text-align: center;
  color: var(--third-color);
  margin-top: 20px;
}

.errorMessage {
  color: #e00;
}


/* contact.module.css */
.successMessageContainer {
  text-align: center;
  padding: 40px;
  background-color: #f0f9ff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.8s ease-out;
}

.successTitle {
  font-size: 3rem;
  font-weight: bold;
  color: var(--third-color);
  background: linear-gradient(90deg, var(--third-color), var(--third-color));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
  animation: slideIn 0.8s ease-out;
}

.successTitle::selection {
  background: none;
}

.successText {
  font-size: 1.25rem;
  color: #333;
  margin-top: 10px;
  animation: fadeIn 1.2s ease-out;
}

/* Fade-in animation */
@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

/* Slide-in animation */
@keyframes slideIn {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 var(--second-color);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}




/* Media Query for Desktop */
@media (max-width: 768px) {
  .row {
    grid-template-columns: 1fr;
  }

  .form {
    padding: 20px;
  }

  .successTitle {
    font-size: 30px;
  }

  .successText {
    font-size: 18px;
  }
}
```

# components\Contact\ContactForm\ContactForm.jsx

```jsx
"use client";
import { useState } from "react";
import styles from "./contact.module.css";
import { FaUser, FaEnvelope, FaCommentDots } from "react-icons/fa"; // Importing icons
import { addContact } from "@actions/actions"; // Import the server action
import confetti from "canvas-confetti"; // Import canvas-confetti for the effect

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    const formData = new FormData(e.target);

    await addContact(formData);
    setSubmitted(true);
    setLoading(false);
    // Trigger confetti when form is successfully submitted
    confetti({
      particleCount: 150,
      spread: 60,
      origin: { y: 0.6 },
      zIndex: 10000,
    });
  };

  return (
    <div className={styles.container}>
      {submitted ? (
        <div className={styles.successMessageContainer}>
          <h1 className={styles.successTitle}>🎉 Thank you! 🎉</h1>
          <p className={styles.successText}>
            Your message has been successfully sent.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Say Hi</h1>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <FaUser className={styles.icon} />
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <FaEnvelope className={styles.icon} />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <FaCommentDots className={styles.icon} />
            <textarea
              name="message"
              placeholder="Your Message"
              required
              className={styles.textarea}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
      )}
    </div>
  );
}

```

# components\Footer\Footer.jsx

```jsx
import Link from "next/link";
import { SiSailsdotjs } from "react-icons/si";

import styles from "./footer.module.css";

const Footer = () => {
  console.log("Footer loaded");
  return (
    <footer className={styles.footer}>
      <div className={styles.content} suppressHydrationWarning>
        <p>&copy; {new Date().getFullYear()} Carlos Marten</p>
        <nav>
          <Link href="/about" className={styles.link}>
            About
          </Link>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <Link href="/dashboard" className={styles.link}>
            <SiSailsdotjs />
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

```

# components\Footer\footer.module.css

```css
.footer {
  width: 100%;
  /* padding: 1rem 0; */
  /* background-color: var(--background); */
  color: var(--text);
  /* border-top: 1px solid var(--border); */
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.link {
  margin-left: 1rem;
  color: var(--text);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 380px){
  .content {
    flex-direction: column;
    justify-content: center;
  }
}



/* Dark mode styles are handled by CSS variables */
:global(.dark) .footer {
  /* --background: #1a1a1a; */
  /* --text: #ffffff; */
  /* --border: #333333; */
}
```

# components\Hero\Hero.jsx

```jsx
"use client";

// import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import styles from "./hero.module.css";
import { useState, useEffect } from "react";

const Hero = () => {
  const { theme } = useTheme();
  console.log("Hero component loaded");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${styles.heroSection} ${theme === "dark" ? styles.dark : ""}`}
    >
      {/* Left Image
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >*/}
      <div className={styles.imageContainer}>
        <Image
          src="/images/me.png"
          alt="Hero Image"
          priority
          width={200}
          height={200}
          className={styles.roundedImage}
        />
      </div>
      {/*</motion.div>*/}

      {/* Right Text 
      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >*/}
      <div className={styles.textContainer}>
        <h3 className={styles.title}>
          Interested in Business Technology, Design, Projects and News?
        </h3>
        <br />
        <p className={styles.subtitle}>
          As an IT Business Consultant, I am passionate about new technologies
          and their impact on businesses. Here, you will find exciting blog
          posts on business and technology topics.
        </p>
        <p className={styles.subtitle}>
          <br />
          Check out the projects page for the solutions I have developed across
          various industries, demonstrating the synergy between technology and
          business.
        </p>
        <br />
        <p className={styles.subtitle}>
          Stay updated with the latest insights and trends in business and
          technology. Join me as we explore new ideas and bring innovative
          concepts to life!
        </p>
      </div>
      {/*  </motion.div>*/}
    </div>
  );
};

export default Hero;

```

# components\Hero\hero.module.css

```css
.heroSection {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
  /* height: calc(100vh - 132px); */
  position: relative;
  min-height: 467px;
}

.heroSection.dark {
  color: #fcfcfc;


}


.imageContainer {
  margin-right: 50px;
  z-index: 1;
  border-radius: 50%;
  /* Circular shape */
  /* overflow: hidden;  */
  position: relative;
  /* For positioning the overlay */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  /* Shadow for depth */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1));
  /* Gradient background */
}

.roundedImage {
  border-radius: 50%;
  width: 200px;
  /* Image fits the container */
  height: auto;
  /* Maintain aspect ratio */
}

.textContainer {
  max-width: 500px;
  z-index: 1;
}

.title {
  font-size: 26px;
  margin: 0 0 10px 0;
  transition: color 0.3s;
}

.heroSection.dark .title {
  color: #fcfcfc;
}

.subtitle {
  font-size: 16px;
  transition: color 0.2s;
}

.heroSection.dark .subtitle {
  color: #bbb;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .heroSection {
    flex-direction: column;
    height: auto;
    padding: 20px;
  }

  .imageContainer {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .textContainer {
    max-width: 500px;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
    text-align: start;
    z-index: 1;
  }

  .title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

}
```

# components\Navbar\MobileMenu\MobileMenu.jsx

```jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from "./mobilemenu.module.css";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "next-themes";
import Link from "next/link";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleTheme = () => {
    handleLinkClick();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={`${styles.mobileMenu} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <button
        aria-label="Toggle menu"
        className={`${styles.hamburger} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>
      {isOpen && (
        <ul className={`${styles.navList} ${styles.open}`}>
          <li className={styles.navItem}>
            <Link
              href="/projects"
              className={styles.navLink}
              onClick={handleLinkClick}
            >
              Projects
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/blog"
              className={styles.navLink}
              onClick={handleLinkClick}
            >
              Blog
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/about"
              className={styles.navLink}
              onClick={handleLinkClick}
            >
              About
            </Link>
          </li>
          <li className={styles.navItem}>
            <button onClick={toggleTheme} className={styles.themeToggle}>
              {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default MobileMenu;

```

# components\Navbar\MobileMenu\mobilemenu.module.css

```css
.mobileMenuContainer {
  display: none;
}

.navList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navItem {
  position: relative;
}

.navLink {
  text-decoration: none;
  color: inherit;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.navLink:hover {
  background-color: rgba(236, 236, 236, 0.9);
}

.themeToggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 50%;
}

.themeToggle:hover {
  background-color: rgba(236, 236, 236, 0.9);
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

@media (min-width: 769px) {
  .hamburger {
    display: none;
    background-color: var(--navbar-text-color);
  }

  .hamburgerLine {
    width: 2rem;
    height: 0.25rem;
    background-color: var(--navbar-text-color, var(--foreground));
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
  }

  .hamburger.open .hamburgerLine:nth-child(1) {
    transform: rotate(45deg);
  }

  .hamburger.open .hamburgerLine:nth-child(2) {
    opacity: 0;
    transform: translateX(20px);
  }

  .hamburger.open .hamburgerLine:nth-child(3) {
    transform: rotate(-45deg);
  }

  @media (max-width: 768px) {
    .mobileMenuContainer {
      display: flex;
    }

    .hamburger {
      display: flex;
    }

    .navList {
      flex-direction: column;
      align-items: center;
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 300px;
      z-index: 2;
      gap: 2rem;
      padding-top: 5.5rem;
      transition: transform 0.3s ease-in-out;
      background-color: var(--background);
      /* Initially hide the mobile menu off-screen */
      transform: translateX(100%);
    }

    .navList.open {
      transform: translateX(0);
    }

    .navItem {
      margin: 0.5rem 0;
      list-style: none;
    }

    .navLink {
      padding: 0.75rem 1.5rem;
      width: 100%;
      text-align: center;
    }

    .mobileMenuContainer.dark .navLink:hover,
    .mobileMenuContainer.dark .themeToggle:hover {
      background-color: rgb(54, 54, 54);
    }
  }
}
```

# components\Navbar\Navbar.jsx

```jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import MobileMenu from "./MobileMenu/MobileMenu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`${styles.navbar_container} ${
        mounted && resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Carlos Marten</span>
        </Link>

        {/* Mobile menu is always rendered but might be hidden via CSS */}
        <MobileMenu />

        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link
              href="/projects"
              className={`${styles.navLink} ${
                pathname === "/projects" ? styles.active : ""
              }`}
            >
              Projects
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/blog"
              className={`${styles.navLink} ${
                pathname === "/blog" ? styles.active : ""
              }`}
            >
              Blog
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/about"
              className={`${styles.navLink} ${
                pathname === "/about" ? styles.active : ""
              }`}
            >
              About
            </Link>
          </li>
          <li className={styles.navItem}>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </div>
  );
}

```

# components\Navbar\navbar.module.css

```css
/* navbar.module.css */


.navbar {
  background-color: transparent;
  color: var(--navbar-text-color, #000000);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin: 25px 0px;
  font-size: 1.4rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.logo {
  text-decoration: none;
  color: inherit;
  font-weight: bold;
  position: relative;
  display: inline-block;
}

.logoText {
  display: inline-block;
  transition: all 0.3s ease;
}

.logo:hover .logoText {
  transform: scale(1.02);
  /* background: linear-gradient(45deg, var(--second-color), var(--fourth-color)); */
  /* background: var(--foreground); */
  /* -webkit-background-clip: text; */
  /* -webkit-text-fill-color: transparent; */
}

.logo::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(45deg, var(--fourth-color), var(--second-color));
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.logo:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.navList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 2rem;
  align-items: center;
}


.navItem {
  position: relative;
}

.navLink {
  text-decoration: none;
  color: var(--foreground);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
}



.active {
  color: var(--third-color) !important; /* Active link color */
  font-weight: bold; /* Example styling */
}


.navLink:hover {
  background-color: rgba(236, 236, 236, 0.9);
}

.navbar_container.dark .navLink:hover {
  background-color: rgba(48, 48, 48, 0.9);
  color: white;
}

.themeToggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 50%;
}


.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}

.hamburgerLine {
  width: 2rem;
  height: 0.25rem;
  background-color: var(--navbar-text-color, #000000);
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

.hamburger.open .hamburgerLine:nth-child(1) {
  transform: rotate(45deg);
}

.hamburger.open .hamburgerLine:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}

.hamburger.open .hamburgerLine:nth-child(3) {
  transform: rotate(-45deg);
}

@media (max-width: 768px) {
  .navbar {
    font-size: 1.4rem;
  }

  .hamburger {
    display: flex;
  }

  .navList {
    flex-direction: column;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 300px;
    z-index: 2;
    gap: 1rem;
    padding-top: 5.5rem;
    transition: transform 0.3s ease-in-out;
    transform: translateX(100%);
  }

  .navList.open {
    transform: translateX(0);
  }

  .navItem {
    margin: 0.5rem 0;
  }

  .navLink {
    padding: 0.75rem 1.5rem;
    width: 100%;
    text-align: center;
  }
}

:global(.dark) .navbar {
  color: #ffffff;
}



:global(.dark) .hamburgerLine {
  background-color: #ffffff;
}

:global(.dark) .logo:hover .logoText {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

# components\Navbar\ThemeToggle\ThemeToggle.jsx

```jsx
"use client";

import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import styles from "./themetoggle.module.css";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return (
      <button className={styles.themeToggle}>
        <FaMoon size={20} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`${styles.themeToggle} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
      aria-label={`Switch to ${
        resolvedTheme === "dark" ? "light" : "dark"
      } mode`}
    >
      {resolvedTheme === "dark" ? (
        <FaSun size={20} aria-hidden="true" />
      ) : (
        <FaMoon size={20} aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;

```

# components\Navbar\ThemeToggle\themetoggle.module.css

```css
.themeToggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--foreground);
  transition: background-color 0.3s, color 0.3s;
  border-radius: 50%;
}

.themeToggle:hover {
  background-color: rgba(236, 236, 236, 0.9);
}

.themeToggle.dark:hover {
  
  background-color: rgba(48, 48, 48, 0.9);
}
```

# components\NotificationTest\NotificationTest.jsx

```jsx
// components/NotificationTest/NotificationTest.jsx
"use client";

import { useState } from "react";
import { sendTestNotification } from "@actions/pushNotifications";
import styles from "./NotificationTest.module.css";

export default function NotificationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("This is a test notification!");

  async function handleTestNotification() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await sendTestNotification({
        title: "Test Notification",
        content: message,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send notification");
      }
    } catch (err) {
      console.error("Error sending test notification:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Test Push Notifications</h3>
      <textarea
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter test notification message"
      />
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={`${styles.button} ${isLoading ? styles.loading : ""}`}
        onClick={handleTestNotification}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send Test Notification"}
      </button>
    </div>
  );
}

```

# components\NotificationTest\NotificationTest.module.css

```css
.container {
    margin: 20px;
    padding: 20px;
    border: 1px solid var(--second-color);
    border-radius: 8px;
    max-width: 400px;
}

.title {
    margin-bottom: 15px;
    color: var(--fourth-color);
}

.textarea {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid var(--second-color);
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
}

.button {
    padding: 10px 20px;
    background-color: var(--third-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
}

.button:hover:not(:disabled) {
    background-color: var(--fourth-color);
}

.button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.button.loading {
    position: relative;
    color: transparent;
}

.button.loading::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid white;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.error {
    color: #e63946;
    margin-bottom: 10px;
    font-size: 0.9em;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}
```

# components\private\ContactsList\ContactsList.jsx

```jsx
// ContactsList.jsx
import { FaUser, FaEnvelope, FaComment } from "react-icons/fa";
import styles from "./contactslist.module.css";

export default function ContactsList({ contacts }) {
  if (!contacts) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {contacts.map((contact) => (
        <div key={contact.id} className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <FaUser className={styles.icon} />
                <span className={styles.infoText}>{contact.name}</span>
              </div>

              <div className={styles.infoItem}>
                <FaEnvelope className={styles.icon} />
                <span className={styles.infoText}>{contact.email}</span>
              </div>
            </div>

            <div className={styles.messageContainer}>
              <FaComment className={styles.icon} />
              <p className={styles.message}>{contact.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

```

# components\private\ContactsList\contactslist.module.css

```css
/* ContactsList.module.css */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  width: 100%;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.cardContent {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contactInfo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.infoItem {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 0.875rem;
  color: #666;
  flex-shrink: 0;
}

.infoText {
  font-size: 0.875rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.messageContainer {
  display: flex;
  gap: 0.5rem;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.375rem;
  align-items: flex-start;
}

.message {
  font-size: 0.875rem;
  color: #444;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Loading Spinner */
.loadingContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 8rem;
}

.loadingSpinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 640px) {
  .container {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .cardContent {
    padding: 0.5rem;
  }

  .messageContainer {
    padding: 0.5rem;
  }
}


```

# components\private\Sidebar\Sidebar.jsx

```jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiContactsLine,
  RiSettings4Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "react-icons/ri";
import SignOutButton from "@components/(auth)/signout-button/signout-button";
import styles from "./sidebar.module.css";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Overview", icon: RiDashboardLine },
    { path: "/dashboard/contacts", label: "Contacts", icon: RiContactsLine },
    { path: "/dashboard/settings", label: "Settings", icon: RiSettings4Line },
  ];

  return (
    <div>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <RiMenuFoldLine /> : <RiMenuUnfoldLine />}
      </button>

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      >
        <header className={styles.header}>
          <h1 className={styles.logo}>Dashboard</h1>
        </header>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <li
                key={path}
                className={`${styles.navItem} ${
                  pathname === path ? styles.active : ""
                }`}
              >
                <Link href={path} className={styles.navLink}>
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className={styles.footer}>
          <SignOutButton />
        </footer>
      </aside>
    </div>
  );
};

export default Sidebar;

```

# components\private\Sidebar\sidebar.module.css

```css
/* sidebar.module.css */
.sidebar {
  position: sticky;
  top: 0;
  height: calc(100vh - 176px);
  background-color: var(--background);
  width: 200px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* Dark mode compatibility */

.closed {
  width: 0;
  padding: 0;
  overflow: hidden;
}

.toggleButton {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 101;
  background: var(--background);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.toggleButton:hover {
  transform: scale(1.1);
}

.header {
  margin-bottom: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;

}

.nav {
  flex-grow: 1;
}

.navList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navItem {
  margin-bottom: 0.5rem;
}

.navLink {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;

  border-radius: 0.5rem;
}

.navLink:hover {
  background-color: var(--hover-background, rgba(0, 0, 0, 0.05));
  transform: translateX(4px);
}

.navIcon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
}

.active .navLink {
  background-color: var(--primary-color, #0070f3);
  color: white;
}

.active .navLink:hover {
  transform: none;
  background-color: var(--fourth-color);
}

.footer {
  margin-top: auto;
  padding-top: 1rem;
}

.logout {
  padding: 0.8rem 1.2rem;
  background-color: var(--logout-bg-color);
  width: 100%;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  margin-top: 20px;
}




.logout:hover {
  background-color: var(--logout-hover-color);
  transform: translateY(-2px);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
  }

  /* .toggleButton {
    top: 50%;
  } */

  .open {
    transform: translateX(0);
    width: 100%;
    max-width: 200px;
  }

  .closed {
    transform: translateX(-100%);
  }

  .header {
    display: flex;
    justify-content: flex-end;
  }

  .navLink:hover {
    transform: none;
    background-color: var(--hover-background, rgba(0, 0, 0, 0.05));
  }
}

/* Animation for content appearing */
.navItem {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    /* transform: translateX(-10px); */
  }

  to {
    opacity: 1;
    /* transform: translateX(0); */
  }
}

/* Stagger animation for nav items */
.navItem:nth-child(1) {
  animation-delay: 0.1s;
}

.navItem:nth-child(2) {
  animation-delay: 0.2s;
}

.navItem:nth-child(3) {
  animation-delay: 0.3s;
}
```

# components\PushNotification\PushNotification.jsx

```jsx
// components/PushNotification/PushNotification.jsx
"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser } from "@actions/pushNotifications";
import styles from "./PushNotification.module.css";

function urlBase64ToUint8Array(base64String) {
  try {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error("Error converting base64 to Uint8Array:", error);
    throw new Error("Invalid VAPID key format");
  }
}

export default function PushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isCompatibleIOS: false,
    isPWA: false,
  });

  // Detect environment safely
  useEffect(() => {
    try {
      setIsClient(true);

      // Safely check if iOS
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      // Safely check iOS version
      let isCompatibleIOS = false;
      if (isIOS) {
        const match = navigator.userAgent.match(/OS (\d+)_/);
        const version = match ? parseInt(match[1], 10) : 0;
        isCompatibleIOS = version >= 16;
      }

      // Safely check if PWA
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setDeviceInfo({ isIOS, isCompatibleIOS, isPWA });

      // Only initialize service worker if appropriate
      if (
        (!isIOS || (isIOS && isCompatibleIOS && isPWA)) &&
        "serviceWorker" in navigator &&
        "PushManager" in window
      ) {
        initializeServiceWorker();
      }
    } catch (error) {
      console.error("Error during initialization:", error);
      setError("Failed to initialize notification system");
    }
  }, []);

  const initializeServiceWorker = async () => {
    try {
      // Check for existing registration first
      const existingReg = await navigator.serviceWorker.getRegistration();

      if (existingReg) {
        console.log("Using existing service worker registration");
        setRegistration(existingReg);

        const existingSub = await existingReg.pushManager.getSubscription();
        if (existingSub) {
          setIsSubscribed(true);
          setSubscription(existingSub);
        }
        return;
      }

      // Only register new service worker if needed
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        setRegistration(reg);
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      // Don't show error to user unless they try to subscribe
    }
  };

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running in PWA mode on iOS
      if (deviceInfo.isIOS && !deviceInfo.isPWA) {
        setError("Please install this website as an app first");
        return;
      }

      // Check iOS compatibility
      if (deviceInfo.isIOS && !deviceInfo.isCompatibleIOS) {
        setError("Notifications require iOS 16.4 or later");
        return;
      }

      // Request permission first
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Ensure we have a service worker registration
      if (!registration) {
        await initializeServiceWorker();
      }

      if (!registration) {
        throw new Error("Failed to initialize notifications");
      }

      // Subscribe to push
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      };

      const pushSubscription = await registration.pushManager.subscribe(
        subscribeOptions
      );

      // Save to server
      await subscribeUser(pushSubscription);

      setIsSubscribed(true);
      setSubscription(pushSubscription);
    } catch (error) {
      console.error("Subscription error:", error);

      // User-friendly error messages
      if (error.message.includes("permission")) {
        setError("Please allow notifications in your browser settings");
      } else if (error.message.includes("VAPID")) {
        setError("Invalid notification configuration");
      } else {
        setError("Failed to enable notifications. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      if (subscription) {
        await unsubscribeUser(subscription);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setSubscription(null);
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setError("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render anything during SSR
  if (!isClient) return null;

  // Show installation instructions for iOS non-PWA
  if (deviceInfo.isIOS && !deviceInfo.isPWA) {
    return (
      <div className={styles.container}>
        <div className={styles.iosInstructions}>
          <h3>Enable Notifications</h3>
          <p>To receive notifications on iOS:</p>
          <ol>
            <li>
              Tap the share button <span className={styles.icon}>⎋</span>
            </li>
            <li>
              Select Add to Home Screen <span className={styles.icon}>+</span>
            </li>
            <li>Open the app from your home screen</li>
            <li>Return here to subscribe</li>
          </ol>
        </div>
      </div>
    );
  }

  // Don't show anything if notifications aren't supported
  if (deviceInfo.isIOS && !deviceInfo.isCompatibleIOS) return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={`${styles.button} ${isLoading ? styles.loading : ""}`}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
      >
        {isLoading
          ? "Processing..."
          : isSubscribed
          ? "Unsubscribe from notifications"
          : "Subscribe to notifications"}
      </button>
    </div>
  );
}

```

# components\PushNotification\PushNotification.module.css

```css
.container {
    margin: 20px 0;
    text-align: center;
}

.button {
    padding: 10px 20px;
    background-color: var(--third-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover:not(:disabled) {
    background-color: var(--fourth-color);
}

.button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.button.loading {
    position: relative;
    color: transparent;
}

.button.loading::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid white;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.error {
    color: #e63946;
    margin-bottom: 10px;
    font-size: 0.9em;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}




/* IOS COMPATIBILITY */

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem 0;
}

.button {
    background-color: var(--third-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.button:hover {
    background-color: var(--fourth-color);
}

.button.loading {
    opacity: 0.7;
    cursor: wait;
}

.error {
    color: #dc3545;
    margin-bottom: 1rem;
    text-align: center;
}

.iosInstructions {
    background-color: var(--first-color);
    padding: 1.5rem;
    border-radius: 0.5rem;
    max-width: 300px;
    margin: 0 auto;
}

.iosInstructions h3 {
    color: var(--fourth-color);
    margin-bottom: 1rem;
    text-align: center;
}

.iosInstructions p {
    margin-bottom: 1rem;
}

.iosInstructions ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.iosInstructions li {
    margin: 0.5rem 0;
    line-height: 1.4;
}

.iosInstructions span {
    display: inline-block;
    margin: 0 0.25rem;
    font-size: 1.2em;
}

.iosInstructions button {
    width: 100%;
    margin-top: 1rem;
}

/* Dark mode support */
:global(.dark) .iosInstructions {
    background-color: var(--background-dark);
    border: 1px solid var(--third-color);
}
```

# context\AudioContext.jsx

```jsx
"use client";

import { createContext, useContext, useState } from "react";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isPlayerVisible: false,
    audioUrl: null,
    currentTime: 0,
  });

  const startPlaying = (url) => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: true,
      isPlayerVisible: true,
      audioUrl: url,
    }));
  };

  const stopPlaying = () => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  };

  const closePlayer = () => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      isPlayerVisible: false,
    }));
  };

  const updateCurrentTime = (time) => {
    setAudioState((prev) => ({
      ...prev,
      currentTime: time,
    }));
  };

  return (
    <AudioContext.Provider
      value={{
        audioState,
        startPlaying,
        stopPlaying,
        closePlayer,
        updateCurrentTime,
        setAudioState,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

```

# fonts\GeistMonoVF.woff

This is a binary file of the type: Binary

# fonts\GeistVF.woff

This is a binary file of the type: Binary

# jsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@components/*": ["components/*"],
      "@actions/*": ["actions/*"],
      "@lib/*": ["lib/*"],
      "@context/*": ["context/*"],
      "@providers/*": ["providers/*"]
    }
  }
}

```

# lib\aws-config.js

```js
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

```

# middleware.js

```js
export { auth as middleware } from "./auth.js";

```

# next.config.js

```js
// next.config.js
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_WP_URL: process.env.NEXT_PUBLIC_WP_URL,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "", // Leave it empty unless you need a specific port
      },
      {
        protocol: "https",
        hostname: "www.carlosmarten.com",
      },
      {
        protocol: "https", // Specify the protocol (http or https)
        hostname: process.env.NEXT_PUBLIC_WP_URL, // Domain name
        port: "", // Leave this empty if there's no specific port
        pathname: "/**", // Wildcard to allow all image paths
      },
      {
        protocol: "https", // Specify the protocol (http or https)
        hostname: "rocketmedia.b-cdn.net", // Domain name
        port: "", // Leave this empty if there's no specific port
        pathname: "/**", // Wildcard to allow all image paths
      },
    ],
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/wordpress/:path*",
  //       destination: `https://${process.env.NEXT_PUBLIC_WP_URL}/:path*`, // URL of your WordPress server
  //     },
  //   ];
  // },
};

// Use ES Modules syntax for exporting
export default nextConfig;

```

# package.json

```json
{
  "name": "carlosmarten",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.679.0",
    "@aws-sdk/client-sqs": "^3.679.0",
    "@aws-sdk/s3-request-presigner": "^3.679.0",
    "@vercel/analytics": "^1.3.1",
    "@vercel/postgres": "^0.10.0",
    "@vercel/speed-insights": "^1.0.14",
    "@wordpress/api-fetch": "^7.8.0",
    "canvas-confetti": "^1.9.3",
    "framer-motion": "^11.9.0",
    "next": "^15.0.3",
    "next-auth": "^5.0.0-beta.22",
    "next-themes": "^0.3.0",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^5.3.0",
    "sharp": "^0.33.5",
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "14.2.13",
    "eslint-plugin-react": "^7.37.1"
  }
}

```

# providers\theme-provider.jsx

```jsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

```

# public\android-chrome-192x192.png

This is a binary file of the type: Image

# public\android-chrome-512x512.png

This is a binary file of the type: Image

# public\apple-touch-icon.png

This is a binary file of the type: Image

# public\favicon-16x16.png

This is a binary file of the type: Image

# public\favicon-32x32.png

This is a binary file of the type: Image

# public\images\feature_blog.png

This is a binary file of the type: Image

# public\images\feature_holiday.png

This is a binary file of the type: Image

# public\images\feature_webframe.png

This is a binary file of the type: Image

# public\images\me.png

This is a binary file of the type: Image

# public\sw.js

```js
// public/sw.js

// Cache name for offline support
const CACHE_NAME = "carlosmarten-v1";

// Resources to cache
const RESOURCES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon-32x32.png",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  // Force waiting Service Worker to become active
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("Push data:", data);

      const options = {
        body: data.body,
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        vibrate: [100],
        tag: data.tag || "blog-notification",
        renotify: true,
        data: {
          url: data.url || "/",
          // Store the URL in both places for compatibility
          openUrl: data.url || "/",
          origin: self.registration.scope,
        },
        // Simplified actions without icons for better compatibility
        // actions: [
        //   {
        //     action: "open",
        //     title: "Read More",
        //   },
        //   {
        //     action: "close",
        //     title: "Close",
        //   },
        // ],
      };

      event.waitUntil(
        self.registration
          .showNotification(data.title, options)
          .then(() => console.log("Notification shown successfully"))
          .catch((error) => {
            console.error("Error showing notification:", error);
            // Fallback to basic notification
            return self.registration.showNotification(data.title, {
              body: data.body,
              icon: "/android-chrome-192x192.png",
              data: { url: data.url || "/" },
            });
          })
      );
    } catch (error) {
      console.error("Error processing push data:", error);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = new URL(
    event.notification.data.url || "/",
    self.registration.scope
  ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // iOS Safari doesn't support clients.openWindow in all cases
        // so we try to focus an existing window first
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no existing window, try to open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification);
});

// Add fetch handler for offline support
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Helper function to check if a client is focused
async function isClientFocused() {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return windowClients.some((client) => client.focused);
}

// Periodic sync for keeping the service worker alive
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "keep-alive") {
    event.waitUntil(
      // Perform minimal task to keep service worker active
      Promise.resolve()
    );
  }
});

```

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# scripts\generate-vapid-keys.js

```js
//for PWA

import webpush from "web-push";
const vapidKeys = webpush.generateVAPIDKeys();

console.log("Paste the following keys in your .env file:");
console.log("-------------------");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=", vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY=", vapidKeys.privateKey);

```

# scripts\process-queue.js

```js
//This script is not running here, it is running in a lambda function

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// Helper function to generate slug from the title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim();
}

async function generateAudio(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to generate audio: ${await response.text()}`);
  }

  return response.arrayBuffer();
}

async function uploadToS3(buffer, slug) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `audio/${slug}.mp3`, // Using slug in the S3 key
    Body: Buffer.from(buffer),
    ContentType: "audio/mpeg",
  });

  await s3Client.send(command);
}

export const handler = async (event) => {
  console.log("Processing messages:", JSON.stringify(event));

  const results = [];

  for (const record of event.Records) {
    try {
      const postData = JSON.parse(record.body);
      console.log("Processing post:", postData.title);

      const text = `${postData.title}. ${postData.content}`;
      const slug = generateSlug(postData.title);

      // Generate audio
      const audioBuffer = await generateAudio(text);
      console.log("Audio generated for post:", slug);

      // Upload to S3
      await uploadToS3(audioBuffer, slug);
      console.log("Audio uploaded for post:", slug);

      console.log(`Successfully processed post ${slug}`);
      results.push({
        postSlug: slug,
        status: "success",
      });
    } catch (error) {
      console.error("Error processing message:", error);
      results.push({
        postSlug: generateSlug(JSON.parse(record.body).title),
        status: "error",
        error: error.message,
      });
      throw error; // This will cause Lambda to retry the message
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};

```

