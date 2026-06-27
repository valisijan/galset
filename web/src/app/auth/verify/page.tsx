"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function EmailVerificationPage() {
  const router = useRouter();
  const { refreshUser, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleVerify = async () => {
    setError("");

    if (!code.trim()) {
      setError("Molimo unesite kod");
      return;
    }
    setLoading(true);

    try {
      const type = localStorage.getItem("verificationType");

      if (type === "register") {
        const { error: sbError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "signup",
        });

        if (sbError) {
          throw new Error(sbError.message === "Token has expired or is invalid" ? "Netačan ili istekao kod za verifikaciju" : sbError.message);
        }

        localStorage.removeItem("registerPayload");
        cleanup();
        await refreshUser();
        router.push("/");
        return;
      }

      if (type === "reset") {
        const { error: sbError } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "recovery",
        });

        if (sbError) {
          throw new Error(sbError.message === "Token has expired or is invalid" ? "Netačan ili istekao kod za verifikaciju" : sbError.message);
        }

        cleanup();
        await refreshUser();
        router.push("/auth/reset-password");
        return;
      }

      throw new Error("Nepoznat tip verifikacije");
    } catch (err: any) {
      setError(err.message || "Greška pri verifikaciji");
    } finally {
      setLoading(false);
    }
  };

  const resendOtpCode = async (targetEmail: string, verificationType: string, isAuto = false) => {
    if (!targetEmail || cooldown > 0) return;

    setCooldown(60);

    try {
      if (verificationType === "register") {
        const { error: sbError } = await supabase.auth.resend({
          type: "signup",
          email: targetEmail,
        });
        if (sbError) throw sbError;
      } else if (verificationType === "reset") {
        const { error: sbError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        });
        if (sbError) throw sbError;
      } else {
        throw new Error("Nepoznat tip verifikacije za ponovno slanje");
      }

      if (isAuto) {
        toast.success("Poslat je novi verifikacioni kod.");
      }
    } catch (err: any) {
      alert("Greška pri slanju novog koda: " + (err.message || "Pokušajte ponovo"));
    }
  };

  const handleResend = () => {
    resendOtpCode(email, localStorage.getItem("verificationType") || "");
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingVerificationEmail");
    const type = localStorage.getItem("verificationType");

    if (!savedEmail || !type) {
      router.push("/auth");
      return;
    }

    setEmail(savedEmail);

    const shouldAutoResend = localStorage.getItem("autoResendOtp");
    if (shouldAutoResend === "true") {
      localStorage.removeItem("autoResendOtp");
      resendOtpCode(savedEmail, type, true);
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const cleanup = () => {
    localStorage.removeItem("pendingVerificationEmail");
    localStorage.removeItem("verificationType");
    document.cookie = "pending_verification=; path=/; max-age=0;";
  };

  return (
    <main className="min-h-screen bg-bg-1 flex items-center justify-center">
      <div className="w-full max-w-md p-7 md:p-8 rounded-3xl">

        {/* TITLE */}
        <h1 className="text-center text-2xl font-semibold text-text-main mb-2">
          Proverite vaše sanduče
        </h1>

        <p className="text-center text-gray-400 mb-8 text-sm">
          Poslali smo vam kod na:
          <br />
          <span className="text-text-main">{email}</span>
        </p>

        {/* CODE INPUT */}
        <div className="relative mb-6">
          <input
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setCode(val);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleVerify();
            }}
            className={`
              w-full bg-transparent px-4 py-4 text-text-main rounded-full
              border
              focus:outline-none
              peer
              ${error ? "border-red-500 focus:border-red-500" : "border-bg-4 focus:border-[#6366f1]"}
            `}
          />
          <label
            className={`
              absolute left-4 bg-bg-1 px-1 pointer-events-none
              transform transition-all
              ${(code.length > 0 || error)
                ? "-translate-y-2 text-sm"
                : "translate-y-4 text-gray-300"}
              
              peer-focus:-translate-y-2 peer-focus:text-sm
              
              ${error
                ? "text-red-500 peer-focus:text-red-500"
                : "text-gray-300 peer-focus:text-[#6366f1]"}
            `}
          >
            Kod
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
              !
            </div>
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className={`
            w-full py-4 rounded-full text-white font-semibold transition cursor-pointer flex justify-center items-center
            ${loading
              ? "bg-[#5b42f3] cursor-not-allowed opacity-70"
              : "transition-all duration-[350ms] bg-[#5b42f3] hover:bg-[#4b35d6] cursor-pointer"}
          `}
        >
          {loading ? <Loader /> : "Nastavi"}
        </button>

        {/* RESEND */}
        <div className="text-center mt-6">
          <button
            onClick={handleResend}
            disabled={cooldown > 0}
            className={`
              w-full py-4 rounded-full text-white font-semibold transition cursor-pointer flex justify-center items-center bg-bg-2 border-none
              ${cooldown > 0
                ? "opacity-50 cursor-not-allowed text-gray-500"
                : "hover:bg-bg-3"}
            `}
          >
            {cooldown > 0 ? `Ponovo pošalji email za ${cooldown}s` : "Ponovo pošalji email"}
          </button>
        </div>

        {/* LOGOUT */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await logout();
                cleanup();
                router.push("/auth/login");
              } catch (err: any) {
                setError(err.message || "Greška pri odjavljivanju");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="text-sm text-white bg-bg-2 hover:bg-bg-3 hover:no-underline px-4 py-2 rounded-full transition-all duration-300 font-semibold cursor-pointer"
          >
            Odjavi me
          </button>
        </div>

      </div>
    </main >
  );
}
