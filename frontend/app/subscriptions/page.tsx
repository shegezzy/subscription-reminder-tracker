"use client";
import Link from "next/link";
import { Protected } from "@/components/auth-provider";
import { DashboardLink } from "@/components/dashboard-link";
import { SubscriptionList } from "@/components/subscription-list";
export default function SubscriptionsPage() { return <Protected><main className="mx-auto min-h-screen max-w-5xl px-6 py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700">Subscription Renewal Reminder</p><h1 className="mt-2 text-3xl font-bold">Your subscriptions</h1><p className="mt-2 text-slate-600">Track what is renewing and when.</p></div><div className="flex flex-wrap gap-3"><DashboardLink /><Link className="rounded-md bg-blue-700 px-4 py-2.5 font-medium text-white" href="/subscriptions/new">Add subscription</Link></div></div><div className="mt-8"><SubscriptionList /></div></main></Protected>; }
