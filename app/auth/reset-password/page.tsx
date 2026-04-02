"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [hasRecoveryAccess, setHasRecoveryAccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkRecoverySession() {
      if (!isSupabaseConfigured) {
        setFeedback({
          type: "error",
          text: "La réinitialisation n'est pas encore branchée. Ajoute les clés Supabase pour l'activer."
        });
        setIsCheckingLink(false);
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (!session) {
          setFeedback({
            type: "error",
            text: "Le lien de réinitialisation est invalide ou expiré. Redemande un nouvel email depuis l'écran de connexion."
          });
          setHasRecoveryAccess(false);
        } else {
          setHasRecoveryAccess(true);
        }
      } catch (error) {
        if (cancelled) return;
        setFeedback({
          type: "error",
          text: error instanceof Error ? error.message : "Impossible de vérifier le lien de réinitialisation."
        });
      } finally {
        if (!cancelled) {
          setIsCheckingLink(false);
        }
      }
    }

    void checkRecoverySession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!isSupabaseConfigured) {
      setFeedback({
        type: "error",
        text: "La réinitialisation n'est pas encore branchée. Ajoute les clés Supabase pour l'activer."
      });
      return;
    }

    if (password.length < 8) {
      setFeedback({
        type: "error",
        text: "Choisis un mot de passe d'au moins 8 caractères."
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        type: "error",
        text: "Les deux mots de passe ne correspondent pas."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        setFeedback({
          type: "error",
          text: error.message
        });
        return;
      }

      setFeedback({
        type: "success",
        text: "Ton mot de passe a bien été réinitialisé. Redirection vers la connexion..."
      });

      window.setTimeout(() => {
        router.push("/auth/login");
      }, 1400);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Impossible de mettre à jour le mot de passe pour le moment."
      });
    } finally {
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

        <h1 className="auth-title">Réinitialiser le mot de passe</h1>
        <p className="auth-description">
          Choisis un nouveau mot de passe pour ton compte Atelio Flow. Une fois validé, tu pourras te reconnecter normalement.
        </p>

        <div className="auth-form-shell">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nouveau mot de passe</span>
              <input
                autoComplete="new-password"
                className="input"
                disabled={!hasRecoveryAccess || isCheckingLink || isSubmitting}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </label>

            <label className="field">
              <span>Confirmer le mot de passe</span>
              <input
                autoComplete="new-password"
                className="input"
                disabled={!hasRecoveryAccess || isCheckingLink || isSubmitting}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
              />
            </label>

            <button
              className="button button-primary auth-submit"
              disabled={!hasRecoveryAccess || isCheckingLink || isSubmitting}
              type="submit"
            >
              {isCheckingLink ? "Vérification du lien..." : isSubmitting ? "Mise à jour..." : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>

          {feedback ? (
            <div className={`form-feedback ${feedback.type === "error" ? "form-feedback-error" : "form-feedback-success"}`}>
              {feedback.text}
            </div>
          ) : null}

          <div className="auth-footer">
            <p className="auth-alt-link">
              Retour à <Link href="/auth/login">la connexion</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
