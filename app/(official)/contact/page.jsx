// Path: app/(official)/contact/page.jsx
import ContactForm from "components/Contact/ContactForm/ContactForm";
import styles from "./page.module.css";
import { Suspense } from "react";
import ContactFormSkeleton from "@components/Contact/ContactForm/ContactFormSkeleton";

// Static page - no revalidation needed
export const metadata = {
  title: 'Contact - Carlos Marten',
  description: 'Get in touch with Carlos Marten for technology and business consulting',
};

export default function ContactPage() {
  console.log("Contact page loaded");
  
  return (
    <div className={styles.contactPage}>
      <Suspense fallback={<ContactFormSkeleton />}>
        <ContactForm />
      </Suspense>
    </div>
  );
}