import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAuthed()) redirect("/admin/panel");
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Yönetici girişi</h1>
      <LoginForm />
    </main>
  );
}
