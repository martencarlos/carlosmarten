// components/private/ContactsList/ContactsList.jsx
"use client";
import { useState } from "react";
import { FaUser, FaEnvelope, FaComment, FaTimes } from "react-icons/fa";
import styles from "./contactslist.module.css";

export default function ContactsList({ contacts }) {
  const [selectedContact, setSelectedContact] = useState(null);

  if (!contacts) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  const openModal = (contact) => {
    setSelectedContact(contact);
  };

  const closeModal = () => {
    setSelectedContact(null);
  };

  return (
    <>
      <div className={styles.container}>
        {contacts.map((contact) => (
          <div 
            key={contact.id} 
            className={styles.card}
            onClick={() => openModal(contact)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openModal(contact);
              }
            }}
          >
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

      {/* Modal */}
      {selectedContact && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            <h2 className={styles.modalTitle}>Contact Details</h2>

            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>
                  <FaUser className={styles.modalIcon} />
                  <span>Name</span>
                </div>
                <p className={styles.modalValue}>{selectedContact.name}</p>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>
                  <FaEnvelope className={styles.modalIcon} />
                  <span>Email</span>
                </div>
                <p className={styles.modalValue}>
                  <a href={`mailto:${selectedContact.email}`}>
                    {selectedContact.email}
                  </a>
                </p>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>
                  <FaComment className={styles.modalIcon} />
                  <span>Message</span>
                </div>
                <p className={styles.modalValue}>{selectedContact.message}</p>
              </div>

              {selectedContact.created_at && (
                <div className={styles.modalSection}>
                  <div className={styles.modalLabel}>
                    <span>Submitted</span>
                  </div>
                  <p className={styles.modalValue}>
                    {new Date(selectedContact.created_at).toLocaleString()}
                  </p>
                </div>
              )}

              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>
                  <span>Contact ID</span>
                </div>
                <p className={styles.modalValue}>#{selectedContact.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}