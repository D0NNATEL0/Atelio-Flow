"use client";

import { useEffect, useState } from "react";
import { defaultAccount, loadAccount, saveAccount, type StoredAccount } from "@/lib/account-store";
import styles from "./page.module.css";

export default function SubscriptionPage() {
  const [account, setAccount] = useState<StoredAccount>(defaultAccount());
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    setAccount(loadAccount());
  }, []);

  function switchPlan(plan: "free" | "pro") {
    const nextAccount = { ...account, plan };
    setAccount(nextAccount);
    saveAccount(nextAccount);
  }

  function getCurrentMonthEndLabel() {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return endOfMonth.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function confirmCancellation() {
    switchPlan("free");
    setCancelModalOpen(false);
  }

  return (
    <div className={styles.page}>
      {cancelModalOpen ? (
        <div className={styles.modalOverlay} onClick={() => setCancelModalOpen(false)}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <span className={styles.cardLabel}>Confirmation</span>
            <strong className={styles.modalTitle}>Es-tu sûr de résilier ?</strong>
            <p className={styles.modalText}>
              Ton abonnement prendra fin le {getCurrentMonthEndLabel()}. Jusqu’à cette date, tu gardes l’accès au plan
              Pro, puis ton espace repassera automatiquement sur le plan Gratuit.
            </p>
            <div className={styles.modalActions}>
              <button className="button button-secondary" onClick={() => setCancelModalOpen(false)} type="button">
                Garder mon abonnement
              </button>
              <button className="button button-primary" onClick={confirmCancellation} type="button">
                Confirmer la résiliation
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className={styles.header}>
        <div>
          <div className={styles.tag}>Abonnement</div>
          <h1 className={styles.title}>
            Passe sur <span className={styles.gradient}>Pro</span>
          </h1>
          <p className={styles.subtitle}>
            {account.plan === "pro"
              ? "Ton espace Pro est actif. Tu peux toujours revenir au plan Gratuit à la fin de la période en cours."
              : "Tu es actuellement sur le plan Gratuit. Si tu veux aller plus vite et débloquer plus de possibilités, Pro est la suite logique."}
          </p>
        </div>
      </section>

      <section className={styles.heroCard}>
        <span className={styles.cardLabel}>Abonnement</span>
        <strong className={styles.heroTitle}>Choisis entre Gratuit et Pro</strong>
        <p className={styles.heroText}>
          L’idée est simple : Gratuit pour démarrer, Pro dès que ton usage devient plus régulier.
        </p>
      </section>

      <section className={styles.plansGrid}>
        <article className={styles.planCard}>
          <div className={styles.planHead}>
            <div className={styles.planTop}>
              <span className={styles.cardLabel}>Plan actuel</span>
              <span className={styles.planBadge}>{account.plan === "free" ? "Actif" : "Disponible"}</span>
            </div>
            <strong className={styles.planName}>Gratuit</strong>
            <div className={styles.planPriceRow}>
              <span className={styles.planPrice}>0 €</span>
              <span className={styles.planMeta}>pour démarrer</span>
            </div>
            <p className={styles.planDescription}>
              Idéal pour démarrer, créer quelques documents et structurer son espace avant de passer à un usage plus soutenu.
            </p>
          </div>

          <div className={styles.featureList}>
            <div className={styles.featureRow}>Jusqu’à 5 clients</div>
            <div className={styles.featureRow}>Jusqu’à 10 documents</div>
            <div className={styles.featureRow}>Devis et factures uniquement</div>
            <div className={styles.featureRow}>Export PDF simple</div>
          </div>

          <div className={styles.planActions}>
            <button
              className="button button-secondary"
              onClick={() => {
                if (account.plan === "pro") {
                  setCancelModalOpen(true);
                  return;
                }

                switchPlan("free");
              }}
              type="button"
            >
              {account.plan === "pro" ? "Basculer sur Gratuit" : "Basculer sur Gratuit"}
            </button>
          </div>
        </article>

        <article className={`${styles.planCard} ${styles.planCardRecommended}`}>
          <div className={styles.planHead}>
            <div className={styles.planTop}>
              <span className={styles.cardLabel}>Recommandé</span>
              <span className={styles.planBadge}>{account.plan === "pro" ? "Actif" : "Pro"}</span>
            </div>
            <strong className={styles.planName}>Pro</strong>
            <div className={styles.planPriceRow}>
              <span className={styles.planPrice}>3,99 €</span>
              <span className={styles.planMeta}>/ mois</span>
            </div>
            <p className={styles.planDescription}>
              Pensé pour un vrai usage pro : plus de volume, plus d’automatisation, plus de confort dans la gestion.
            </p>
          </div>

          <div className={styles.featureList}>
            <div className={styles.featureRow}>Clients illimités</div>
            <div className={styles.featureRow}>Documents illimités</div>
            <div className={styles.featureRow}>Devis, factures, contrats et avenants</div>
            <div className={styles.featureRow}>Export PDF complet</div>
          </div>

          <div className={styles.planActions}>
            {account.plan === "pro" ? (
              <button className="button button-primary" onClick={() => setCancelModalOpen(true)} type="button">
                Résilier mon abonnement
              </button>
            ) : (
              <button className="button button-primary" onClick={() => switchPlan("pro")} type="button">
                Passer à Pro
              </button>
            )}
            <a className="button button-secondary" href="/compte">
              Voir mon compte
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
