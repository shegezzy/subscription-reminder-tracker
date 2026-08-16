"use client";

import { Protected } from "@/components/auth-provider";
import { SpendingAnalytics } from "@/components/spending-analytics";

export default function AnalyticsPage() { return <Protected><SpendingAnalytics /></Protected>; }
