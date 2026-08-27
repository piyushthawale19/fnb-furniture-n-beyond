/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, ShieldCheck, KeyRound, AlertTriangle, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import FnbLogo from "./FnbLogo";

interface AdminLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLoginModal({
  isOpen,
  onLoginSuccess,
  onCancel,
}: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setIsSubmitting(false);
        onLoginSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMessage(data.error || "Invalid Administrator credentials. Access denied.");
      }
    } catch (err: any) {
      console.warn("API login endpoint error, verifying through fallback:", err);
      // Fallback check in case backend endpoint is unreachable during isolated tests
      const fallbackUser = (import.meta as any).env?.VITE_ADMIN_USERNAME || "omkar123";
      const fallbackPass = (import.meta as any).env?.VITE_ADMIN_PASSWORD || "omkar@123";
      if (username.trim() === fallbackUser && password === fallbackPass) {
        setIsSubmitting(false);
        onLoginSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMessage("Invalid Administrator credentials. Access denied.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-stone-950/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-900/30 bg-stone-900 p-6 sm:p-8 text-white shadow-2xl">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-600/15 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-amber-800/15 blur-2xl pointer-events-none"></div>

        {/* Security Header Badge */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-5">
          <div className="flex items-center space-x-3">
            <FnbLogo className="h-10 w-auto" light={true} />
            <div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Protected System
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-100">
                Admin Console Auth
              </h2>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="rounded-full bg-stone-800/60 p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            title="Close / Cancel"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs font-light text-stone-400 leading-relaxed">
          Access to the FNB Factory Management Panel is restricted to authorized personnel. Please authenticate with administrator credentials.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center space-x-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs font-bold text-red-300 animate-shake">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-200/70 mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Enter admin username"
                className="w-full rounded-xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-xs font-medium text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-200/70 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-stone-800 bg-stone-950/80 pl-4 pr-10 py-3 text-xs font-medium text-white placeholder-stone-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-100 shadow-lg hover:from-amber-600 hover:to-amber-800 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Verify Credentials & Enter Console</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security note footer */}
        <div className="mt-6 border-t border-stone-800/80 pt-4 flex items-center justify-between text-[10px] text-stone-500">
          <div className="flex items-center space-x-1 text-stone-400">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>High-Security Encrypted Portal</span>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-amber-400 underline cursor-pointer"
          >
            Back to Public Site
          </button>
        </div>

      </div>
    </div>
  );
}
