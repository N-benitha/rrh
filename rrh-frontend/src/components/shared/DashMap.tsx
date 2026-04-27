import { useRef, useEffect } from "react";
import { ZONES } from "../../constants";

/* Landing-page map: real Leaflet map of Rwanda showing only rivers
   and critical/high risk zones. No detail panel — just visual overview. */

const RIVERS = [
  { name: "Nyabarongo",  coords: [[-2.35, 29.70], [-2.15, 29.95], [-1.95, 30.06]] as [number,number][] },
  { name: "Akagera",     coords: [[-1.87, 30.40], [-1.70, 30.65], [-1.50, 30.80]] as [number,number][] },
  { name: "Sebeya",      coords: [[-1.50, 29.25], [-1.62, 29.35], [-1.68, 29.38]] as [number,number][] },
  { name: "Kagera",      coords: [[-2.55, 30.45], [-2.40, 30.70], [-2.20, 30.90]] as [number,number][] },
  { name: "Ruvubu",      coords: [[-2.80, 30.10], [-2.60, 30.30], [-2.45, 30.55]] as [number,number][] },
];

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH:     "#f97316",
  MODERATE: "#eab308",
  LOW:      "#22c55e",
};

interface LLayer {
  addTo: (map: LMap) => LLayer;
  bindTooltip: (content: string, opts?: unknown) => LLayer;
}
interface LMap { remove: () => void; }
interface LStatic {
  map: (el: HTMLElement, opts: unknown) => LMap;
  tileLayer: (url: string, opts: unknown) => Pick<LLayer, "addTo">;
  polyline: (coords: unknown, opts: unknown) => LLayer;
  divIcon: (opts: unknown) => unknown;
  marker: (coords: unknown, opts: unknown) => LLayer;
}
type WindowWithLeaflet = Window & typeof globalThis & { L?: LStatic };

export function DashMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    if (!document.querySelector("#lfcss-lp")) {
      const l = document.createElement("link");
      l.id = "lfcss-lp";
      l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }

    const init = () => {
      const L = (window as WindowWithLeaflet).L;
      if (!L || !ref.current) return;

      const map = L.map(ref.current, {
        center: [-1.95, 30.05],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      /* Draw rivers as blue polylines */
      RIVERS.forEach((r) => {
        L.polyline(r.coords, {
          color: "#4fc3f7",
          weight: 2.5,
          opacity: 0.6,
        }).addTo(map).bindTooltip(r.name, {
          permanent: false,
          direction: "top",
          className: "lp-river-tip",
        });
      });

      /* Show only CRITICAL and HIGH zones */
      ZONES.filter((z) => z.level === "CRITICAL" || z.level === "HIGH").forEach((z) => {
        const color = RISK_COLOR[z.level];
        const pulse = z.level === "CRITICAL";

        const html = `
          <div style="position:relative;width:26px;height:26px;transform:translate(-50%,-50%)">
            ${pulse ? `<div style="position:absolute;inset:0;border-radius:50%;background:${color};animation:lpPing 2s ease-out infinite;opacity:.55"></div>` : ""}
            <div style="position:absolute;top:50%;left:50%;width:11px;height:11px;
              transform:translate(-50%,-50%);border-radius:50%;background:${color};
              border:2px solid #fff;box-shadow:0 0 8px ${color}88"></div>
          </div>`;

        const icon = L.divIcon({ className: "", html, iconSize: [0, 0], iconAnchor: [0, 0] });
        L.marker([z.lat, z.lng], { icon })
          .addTo(map)
          .bindTooltip(`<b>${z.name}</b><br/>${z.level} · ${z.rainfall}/day`, {
            direction: "top",
            offset: [0, -14],
          });
      });

      /* Pulse keyframe injected once */
      if (!document.querySelector("#lp-ping-style")) {
        const s = document.createElement("style");
        s.id = "lp-ping-style";
        s.textContent = `
          @keyframes lpPing {
            0%   { transform:scale(1);opacity:.6 }
            70%  { transform:scale(3.2);opacity:0 }
            100% { transform:scale(3.2);opacity:0 }
          }
          .lp-river-tip { background:#0c1a2e; border:1px solid #4fc3f744;
            color:#4fc3f7; font-size:10px; border-radius:4px; padding:2px 7px; }
        `;
        document.head.appendChild(s);
      }

      mapRef.current = map;
    };

    if ((window as WindowWithLeaflet).L) {
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
  }, []);

  return <div ref={ref} style={{ height: "100%", width: "100%" }} />;
}
