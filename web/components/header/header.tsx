"use client";

import Image from "next/image";
import styles from "./header.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className={styles.container}>
      <Link href="/" className={styles.logo_link}>
        <Image src="/logo-clear.svg" alt="Regimotion Logo" width={80} height={80} priority className={styles.logo_icon} />
      </Link>

      <nav>
        <ul className={styles.links_container}>
          <li>
            <Link href="/" className={pathname === "/" ? styles.active : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/modules" className={pathname === "/modules" ? styles.active : ""}>
              Modules
            </Link>
          </li>
          <li>
            <Link href="/account" className={pathname === "/account" ? styles.active : ""}>
              Account
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
