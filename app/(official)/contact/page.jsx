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
