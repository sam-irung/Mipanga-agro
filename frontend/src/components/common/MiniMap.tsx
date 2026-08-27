import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MiniMapProps {
  latitude: number;
  longitude: number;
  height?: string;
  interactive?: boolean;
  markers?: { lat: number; lng: number; label?: string }[];
  onClick?: (lat: number, lng: number) => void;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onClick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onClick]);
  return null;
}

export default function MiniMap({
  latitude,
  longitude,
  height = "200px",
  interactive = true,
  markers,
  onClick,
}: MiniMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div
      className="overflow-hidden rounded-xl border border-border"
      style={{ height }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        style={{ height: "100%", width: "100%" }}
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers && markers.length > 0 ? (
          markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]}>
              {m.label && (
                <Popup>
                  <span className="text-sm font-medium">{m.label}</span>
                </Popup>
              )}
            </Marker>
          ))
        ) : (
          <Marker position={[latitude, longitude]} />
        )}
        <Recenter lat={latitude} lng={longitude} />
        {interactive && onClick && <ClickHandler onClick={onClick} />}
      </MapContainer>
    </div>
  );
}
