import Link from "next/link";

const menuLinks = [
  { href: "/home", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/inventory", label: "Inventory" },
  { href: "/chores", label: "Chores" },
  { href: "/collab", label: "Collab" }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Menu</h2>
      <nav>
        {menuLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
