"use client"

import { useState, useEffect } from "react"
import { X, Search, Check } from "lucide-react"
import { motion } from "framer-motion"

interface FilterOptionsModalProps {
    isOpen: boolean
    onClose: () => void
    filterKey: string
    filter: any
    value: any
    onSave: (key: string, value: any) => void
    brands?: any[]
    categorySlug: string
}

export default function FilterOptionsModal({
    isOpen,
    onClose,
    filterKey,
    filter,
    value,
    onSave,
    brands = [],
    categorySlug,
}: FilterOptionsModalProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isMobile, setIsMobile] = useState(true)
    const [initialValue, setInitialValue] = useState<any>(null)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setInitialValue(value)
        }
    }, [isOpen])

    const handleCancel = () => {
        onSave(filterKey, initialValue)
        onClose()
    }

    useEffect(() => {
        if (!isOpen) return

        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
        document.body.classList.add("lock-scroll")

        return () => {
            document.body.style.overflow = ""
            document.documentElement.style.overflow = ""
            document.body.classList.remove("lock-scroll")
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("")
        }
    }, [isOpen])

    if (!filter) return null

    const handleSelect = (val: any) => {
        onSave(filterKey, val)
        if (filter.type !== "checkbox-multi") {
            onClose()
        }
    }

    const handleCheckboxToggle = (opt: string) => {
        if (filter.isFormRadio) {
            onSave(filterKey, [opt])
            onClose()
            return
        }
        const currentValues = Array.isArray(value) ? value : []
        if (currentValues.includes(opt)) {
            onSave(filterKey, currentValues.filter(v => v !== opt))
        } else {
            onSave(filterKey, [...currentValues, opt])
        }
    }

    const renderContent = () => {
        switch (filter.type) {
            case "brand-selector":
                return (
                    <div className="flex flex-col h-full">
                        {brands.length > 15 && (
                            <div className="p-4 border-b border-bg-2">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8e8e93] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Pretraži marke..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-bg-2 text-text-main pl-14 pr-6 py-3 rounded-full border border-bg-3 outline-none focus:border-[#6366f1] transition-all"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-modal-scrollbar">
                            {brands
                                .filter(b => b.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(brand => {
                                    const isSelected = value === brand.brand
                                    return (
                                        <button
                                            key={brand.brand}
                                            onClick={() => handleSelect(brand.brand)}
                                            className={`w-full flex items-center justify-between px-6 py-3.5 rounded-full transition-colors cursor-pointer group border ${
                                                isSelected 
                                                    ? "bg-[#6366f1]/10 border-[#6366f1] text-[#6366f1]" 
                                                    : "bg-bg-2 border-bg-3 text-text-main hover:bg-bg-3"
                                            }`}
                                        >
                                            <span className="font-medium">{brand.brand}</span>
                                            {isSelected && <Check className="w-5 h-5 text-[#6366f1]" />}
                                        </button>
                                    )
                                })}
                        </div>
                        <div className="p-6 border-t border-bg-2 bg-bg-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-[#5b42f3] text-white py-3 rounded-full font-bold text-base hover:bg-[#4b35d6] transition-all cursor-pointer"
                            >
                                Primeni
                            </button>
                        </div>
                    </div>
                )

            case "model-selector":
                const models = filter.options || []
                return (
                    <div className="flex flex-col h-full">
                        {models.length > 15 && (
                            <div className="p-4 border-b border-bg-2">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8e8e93] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Pretraži modele..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-bg-2 text-text-main pl-14 pr-6 py-3 rounded-full border border-bg-3 outline-none focus:border-[#6366f1] transition-all"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-modal-scrollbar">
                            {(Array.isArray(models) ? models : [])
                                .filter((m: any) => {
                                    const modelStr = m?.name || m || "";
                                    return modelStr.toLowerCase().includes(searchQuery.toLowerCase());
                                })
                                .map((model: any) => {
                                    const modelStr = model?.name || model;
                                    const isSelected = value === modelStr
                                    return (
                                        <button
                                            key={modelStr}
                                            onClick={() => handleSelect(modelStr)}
                                            className={`w-full flex items-center justify-between px-6 py-3.5 rounded-full transition-colors cursor-pointer group border ${
                                                isSelected 
                                                    ? "bg-[#6366f1]/10 border-[#6366f1] text-[#6366f1]" 
                                                    : "bg-bg-2 border-bg-3 text-text-main hover:bg-bg-3"
                                            }`}
                                        >
                                            <span className="font-medium">{modelStr}</span>
                                            {isSelected && <Check className="w-5 h-5 text-[#6366f1]" />}
                                        </button>
                                    );
                                })}
                        </div>
                        <div className="p-6 border-t border-bg-2 bg-bg-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-[#5b42f3] text-white py-3 rounded-full font-bold text-base hover:bg-[#4b35d6] transition-all cursor-pointer"
                            >
                                Primeni
                            </button>
                        </div>
                    </div>
                )

            case "radio":
                const radioOpts = filter.options || [];
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4 custom-modal-scrollbar">
                            <div className="grid grid-cols-1 gap-2">
                                {(Array.isArray(radioOpts) ? radioOpts : [])
                                    .map((opt: any) => {
                                        const optStr = opt?.name || opt || "";
                                        const optSlug = opt?.slug || optStr;
                                        const isSelected = value === optSlug;
                                        return (
                                            <button
                                                key={optSlug}
                                                onClick={() => handleSelect(optSlug)}
                                                className={`flex items-center justify-between px-6 py-3.5 rounded-full transition text-left cursor-pointer border ${isSelected
                                                    ? "bg-[#6366f1]/10 border-[#6366f1] text-[#6366f1]"
                                                    : "bg-bg-2 border-bg-3 text-[#8e8e93] hover:text-text-main hover:border-bg-4"
                                                    }`}
                                            >
                                                <span className="font-medium text-base">{optStr}</span>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? "border-[#6366f1]" : "border-[#8e8e93]"}`}>
                                                    {isSelected && <div className="w-3 h-3 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-bg-2 bg-bg-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-[#5b42f3] text-white py-3 rounded-full font-bold text-base hover:bg-[#4b35d6] transition-all cursor-pointer"
                            >
                                Primeni
                            </button>
                        </div>
                    </div>
                )

            case "checkbox-multi":
                const options = filter.options || filter[categorySlug] || []
                return (
                    <div className="flex flex-col h-full">
                        {options.length > 15 && (
                            <div className="p-4 border-b border-bg-2">
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8e8e93] w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder={`Pretraži ${(filter.name || filter.label || "").toLowerCase()}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-bg-2 text-text-main pl-14 pr-6 py-3 rounded-full border border-bg-3 outline-none focus:border-[#6366f1] transition-all"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto p-4 custom-modal-scrollbar">
                            <div className="grid grid-cols-1 gap-2">
                                {(Array.isArray(options) ? options : [])
                                    .filter((opt: any) => {
                                        const optStr = opt?.name || opt || "";
                                        const optSlug = opt?.slug || optStr;
                                        return optStr.toLowerCase().includes(searchQuery.toLowerCase());
                                    })
                                    .map((opt: any) => {
                                        const optStr = opt?.name || opt || "";
                                        const optSlug = opt?.slug || optStr;
                                        const isSelected = Array.isArray(value)
                                            ? value.includes(optSlug)
                                            : value === optSlug;
                                        return (
                                            <button
                                                key={optSlug}
                                                onClick={() => handleCheckboxToggle(optSlug)}
                                                className={`flex items-center justify-between px-6 py-3.5 rounded-full transition text-left cursor-pointer border ${isSelected
                                                    ? "bg-[#6366f1]/10 border-[#6366f1] text-[#6366f1]"
                                                    : "bg-bg-2 border-bg-3 text-[#8e8e93] hover:text-text-main hover:border-bg-4"
                                                    }`}
                                            >
                                                <span className="font-medium text-base">{optStr}</span>
                                                {isSelected && <Check className="w-5 h-5" />}
                                            </button>
                                        )
                                    })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-bg-2 bg-bg-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-[#5b42f3] text-white py-3 rounded-full font-bold text-base hover:bg-[#4b35d6] transition-all cursor-pointer"
                            >
                                Primeni
                            </button>
                        </div>
                    </div>
                )

            case "range-select":
            case "range+dropdown":
            case "range+flags":
                const dropdownOpts = filter.dropdownOptions || []
                return (
                    <div className="flex flex-col h-full">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-[#8e8e93]">Od</label>
                                    <select
                                        value={value?.min || ""}
                                        onChange={(e) => onSave(filterKey, { ...value, min: e.target.value })}
                                        className="w-full bg-bg-2 text-text-main p-4 rounded-xl outline-none border border-transparent focus:border-[#6366f1]"
                                    >
                                        <option value="">Izaberi</option>
                                        {dropdownOpts.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-[#8e8e93]">Do</label>
                                    <select
                                        value={value?.max || ""}
                                        onChange={(e) => onSave(filterKey, { ...value, max: e.target.value })}
                                        className="w-full bg-bg-2 text-text-main p-4 rounded-xl outline-none border border-transparent focus:border-[#6366f1]"
                                    >
                                        <option value="">Izaberi</option>
                                        {dropdownOpts.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto p-6 border-t border-bg-2 bg-bg-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-[#5b42f3] text-white py-3 rounded-full font-bold text-base hover:bg-[#4b35d6] transition-all cursor-pointer"
                            >
                                Primeni
                            </button>
                        </div>
                    </div>
                )

            case "range-with-unit":
                const uArr = filter.units || []
                const curUnitSlug = value?.displayUnit || value?.unit || filter.default_unit || "kw"
                const curAmount = value?.displayAmount || value?.amount || ""

                return (
                    <div className="flex flex-col h-full">
                        <div className="p-8 space-y-10 flex-1 flex flex-col justify-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                {/* Input Field */}
                                <div className="relative w-full max-w-[180px]">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={curAmount}
                                        onChange={(e) => onSave(filterKey, { ...value, amount: e.target.value, unit: curUnitSlug })}
                                        className="w-full bg-bg-2 text-text-main p-5 rounded-2xl outline-none border-2 border-transparent focus:border-[#6366f1] text-center text-3xl font-bold transition-all shadow-inner"
                                    />
                                </div>

                                {/* Unit Radio Buttons */}
                                <div className="flex items-center gap-8">
                                    {uArr.map((u: any) => (
                                        <div
                                            key={u.slug}
                                            onClick={() => onSave(filterKey, { ...value, unit: u.slug, amount: curAmount })}
                                            className="flex items-center gap-3 cursor-pointer group select-none"
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${curUnitSlug === u.slug ? "border-[#6366f1]" : "border-[#8e8e93] group-hover:border-text-main"}`}>
                                                {curUnitSlug === u.slug && <div className="w-3 h-3 bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full" />}
                                            </div>
                                            <span className={`text-xl font-bold transition-colors ${curUnitSlug === u.slug ? "text-text-main" : "text-[#8e8e93] group-hover:text-text-main"}`}>
                                                {u.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {curAmount && (
                                <div className="text-center text-gray-500 text-lg font-medium bg-bg-2/30 py-4 px-8 rounded-2xl self-center border border-bg-3/30 backdrop-blur-sm">
                                    {curUnitSlug === "kw"
                                        ? `≈ ${Math.round(Number(curAmount) * 1.35962)} KS`
                                        : `≈ ${Math.round(Number(curAmount) / 1.35962)} kW`
                                    }
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-bg-2 bg-bg-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full bg-[#5b42f3] text-white py-3 rounded-full font-bold text-base hover:bg-[#4b35d6] transition-all active:scale-95 cursor-pointer"
                            >
                                Primeni
                            </button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={handleCancel}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="relative bg-bg-2 w-full max-w-[400px] h-[70vh] sm:h-[600px] max-h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-text-main text-center">{filter.name || filter.label}</h3>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {renderContent()}
                </div>
            </motion.div>
        </div>
    )
}
