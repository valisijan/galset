"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Check, X, ChevronDown } from "lucide-react";
import Loader from "@/components/Loader";



function CountrySelect({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [locationsData, setLocationsData] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const countries = Object.keys(locationsData);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/locations.json`)
      .then(r => r.json())
      .then(data => setLocationsData(data || {}))
      .catch(() => setLocationsData({}));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full min-h-[56px] bg-transparent border rounded-full px-4 py-4 text-left focus:outline-none transition-colors duration-200 ${error ? "border-red-500" : open ? "border-[#6366f1]" : "border-bg-4"
          }`}
      >
        <span className={value ? "text-text-main" : "text-gray-400"}>
          {value || "\u00A0"}
        </span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          <ChevronDown size={18} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      <label
        className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all duration-200 ${value || open
          ? "top-0 -translate-y-2 text-sm"
          : "top-1/2 -translate-y-1/2 text-sm"
          } ${error ? "text-red-500" : open ? "text-[#6366f1]" : "text-gray-300"
          }`}
      >
        Država
      </label>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-bg-2 border border-bg-3 rounded-3xl overflow-y-auto max-h-56 shadow-xl
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-bg-4
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-[#6366f1]
              transition-colors"
          >
            {countries.map((country) => (
              <li
                key={country}
                onMouseDown={() => {
                  onChange(country);
                  setOpen(false);
                }}
                className={`px-6 py-3 cursor-pointer text-sm transition-colors ${
                  value === country
                    ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                    : "text-text-main hover:bg-bg-3"
                }`}
              >
                {country}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordCheckItem({ isMet, text, showError }: { isMet: boolean; text: string; showError: boolean }) {
  const colorClass = isMet ? "text-[#6366f1]" : showError ? "text-red-500" : "text-text-main";
  const icon = isMet ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ) : showError ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ) : (
    <div className="w-1 h-1 rounded-full bg-white ml-1 mr-0.5" />
  );

  return (
    <li className={`flex items-center gap-2 text-xs transition-colors duration-300 ${colorClass}`}>
      {icon}
      <span>{text}</span>
    </li>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
    country: "Srbija",
  });

  const [errors, setErrors] = useState({
    password: "",
    username: "",
    fullName: "",
  });

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken">("idle");

  useEffect(() => {
    const saved = localStorage.getItem("authEmail");
    if (saved) {
      setForm((prev) => ({ ...prev, email: saved }));
    }
  }, []);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [hasBlurredPassword, setHasBlurredPassword] = useState(false);

  const passwordChecks = {
    length: form.password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
  };

  const allMet = passwordChecks.length && passwordChecks.hasLetter && passwordChecks.hasNumber;
  const showPasswordError = (!!errors.password || (hasBlurredPassword && !allMet)) && !allMet;
  const shouldShowHints = isPasswordFocused || (hasBlurredPassword && !allMet);

  const handleTogglePassword = () => {
    const input = passwordRef.current;
    if (!input) return;

    const cursorPos = input.selectionStart ?? form.password.length;
    setShowPassword((prev) => !prev);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") {
      if (value.length > 30) return;
      const regex = /^[a-zA-Z0-9._-]*$/;
      if (!regex.test(value)) return;
    }

    setForm({ ...form, [name]: value });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };



  useEffect(() => {
    if (form.username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("loading");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username }),
        });
        if (!res.ok) {
          setUsernameStatus("idle");
          return;
        }
        const data = await res.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch (err) {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: any = {};
    if (!form.password.trim()) newErrors.password = "Molimo unesite lozinku";
    if (!form.username.trim()) newErrors.username = "Molimo unesite korisničko ime";
    else if (form.username.length < 3) newErrors.username = "Korisničko ime mora da sadrži najmanje 3 karaktera";
    else if (!/[a-zA-Z]/.test(form.username)) newErrors.username = "Korisničko ime mora da sadrži najmanje jedno slovo";
    if (usernameStatus === "taken") newErrors.username = "Korisničko ime je zauzeto";
    if (!form.fullName.trim()) newErrors.fullName = "Molimo unesite puno ime";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!passwordChecks.length || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      setErrors(prev => ({ ...prev, password: "Lozinka ne ispunjava sve uslove" }));
      return;
    }

    setLoading(true);

    try {
      // 1. Check availability on the backend first
      const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-availability?email=${encodeURIComponent(form.email)}&username=${encodeURIComponent(form.username)}`);
      const checkData = await checkRes.json();
      if (!checkRes.ok) {
        throw new Error(checkData.error || "Email ili korisničko ime je već zauzeto");
      }

      // 2. Call Supabase signUp directly
      const { data, error: sbError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username.toLowerCase(),
            full_name: form.fullName,
            country: form.country || "Srbija",
          }
        }
      });

      if (sbError) throw sbError;

      localStorage.setItem("pendingVerificationEmail", form.email);
      localStorage.setItem("verificationType", "register");
      document.cookie = "pending_verification=true; path=/; max-age=86400;";

      router.push("/auth/verify");
    } catch (err: any) {
      toast.error(err.message || "Greška pri registraciji");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-1 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-7 md:p-8 rounded-3xl"
        noValidate
      >
        <h1 className="text-center text-2xl font-semibold text-text-main mb-8">
          Kreiraj nalog
        </h1>

        {/* EMAIL */}
        <div className="relative mb-6">
          <input
            type="email"
            name="email"
            readOnly
            value={form.email}
            className="w-full border border-bg-4 rounded-full bg-transparent pl-4 pr-24 py-4 text-text-main
              focus:outline-none peer"
          />

          <label
            className="absolute left-4 text-gray-300 pointer-events-none
              transform -translate-y-2 text-sm bg-bg-1 px-1"
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

        {/* PASSWORD */}
        <div className="relative mb-6">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => {
              setIsPasswordFocused(false);
              if (form.password.length > 0) {
                setHasBlurredPassword(true);
              }
            }}
            className={`w-full rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
              border transition-colors duration-200
              ${showPasswordError
                ? "border-red-500 focus:border-red-500"
                : "border-bg-4 focus:border-[#6366f1]"
              }`}
          />

          <label
            className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
              peer-focus:-translate-y-2 peer-focus:text-sm
              ${form.password.length > 0 || errors.password || showPasswordError
                ? "-translate-y-2 text-sm"
                : "translate-y-4 text-gray-300"
              }
              ${showPasswordError
                ? "text-red-500 peer-focus:text-red-500"
                : "peer-focus:text-[#6366f1] text-gray-300"}`}
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

        <AnimatePresence>
          {shouldShowHints && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "1.5rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="px-4 overflow-hidden"
            >
              <p className={`${showPasswordError ? "text-red-500" : "text-text-main"} text-sm font-medium mb-2 transition-colors duration-300`}>
                Vaša lozinka mora da sadrži:
              </p>
              <ul className="space-y-1.5">
                <PasswordCheckItem isMet={passwordChecks.length} text="Najmanje 8 znakova" showError={showPasswordError} />
                <PasswordCheckItem isMet={passwordChecks.hasLetter} text="Najmanje jedno slovo" showError={showPasswordError} />
                <PasswordCheckItem isMet={passwordChecks.hasNumber} text="Najmanje jedan broj" showError={showPasswordError} />
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {errors.password && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
              !
            </div>
            <span className="text-sm text-red-400">{errors.password}</span>
          </div>
        )}

        {/* USERNAME */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
                ${errors.username
                  ? "border-red-500 focus:border-red-500"
                  : "border-bg-4 focus:border-[#6366f1]"
                }`}
            />

            <label
              className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                peer-focus:-translate-y-2 peer-focus:text-sm
                ${form.username.length > 0 || errors.username
                  ? "-translate-y-2 text-sm"
                  : "translate-y-4 text-gray-300"
                }
                ${errors.username
                  ? "text-red-500 peer-focus:text-red-500"
                  : "peer-focus:text-[#6366f1] text-gray-300"}`}
            >
              Korisničko ime
            </label>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
              {usernameStatus === "loading" && (
                <div className="scale-50">
                  <Loader />
                </div>
              )}
              {usernameStatus === "available" && (
                <Check className="text-green-500" size={20} />
              )}
              {usernameStatus === "taken" && (
                <X className="text-red-500" size={20} />
              )}
            </div>
          </div>
        </div>

        {errors.username && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
              !
            </div>
            <span className="text-sm text-red-400">{errors.username}</span>
          </div>
        )}

        {/* FULL NAME */}
        <div className="relative mb-6">
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
              ${errors.fullName
                ? "border-red-500 focus:border-red-500"
                : "border-bg-4 focus:border-[#6366f1]"
              }`}
          />

          <label
            className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
              peer-focus:-translate-y-2 peer-focus:text-sm
              ${form.fullName.length > 0 || errors.fullName
                ? "-translate-y-2 text-sm"
                : "translate-y-4 text-gray-300"
              }
              ${errors.fullName
                ? "text-red-500 peer-focus:text-red-500"
                : "peer-focus:text-[#6366f1] text-gray-300"}`}
          >
            Puno ime
          </label>
        </div>

        {errors.fullName && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
              !
            </div>
            <span className="text-sm text-red-400">{errors.fullName}</span>
          </div>
        )}



        {/* COUNTRY */}
        <div className="relative mb-6">
          <CountrySelect
            value={form.country}
            onChange={(val) => setForm(p => ({ ...p, country: val }))}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white font-semibold rounded-full transition cursor-pointer
            flex items-center justify-center
            ${loading
              ? "linear bg-[#5b42f3] cursor-not-allowed"
              : "transition-all duration-[350ms] linear bg-[#5b42f3] hover:bg-[#4b35d6]"
            }`}
        >
          {loading ? <Loader /> : "Nastavi"}
        </button>
      </form>
    </main>
  );
}
