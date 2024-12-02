import SignInButton from "@components/(auth)/signin-button/signin-button.jsx";
import styles from "./page.module.css";

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Please sign in with GitHub to access the dashboard
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
