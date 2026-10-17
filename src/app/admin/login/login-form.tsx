"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/server/admin";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" });
  return (
    <main className="flex min-h-screen items-center justify-center bg-subtle-gradient px-4">
      <form action={action} className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <p className="text-sm font-semibold text-primary">INAME CMS</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-muted-foreground">Chỉ tài khoản quản trị đã được cấp mới thay đổi được nội dung website.</p>
        <input type="hidden" name="next" value={nextPath} />
        <label className="mt-6 block text-sm font-semibold">Email
          <input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-normal" />
        </label>
        <label className="mt-4 block text-sm font-semibold">Mật khẩu
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-normal" />
        </label>
        {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
        <button disabled={pending} className="mt-6 h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground" type="submit">
          {pending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
