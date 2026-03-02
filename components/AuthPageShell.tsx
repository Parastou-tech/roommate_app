"use client";

import { ReactNode } from "react";
import BrandLogo from "./BrandLogo";

export default function AuthPageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth-shell">
      <header className="app-header">
        <div className="header-brand">
          <BrandLogo />
        </div>
        <h1>{title}</h1>
        <div className="header-spacer" aria-hidden />
      </header>
      <section className="auth-content">{children}</section>
    </main>
  );
}
