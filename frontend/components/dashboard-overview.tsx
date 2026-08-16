"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiClientError, subscriptionApi, type Subscription } from "@/lib/api-client";

const UPCOMING_DAYS = 30;
const TRIAL_ENDING_DAYS = 7;

function amount(value: Subscription["amount"]) {
  return typeof value === "number" ? value : Number(value.$numberDecimal);
}

function startOfToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function dateFromApi(value: string) {
  return new Date(value);
}

function currencyAmount(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(
    dateFromApi(value),
  );
}

function daysUntil(value: string, today: Date) {
  return Math.round((dateFromApi(value).getTime() - today.getTime()) / 86_400_000);
}

function projection(subscription: Subscription) {
  const value = amount(subscription.amount);
  switch (subscription.billingCycle) {
    case "weekly":
      return { monthly: (value * 52) / 12, annual: value * 52 };
    case "monthly":
      return { monthly: value, annual: value * 12 };
    case "quarterly":
      return { monthly: value / 3, annual: value * 4 };
    case "yearly":
      return { monthly: value / 12, annual: value };
  }
}

function totalsByCurrency(subscriptions: Subscription[], period: "monthly" | "annual") {
  return subscriptions.reduce<Record<string, number>>((totals, subscription) => {
    const total = projection(subscription)[period];
    totals[subscription.currency] = (totals[subscription.currency] ?? 0) + total;
    return totals;
  }, {});
}

function TotalLines({ totals }: { totals: Record<string, number> }) {
  const entries = Object.entries(totals);
  return entries.length === 0 ? <p className="mt-3 text-sm text-slate-600">No active subscriptions</p> : <div className="mt-3 space-y-1">{entries.map(([currency, total]) => <p key={currency} className="text-lg font-bold">{currencyAmount(total, currency)}</p>)}</div>;
}

function relativeDate(value: string, today: Date) {
  const days = daysUntil(value, today);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `In ${days} days`;
}

export function DashboardOverview() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void subscriptionApi
      .list()
      .then(({ subscriptions: items }) => setSubscriptions(items))
      .catch((cause: unknown) => setError(cause instanceof ApiClientError ? cause.message : "We could not load your dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const dashboard = useMemo(() => {
    const today = startOfToday();
    const active = subscriptions.filter((subscription) => subscription.status === "active");
    const regular = active.filter((subscription) => !subscription.isTrial);
    const upcoming = regular
      .filter((subscription) => {
        const days = daysUntil(subscription.renewalDate, today);
        return days >= 0 && days <= UPCOMING_DAYS;
      })
      .sort((left, right) => dateFromApi(left.renewalDate).getTime() - dateFromApi(right.renewalDate).getTime());
    const trialsEnding = active
      .filter((subscription) => subscription.isTrial && subscription.trialEndDate)
      .filter((subscription) => {
        const days = daysUntil(subscription.trialEndDate!, today);
        return days >= 0 && days <= TRIAL_ENDING_DAYS;
      })
      .sort((left, right) => dateFromApi(left.trialEndDate!).getTime() - dateFromApi(right.trialEndDate!).getTime());

    return {
      active,
      upcoming,
      nextCharge: upcoming[0],
      trialsEnding,
      monthly: totalsByCurrency(regular, "monthly"),
      annual: totalsByCurrency(regular, "annual"),
      today,
    };
  }, [subscriptions]);

  if (loading) return <p className="py-12 text-center text-slate-600" role="status">Loading dashboard…</p>;
  if (error) return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>;
  if (subscriptions.length === 0) return <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h2 className="text-lg font-semibold">No subscriptions yet</h2><p className="mt-2 text-slate-600">Add a subscription to see your upcoming charges and spending outlook.</p><Link className="mt-5 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white" href="/subscriptions/new">Add a subscription</Link></section>;

  return <section className="mt-8 space-y-8">
    <div className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Active subscriptions</p><p className="mt-3 text-3xl font-bold">{dashboard.active.length}</p></article>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Monthly spending</p><TotalLines totals={dashboard.monthly} /></article>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Annual projection</p><TotalLines totals={dashboard.annual} /></article>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Next charge</p>{dashboard.nextCharge ? <div className="mt-3"><p className="text-xl font-bold">{dashboard.nextCharge.name}</p><p className="mt-1 font-semibold">{currencyAmount(amount(dashboard.nextCharge.amount), dashboard.nextCharge.currency)}</p><p className="mt-2 text-sm text-slate-600">Renews {displayDate(dashboard.nextCharge.renewalDate)} · {relativeDate(dashboard.nextCharge.renewalDate, dashboard.today)}</p></div> : <p className="mt-3 text-sm text-slate-600">No renewals in the next {UPCOMING_DAYS} days.</p>}</article>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-600">Trials ending soon</p>{dashboard.trialsEnding.length > 0 ? <ul className="mt-3 space-y-3">{dashboard.trialsEnding.map((subscription) => <li key={subscription._id}><p className="font-semibold">{subscription.name}</p><p className="text-sm text-slate-600">Ends {displayDate(subscription.trialEndDate!)} · {relativeDate(subscription.trialEndDate!, dashboard.today)}</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">No trials end in the next {TRIAL_ENDING_DAYS} days.</p>}</article>
    </div>

    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold">Upcoming renewals</h2><p className="mt-1 text-sm text-slate-600">Active subscriptions renewing in the next {UPCOMING_DAYS} days.</p></div><Link className="text-sm font-medium text-blue-700" href="/subscriptions">View all</Link></div>{dashboard.upcoming.length > 0 ? <ul className="mt-5 divide-y divide-slate-100">{dashboard.upcoming.map((subscription) => <li key={subscription._id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold">{subscription.name}</p><p className="text-sm text-slate-600">{displayDate(subscription.renewalDate)} · {relativeDate(subscription.renewalDate, dashboard.today)}</p></div><p className="font-semibold">{currencyAmount(amount(subscription.amount), subscription.currency)}</p></li>)}</ul> : <p className="mt-5 text-sm text-slate-600">No upcoming renewals in this period.</p>}</article>
  </section>;
}
