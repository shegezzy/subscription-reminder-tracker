import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
      <p className="text-sm font-semibold text-blue-700">Subscription Renewal Reminder</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-bold">Never get surprised by a recurring charge again.</h1>
      <p className="mt-5 max-w-xl text-lg text-slate-600">Track subscriptions, trials, and recurring expenses in one clear place.</p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white" href="/register">Create an account</Link>
        <Link className="rounded-lg border border-slate-300 px-5 py-3 font-medium" href="/login">Sign in</Link>
      </div>
    </main>
  );
}
