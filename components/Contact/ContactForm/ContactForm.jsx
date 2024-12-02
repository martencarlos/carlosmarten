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
