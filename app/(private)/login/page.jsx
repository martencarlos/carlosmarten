import { SignIn } from "@components/(auth)/signin-button/signin-button";
import styles from "./page.module.css";

export default async function Login() {
  return (
    <div className={styles.container}>
      <SignIn />
    </div>
  );
}
