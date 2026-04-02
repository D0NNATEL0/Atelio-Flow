"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!isSupabaseConfigured) {
      setFeedback({
        type: "error",
        text: "La connexion n'est pas encore branchée. Ajoute les clés Supabase pour activer l'accès."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setFeedback({ type: "error", text: error.message });
        return;
      }

      setFeedback({ type: "success", text: "Connexion réussie. Redirection en cours..." });
      router.push("/");
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Impossible de se connecter pour le moment."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setFeedback(null);

    if (!isSupabaseConfigured) {
      setFeedback({
        type: "error",
        text: "La connexion Google n'est pas encore configurée. Ajoute Supabase et le provider Google pour l'activer."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      });

      if (error) {
        setFeedback({ type: "error", text: error.message });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Impossible de lancer la connexion Google."
      });
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-row">
          <div className="auth-brand-mark">
            <Image alt="Logo Atelio Flow" className="auth-brand-logo" height={56} priority src="/atelio-logo.png" width={56} />
          </div>
          <div className="auth-brand-pill">Atelio Flow</div>
        </div>
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-description">
          L’outil simple pour tes documents pro.
        </p>

        <div className="auth-form-shell">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                className="input"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="contact@atelio.fr"
                type="email"
                value={email}
              />
            </label>

            <label className="field">
              <span>Mot de passe</span>
              <input
                autoComplete="current-password"
                className="input"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </label>

            <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="auth-divider">ou</div>

          <div className="oauth-grid">
            <button className="button button-secondary oauth-button" disabled={isSubmitting} onClick={handleGoogleLogin} type="button">
              <svg aria-hidden="true" className="oauth-icon" viewBox="0 0 24 24">
                <path
                  d="M21.35 11.1H12v2.98h5.35c-.23 1.48-1.8 4.35-5.35 4.35-3.22 0-5.84-2.67-5.84-5.96s2.62-5.96 5.84-5.96c1.84 0 3.07.79 3.77 1.47l2.57-2.49C16.7 3.95 14.58 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.19 0 8.63-3.65 8.63-8.8 0-.59-.06-1.04-.14-1.1Z"
                  fill="currentColor"
                />
              </svg>
              Continuer avec Google
            </button>
          </div>

          {feedback ? (
            <div className={`form-feedback ${feedback.type === "error" ? "form-feedback-error" : "form-feedback-success"}`}>
              {feedback.text}
            </div>
          ) : null}

          <div className="auth-footer">
            <p className="auth-alt-link">
              Pas encore de compte ? <Link href="/auth/signup">Créer un compte</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
