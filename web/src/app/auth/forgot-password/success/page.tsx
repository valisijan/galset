"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ForgotPasswordSuccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingVerificationEmail");
    if (!savedEmail) {
      router.push("/auth");
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setCooldown(60);

    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });

      if (sbError) throw sbError;

      toast.success("Poslat je novi link za promenu lozinke.");
    } catch (err: any) {
      toast.error("Greška pri slanju novog koda: " + (err.message || "Pokušajte ponovo"));
    }
  };

  return (
    <main className="min-h-screen bg-bg-1 flex items-center justify-center">
      <div className="w-full max-w-md p-7 md:p-8 rounded-3xl">
        {/* TITLE */}
        <h1 className="text-center text-2xl font-semibold text-text-main mb-2">
          Proverite vaše sanduče
        </h1>

        <p className="text-center text-gray-400 mb-8 text-sm">
          Poslali smo vam email sa linkom za promenu lozinke na:
          <br />
          <span className="text-text-main">{email}</span>
        </p>

        {/* RESEND */}
        <div className="text-center">
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

        {/* BACK TO LOGIN */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push("/auth/login")}
            className="text-sm text-white bg-bg-2 hover:bg-bg-3 hover:no-underline px-4 py-2 rounded-full transition-all duration-300 font-semibold cursor-pointer"
          >
            Nazad na prijavu
          </button>
        </div>
      </div>
    </main>
  );
}
