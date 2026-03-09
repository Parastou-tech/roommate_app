"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuLinks = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/meals", label: "Meals", icon: "🍽️" },
  { href: "/inventory", label: "Inventory", icon: "🛒" },
  { href: "/chores", label: "Chores", icon: "🧹" },
  { href: "/collab", label: "Collab", icon: "👥" }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Main navigation">
        {menuLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`sidebar-link ${isActive ? "active" : ""}`}>
              <span>{link.label}</span>
              <span aria-hidden>{link.icon}</span>
            </Link>
          );
        })}
      </nav>
      <Link href="/login" className="logout-link">
        <span>Logout</span>
        <svg className="logout-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M10 17V19C10 19.55 9.55 20 9 20H5C4.45 20 4 19.55 4 19V5C4 4.45 4.45 4 5 4H9C9.55 4 10 4.45 10 5V7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M15 8L20 12L15 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12H10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </aside>
  );
}