"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { defaultAccount, loadAccount, type StoredAccount } from "@/lib/account-store";
import { navItems } from "@/data";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isOpen?: boolean;
  onNavigate?: () => void;
};

function getTodayLabel() {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());
}

export function Sidebar({ isOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [account, setAccount] = useState<StoredAccount>(defaultAccount());

  useEffect(() => {
    function syncAccount() {
      setAccount(loadAccount());
    }

    syncAccount();
    window.addEventListener("atelio-account-updated", syncAccount);
    return () => window.removeEventListener("atelio-account-updated", syncAccount);
  }, []);

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.logo}>
        {account.logoUrl ? (
          <img alt="Logo entreprise" className={styles.logoImage} src={account.logoUrl} />
        ) : (
          <Image
            alt="Logo Atelio Flow"
            className={styles.logoImage}
            height={42}
            priority
            src="/atelio-logo.png"
            width={42}
          />
        )}
        <div className={styles.logoCopy}>
          <strong className={styles.logoTitle}>{account.companyName || "Atelio Flow"}</strong>
          <span className={styles.logoMeta}>Espace pro</span>
        </div>
      </div>

      <div className={styles.datePill}>{getTodayLabel()}</div>

      <div className={styles.navGroup}>
        <span className={styles.navLabel}>Principal</span>
        <div className={styles.navList}>
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                className={`${styles.navLink} ${active ? styles.navActive : ""}`}
                href={item.href}
                key={item.href}
                onClick={onNavigate}
              >
                <span className={styles.token}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                {"badge" in item ? <span className={styles.badge}>{item.badge}</span> : null}
              </Link>
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <Link
          className={`${styles.planCard} ${account.plan === "pro" ? styles.planCardPro : styles.planCardFree}`}
          href="/abonnement"
          onClick={onNavigate}
        >
          <div className={styles.planHead}>
            <span className={styles.navLabel}>Plan</span>
            <span className={styles.planStatus}>{account.plan === "pro" ? "Pro" : "Gratuit"}</span>
          </div>
          <strong className={styles.planName}>{account.plan === "pro" ? "Abonnement Pro" : "Plan Gratuit"}</strong>
          <p className={styles.planMeta}>
            {account.plan === "pro" ? "Votre abonnement Pro est actif." : "Passez à Pro pour débloquer plus de fonctionnalités."}
          </p>
          <span className={`${styles.planCta} button ${account.plan === "pro" ? "button-secondary" : "button-primary"} button-small`}>
            {account.plan === "pro" ? "Gérer mon abonnement" : "Passer à Pro"}
          </span>
        </Link>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {(account.fullName || "MA")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <div className={styles.userCopy}>
            <strong className={styles.userName}>{account.fullName || "Mathis"}</strong>
            <span className={styles.userRole}>Administrateur</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
