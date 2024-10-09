// app/contact/page.js
import ContactForm from "@components/ContactForm/ContactForm";
import styles from "./page.module.css";

export default function ContactPage() {
  console.log("Contact page loaded");
  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Let&apos;s Chat!</h1>
        <p className={styles.subtitle}>
          Have questions, ideas, or just want to say hi? Drop us a message!
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
