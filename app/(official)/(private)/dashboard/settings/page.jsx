// components/Dashboard.js
import styles from './page.module.css';
import SignOutButton from '@components/(auth)/signout-button/signout-button';
import { RiLogoutBoxLine } from "react-icons/ri";

const Settings = () => {
  console.log("Dashboard loaded");

  return (
    <div className={styles.settings}>
      <div className={styles.settingsContent}>
        <h2 className={styles.settingsHeader}>Settings</h2>
        {/* You can add other settings options here in the future */}
      </div>

      <div className={styles.signOutSection}>
        <SignOutButton className={styles.signOutButton}>
          <RiLogoutBoxLine />
          <span>Sign Out</span>
        </SignOutButton>
      </div>
    </div>
  );
};

export default Settings;