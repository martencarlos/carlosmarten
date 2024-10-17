"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./not-found.module.css";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.notfoundcontainer}>
      <h2>Not Found: {pathname} </h2>
      <p>Could not find requested resource</p>
      <button
        className={styles.allpostsbutton}
        onClick={() => router.push("/blog")}
      >
        View all posts
      </button>
    </div>
  );
}
