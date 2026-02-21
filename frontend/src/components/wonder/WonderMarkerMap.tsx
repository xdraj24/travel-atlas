"use client";

import Map, { Marker } from "react-map-gl/mapbox";

interface WonderMarkerMapProps {
  lat?: number;
  lng?: number;
  label: string;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? "mapbox://styles/mapbox/outdoors-v12";

export function WonderMarkerMap({ lat, lng, label }: WonderMarkerMapProps) {
  const hasMarker =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng);

  const center = hasMarker
    ? { latitude: lat, longitude: lng, zoom: 4.6 }
    : { latitude: 20, longitude: 10, zoom: 1.35 };

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white/70 p-3 shadow-sm">
      {mapboxToken ? (
        <div className="overflow-hidden rounded-lg">
          <Map
            style={{ width: "100%", height: "16rem" }}
            mapboxAccessToken={mapboxToken}
            mapStyle={mapboxStyle}
            initialViewState={center}
            minZoom={1}
            maxZoom={14}
            dragRotate={false}
            touchZoomRotate={false}
            attributionControl={false}
          >
            {hasMarker ? (
              <Marker longitude={lng} latitude={lat} anchor="bottom">
                <div className="flex flex-col items-center">
                  <span className="mb-1 max-w-40 truncate rounded-full bg-[#3f3627]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {label}
                  </span>
                  <span className="h-3 w-3 rounded-full border-2 border-white bg-[#6f5d43] shadow-[0_2px_10px_rgba(0,0,0,0.25)]" />
                </div>
              </Marker>
            ) : null}
          </Map>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 text-center text-xs text-stone-600">
          Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to render this map preview.
        </div>
      )}
    </div>
  );
}
