"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Loader from "@/components/Loader";

export default function LoginRegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /^\S+@\S+\.\S+$/;

  useEffect(() => {
    const editing = localStorage.getItem("authEmailEdit");

    if (editing) {
      const saved = localStorage.getItem("authEmail");
      if (saved) setEmail(saved);

      localStorage.removeItem("authEmailEdit");
    }
  }, []);

  const handleContinue = async () => {
    setError("");

    if (!email.trim()) {
      setError("Molimo unesite email adresu.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Email adresa nije ispravna.");
      return;
    }

    setChecking(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      localStorage.setItem("authEmail", email);
      if (data.fullName) {
        localStorage.setItem("authFullName", data.fullName);
      } else {
        localStorage.removeItem("authFullName");
      }

      if (data.exists) {
        if (data.isDeactivated) {
          localStorage.setItem("authAccountStatus", "deactivated");
        } else {
          localStorage.removeItem("authAccountStatus");
          localStorage.removeItem("authDaysUntilDeletion");
        }
        router.push("/auth/login");
      } else {
        localStorage.removeItem("authAccountStatus");
        localStorage.removeItem("authDaysUntilDeletion");
        router.push("/auth/create-account");
      }
    } catch (e) {
      console.log(e);
      setError("Došlo je do greške na serveru. Pokušajte ponovo.");
    } finally {
      setChecking(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(`Greška pri prijavi sa ${provider}: ` + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-bg-1 flex flex-col items-center justify-start md:justify-center py-5">
      <div className="w-full max-w-md p-7 md:p-8 rounded-3xl">

        <h1 className="text-center text-2xl font-semibold text-text-main mb-8">
          Dobrodošli na Galset!
        </h1>

        {/* OAuth Buttons */}
        <div className="space-y-4">
          <OAuthButton icon="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/oauth/google.svg" text="Nastavi sa Google" onClick={() => handleOAuthLogin("google")} />
          {/* <OAuthButton icon="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/oauth/facebook.svg" text="Nastavi sa Facebook" onClick={() => handleOAuthLogin("facebook")} /> */}
          {/* <OAuthButton icon="https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/oauth/apple.svg" text="Nastavi sa Apple" onClick={() => handleOAuthLogin("apple")} /> */}
        </div>

        <div className="flex items-center my-8">
          <div className="flex-1 h-[1px] bg-bg-4" />
          <span className="text-gray-400 px-3">ili</span>
          <div className="flex-1 h-[1px] bg-bg-4" />
        </div>

        {/* EMAIL INPUT */}
        <div className="relative mb-6">
          <input
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleContinue();
            }}
            className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
              ${error ? "border-red-500 focus:border-red-500" : "border-bg-4 focus:border-[#6366f1]"}`}
          />

          <label
            className={`
              absolute left-4 bg-bg-1 px-1 pointer-events-none
              transform transition-all
              peer-focus:-translate-y-2 peer-focus:text-sm
              ${(email.length > 0 || error)
                ? "-translate-y-2 text-sm"
                : "translate-y-4 text-gray-300"}
              
              ${error
                ? "text-red-500 peer-focus:text-red-500"
                : "peer-focus:text-[#6366f1] text-gray-300"}
            `}
          >
            Email adresa
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

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={checking}
          className={`
            w-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-semibold py-4 rounded-full transition-all duration-[350ms] cursor-pointer flex justify-center items-center
            ${checking ? "opacity-70 cursor-not-allowed" : ""}
          `}
        >
          {checking ? <Loader /> : "Nastavi"}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#6366f1]">
          <Link href="/policies/terms-of-use" className="hover:underline cursor-pointer">Uslovi korišćenja</Link>
          <span className="text-gray-400">|</span>
          <Link href="/policies/privacy-policy" className="hover:underline cursor-pointer">Politika privatnosti</Link>
        </div>
      </div>
    </main>
  );
}

function OAuthButton({ icon, text, onClick }: { icon: string; text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 rounded-full border border-bg-3 bg-bg-2 hover:border-[#555] hover:brightness-110 transition cursor-pointer"
    >
      <Image src={icon} alt="icon" width={22} height={22} />
      <span className="text-text-main">{text}</span>
    </button>
  );
}
