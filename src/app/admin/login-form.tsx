"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-3">
      <input name="password" type="password" required autoFocus placeholder="Şifre" className="w-full rounded-lg border border-neutral-300 p-3" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-medium text-white disabled:opacity-50">
        Giriş yap
      </button>
    </form>
  );
}
