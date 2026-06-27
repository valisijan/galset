"use client";

import { useEffect } from "react";
import { fixLeafletIcons } from "@/lib/fixLeafletIcons";
import L from "leaflet";

useEffect(() => {
    fixLeafletIcons();
}, []);

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});
