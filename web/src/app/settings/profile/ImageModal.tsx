"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { toast } from "sonner";

const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            const maxSize = 2000;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas toBlob failed"));
            }, "image/jpeg", 0.85);
        };
        img.onerror = () => reject(new Error("Image load failed for compression"));
    });
};

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageModal({ isOpen, onClose }: ImageModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [initialZoom, setInitialZoom] = useState(1);
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [imgSize, setImgSize] = useState<{ width: number; height: number } | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const { user, sessionToken, refreshUser } = useAuth();

    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        window.history.pushState({ modal: "profileImage" }, "");

        const handlePopState = () => {
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);
        document.body.classList.add("lock-scroll");
        document.documentElement.classList.add("lock-scroll");

        return () => {
            window.removeEventListener("popstate", handlePopState);
            document.body.classList.remove("lock-scroll");
            document.documentElement.classList.remove("lock-scroll");

            if (window.history.state?.modal === "profileImage") {
                window.history.back();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        let timeoutId: NodeJS.Timeout;
        const measure = () => {
            if (imageContainerRef.current) {
                const width = imageContainerRef.current.offsetWidth;
                if (width > 0) {
                    setContainerWidth(width);
                    return;
                }
            }
            timeoutId = setTimeout(measure, 100);
        };
        measure();

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width || (entry.target as HTMLElement).offsetWidth;
                if (width > 0) {
                    setContainerWidth(width);
                }
            }
        });

        if (imageContainerRef.current) {
            resizeObserver.observe(imageContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isOpen, previewUrl]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setOriginalUrl(null);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setInitialZoom(1);
            setInitialPosition({ x: 0, y: 0 });
            setIsDeleting(false);
            setImgSize(null);
            setIsInitialLoad(true);
        } else if (user?.profileImg) {
            if (user.profileImg.includes("|||")) {
                const [crop, metadata] = user.profileImg.split("|||");
                const params = new URLSearchParams(metadata);
                const orig = params.get("orig");
                const z = params.get("zoom");
                const x = params.get("x");
                const y = params.get("y");
                const cw = params.get("cw");

                if (orig) {
                    setPreviewUrl(decodeURIComponent(orig));
                    setOriginalUrl(decodeURIComponent(orig));
                } else {
                    setPreviewUrl(crop);
                }

                let parsedZoom = 1;
                let parsedX = 0;
                let parsedY = 0;

                if (z) {
                    parsedZoom = parseFloat(z);
                    setZoom(parsedZoom);
                }

                if (x && y) {
                    let posX = parseFloat(x);
                    let posY = parseFloat(y);

                    if (cw && containerWidth > 0) {
                        const savedCW = parseFloat(cw);
                        if (savedCW > 0 && Math.abs(savedCW - containerWidth) > 1) {
                            const scale = containerWidth / savedCW;
                            posX *= scale;
                            posY *= scale;
                        }
                    }

                    parsedX = posX;
                    parsedY = posY;
                    setPosition({ x: posX, y: posY });
                }

                setInitialZoom(parsedZoom);
                setInitialPosition({ x: parsedX, y: parsedY });
            } else {
                setPreviewUrl(user.profileImg);
                setOriginalUrl(user.profileImg);
                setInitialZoom(1);
                setInitialPosition({ x: 0, y: 0 });
            }
            setIsInitialLoad(false);
        } else {
            setInitialZoom(1);
            setInitialPosition({ x: 0, y: 0 });
            setIsInitialLoad(false);
        }
    }, [isOpen, user?.profileImg, containerWidth]);

    useEffect(() => {
        const container = imageContainerRef.current;
        if (!container || !previewUrl) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY;
            setZoom((prevZoom) => {
                const newZoom = Math.min(Math.max(1.0, prevZoom - delta * 0.0003), 10.0);
                setPosition(pos => applyConstraints(pos.x, pos.y, newZoom));
                return newZoom;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [previewUrl, imgSize]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith("image/")) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setOriginalUrl(null);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setImgSize(null);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!previewUrl) return;
        e.preventDefault();
        setIsDraggingImage(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingImage) return;
        e.preventDefault();
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition(applyConstraints(newX, newY, zoom));
    };

    const applyConstraints = (x: number, y: number, z: number) => {
        if (!imgSize || containerWidth <= 0) return { x, y };

        const circleRadius = (containerWidth * 0.85) / 2;
        const circleDiameter = containerWidth * 0.85;
        const aspect = imgSize.width / imgSize.height;

        let baseW, baseH;
        if (aspect > 1) {
            baseH = circleDiameter;
            baseW = circleDiameter * aspect;
        } else {
            baseW = circleDiameter;
            baseH = circleDiameter / aspect;
        }

        const currentW = baseW * z;
        const currentH = baseH * z;

        const limitX = Math.max(0, (currentW - circleRadius * 2) / 2);
        const limitY = Math.max(0, (currentH - circleRadius * 2) / 2);

        return {
            x: Math.min(Math.max(x, -limitX), limitX),
            y: Math.min(Math.max(y, -limitY), limitY)
        };
    };

    const handleMouseUp = () => {
        setIsDraggingImage(false);
    };

    const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!previewUrl) return;

        if (e.touches.length === 2) {
            const distance = getTouchDistance(e.touches[0], e.touches[1]);
            setLastTouchDistance(distance);
        } else if (e.touches.length === 1) {
            setIsDraggingImage(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!previewUrl) return;

        if (e.touches.length === 2 && lastTouchDistance !== null) {
            e.preventDefault();
            const distance = getTouchDistance(e.touches[0], e.touches[1]);
            const scale = distance / (lastTouchDistance || distance);

            const newZoom = Math.min(Math.max(1.0, zoom * scale), 3);
            setZoom(newZoom);
            setPosition(applyConstraints(position.x, position.y, newZoom));

            setLastTouchDistance(distance);
        } else if (e.touches.length === 1 && isDraggingImage) {
            e.preventDefault();
            const newX = e.touches[0].clientX - dragStart.x;
            const newY = e.touches[0].clientY - dragStart.y;
            setPosition(applyConstraints(newX, newY, zoom));
        }
    };

    const handleTouchEnd = () => {
        setIsDraggingImage(false);
        setLastTouchDistance(null);
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsDeleting(true);
    };

    const buildCropBlob = (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new (window.Image)();

            let freshUrl: string | null = null;
            if (selectedFile) {
                freshUrl = URL.createObjectURL(selectedFile);
                img.src = freshUrl;
            } else {
                if (previewUrl && !previewUrl.startsWith("blob:")) {
                    img.crossOrigin = "anonymous";
                }
                img.src = previewUrl!;
            }

            img.onload = () => {
                if (freshUrl) URL.revokeObjectURL(freshUrl);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Canvas context unavailable"));

                canvas.width = 512;
                canvas.height = 512;

                ctx.beginPath();
                ctx.arc(256, 256, 256, 0, Math.PI * 2);
                ctx.clip();

                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, 512, 512);
                ctx.translate(256, 256);
                ctx.scale(zoom, zoom);

                const cw = imageContainerRef.current?.offsetWidth || containerWidth || 300;
                const circleWidthUI = cw * 0.85;
                const uiToCanvasScale = 512 / circleWidthUI;

                ctx.translate(position.x * uiToCanvasScale / zoom, position.y * uiToCanvasScale / zoom);

                const imgAspect = img.naturalWidth / img.naturalHeight;
                let drawW, drawH;
                if (imgAspect > 1) {
                    drawH = circleWidthUI;
                    drawW = drawH * imgAspect;
                } else {
                    drawW = circleWidthUI;
                    drawH = drawW / imgAspect;
                }

                drawW *= uiToCanvasScale;
                drawH *= uiToCanvasScale;

                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create crop blob"));
                }, "image/jpeg", 0.9);
            };

            img.onerror = () => {
                if (freshUrl) URL.revokeObjectURL(freshUrl);
                reject(new Error("Greška pri učitavanju slike."));
            };
        });
    };

    const isImageChanged = () => {
        if (isDeleting) return true;
        if (selectedFile) return true;
        if (!user?.profileImg && previewUrl) return true;
        if (user?.profileImg && !previewUrl) return true;

        const zoomChanged = Math.abs(zoom - initialZoom) > 0.001;
        const xChanged = Math.abs(position.x - initialPosition.x) > 0.1;
        const yChanged = Math.abs(position.y - initialPosition.y) > 0.1;

        return zoomChanged || xChanged || yChanged;
    };

    const cropAndUpload = async () => {
        if (!previewUrl && !isDeleting) return;
        setIsUploading(true);

        try {
            if (isDeleting) {
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (sessionToken) {
                    headers["Authorization"] = `Bearer ${sessionToken}`;
                }
                const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ profileImg: null }),
                });

                if (!profileRes.ok) throw new Error("Profile update failed");

                await refreshUser();
                toast.success("Profilna slika je uspešno obrisana!");
                onClose();
                return;
            }

            let originalTempImageId: number | null = null;
            let finalOriginalUrl = originalUrl;

            if (selectedFile) {
                const compressedBlob = await compressImage(selectedFile);
                const originalFormData = new FormData();
                originalFormData.append("file", compressedBlob, "original_" + selectedFile.name);
                originalFormData.append("imageType", "profile_original");

                const uploadHeaders: Record<string, string> = {};
                if (sessionToken) {
                    uploadHeaders["Authorization"] = `Bearer ${sessionToken}`;
                }

                const originalUploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-temp-image`, {
                    method: "POST",
                    headers: uploadHeaders,
                    body: originalFormData,
                });
                if (!originalUploadRes.ok) throw new Error("Original upload failed");
                const originalUploadData = await originalUploadRes.json();
                finalOriginalUrl = originalUploadData.url;
                originalTempImageId = originalUploadData.tempImageId;
            }

            if (!finalOriginalUrl && !previewUrl) throw new Error("No image to upload");

            const cropBlob = await buildCropBlob();

            const cropFormData = new FormData();
            cropFormData.append("file", cropBlob, "profile_crop.jpg");
            cropFormData.append("imageType", "profile_crop");

            const uploadHeaders: Record<string, string> = {};
            if (sessionToken) {
                uploadHeaders["Authorization"] = `Bearer ${sessionToken}`;
            }

            const cropUploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-temp-image`, {
                method: "POST",
                headers: uploadHeaders,
                body: cropFormData,
            });
            if (!cropUploadRes.ok) throw new Error("Crop upload failed");
            const cropUploadData = await cropUploadRes.json();
            const cropTempImageId: number = cropUploadData.tempImageId;

            const currentCW = imageContainerRef.current?.offsetWidth || containerWidth;
            const metadata = `orig=${encodeURIComponent(finalOriginalUrl || "")}&zoom=${zoom}&x=${position.x}&y=${position.y}&cw=${currentCW}`;
            const compositeUrl = `${cropUploadData.url}|||${metadata}`;

            const jsonHeaders: Record<string, string> = { "Content-Type": "application/json" };
            if (sessionToken) {
                jsonHeaders["Authorization"] = `Bearer ${sessionToken}`;
            }

            const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/account`, {
                method: "PUT",
                headers: jsonHeaders,
                body: JSON.stringify({
                    profileImg: compositeUrl,
                    ...(originalTempImageId !== null ? { originalTempImageId } : {}),
                    cropTempImageId,
                }),
            });

            if (!profileRes.ok) throw new Error("Profile update failed");

            await refreshUser();
            toast.success("Profilna slika je uspešno promenjena!");
            onClose();
        } catch (error) {
            console.error("Error processing image:", error);
            toast.error("Greška pri čuvanju slike.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-bg-2 w-full max-w-[400px] rounded-4xl z-[10100] overflow-hidden"
                    >
                        {/* Centered Header */}
                        <div className="pt-8 pb-1 text-center">
                            <h2 className="text-text-main text-lg font-bold">
                                Promenite profilnu sliku
                            </h2>
                        </div>

                        <div className="p-6">
                            {/* CROP AREA */}
                            <div
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={previewUrl ? undefined : handleClick}
                                className={`mb-6 w-full aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center transition-all relative overflow-hidden ${previewUrl ? "" : "p-8 cursor-pointer"
                                    } ${isDragging
                                        ? "border-[#6366f1] bg-[#6366f1]/10"
                                        : "border-bg-4 hover:border-[#6366f1]/50"
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />

                                {previewUrl && (
                                    <div
                                        ref={imageContainerRef}
                                        className="relative w-full h-full flex items-center justify-center cursor-move"
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <div
                                            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${imgSize && containerWidth > 0 ? "opacity-100" : "opacity-0"}`}
                                        >
                                            {imgSize && containerWidth > 0 && (
                                                <Image
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    unoptimized
                                                    width={imgSize.width}
                                                    height={imgSize.height}
                                                    className="max-none"
                                                    style={(() => {
                                                        const aspect = imgSize.width / imgSize.height;
                                                        const circleDiameter = containerWidth * 0.85;

                                                        let baseW, baseH;
                                                        if (aspect > 1) {
                                                            baseH = circleDiameter;
                                                            baseW = circleDiameter * aspect;
                                                        } else {
                                                            baseW = circleDiameter;
                                                            baseH = circleDiameter / aspect;
                                                        }

                                                        return {
                                                            width: baseW,
                                                            height: baseH,
                                                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                                            maxWidth: 'none',
                                                            maxHeight: 'none'
                                                        };
                                                    })()}
                                                />
                                            )}
                                        </div>

                                        {(!imgSize || containerWidth <= 0) && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader />
                                            </div>
                                        )}

                                        <div
                                            className="absolute pointer-events-none z-10 border-2 border-[#6366f1] rounded-full"
                                            style={{
                                                width: '85%',
                                                height: '85%',
                                                boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.6)'
                                            }}
                                        />

                                        <img
                                            src={previewUrl}
                                            alt=""
                                            className="absolute opacity-0 pointer-events-none"
                                            style={{ width: '1px', height: '1px' }}
                                            onLoad={(e) => {
                                                const img = e.currentTarget;
                                                if (img.naturalWidth > 0) {
                                                    setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {!previewUrl && !isInitialLoad && (
                                    <div className="space-y-4 text-center">
                                        <div className="w-16 h-16 mx-auto bg-bg-3 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-text-main font-medium mb-1">
                                                Prevucite sliku ovde
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                ili kliknite da biste pregledali datoteke
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="w-full px-6 pb-6 flex flex-col gap-3">
                            <button
                                onClick={cropAndUpload}
                                disabled={(!previewUrl && !isDeleting) || isUploading || !isImageChanged()}
                                className="w-full py-3 rounded-full bg-[#5b42f3] hover:bg-[#4b35d6] text-white font-bold transition-all duration-200 cursor-pointer text-base flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isUploading ? <Loader /> : "Primeni"}
                            </button>

                            {previewUrl && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRemoveImage}
                                        className="flex-1 py-3 rounded-full bg-bg-3 hover:bg-bg-3/80 text-text-main font-bold transition-all duration-200 cursor-pointer text-base text-center"
                                    >
                                        Ukloni
                                    </button>
                                    <button
                                        onClick={handleClick}
                                        className="flex-1 py-3 rounded-full bg-bg-3 hover:bg-bg-3/80 text-text-main font-bold transition-all duration-200 cursor-pointer text-base text-center"
                                    >
                                        Izaberi
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-full bg-bg-3 hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base"
                            >
                                Otkaži
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
