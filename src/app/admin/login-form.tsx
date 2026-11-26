"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="pw" className="label">Şifre</label>
        <input id="pw" name="password" type="password" required autoFocus autoComplete="current-password" placeholder="••••••••" className="field" aria-invalid={error ? true : undefined} aria-describedby={error ? "pw-err" : undefined} />
      </div>
      {error && (
        <p id="pw-err" role="alert" className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger">
          <Icon name="x" size={16} /> {error}
        </p>
      )}
      <button disabled={pending} className="btn btn-primary btn-lg">
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        {!pending && <Icon name="arrowRight" size={18} />}
      </button>
    </form>
  );
}
