"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useAnimation, PanInfo, animate } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"

interface ZoomableImageProps {
    src: string
    alt: string
    className?: string
    isModal?: boolean
    onZoomChange?: (isZoomed: boolean) => void
}

const ZoomableImage = ({ src, alt, className, isModal, onZoomChange }: ZoomableImageProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const scale = useMotionValue(1)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const [isZoomed, setIsZoomed] = useState(false)
    const [isTouching, setIsTouching] = useState(false)
    const startScale = useRef<number>(1)
    const startX = useRef<number>(0)
    const startY = useRef<number>(0)
    const startDistance = useRef<number | null>(null)
    const startMidpoint = useRef<{ x: number; y: number } | null>(null)
    const touchStartPoint = useRef<{ x: number; y: number } | null>(null)
    const [dragBounds, setDragBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0 })

    const onZoomChangeRef = useRef(onZoomChange)
    useEffect(() => {
        onZoomChangeRef.current = onZoomChange
    }, [onZoomChange])

    const getBounds = (currentScale: number) => {
        const container = containerRef.current
        if (!container) return { maxX: 0, maxY: 0 }
        
        const rect = container.getBoundingClientRect()
        const imgElement = container.querySelector('img')
        if (!imgElement || !imgElement.naturalWidth) {
            return {
                maxX: (rect.width * (currentScale - 1)) / 2,
                maxY: (rect.height * (currentScale - 1)) / 2
            }
        }

        const imgAspect = imgElement.naturalWidth / imgElement.naturalHeight
        const containerAspect = rect.width / rect.height

        let renderedW, renderedH
        if (imgAspect > containerAspect) {
            renderedW = rect.width
            renderedH = rect.width / imgAspect
        } else {
            renderedH = rect.height
            renderedW = rect.height * imgAspect
        }

        const scaledW = renderedW * currentScale
        const scaledH = renderedH * currentScale

        const maxX = Math.max(0, (scaledW - rect.width) / 2)
        const maxY = Math.max(0, (scaledH - rect.height) / 2)

        return { maxX, maxY }
    }

    const updateZoom = (newScale: number, centerX: number, centerY: number) => {
        const currentScale = scale.get()
        if (newScale === currentScale) return

        if (newScale <= 1.01) {
            animate(scale, 1, { type: "spring", stiffness: 300, damping: 30 })
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
            animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
            setIsZoomed(false)
            onZoomChangeRef.current?.(false)
            return
        }

        const rect = containerRef.current!.getBoundingClientRect()

        const containerCenterX = rect.left + rect.width / 2
        const containerCenterY = rect.top + rect.height / 2

        const mouseX = centerX - containerCenterX
        const mouseY = centerY - containerCenterY

        const diff = 1 / newScale - 1 / currentScale
        let newX = x.get() + mouseX * diff
        let newY = y.get() + mouseY * diff

        // Smoothly pull the image back to the center as the scale approaches 1.0
        if (newScale < 1.5) {
            const factor = (newScale - 1) / 0.5
            const clampFactor = Math.max(0, Math.min(1, factor))
            newX = newX * clampFactor
            newY = newY * clampFactor
        }

        const { maxX, maxY } = getBounds(newScale)

        scale.set(newScale)
        x.set(Math.min(Math.max(newX, -maxX), maxX))
        y.set(Math.min(Math.max(newY, -maxY), maxY))

        const zoomed = newScale > 1.01
        if (zoomed !== isZoomed) {
            setIsZoomed(zoomed)
            onZoomChangeRef.current?.(zoomed)
        }
    }

    const handleWheel = (e: WheelEvent) => {
        if (!containerRef.current) return
        e.preventDefault()

        const delta = -e.deltaY * 0.0015
        const newScale = Math.min(Math.max(scale.get() + delta, 1), 10)
        updateZoom(newScale, e.clientX, e.clientY)
    }

    const handleTouchStart = (e: TouchEvent) => {
        setIsTouching(true)
        if (scale.get() > 1.01 || e.touches.length > 1) {
            e.stopPropagation()
        }

        if (e.touches.length === 1) {
            touchStartPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
            startX.current = x.get()
            startY.current = y.get()
            startDistance.current = null
            startMidpoint.current = null
        } else if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            startDistance.current = distance
            startScale.current = scale.get()
            startX.current = x.get()
            startY.current = y.get()

            const rect = containerRef.current!.getBoundingClientRect()
            const containerCenterX = rect.left + rect.width / 2
            const containerCenterY = rect.top + rect.height / 2
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
            startMidpoint.current = {
                x: centerX - containerCenterX,
                y: centerY - containerCenterY
            }
            touchStartPoint.current = null
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (scale.get() > 1.01 || e.touches.length > 1) {
            e.stopPropagation()
        }

        if (e.touches.length === 1 && scale.get() > 1.01 && touchStartPoint.current) {
            const dx = e.touches[0].clientX - touchStartPoint.current.x
            const dy = e.touches[0].clientY - touchStartPoint.current.y
            const newX = startX.current + dx
            const newY = startY.current + dy

            const { maxX, maxY } = getBounds(scale.get())

            x.set(Math.min(Math.max(newX, -maxX), maxX))
            y.set(Math.min(Math.max(newY, -maxY), maxY))
        } else if (e.touches.length === 2 && startDistance.current !== null && startMidpoint.current !== null) {
            e.preventDefault()

            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            const ratio = distance / startDistance.current
            const newScale = Math.min(Math.max(startScale.current * ratio, 1), 10)

            const rect = containerRef.current!.getBoundingClientRect()
            const containerCenterX = rect.left + rect.width / 2
            const containerCenterY = rect.top + rect.height / 2
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
            const currentMidX = centerX - containerCenterX
            const currentMidY = centerY - containerCenterY

            const targetX = currentMidX - (startMidpoint.current.x - startX.current) * ratio
            const targetY = currentMidY - (startMidpoint.current.y - startY.current) * ratio

            let newX = targetX
            let newY = targetY

            if (newScale < startScale.current && startScale.current > 1.01) {
                const scalePercent = (newScale - 1) / (startScale.current - 1)
                const clampPercent = Math.max(0, Math.min(1, scalePercent))
                newX = targetX * clampPercent
                newY = targetY * clampPercent
            } else if (newScale < 1.5) {
                const factor = (newScale - 1) / 0.5
                const clampFactor = Math.max(0, Math.min(1, factor))
                newX = newX * clampFactor
                newY = newY * clampFactor
            }

            const { maxX, maxY } = getBounds(newScale)

            scale.set(newScale)
            x.set(Math.min(Math.max(newX, -maxX), maxX))
            y.set(Math.min(Math.max(newY, -maxY), maxY))

            const zoomed = newScale > 1.01
            if (zoomed !== isZoomed) {
                setIsZoomed(zoomed)
                onZoomChangeRef.current?.(zoomed)
            }
        }
    }

    const handleTouchEnd = (e: TouchEvent) => {
        if (scale.get() > 1.01 || e.touches.length > 0) {
            e.stopPropagation()
        }

        if (e.touches.length === 0) {
            setIsTouching(false)
            startDistance.current = null
            startMidpoint.current = null
            touchStartPoint.current = null

            if (scale.get() < 1.2) {
                animate(scale, 1, { type: "spring", stiffness: 300, damping: 30 })
                animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
                animate(y, 0, { type: "spring", stiffness: 300, damping: 30 })
                setIsZoomed(false)
                onZoomChangeRef.current?.(false)
            }
        } else if (e.touches.length === 1) {
            touchStartPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
            startX.current = x.get()
            startY.current = y.get()
            startDistance.current = null
            startMidpoint.current = null
        }
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('touchstart', handleTouchStart, { passive: true })
        container.addEventListener('wheel', handleWheel, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('wheel', handleWheel)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [])

    useEffect(() => {
        scale.set(1)
        x.set(0)
        y.set(0)
        setIsZoomed(false)
        onZoomChangeRef.current?.(false)
    }, [src])

    useEffect(() => {
        return scale.on("change", (latest) => {
            const { maxX, maxY } = getBounds(latest)
            setDragBounds({ left: -maxX, right: maxX, top: -maxY, bottom: maxY })
        })
    }, [])

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden flex items-center justify-center touch-none"
        >
            <motion.div
                style={{ scale, x, y }}
                className="relative w-full h-full flex items-center justify-center"
                drag={isZoomed && !isTouching}
                dragConstraints={dragBounds}
                dragElastic={0}
                dragMomentum={false}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                />
            </motion.div>
        </div>
    )
}

interface SwipeableGalleryProps {
    images: string[]
    currentIndex: number
    onNext: () => void
    onPrev: () => void
    onClick?: () => void
    className?: string
    isModal?: boolean
}

export const SwipeableGallery = ({
    images,
    currentIndex,
    onNext,
    onPrev,
    onClick,
    className,
    isModal = false
}: SwipeableGalleryProps) => {
    const x = useMotionValue(0)
    const controls = useAnimation()
    const [isZoomed, setIsZoomed] = useState(false)
    const hasPinched = useRef(false)

    useEffect(() => {
        controls.set({ x: 0 })
    }, [currentIndex, controls])

    const prevIdx = (currentIndex - 1 + images.length) % images.length
    const nextIdx = (currentIndex + 1) % images.length

    const swipeConfidenceThreshold = 10000
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity
    }

    const handleDragEnd = async (e: any, { offset, velocity }: PanInfo) => {
        if (isZoomed || hasPinched.current || images.length <= 1) {
            hasPinched.current = false
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } })
            return
        }
        const swipe = swipePower(offset.x, velocity.x)
        const width = window.innerWidth

        if (swipe < -swipeConfidenceThreshold || offset.x < -width / 3) {
            await controls.start({ x: "-100%", transition: { duration: 0.2 } })
            onNext()
        } else if (swipe > swipeConfidenceThreshold || offset.x > width / 3) {
            await controls.start({ x: "100%", transition: { duration: 0.2 } })
            onPrev()
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } })
        }
    }

    return (
        <motion.div
            className={`relative w-full h-full flex ${className}`}
            style={{ x }}
            animate={controls}
            drag={isZoomed || images.length <= 1 ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            onClick={onClick}
            onTouchStart={(e) => {
                if (e.touches.length === 1) {
                    hasPinched.current = false
                }
                if (e.touches.length > 1) {
                    hasPinched.current = true
                    setIsZoomed(true)
                }
            }}
            onTouchMove={(e) => {
                if (e.touches.length > 1) {
                    hasPinched.current = true
                    setIsZoomed(true)
                }
            }}
        >
            {/* Prev Image */}
            <div className="absolute top-0 left-0 w-full h-full" style={{ left: "-100%" }}>
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={images[prevIdx]}
                        alt="Previous"
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Current Image */}
            <div className="absolute top-0 left-0 w-full h-full" style={{ left: "0%" }}>
                {isModal ? (
                    <ZoomableImage
                        src={images[currentIndex]}
                        alt="Current"
                        isModal={isModal}
                        onZoomChange={setIsZoomed}
                    />
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={images[currentIndex]}
                            alt="Current"
                            className="max-w-full max-h-full object-contain"
                            draggable={false}
                        />
                    </div>
                )}
            </div>

            {/* Next Image */}
            <div className="absolute top-0 left-0 w-full h-full" style={{ left: "100%" }}>
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={images[nextIdx]}
                        alt="Next"
                        className="max-w-full max-h-full object-contain"
                        draggable={false}
                    />
                </div>
            </div>
        </motion.div>
    )
}

interface GalleryModalProps {
    isOpen: boolean
    onClose: () => void
    images: string[]
    imageIndex: number
    onNext: () => void
    onPrev: () => void
    onSelectIndex: (index: number) => void
    direction: number
    page: number
}

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 2000 : -2000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 2000 : -2000,
        opacity: 0
    })
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
}

export default function GalleryModal({
    isOpen,
    onClose,
    images,
    imageIndex,
    onNext,
    onPrev,
    onSelectIndex,
    direction,
    page
}: GalleryModalProps) {
    const [isZoomed, setIsZoomed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
            document.documentElement.style.overflow = "hidden"

            window.history.pushState({ galleryOpen: true }, "")

            const onPop = () => {
                onCloseRef.current()
            }
            window.addEventListener("popstate", onPop)

            return () => {
                document.body.style.overflow = ""
                document.documentElement.style.overflow = ""
                window.removeEventListener("popstate", onPop)
                if (window.history.state?.galleryOpen) {
                    window.history.back()
                }
            }
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                onPrev()
            } else if (e.key === "ArrowRight") {
                onNext()
            } else if (e.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onNext, onPrev, onClose])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center transition-all duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-3 right-3 md:top-5 md:right-5 text-white z-50 p-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full hover:bg-white/20 transition-all cursor-pointer"
            >
                <X size={24} />
            </button>

            {/* Counter */}
            <div
                className="absolute top-3 left-3 md:top-5 md:left-5 text-white font-medium text-sm md:text-lg z-50 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full px-4 py-2"
                onClick={(e) => e.stopPropagation()}
            >
                {imageIndex + 1} / {images.length}
            </div>

            {/* Navigation Arrows (Desktop only, hidden when only 1 image) */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 text-white z-50 hidden md:block bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full hover:bg-white/20 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 text-white z-50 hidden md:block bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-full hover:bg-white/20 transition-all cursor-pointer"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Main Image - Desktop (Slide Animation) */}
            <div
                className="hidden md:block relative w-full h-full overflow-hidden"
            >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag={isZoomed || images.length <= 1 ? false : "x"}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onTouchStart={(e) => {
                            if (e.touches.length > 1) {
                                setIsZoomed(true)
                            }
                        }}
                        onDragEnd={(e, { offset, velocity }) => {
                            if (isZoomed || images.length <= 1) return
                            const swipe = swipePower(offset.x, velocity.x)

                            if (swipe < -swipeConfidenceThreshold) {
                                onNext()
                            } else if (swipe > swipeConfidenceThreshold) {
                                onPrev()
                            }
                        }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center"
                    >
                        <ZoomableImage
                            src={images[imageIndex]}
                            alt={`Gallery image ${imageIndex + 1}`}
                            isModal={true}
                            onZoomChange={setIsZoomed}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Main Image - Mobile (Infinite Loop Strip) */}
            <div
                className="block md:hidden relative w-full h-full overflow-hidden"
            >
                <SwipeableGallery
                    images={images}
                    currentIndex={imageIndex}
                    onNext={onNext}
                    onPrev={onPrev}
                    isModal={true}
                />
            </div>

            {/* Dots Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50 items-center">
                {images.map((_: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation()
                            onSelectIndex(idx)
                        }}
                        className={`h-2.5 rounded-full transition-all duration-300 ${imageIndex === idx ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`}
                    />
                ))}
            </div>
        </div>,
        document.body
    );
}
