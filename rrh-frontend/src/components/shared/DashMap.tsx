import { useRef, useEffect } from "react";
import { ZONES, RISK_META } from "../../constants";
import type { Zone } from "../../types";

interface DashMapProps {
  onZoneSelect?: (zone: Zone) => void;
}

/**
 * Dashboard map component using Leaflet
 * Displays all zones with risk indicators
 */
export function DashMap({ onZoneSelect }: DashMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector("#lfcss2")) {
      const l = document.createElement("link");
      l.id = "lfcss2";
      l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }

    const init = () => {
      const L = (window as any).L;
      if (!L || !ref.current) return;

      const map = L.map(ref.current, {
        center: [-1.95, 30.05],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomleft" }).addTo(map);

      ZONES.forEach((z) => {
        const r = RISK_META[z.level];
        L.circle([z.lat, z.lng], {
          radius: r.radius,
          color: r.color,
          fillColor: r.color,
          fillOpacity: 0.1,
          weight: 1,
          opacity: 0.35,
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:28px;height:28px;transform:translate(-50%,-50%)"><div style="position:absolute;inset:0;border-radius:50%;background:${r.color};opacity:.18;animation:mapPing 2.4s ease infinite"></div><div style="position:absolute;top:50%;left:50%;width:10px;height:10px;transform:translate(-50%,-50%);border-radius:50%;background:${r.color};border:2px solid #071E26;box-shadow:0 0 8px ${r.glow}"></div></div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([z.lat, z.lng], { icon }).addTo(map);
        marker.bindPopup(`<b>${z.name}</b><br/>${z.level} — ${z.rainfall}/day`);

        if (onZoneSelect) {
          marker.on("click", () => onZoneSelect(z));
        }
      });

      mapRef.current = map;
    };

    if ((window as any).L) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload = init;
      document.head.appendChild(s);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onZoneSelect]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}
