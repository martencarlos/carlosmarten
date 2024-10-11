// components/Dashboard.js

import ContactsList from "@components/(auth)/ContactsList/ContactsList";
import styles from "./page.module.css";
import { sql } from "@vercel/postgres";

export const revalidate = 0; // Disable ISR and force fresh data on every request

export default async function Contacts() {
  console.log("Dashboard - Contacts loaded");
  const res = await sql`SELECT * FROM contacts ORDER BY id DESC`;
  const contacts = res.rows;

  return (
    <div className={styles.contactsMain}>
      <h2>List of people who contacted</h2>
      <ContactsList contacts={contacts} />
    </div>
  );
}
