"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { cityCoords } from "@/lib/cityCoords";
import { useEffect } from "react";
import { fixLeafletIcons } from "@/lib/fixLeafletIcons";

interface Props {
    adId: string | null;
}

export default function FullMap({ adId }: Props) {
    useEffect(() => {
        fixLeafletIcons();
    }, []);
    const city = adId ? "Vranje" : null;

    const coords = city ? cityCoords[city] : { lat: 44.8125, lng: 20.4612 };

    return (
        <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={12}
            className="w-full h-full"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {adId && city && (
                <Marker position={[coords.lat, coords.lng]} />
            )}
        </MapContainer>
    );
}
