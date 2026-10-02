"use client";

import { FormEvent, useState } from "react";
import { errorMessage, signIn, signUp } from "../apis/backend";
import type { User } from "../types/api";

export default function AuthForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    if (register && password !== data.get("confirmation")) { setError("비밀번호가 일치하지 않습니다."); return; }
    setBusy(true); setError("");
    try { onLogin(await (register ? signUp : signIn)(email, password)); }
    catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <section className="login-page">
    <div className="login-intro"><p>WELCOME TO</p><h1>LOOKFIND</h1></div>
    <form className="login-panel" onSubmit={submit} aria-busy={busy}>
      <h2>{register ? "SIGN UP" : "LOGIN"}</h2>
      <label>EMAIL<input type="email" name="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required disabled={busy} /></label>
      <label>PASSWORD<input type="password" name="password" autoComplete={register ? "new-password" : "current-password"} minLength={8} maxLength={128} placeholder="8자 이상 입력" required disabled={busy} /></label>
      {register && <label>CONFIRM PASSWORD<input type="password" name="confirmation" autoComplete="new-password" minLength={8} maxLength={128} required disabled={busy} /></label>}
      {error && <p className="api-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "처리 중…" : register ? "SIGN UP" : "LOGIN"} <span>↗</span></button>
      <a className="kakao-login" href="/api/auth/kakao">KAKAO로 계속하기 <span>↗</span></a>
      <small>{register ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"} <button className="auth-switch" type="button" disabled={busy} onClick={() => { setRegister(!register); setError(""); }}>{register ? "LOGIN" : "SIGN UP"}</button></small>
    </form>
  </section>;
}
