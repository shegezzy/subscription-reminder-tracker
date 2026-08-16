"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardLink } from "@/components/dashboard-link";
import { ApiClientError, subscriptionApi, type Subscription } from "@/lib/api-client";

type Period = "monthly" | "annual";
type CurrencyTotals = Record<string, number>;
type CategoryTotals = Record<string, CurrencyTotals>;

function amount(value: Subscription["amount"]) { return typeof value === "number" ? value : Number(value.$numberDecimal); }
function projection(subscription: Subscription, period: Period) {
  const value = amount(subscription.amount);
  const annual = { weekly: value * 52, monthly: value * 12, quarterly: value * 4, yearly: value }[subscription.billingCycle];
  return period === "annual" ? annual : annual / 12;
}
function formatCurrency(value: number, currency: string) { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value); }
function byCurrency(subscriptions: Subscription[], period: Period): CurrencyTotals { return subscriptions.reduce<CurrencyTotals>((totals, subscription) => { totals[subscription.currency] = (totals[subscription.currency] ?? 0) + projection(subscription, period); return totals; }, {}); }
function byCategory(subscriptions: Subscription[]): CategoryTotals { return subscriptions.reduce<CategoryTotals>((totals, subscription) => { const category = subscription.category?.trim() || "Uncategorised"; const values = totals[category] ?? {}; values[subscription.currency] = (values[subscription.currency] ?? 0) + projection(subscription, "monthly"); totals[category] = values; return totals; }, {}); }
function Totals({ totals }: { totals: CurrencyTotals }) { return <ul className="mt-3 space-y-1">{Object.entries(totals).sort(([left], [right]) => left.localeCompare(right)).map(([currency, total]) => <li key={currency} className="flex justify-between gap-4"><span>{currency}</span><span className="font-semibold">{formatCurrency(total, currency)}</span></li>)}</ul>; }

export function SpendingAnalytics() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { void subscriptionApi.list().then(({ subscriptions: items }) => setSubscriptions(items)).catch((cause: unknown) => setError(cause instanceof ApiClientError ? cause.message : "We could not load your spending analytics.")).finally(() => setLoading(false)); }, []);
  const analytics = useMemo(() => { const active = subscriptions.filter((subscription) => subscription.status === "active" && !subscription.isTrial); return { active, monthly: byCurrency(active, "monthly"), annual: byCurrency(active, "annual"), categories: byCategory(active), currencies: Array.from(new Set(active.map((subscription) => subscription.currency))).sort() }; }, [subscriptions]);
  if (loading) return <main className="grid min-h-screen place-items-center" role="status">Loading spending analytics…</main>;
  if (error) return <main className="mx-auto min-h-screen max-w-5xl px-6 py-12"><DashboardLink /><p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p></main>;
  return <main className="mx-auto min-h-screen max-w-5xl px-6 py-12"><DashboardLink /><div className="mt-6"><p className="text-sm font-semibold text-blue-700">Subscription Renewal Reminder</p><h1 className="mt-2 text-3xl font-bold">Spending analytics</h1><p className="mt-2 text-slate-600">Active paid subscriptions only. Currency amounts are separate and never converted.</p></div>{analytics.active.length === 0 ? <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h2 className="text-lg font-semibold">No active subscriptions to analyse</h2><p className="mt-2 text-slate-600">Add or reactivate a paid subscription to see projections.</p><Link className="mt-5 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white" href="/subscriptions/new">Add a subscription</Link></section> : <section className="mt-8 space-y-8"><div className="grid gap-4 sm:grid-cols-3"><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Active subscriptions</p><p className="mt-3 text-3xl font-bold">{analytics.active.length}</p></article><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Monthly projection</p><Totals totals={analytics.monthly} /></article><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Annual projection</p><Totals totals={analytics.annual} /></article></div><div className="grid gap-6 lg:grid-cols-2"><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Spending by category</h2><p className="mt-1 text-sm text-slate-600">Monthly projection by category and currency.</p><div className="mt-5 space-y-5">{Object.entries(analytics.categories).sort(([left], [right]) => left.localeCompare(right)).map(([category, totals]) => <div key={category} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0"><h3 className="font-medium">{category}</h3><Totals totals={totals} /></div>)}</div></article><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Spending by currency</h2><p className="mt-1 text-sm text-slate-600">Totals stay in their original currencies.</p><div className="mt-5 space-y-5">{analytics.currencies.map((currency) => <div key={currency} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0"><h3 className="font-medium">{currency}</h3><p className="mt-2 text-sm text-slate-600">Monthly</p><p className="font-semibold">{formatCurrency(analytics.monthly[currency] ?? 0, currency)}</p><p className="mt-2 text-sm text-slate-600">Annual</p><p className="font-semibold">{formatCurrency(analytics.annual[currency] ?? 0, currency)}</p></div>)}</div></article></div></section>}</main>;
}
