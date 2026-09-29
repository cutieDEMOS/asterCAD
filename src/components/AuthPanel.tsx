import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthMode = "WELCOME" | "SIGN_IN" | "SIGN_UP";

function getUserLabel(session: Session): string {
  return (
    session.user.user_metadata.user_name ??
    session.user.user_metadata.preferred_username ??
    session.user.user_metadata.display_name ??
    session.user.email ??
    "Signed-in user"
  );
}

export function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AuthMode>("WELCOME");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMessage(error.message);
      }

      setSession(data.session);
      setIsLoading(false);
    }

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (nextSession) {
        setMode("WELCOME");
        setMessage(null);
        setErrorMessage(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function clearFeedback() {
    setMessage(null);
    setErrorMessage(null);
  }

  function showSignIn() {
    clearFeedback();
    setMode("SIGN_IN");
  }

  function showSignUp() {
    clearFeedback();
    setMode("SIGN_UP");
  }

  function showWelcome() {
    clearFeedback();
    setMode("WELCOME");
  }

  async function signInWithGitHub() {
    clearFeedback();
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  }

  async function submitEmailSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    if (password.length < 8) {
      setErrorMessage("Choose a password with at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: email.trim().split("@")[0],
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPassword("");
    setMessage(
      "Check your email and open the confirmation link. After that, return here and sign in with your email and password.",
    );
  }

  async function submitEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        "Could not sign in. Confirm your email first, then check your email address and password.",
      );
    }
  }

  async function signOut() {
    clearFeedback();
    setIsSubmitting(true);

    const { error } = await supabase.auth.signOut();

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return <span className="auth-status">Checking sign-in…</span>;
  }

  if (session) {
    return (
      <div className="auth-panel">
        <span className="auth-status">
          Signed in as {getUserLabel(session)}
        </span>

        <button
          className="secondary-button"
          disabled={isSubmitting}
          onClick={() => void signOut()}
          type="button"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (mode === "SIGN_UP") {
    return (
      <div className="auth-popover">
        <h3>Create account</h3>

        <form onSubmit={submitEmailSignUp}>
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          <button
            className="text-button"
            disabled={isSubmitting}
            onClick={showSignIn}
            type="button"
          >
            Already have an account? Sign in
          </button>

          <button
            className="text-button"
            disabled={isSubmitting}
            onClick={showWelcome}
            type="button"
          >
            Cancel
          </button>
        </div>

        {message && <p className="auth-message">{message}</p>}
        {errorMessage && <p className="auth-error">{errorMessage}</p>}
      </div>
    );
  }

  if (mode === "SIGN_IN") {
    return (
      <div className="auth-popover">
        <h3>Sign in with email</h3>

        <form onSubmit={submitEmailSignIn}>
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-links">
          <button
            className="text-button"
            disabled={isSubmitting}
            onClick={showSignUp}
            type="button"
          >
            Need an account? Create one
          </button>

          <button
            className="text-button"
            disabled={isSubmitting}
            onClick={showWelcome}
            type="button"
          >
            Cancel
          </button>
        </div>

        {message && <p className="auth-message">{message}</p>}
        {errorMessage && <p className="auth-error">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <button
        className="primary-button"
        disabled={isSubmitting}
        onClick={() => void signInWithGitHub()}
        type="button"
      >
        Sign in with GitHub
      </button>

      <button
        className="secondary-button"
        disabled={isSubmitting}
        onClick={showSignIn}
        type="button"
      >
        Sign in with email
      </button>

      <button
        className="secondary-button"
        disabled={isSubmitting}
        onClick={showSignUp}
        type="button"
      >
        Create account
      </button>

      {errorMessage && <p className="auth-error">{errorMessage}</p>}
    </div>
  );
}