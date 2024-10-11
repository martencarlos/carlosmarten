"use client";
import { useState } from "react";
import styles from "./contact.module.css";
import { FaUser, FaEnvelope, FaCommentDots } from "react-icons/fa"; // Importing icons
import { addContact } from "actions/actions"; // Import the server action

export default function ContactForm() {
  const [loading, setLoading] = useState(false); // Manage loading state
  const [submitted, setSubmitted] = useState(false); // Manage success state
  const [error, setError] = useState(null); // Manage error state

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setLoading(true); // Set loading to true when submission starts
    setError(null); // Reset error state
    setSubmitted(false); // Reset submitted state

    const formData = new FormData(e.target); // Collect the form data

    try {
      // Send the form data using the server action
      await addContact(formData);

      // If successful, set the submitted state
      setSubmitted(true);
    } catch (err) {
      // If there's an error, store it in state
      setError("There was an issue submitting the form.");
    } finally {
      setLoading(false); // Stop the loading state once submission is complete
    }
  };

  return (
    <div>
      {submitted ? (
        <p className={styles.successMessage}>
          Thank you! Your message has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
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
