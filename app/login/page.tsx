"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell from "@/components/AuthPageShell";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    router.push("/home");
  }

  return (
    <AuthPageShell title="Login">
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

      
        <button type="submit" className="auth-primary">
          Login
        </button>

        {error ? <p className="auth-error">{error}</p> : null}

        <p className="auth-alt">Don&apos;t have an account?</p>
        <button type="button" className="auth-link" onClick={() => router.push("/register")}>
          ★ Register
        </button>
      </form>
    </AuthPageShell>
  );
}