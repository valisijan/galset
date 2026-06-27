"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Loader from "@/components/Loader"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
  email: string
}

const REASONS = [
  "Prodao/Kupio sam to što sam hteo",
  "Više mi nije potreban nalog",
  "Otvaram novi/drugi nalog",
  "Nezadovoljan sam uslugom platforme",
  "Previsoke cene Galset usluga",
  "Teško se snalazim na sajtu",
  "Imam problem sa drugim korisnicima",
  "Zabrinut sam za privatnost podataka",
  "Drugo"
];

const shouldSkipDetailedReason = (reason: string | null) => {
  return reason === "Prodao/Kupio sam to što sam hteo" ||
    reason === "Otvaram novi/drugi nalog" ||
    reason === "Zabrinut sam za privatnost podataka";
};

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  email,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [detailedReason, setDetailedReason] = useState("")
  const [isDescFocused, setIsDescFocused] = useState(false)

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setDirection(1);
      setSelectedReason(null);
      setDetailedReason("");
      setIsDescFocused(false);
      return;
    }

    window.history.pushState({ modal: "deleteAccount" }, "");

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    document.body.classList.add("lock-scroll");

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.body.classList.remove("lock-scroll");

      if (window.history.state?.modal === "deleteAccount") {
        window.history.back();
      }
    };
  }, [isOpen]);

  const handleNext = () => {
    if (step === 1) {
      if (!selectedReason) return;
      if (shouldSkipDetailedReason(selectedReason)) {
        setDirection(1);
        setStep(3);
      } else {
        setDirection(1);
        setStep(2);
      }
    } else if (step === 2) {
      setDirection(1);
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setDirection(-1);
      setStep(1);
    } else if (step === 3) {
      if (shouldSkipDetailedReason(selectedReason)) {
        setDirection(-1);
        setStep(1);
      } else {
        setDirection(-1);
        setStep(2);
      }
    }
  };

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? "110%" : "-110%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? "-110%" : "110%",
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80"
            onClick={!loading ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-bg-2 w-full max-w-[420px] rounded-4xl z-[10100] overflow-hidden"
          >
            {/* Header (fixed) */}
            <div className="pt-8 pb-1 text-center">
              <h3 className="text-text-main font-bold text-lg">
                {step === 3 ? "Obriši nalog" : "Zašto brišete vaš nalog"}
              </h3>
            </div>

            {/* Sliding Content Container */}
            <div className="relative overflow-hidden w-full px-6 pb-6 min-h-[445px] flex flex-col justify-between">
              <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-full flex flex-col gap-4 flex-1 mt-2 justify-between"
                >
                  {/* Step Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    {step === 1 && (
                      <div className="flex flex-col gap-4 flex-1">
                        <p className="text-gray-400 text-[13px] text-center leading-relaxed">
                          Zašto napuštate našu platformu
                        </p>
                        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 custom-modal-scrollbar">
                          {REASONS.map((reason) => {
                            const isSelected = selectedReason === reason;
                            return (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => setSelectedReason(reason)}
                                className={`flex items-center justify-between gap-3 px-5 py-2.5 rounded-full border text-left transition-all duration-200 cursor-pointer ${isSelected
                                  ? "border-[#5b42f3] bg-[#5b42f3]/5 text-text-main font-semibold"
                                  : "border-bg-3 bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-gray-300"
                                  }`}
                              >
                                <span className="text-[13px] select-none">{reason}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-[#5b42f3]" : "border-gray-500"
                                  }`}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#5b42f3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="flex flex-col gap-4 flex-1">
                        <p className="text-gray-400 text-[13px] text-center leading-relaxed">
                          Opišite nam detaljnije zašto napuštate našu platformu
                        </p>
                        <div className="relative mt-4">
                          <textarea
                            value={detailedReason}
                            onChange={(e) => {
                              if (e.target.value.length <= 5000) {
                                setDetailedReason(e.target.value);
                              }
                            }}
                            onFocus={() => setIsDescFocused(true)}
                            onBlur={() => setIsDescFocused(false)}
                            placeholder=""
                            rows={4}
                            className={`w-full bg-transparent border px-4 py-3 text-text-main text-sm focus:outline-none transition-all rounded-3xl resize-none min-h-[140px] custom-modal-scrollbar ${isDescFocused || detailedReason.length > 0
                              ? "border-[#6366f1]"
                              : "border-bg-3"
                              }`}
                          />
                          <label
                            className={`absolute left-4 transition-all pointer-events-none bg-bg-2 px-1
                              ${isDescFocused || detailedReason.length > 0
                                ? "-top-2 text-sm text-[#6366f1]"
                                : "top-3 text-gray-400"
                              }`}
                          >
                            Opis
                          </label>
                          <p className="text-[11px] text-gray-500 text-right mt-1">
                            {detailedReason.length}/5000
                          </p>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="flex-1 flex flex-col justify-center items-center py-6 min-h-[220px]">
                        <p className="text-gray-400 text-[13px] text-center leading-relaxed">
                          Žao nam je što odlazite sa naše platforme. Vaš nalog <span className="text-text-main font-bold">{email}</span> i svi podaci na njemu biće odmah i trajno obrisani. Nakon ovoga, pristup nalogu više nećete moći da povratite i akciju nije moguće poništiti.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions (Inside sliding container so they align with steps) */}
                  <div className="flex flex-col gap-3 mt-6 w-full">
                    {step === 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!selectedReason}
                          className={`w-full py-3 rounded-full font-bold transition-all duration-200 text-base ${selectedReason
                            ? "bg-[#5b42f3] hover:bg-[#4b35d6] text-white cursor-pointer"
                            : "bg-bg-3 text-gray-500 opacity-50 cursor-not-allowed"
                            }`}
                        >
                          Nastavi
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                        >
                          Otkaži
                        </button>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base"
                        >
                          Nastavi
                        </button>
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                        >
                          Nazad
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                        >
                          Otkaži
                        </button>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <button
                          type="button"
                          onClick={onConfirm}
                          disabled={loading}
                          className={`w-full py-3 rounded-full font-bold transition-all duration-300 text-base flex items-center justify-center ${!loading
                            ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                            : "bg-bg-3 text-gray-500 opacity-50 cursor-not-allowed"
                            }`}
                        >
                          {loading ? <Loader /> : "Obriši nalog"}
                        </button>
                        <button
                          type="button"
                          onClick={handleBack}
                          disabled={loading}
                          className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base disabled:opacity-50"
                        >
                          Nazad
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          disabled={loading}
                          className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base disabled:opacity-50"
                        >
                          Otkaži
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
