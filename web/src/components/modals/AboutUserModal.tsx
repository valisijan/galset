import { motion } from "framer-motion";
import { Calendar, MapPin, BadgeCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png";

interface AboutUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    user: any;
}

export default function AboutUserModal({ isOpen, onClose, onBack, user }: AboutUserModalProps) {
    const [localUser, setLocalUser] = useState(user);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    useEffect(() => {
        if (!isOpen || !user?.id) return;

        // If city, country, or successfulSales are missing, fetch them
        if (localUser?.city === undefined || localUser?.country === undefined || localUser?.successfulSales === undefined) {
            const fetchFullUser = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`);
                    const data = await res.json();
                    if (data.success && data.user) {
                        setLocalUser((prev: any) => ({
                            ...prev,
                            ...data.user
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch full user info in AboutUserModal:", err);
                }
            };
            fetchFullUser();
        }
    }, [isOpen, user?.id, localUser?.city, localUser?.country, localUser?.successfulSales]);

    const joinedDate = localUser?.createdAt ? new Date(localUser.createdAt) : new Date();
    const monthNames = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
    const formattedJoinedDate = `${monthNames[joinedDate.getMonth()]} ${joinedDate.getFullYear()}`;

    let locationDisplay = "Nije navedena";
    if (localUser?.country && localUser?.city) {
        locationDisplay = `${localUser.country}, ${localUser.city}`;
    } else if (localUser?.country) {
        locationDisplay = localUser.country;
    } else if (localUser?.city) {
        locationDisplay = localUser.city;
    }

    const successfulSalesCount = localUser?.successfulSales ?? 0;

    function formatSales(count: number) {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${count} uspešnih prodaja`;
        }
        if (lastDigit === 1) {
            return `${count} uspešna prodaja`;
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${count} uspešne prodaje`;
        }
        return `${count} uspešnih prodaja`;
    }

    return (
        <motion.div
            key="about"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative bg-bg-2 w-full max-w-sm rounded-4xl overflow-hidden"
        >
            {/* ABOUT VIEW */}
            <div className="pt-8 pb-1 text-center">
                <h3 className="text-text-main font-bold text-lg">O ovom nalogu</h3>
            </div>

            <div className="overflow-y-auto max-h-[60vh] px-5 py-8 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative border border-bg-3">
                        <Image
                            src={localUser?.profileImg?.split("|||")[0] || UserAvatar}
                            alt={localUser?.fullName || "Korisnik"}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-text-main text-base">{localUser?.fullName}</p>
                        <p className="text-gray-400 text-xs">@{localUser?.username}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="pl-4 pb-2 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-2 flex items-center justify-center">
                            <Calendar size={20} className="text-text-main" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] tracking-wider font-semibold">Korisnik od</p>
                            <p className="text-text-main font-bold text-sm capitalize">{formattedJoinedDate}</p>
                        </div>
                    </div>

                    <div className="pl-4 pb-2 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-2 flex items-center justify-center">
                            <MapPin size={20} className="text-text-main" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] tracking-wider font-semibold">Lokacija</p>
                            <p className="text-text-main font-bold text-sm">{locationDisplay}</p>
                        </div>
                    </div>

                    <div className="pl-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-2 flex items-center justify-center">
                            <BadgeCheck size={20} className="text-text-main" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] tracking-wider font-semibold">Uspešne prodaje</p>
                            <p className="text-text-main font-bold text-sm">
                                {formatSales(successfulSalesCount)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-6 pb-6 flex flex-col gap-3">
                <button
                    onClick={onBack}
                    className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-bold transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                >
                    Nazad
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-full bg-bg-4 dark:bg-bg-3 hover:bg-bg-4/80 dark:hover:bg-bg-3/80 text-text-main font-medium transition-all duration-200 cursor-pointer text-base flex justify-center items-center"
                >
                    Otkaži
                </button>
            </div>
        </motion.div>
    );
}
