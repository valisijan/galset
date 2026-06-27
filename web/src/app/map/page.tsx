"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/Loader";

const AdMap = dynamic(() => import("@/components/map/AdMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-bg-1">
            <Loader />
        </div>
    )
});

const SERBIA_CENTER = { lat: 44.0165, lng: 21.0059 };

export default function GeneralMapPage() {
    return (
        <div className="w-full h-screen bg-bg-1 overflow-hidden relative md:p-6">
            <div className="w-full h-full md:rounded-3xl overflow-hidden md:border md:border-bg-3 relative z-10">
                <AdMap
                    lat={SERBIA_CENTER.lat}
                    lng={SERBIA_CENTER.lng}
                    hideMarker={true}
                    noRounded={true}
                    scrollWheelZoom={true}
                    zoom={7}
                />
            </div>
        </div>
    );
}
