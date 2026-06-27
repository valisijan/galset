import { useMap } from "react-leaflet";
import Link from "next/link";

type CustomMapControlsProps = {
    adId?: number;
    adSlug?: string;
};

export default function CustomMapControls({ adId, adSlug }: CustomMapControlsProps) {
    const map = useMap();

    return (
        <>
            {/* Bottom Controls */}
            <div className="absolute bottom-3 md:bottom-3 right-3 z-[5000] flex flex-col gap-3">
                <button
                    onClick={() => map.zoomIn()}
                    className="w-10 h-10 bg-bg-2 rounded-full text-text-main text-xl hover:bg-bg-3 transition-colors cursor-pointer shadow-lg dark:shadow-none"
                >
                    +
                </button>
                <button
                    onClick={() => map.zoomOut()}
                    className="w-10 h-10 bg-bg-2 rounded-full text-text-main text-xl hover:bg-bg-3 transition-colors cursor-pointer shadow-lg dark:shadow-none"
                >
                    −
                </button>
            </div>

            {/* Top Right "Show Map" control */}
            {adId && (
                <div className="absolute top-3 right-3 z-[1000]">
                    <Link
                        href={adSlug ? `/map/${adSlug}` : `/map?adId=${adId}`}
                        className="bg-bg-2 rounded-full px-4 py-2.5 font-bold text-sm shadow-xl dark:shadow-none hover:bg-bg-3 transition-all !text-text-main flex items-center justify-center min-w-[120px]"
                    >
                        Prikaži mapu
                    </Link>
                </div>
            )}
        </>
    );
}
