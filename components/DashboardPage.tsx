import { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function DashboardPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="main">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}
