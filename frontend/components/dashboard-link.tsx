import Link from "next/link";

export function DashboardLink() {
  return <Link className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700" href="/dashboard">← Back to dashboard</Link>;
}
