import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="page">
      <h1>Login</h1>
      <div className="links">
        <Link href="/register">Need an account? Register</Link>
        <Link href="/home">Login to Home</Link>
      </div>
    </main>
  );
}
