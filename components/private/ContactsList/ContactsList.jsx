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
