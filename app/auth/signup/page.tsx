"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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
        text: "La création de compte n'est pas encore branchée. Ajoute les clés Supabase pour activer l'inscription."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/onboarding`
        }
      });

      if (error) {
        const normalizedMessage = error.message.toLowerCase();
        const alreadyExists =
          normalizedMessage.includes("already registered") ||
          normalizedMessage.includes("already exists") ||
          normalizedMessage.includes("already been registered");

        setFeedback({
          type: "error",
          text: alreadyExists ? "Cette adresse mail est déjà reliée à un compte." : error.message
        });
        return;
      }

      const duplicateSignup =
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0;

      if (duplicateSignup) {
        setFeedback({
          type: "error",
          text: "Cette adresse mail est déjà reliée à un compte."
        });
        return;
      }

      setFeedback({
        type: "success",
        text: "Compte créé. Vérifie ton email si une confirmation est demandée, puis termine ton installation."
      });
      router.push("/onboarding");
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Impossible de créer le compte pour le moment."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setFeedback(null);

    if (!isSupabaseConfigured) {
      setFeedback({
        type: "error",
        text: "La création avec Google n'est pas encore configurée. Ajoute Supabase et le provider Google pour l'activer."
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
        text: error instanceof Error ? error.message : "Impossible de lancer l'inscription Google."
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
        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-description">
          L’outil simple pour tes documents pro.
        </p>

        <div className="auth-form-shell">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nom complet</span>
              <input
                autoComplete="name"
                className="input"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Mathis Dupont"
                value={fullName}
              />
            </label>

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
                autoComplete="new-password"
                className="input"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="8 caractères minimum"
                type="password"
                value={password}
              />
            </label>

            <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <div className="auth-divider">ou</div>

          <div className="oauth-grid">
            <button className="button button-secondary oauth-button" disabled={isSubmitting} onClick={handleGoogleSignup} type="button">
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
              Déjà un compte ? <Link href="/auth/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
