// Path: components/Contact/ContactForm/ContactForm.jsx
"use client";
import { useState } from "react";
import styles from "./contact.module.css";
import { FaUser, FaEnvelope, FaCommentDots, FaPaperPlane } from "react-icons/fa";
import { addContact } from "@actions/actions";
import confetti from "canvas-confetti";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;
    
    if (field === "email" && formData.email && !validateEmail(formData.email)) {
      return "Please enter a valid email address";
    }
    if (!formData[field]) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    const formDataObj = new FormData(e.target);

    try {
      await addContact(formDataObj);
      setSubmitted(true);
      setLoading(false);
      
      // Reset form
      setFormData({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
      
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 10000,
        colors: ['#3F72AF', '#DBE2EF', '#112D4E']
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      validateEmail(formData.email) &&
      formData.message
    );
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <FaPaperPlane />
          </div>
          <h1 className={styles.successTitle}>Message Sent!</h1>
          <p className={styles.successText}>
            Thank you for reaching out. I'll get back to you as soon as possible.
          </p>
          <button 
            className={styles.resetButton}
            onClick={() => setSubmitted(false)}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formHeader}>
          <h1 className={styles.title}>Let's Connect</h1>
          <p className={styles.subtitle}>
            Have a question or want to work together? Drop me a message!
          </p>
        </div>

        <div className={styles.formBody}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                <FaUser className={styles.labelIcon} />
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={() => handleBlur("name")}
                placeholder="John Doe"
                required
                className={`${styles.input} ${getFieldError("name") ? styles.inputError : ""}`}
                disabled={loading}
              />
              {getFieldError("name") && (
                <span className={styles.errorText}>{getFieldError("name")}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <FaEnvelope className={styles.labelIcon} />
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur("email")}
                placeholder="john@example.com"
                required
                className={`${styles.input} ${getFieldError("email") ? styles.inputError : ""}`}
                disabled={loading}
              />
              {getFieldError("email") && (
                <span className={styles.errorText}>{getFieldError("email")}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              <FaCommentDots className={styles.labelIcon} />
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              onBlur={() => handleBlur("message")}
              placeholder="Tell me about your project or question..."
              required
              className={`${styles.textarea} ${getFieldError("message") ? styles.inputError : ""}`}
              disabled={loading}
              rows="5"
            />
            {getFieldError("message") && (
              <span className={styles.errorText}>{getFieldError("message")}</span>
            )}
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.button} 
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className={styles.buttonIcon} />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}