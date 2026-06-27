"use client";

import { useState } from "react";
import Image from "next/image";
const UserAvatar = "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/user-avatar.png?updatedAt=1776365714850";

interface AvatarProps {
    name?: string;
    email?: string;
    imageUrl?: string | null;
    size?: number;
}

export default function Avatar({
    name,
    email,
    imageUrl,
    size = 40,
}: AvatarProps) {
    const [imgError, setImgError] = useState(false);

    const rawImgUrl = imageUrl?.split("|||")[0];
    const imgSrc = (rawImgUrl && !imgError) ? rawImgUrl : UserAvatar;

    return (
        <div
            className="relative rounded-full overflow-hidden flex-shrink-0"
            style={{ width: size, height: size }}
        >
            <Image
                src={imgSrc}
                alt={name || "Avatar"}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
            />
        </div>
    );
}


