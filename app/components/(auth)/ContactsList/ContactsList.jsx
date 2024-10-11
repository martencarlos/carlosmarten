import { FaUser, FaEnvelope, FaComment } from "react-icons/fa";
import styles from "./contactslist.module.css";
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";

export default function ContactsList({ contacts }) {
  console.log("ContactsList loaded");
  if (!contacts) {
    return <LoadingComponent />;
  }

  return (
    <div className={styles.container}>
      {contacts.map((contact) => (
        <div key={contact.id} className={styles.contactCard}>
          <div className={styles.contactInfo}>
            <div className={styles.contactDetail}>
              <FaUser className={styles.icon} />
              <span className={styles.value}>{contact.name}</span>
            </div>
            <div className={styles.contactDetail}>
              <FaEnvelope className={styles.icon} />
              <span className={styles.value}>{contact.email}</span>
            </div>
          </div>
          <div className={styles.messageSection}>
            <FaComment className={styles.icon} />
            <span className={styles.messageValue}>{contact.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
