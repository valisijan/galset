"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState("");

  const router = useRouter();
  const { refreshUser } = useAuth();

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("authEmail");
    if (saved) setEmail(saved);
    const savedName = localStorage.getItem("authFullName");
    if (savedName) setFullName(savedName);
  }, []);

  const handleTogglePassword = () => {
    const input = passwordRef.current;
    if (!input) return;

    const cursorPos = input.selectionStart ?? password.length;
    setShowPassword((prev) => !prev);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Molimo unesite lozinku");
      return;
    }

    setLoading(true);

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (sbError) {
        if (sbError.message === "Email not confirmed") {
          localStorage.setItem("pendingVerificationEmail", email);
          localStorage.setItem("verificationType", "register");
          localStorage.setItem("autoResendOtp", "true");
          document.cookie = "pending_verification=true; path=/; max-age=86400;";
          toast.success("Vaša email adresa nije verifikovana. Preusmeravamo vas na verifikaciju.");
          router.push("/auth/verify");
          return;
        }
        setError("Pogrešna lozinka");
        return;
      }

      localStorage.removeItem("authAccountStatus");

      await refreshUser();
      router.push("/");



      await refreshUser();
      router.push("/");

    } catch (err) {
      setError("Greška na serveru. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-1 flex items-center justify-center">
      <div className="w-full max-w-md p-7 md:p-8 rounded-3xl">

        <h1 className="text-center text-2xl font-semibold text-text-main mb-8">
          {fullName ? `Zdravo, ${fullName}` : "Prijavite se"}
        </h1>

        {/* DISABLED DEFAULT HTML5 VALIDATION */}
        <form onSubmit={handleLogin} noValidate>

          {/* EMAIL */}
          <div className="relative mb-6">
            <input
              type="email"
              readOnly
              value={email}
              className="
                w-full border border-bg-4 rounded-full bg-transparent pl-4 pr-24 py-4 text-text-main
                focus:outline-none focus:border-[#6366f1] peer
              "
            />

            <label
              className="
                absolute left-4 text-gray-300 pointer-events-none
                transform -translate-y-2 text-sm bg-bg-1 px-1
                peer-focus:text-[#6366f1]
              "
            >
              Email adresa
            </label>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem("authEmailEdit", "true");
                router.push("/auth");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-bg-2 text-white hover:bg-bg-3 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer"
            >
              Izmeni
            </button>
          </div>

          {/* PASSWORD INPUT */}
          <div className={`relative ${error ? "mb-3" : "mb-6"}`}>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={`
                w-full rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
                border
                ${error ? "border-red-500 focus:border-red-500" : "border-bg-4 focus:border-[#6366f1]"}
              `}
            />

            <label
              className={`
                absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                peer-focus:-translate-y-2 peer-focus:text-sm
                ${(password.length > 0 || error)
                  ? "-translate-y-2 text-sm"
                  : "translate-y-4 text-gray-300"}
                
                ${error
                  ? "text-red-500 peer-focus:text-red-500"
                  : "peer-focus:text-[#6366f1] text-gray-300"}
              `}
            >
              Lozinka
            </label>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleTogglePassword}
              className="absolute inset-y-0 right-4 flex items-center justify-center text-gray-400 hover:text-text-main cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
                !
              </div>
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-4 text-white font-semibold rounded-full transition cursor-pointer
              flex items-center justify-center
              ${loading
                ? "transition-all duration-[350ms] bg-[#5b42f3] cursor-not-allowed"
                : "transition-all duration-[350ms] bg-[#5b42f3] hover:bg-[#4b35d6]"
              }
            `}
          >
            {loading ? <Loader /> : "Prijavite se"}
          </button>

          <div className="mt-6 flex justify-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-white bg-bg-2 hover:bg-bg-3 hover:no-underline px-4 py-2 rounded-full transition-all duration-300 font-semibold"
            >
              Zaboravljena lozinka?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
