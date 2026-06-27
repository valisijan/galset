"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { User, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

const REKLAME_INTERVAL = 5000

const reklame = [
    {
        id: 1,
        title: "Registruj se besplatno i osvoji 1000 kredita",
        buttonText: "Registruj se",
        buttonIcon: User,
        href: "/auth"
    },
    {
        id: 2,
        title: "Objavi svoj prvi oglas besplatno i osvoji 100 kredita",
        buttonText: "Novi oglas",
        buttonIcon: Plus,
        href: "/ad/add"
    },
    {
        id: 3,
        title: "Isprobaj besplatno naprednu pretragu oglasa uz Galset AI",
        buttonText: "Isprobaj AI",
        buttonIcon: Sparkles,
        href: "/ai"
    }
]

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.95
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.95
    })
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
}

export default function Banners() {
    const [[page, direction], setPage] = useState([0, 0])
    const [isHovered, setIsHovered] = useState(false)
    const [progress, setProgress] = useState(0)

    const currentReklama = ((page % reklame.length) + reklame.length) % reklame.length

    useEffect(() => {
        if (isHovered) return

        const interval = 50
        const step = (interval / REKLAME_INTERVAL) * 100

        const t = setInterval(() => {
            setProgress((prev) => prev + step)
        }, interval)

        return () => clearInterval(t)
    }, [isHovered])

    const paginate = (newDirection: number) => {
        setPage([page + newDirection, newDirection])
        setProgress(0)
    }

    useEffect(() => {
        if (progress >= 100) {
            setProgress(0)
            paginate(1)
        }
    }, [progress])

    const nextReklama = () => {
        paginate(1)
    }

    const prevReklama = () => {
        paginate(-1)
    }

    const scrollTo = (index: number) => {
        if (index === currentReklama) return
        const dir = index > currentReklama ? 1 : -1
        const diff = index - currentReklama
        paginate(diff)
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group/reklame rounded-3xl overflow-hidden h-[200px] md:h-[350px] lg:h-full lg:min-h-[350px]"
            style={{ background: 'linear-gradient(135deg, #8a2be2, #6366f1)' }}
        >
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />

            <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x)
                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1)
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1)
                            }
                        }}
                        onMouseDown={() => setIsHovered(true)}
                        onMouseUp={() => setIsHovered(false)}
                        onTouchStart={() => setIsHovered(true)}
                        onTouchEnd={() => setIsHovered(false)}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 z-10 cursor-grab active:cursor-grabbing"
                    >
                        {(() => {
                            const r = reklame[currentReklama]
                            const Icon = r.buttonIcon
                            return (
                                <>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 sm:mb-6 md:mb-8 drop-shadow-lg max-w-2xl leading-tight select-none">
                                        {r.title}
                                    </h2>
                                    <Link
                                        href={r.href}
                                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 md:py-3 md:px-8 rounded-full transition-all hover:bg-white/20 active:scale-95"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Icon size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                                        <span className="text-sm sm:text-base md:text-lg">{r.buttonText}</span>
                                    </Link>
                                </>
                            )
                        })()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows - Hidden on mobile, handled by swipe */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 hidden md:flex lg:hidden justify-between pointer-events-none z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); prevReklama(); }}
                    className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-all pointer-events-auto active:scale-95"
                >
                    <ChevronLeft size={22} className="text-white drop-shadow-md" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextReklama(); }}
                    className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-all pointer-events-auto active:scale-95"
                >
                    <ChevronRight size={22} className="text-white drop-shadow-md" />
                </button>
            </div>

            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 hidden lg:flex justify-between opacity-0 group-hover/reklame:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); prevReklama(); }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center pointer-events-auto transition-all text-white cursor-pointer active:scale-95"
                >
                    <ChevronLeft size={22} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); nextReklama(); }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full flex items-center justify-center pointer-events-auto transition-all text-white cursor-pointer active:scale-95"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 items-center">
                {reklame.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollTo(i)}
                        className={`h-1.5 rounded-full overflow-hidden transition-all duration-300 relative ${currentReklama === i ? 'w-8 bg-white/30 hover:bg-white/50' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                    >
                        {currentReklama === i && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.05, ease: "linear" }}
                                className="absolute inset-y-0 left-0 bg-white"
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

