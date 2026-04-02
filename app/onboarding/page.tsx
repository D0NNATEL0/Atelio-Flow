"use client";

import Image from "next/image";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-row">
          <div className="auth-brand-mark">
            <Image alt="Logo Atelio Flow" className="auth-brand-logo" height={56} priority src="/atelio-logo.png" width={56} />
          </div>
          <div className="auth-brand-pill">Atelio Flow</div>
        </div>
        <h1 className="auth-title">Ton espace est prêt</h1>
        <p className="auth-description">
          L’outil simple pour tes documents pro. Finalise maintenant ton identité et commence à créer tes premiers documents.
        </p>

        <div className="auth-form-shell">
          <div className="auth-form">
            <Link className="button button-primary auth-submit" href="/compte">
              Configurer mon compte
            </Link>
            <Link className="button button-secondary auth-submit" href="/">
              Aller au dashboard
            </Link>
          </div>

          <div className="auth-footer">
            <p className="auth-alt-link">
              Tu pourras toujours retrouver ces réglages plus tard dans <Link href="/compte">Mon compte</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
