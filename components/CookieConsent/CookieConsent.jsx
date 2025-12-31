// components/CookieConsent/CookieConsent.jsx
"use client";

import { useState, useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { FaCookieBite } from "react-icons/fa";
import styles from "./cookieconsent.module.css";

export default function CookieConsent({ gaId }) {
    const [consent, setConsent] = useState(null); // null = not yet decided
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const savedConsent = localStorage.getItem("cookie_consent");
        if (savedConsent) {
            setConsent(savedConsent);
        } else {
            // Small delay to show banner smoothly
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setConsent("granted");
        setShowBanner(false);
        localStorage.setItem("cookie_consent", "granted");
    };

    const handleDecline = () => {
        setConsent("denied");
        setShowBanner(false);
        localStorage.setItem("cookie_consent", "denied");
    };

    return (
        <>
            {/* 1. Conditionally load Google Analytics based on consent state */}
            {consent === "granted" && <GoogleAnalytics gaId={gaId} />}

            {/* 2. Consent Banner UI */}
            {showBanner && (
                <div className={styles.banner}>
                    <div className={styles.content}>
                        <div className={styles.textContainer}>
                            <div className={styles.iconWrapper}>
                                <FaCookieBite className={styles.icon} />
                            </div>
                            <div className={styles.textContent}>
                                <h3 className={styles.title}>Cookie Consent</h3>
                                <p className={styles.description}>
                                    We use cookies to improve your experience and analyze site traffic.
                                    In compliance with GDPR, we do not track you until you give explicit consent.
                                </p>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={handleDecline} className={styles.declineButton}>
                                Decline
                            </button>
                            <button onClick={handleAccept} className={styles.acceptButton}>
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}