import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="page">
      <h1>Register</h1>
      <div className="links">
        <Link href="/login">Already have an account? Login</Link>
        <Link href="/home">Continue to Home</Link>
      </div>
    </main>
  );
}
