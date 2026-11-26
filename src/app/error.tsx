"use client";

import { Icon } from "@/components/icons";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full" style={{ background: "var(--cancelled-bg)", color: "var(--cancelled-fg)" }}>
          <Icon name="x" size={26} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Bir şeyler ters gitti</h1>
        <p className="mt-2 text-muted">Beklenmedik bir hata oluştu. Lütfen tekrar deneyin; sorun sürerse işletmeyi arayarak randevu alabilirsiniz.</p>
        {error.digest && <p className="num mt-3 text-xs text-faint">Hata kodu: {error.digest}</p>}
        <button onClick={reset} className="btn btn-primary mt-8">Tekrar dene</button>
      </div>
    </main>
  );
}
