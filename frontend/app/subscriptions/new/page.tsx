"use client";
import { Protected } from "@/components/auth-provider";
import { SubscriptionForm } from "@/components/subscription-form";
export default function NewSubscriptionPage() { return <Protected><main className="mx-auto min-h-screen max-w-2xl px-6 py-12"><p className="text-sm font-semibold text-blue-700">Subscription Renewal Reminder</p><h1 className="mt-2 text-3xl font-bold">Add a subscription</h1><p className="mt-2 text-slate-600">Save the details you need to track the next renewal.</p><div className="mt-8"><SubscriptionForm /></div></main></Protected>; }
