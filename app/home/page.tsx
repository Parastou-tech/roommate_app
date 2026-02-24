import Link from "next/link";
import DashboardPage from "@/components/DashboardPage";

export default function HomePage() {
  return (
    <DashboardPage title="Home">
      <div className="links">
        <Link href="/login">Back to Login</Link>
        <Link href="/register">Back to Register</Link>
      </div>
    </DashboardPage>
  );
}
