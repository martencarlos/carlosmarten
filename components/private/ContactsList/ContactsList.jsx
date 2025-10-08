// Path: components/private/ContactsList/ContactsList.jsx
"use client";
import { useState } from "react";
import { FaUser, FaEnvelope, FaComment, FaTimes, FaClock } from "react-icons/fa";
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {getInitials(contact.name)}
              </div>
              <div className={styles.headerInfo}>
                <h3 className={styles.contactName}>{contact.name}</h3>
                <p className={styles.contactEmail}>{contact.email}</p>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.messagePreview}>
                <FaComment className={styles.messageIcon} />
                <p className={styles.messageText}>{contact.message}</p>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.contactId}>ID: {contact.id}</span>
              {contact.created_at && (
                <span className={styles.timestamp}>
                  {formatDate(contact.created_at)}
                </span>
              )}
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

            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>
                {getInitials(selectedContact.name)}
              </div>
              <div className={styles.modalHeaderInfo}>
                <h2 className={styles.modalTitle}>{selectedContact.name}</h2>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className={styles.modalEmail}
                >
                  <FaEnvelope />
                  {selectedContact.email}
                </a>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.messageSection}>
                <div className={styles.sectionHeader}>
                  <FaComment className={styles.sectionIcon} />
                  <h3>Message</h3>
                </div>
                <div className={styles.messageContent}>
                  {selectedContact.message}
                </div>
              </div>

              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <FaClock className={styles.metaIcon} />
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>Submitted</span>
                    <span className={styles.metaValue}>
                      {formatDate(selectedContact.created_at)}
                    </span>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>#</div>
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>Contact ID</span>
                    <span className={styles.metaValue}>{selectedContact.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.actionButton}
                onClick={() => window.location.href = `mailto:${selectedContact.email}`}
              >
                <FaEnvelope />
                Reply via Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}