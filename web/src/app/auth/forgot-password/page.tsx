"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("authEmail");
    if (saved) setEmail(saved);
  }, []);

  const handleContinue = async () => {
    if (!email.trim()) return;

    setLoading(true);

    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });

      if (sbError) throw sbError;

      localStorage.setItem("pendingVerificationEmail", email);
      localStorage.setItem("verificationType", "reset");
      document.cookie = "pending_verification=; path=/; max-age=0;";
      router.push("/auth/forgot-password/success");
    } catch (err: any) {
      toast.error(err.message || "Greška pri slanju emaila");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleContinue();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [email]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleContinue();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [email, loading]);

  return (
    <main className="min-h-screen bg-bg-1 flex items-center justify-center">
      <div className="w-full max-w-md p-7 md:p-8 rounded-3xl">
        <h1 className="text-center text-2xl font-semibold text-text-main mb-3">
          Promenite lozinku
        </h1>

        <p className="text-center text-gray-400 mb-8 text-sm">
          Poslaćemo vam link za promenu lozinke na:
          <br />
          <span className="text-text-main">{email}</span>
        </p>

        <button
          onClick={handleContinue}
          disabled={loading}
          className={`w-full py-4 rounded-full text-white font-semibold transition cursor-pointer flex justify-center items-center
            ${loading
              ? "bg-[#5b42f3] cursor-not-allowed opacity-70"
              : "transition-all duration-[350ms] bg-[#5b42f3] hover:bg-[#4b35d6]"}`}
        >
          {loading ? <Loader /> : "Nastavi"}
        </button>

        <div className="mt-5 flex justify-center">
          <button
            onClick={() => router.push("/auth/login")}
            className="text-sm text-white bg-bg-2 hover:bg-bg-3 hover:no-underline px-4 py-2 rounded-full transition-all duration-300 font-semibold cursor-pointer"
          >
            Vrati se na prijavu
          </button>
        </div>
      </div>
    </main>
  );
}
