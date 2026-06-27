"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { supabase } from "@/lib/supabase";

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

function NewPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [errors, setErrors] = useState({
    password: "",
    repeatPassword: "",
  });

  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Nevažeća sesija za resetovanje lozinke. Molimo pokrenite proces ponovo.");
        router.push("/auth/forgot-password");
      } else {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { password: "", repeatPassword: "" };
    let hasError = false;

    if (!password) {
      newErrors.password = "Molimo unesite novu lozinku";
      hasError = true;
    }
    if (!repeatPassword) {
      newErrors.repeatPassword = "Molimo ponovo unesite lozinku";
      hasError = true;
    }

    if (!hasError && password !== repeatPassword) {
      newErrors.password = "Mismatch";
      newErrors.repeatPassword = "Lozinke se ne poklapaju";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    if (!passwordChecks.length || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      setErrors(prev => ({ ...prev, password: "Lozinka ne ispunjava sve uslove" }));
      return;
    }

    setLoading(true);

    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) {
        throw sbError;
      }

      toast.success("Lozinka uspešno promenjena");
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Greška pri promeni lozinke");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (ref: any, set: any) => {
    const input = ref.current;
    if (!input) return;
    const pos = input.selectionStart ?? 0;
    set((p: boolean) => !p);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(pos, pos);
    }, 0);
  };

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [hasBlurredPassword, setHasBlurredPassword] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const allMet = passwordChecks.length && passwordChecks.hasLetter && passwordChecks.hasNumber;
  const showPasswordError = !!errors.password || (hasBlurredPassword && !allMet);
  const shouldShowHints = (isPasswordFocused || (hasBlurredPassword && !allMet)) && !errors.password;

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setErrors((prev) => {
      if (prev.repeatPassword === "Lozinke se ne poklapaju") {
        return { password: "", repeatPassword: "" };
      }
      return { ...prev, password: "" };
    });
  };

  const handleRepeatChange = (val: string) => {
    setRepeatPassword(val);
    setErrors((prev) => {
      if (prev.repeatPassword === "Lozinke se ne poklapaju") {
        return { password: "", repeatPassword: "" };
      }
      return { ...prev, repeatPassword: "" };
    });
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-bg-1 flex items-center justify-center">
        <Loader />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-1 flex items-center justify-center">
      <div className="w-full max-w-md p-7 md:p-8 rounded-3xl">
        <h1 className="text-center text-2xl font-semibold text-text-main mb-6">
          Nova lozinka
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* New password */}
          <div className="relative mb-6">
            <input
              ref={ref1}
              type={show1 ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => {
                setIsPasswordFocused(false);
                if (password.length > 0) {
                  setHasBlurredPassword(true);
                }
              }}
              className={`w-full rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
                border transition-colors duration-200
                ${showPasswordError
                  ? "border-red-500 focus:border-red-500"
                  : "border-bg-4 focus:border-[#6366f1]"}`}
            />
            <label
              className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                peer-focus:-translate-y-2 peer-focus:text-sm
                ${password.length > 0 || errors.password || showPasswordError
                  ? "-translate-y-2 text-sm"
                  : "translate-y-4 text-gray-300"}
                ${showPasswordError
                  ? "text-red-500 peer-focus:text-red-500"
                  : "peer-focus:text-[#6366f1] text-gray-300"}`}
            >
              Nova lozinka
            </label>
            <button
              type="button"
              onClick={() => toggle(ref1, setShow1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main cursor-pointer"
            >
              {show1 ? <EyeOff size={20} /> : <Eye size={20} />}
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

          {errors.password && errors.password !== "Mismatch" && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
                !
              </div>
              <span className="text-sm text-red-400">{errors.password}</span>
            </div>
          )}

          {/* Repeat */}
          <div className="relative mb-6">
            <input
              ref={ref2}
              type={show2 ? "text" : "password"}
              value={repeatPassword}
              onChange={(e) => handleRepeatChange(e.target.value)}
              className={`w-full rounded-full bg-transparent px-4 py-4 text-text-main focus:outline-none peer
                border
                ${errors.repeatPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-bg-4 focus:border-[#6366f1]"}`}
            />
            <label
              className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                peer-focus:-translate-y-2 peer-focus:text-sm
                ${repeatPassword.length > 0 || errors.repeatPassword
                  ? "-translate-y-2 text-sm"
                  : "translate-y-4 text-gray-300"}
                ${errors.repeatPassword
                  ? "text-red-500 peer-focus:text-red-500"
                  : "text-gray-300 peer-focus:text-[#6366f1]"}`}
            >
              Ponovite lozinku
            </label>
            <button
              type="button"
              onClick={() => toggle(ref2, setShow2)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main cursor-pointer"
            >
              {show2 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {errors.repeatPassword && (
            <div className={`flex items-center gap-2 mb-6`}>
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">
                !
              </div>
              <span className="text-sm text-red-400">{errors.repeatPassword}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full text-white font-semibold flex justify-center items-center cursor-pointer
              ${loading
                ? "bg-[#5b42f3] cursor-not-allowed opacity-70"
                : "transition-all duration-[350ms] bg-[#5b42f3] hover:bg-[#4b35d6]"}`}
          >
            {loading ? <Loader /> : "Nastavi"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg-1 flex items-center justify-center"><Loader /></main>}>
      <NewPasswordForm />
    </Suspense>
  );
}
