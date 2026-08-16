"use client";

import { useRouter } from "next/navigation";
import { Protected, useAuth } from "@/components/auth-provider";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function DashboardPage() { return <Protected><Dashboard /></Protected>; }

function Dashboard() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  async function handleSignOut() { await signOut(); router.replace("/login"); }
  return <main className="mx-auto min-h-screen max-w-5xl px-6 py-12"><div className="flex items-center justify-between gap-6"><div><p className="text-sm font-semibold text-blue-700">Subscription Renewal Reminder</p><h1 className="mt-2 text-3xl font-bold">Welcome back</h1><p className="mt-2 text-slate-600">Signed in as {user?.email}.</p></div><button className="rounded-md border border-slate-300 px-4 py-2 font-medium" onClick={handleSignOut} type="button">Log out</button></div><DashboardOverview /></main>;
}
