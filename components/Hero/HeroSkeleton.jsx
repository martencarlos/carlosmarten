//components / Hero / HeroSkeleton.jsx
import styles from "./HeroSkeleton.module.css";

export default function HeroSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.imageWrapper}>
                <div className={styles.imageSkeleton}></div>
            </div>

            <div className={styles.textContainer}>
                {/* Title placeholder */}
                <div className={styles.titleSkeleton}></div>

                {/* Paragraph placeholders */}
                <div className={styles.paragraphSkeleton}>
                    <div className={styles.line} style={{ width: "100%" }}></div>
                    <div className={styles.line} style={{ width: "95%" }}></div>
                    <div className={styles.line} style={{ width: "90%" }}></div>
                </div>

                <div className={styles.paragraphSkeleton}>
                    <div className={styles.line} style={{ width: "98%" }}></div>
                    <div className={styles.line} style={{ width: "92%" }}></div>
                </div>

                <div className={styles.paragraphSkeleton}>
                    <div className={styles.line} style={{ width: "96%" }}></div>
                    <div className={styles.line} style={{ width: "88%" }}></div>
                </div>
            </div>
        </div>
    );
}