"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ApiClientError, authApi } from "@/lib/api-client";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { setAuthenticatedUser } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");
    if (password.length < 12) return setError("Password must contain at least 12 characters.");
    if (isRegister && passwordConfirmation !== password) return setError("Passwords do not match.");

    setPending(true);
    setError("");
    try {
      const result = isRegister
        ? await authApi.register({ email, password, firstName: String(formData.get("firstName") ?? ""), lastName: String(formData.get("lastName") ?? "") })
        : await authApi.login({ email, password });
      setAuthenticatedUser(result.user);
      router.replace("/dashboard");
    } catch (error) {
      setError(error instanceof ApiClientError ? error.message : "We could not reach the service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6"><form className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm" onSubmit={submit}><p className="text-sm font-semibold text-blue-700">Subscription Renewal Reminder</p><h1 className="mt-2 text-2xl font-bold">{isRegister ? "Create your account" : "Welcome back"}</h1>{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<div className="mt-6 space-y-4">{isRegister && <NameFields />}<Field label="Email" name="email" type="email" /><Field label="Password" minLength={12} name="password" type="password" />{isRegister && <Field label="Confirm password" minLength={12} name="passwordConfirmation" type="password" />}</div><button className="mt-6 w-full rounded-md bg-blue-700 px-4 py-2.5 font-medium text-white disabled:opacity-60" disabled={pending} type="submit">{pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button><p className="mt-5 text-center text-sm text-slate-600">{isRegister ? "Already have an account?" : "New here?"} <Link className="font-medium text-blue-700" href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p></form></main>;
}

function NameFields() { return <><Field label="First name" name="firstName" /><Field label="Last name" name="lastName" /></>; }
function Field({ label, name, type = "text", minLength }: { label: string; name: string; type?: string; minLength?: number }) { return <label className="block text-sm font-medium" htmlFor={name}>{label}<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" id={name} minLength={minLength} name={name} required type={type} /></label>; }
