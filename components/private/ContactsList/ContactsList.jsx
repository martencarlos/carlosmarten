// Path: components/private/ContactsList/ContactsList.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import {
  FaUser,
  FaEnvelope,
  FaComment,
  FaTimes,
  FaClock,
  FaThLarge,
  FaList,
  FaSort,
  FaSortUp,
  FaSortDown
} from "react-icons/fa";
import styles from "./contactslist.module.css";

export default function ContactsList({ contacts }) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  // Sorting state: default to newest first
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [mounted, setMounted] = useState(false);

  // Initialize view mode from localStorage on client side
  useEffect(() => {
    setMounted(true);
    const savedView = localStorage.getItem('contactsViewMode');
    if (savedView) {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('contactsViewMode', mode);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort Logic
  const sortedContacts = useMemo(() => {
    if (!contacts) return [];

    let sortableItems = [...contacts];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle Date sorting specifically
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        // Handle String sorting (case insensitive)
        else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [contacts, sortConfig]);

  // Helper to render sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <FaSort className={styles.sortIconIdle} />;
    return sortConfig.direction === 'asc'
      ? <FaSortUp className={styles.sortIconActive} />
      : <FaSortDown className={styles.sortIconActive} />;
  };

  if (!contacts) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  // Prevent hydration mismatch for viewMode
  if (!mounted) return null;

  const openModal = (contact) => setSelectedContact(contact);
  const closeModal = () => setSelectedContact(null);

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
    <div className={styles.wrapper}>
      {/* View Toggle Header */}
      <div className={styles.controlsHeader}>
        <div className={styles.stats}>
          <span>{contacts.length} Messages</span>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'card' ? styles.active : ''}`}
            onClick={() => handleViewChange('card')}
            aria-label="Card View"
          >
            <FaThLarge />
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => handleViewChange('list')}
            aria-label="List View"
          >
            <FaList />
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className={viewMode === 'card' ? styles.gridContainer : styles.listContainer}>

        {/* List Header - Sortable */}
        {viewMode === 'list' && (
          <div className={styles.listHeaderRow}>
            <div className={`${styles.colName} ${styles.sortableHeader}`} onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </div>
            <div className={`${styles.colEmail} ${styles.sortableHeader}`} onClick={() => handleSort('email')}>
              Email {getSortIcon('email')}
            </div>
            <div className={`${styles.colMessage} ${styles.sortableHeader}`} onClick={() => handleSort('message')}>
              Message Preview {getSortIcon('message')}
            </div>
            <div className={`${styles.colDate} ${styles.sortableHeader}`} onClick={() => handleSort('created_at')}>
              Date {getSortIcon('created_at')}
            </div>
          </div>
        )}

        {sortedContacts.map((contact) => (
          <div
            key={contact.id}
            className={viewMode === 'card' ? styles.card : styles.listRow}
            onClick={() => openModal(contact)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openModal(contact);
              }
            }}
          >
            {/* --- CARD VIEW --- */}
            {viewMode === 'card' ? (
              <>
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
              </>
            ) : (
              /* --- LIST VIEW --- */
              <>
                <div className={styles.colName}>
                  <div className={styles.listAvatar}>{getInitials(contact.name)}</div>
                  <span className={styles.listNameText}>{contact.name}</span>
                </div>
                <div className={styles.colEmail}>{contact.email}</div>
                <div className={styles.colMessage}>
                  <span className={styles.listMessageText}>{contact.message}</span>
                </div>
                <div className={styles.colDate}>
                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal (Unchanged) */}
      {selectedContact && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal} aria-label="Close modal">
              <FaTimes />
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.modalAvatar}>{getInitials(selectedContact.name)}</div>
              <div className={styles.modalHeaderInfo}>
                <h2 className={styles.modalTitle}>{selectedContact.name}</h2>
                <a href={`mailto:${selectedContact.email}`} className={styles.modalEmail}>
                  <FaEnvelope /> {selectedContact.email}
                </a>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.messageSection}>
                <div className={styles.sectionHeader}>
                  <FaComment className={styles.sectionIcon} />
                  <h3>Message</h3>
                </div>
                <div className={styles.messageContent}>{selectedContact.message}</div>
              </div>
              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <FaClock className={styles.metaIcon} />
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>Submitted</span>
                    <span className={styles.metaValue}>{formatDate(selectedContact.created_at)}</span>
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
              <button className={styles.actionButton} onClick={() => window.location.href = `mailto:${selectedContact.email}`}>
                <FaEnvelope /> Reply via Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}