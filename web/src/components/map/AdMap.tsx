import { MapContainer, TileLayer, Marker, Popup, Circle, AttributionControl, useMap } from "react-leaflet";
import CustomMapControls from "@/components/map/CustomMapControls";
import { useEffect } from "react";
import { fixLeafletIcons } from "@/lib/fixLeafletIcons";

type AdMapProps = {
    lat: number;
    lng: number;
    label?: string;
    street?: string | null;
    adId?: number;
    hideMarker?: boolean;
    noRounded?: boolean;
    scrollWheelZoom?: boolean;
    adSlug?: string;
    zoom?: number;
    fullScreen?: boolean;
    singleFingerPan?: boolean;
};

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 500);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

function MapInteractionHandler({ singleFingerPan }: { singleFingerPan?: boolean }) {
    const map = useMap();

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            if (singleFingerPan) {
                map.dragging.enable();
                return;
            }

            // Disable dragging by default on mobile to force two-finger pan
            map.dragging.disable();

            const handleTouchStart = (e: any) => {
                if (e.originalEvent.touches.length > 1) {
                    map.dragging.enable();
                } else {
                    map.dragging.disable();
                }
            };

            const handleTouchEnd = () => {
                map.dragging.disable();
            };

            map.on("touchstart", handleTouchStart);
            map.on("touchend", handleTouchEnd);

            return () => {
                map.off("touchstart", handleTouchStart);
                map.off("touchend", handleTouchEnd);
            };
        }
    }, [map, singleFingerPan]);

    return null;
}

export default function AdMap({ lat, lng, label, street, adId, hideMarker, noRounded, scrollWheelZoom = false, adSlug, zoom, fullScreen, singleFingerPan }: AdMapProps) {
    useEffect(() => {
        fixLeafletIcons();
    }, []);

    const hasExactLocation = !!street;

    return (
        <div className={`w-full overflow-hidden relative z-10 ${noRounded ? "h-full" : "rounded-2xl h-[260px]"}`}>
            <MapContainer
                center={[lat, lng]}
                zoom={zoom || (hasExactLocation ? 15 : 12)}
                zoomControl={false}
                scrollWheelZoom={scrollWheelZoom}
                attributionControl={false}
                className="w-full h-full"
            >
                <MapResizer />
                <MapInteractionHandler singleFingerPan={singleFingerPan} />
                <CustomMapControls adId={fullScreen ? undefined : adId} adSlug={adSlug} />
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <AttributionControl position="bottomleft" />

                {!hideMarker && (
                    hasExactLocation ? (
                        <Marker position={[lat, lng]}>
                            <Popup>{label || "Tačna lokacija"}</Popup>
                        </Marker>
                    ) : (
                        <Circle
                            center={[lat, lng]}
                            radius={2500}
                            pathOptions={{
                                fillColor: "#4a4a4a",
                                fillOpacity: 0.3,
                                color: "#6366f1",
                                weight: 2
                            }}
                        >
                            <Popup>{label || "Približna lokacija (Grad)"}</Popup>
                        </Circle>
                    )
                )}
            </MapContainer>
        </div>
    );
}
