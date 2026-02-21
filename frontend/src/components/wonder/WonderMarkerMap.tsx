"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

interface WonderMarkerMapProps {
  lat?: number;
  lng?: number;
  label: string;
}

const geographyUrl =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

export function WonderMarkerMap({ lat, lng, label }: WonderMarkerMapProps) {
  const hasMarker =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white/70 p-3 shadow-sm">
      <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%" }}>
        <Geographies geography={geographyUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "#ddd8ce",
                    stroke: "#f7f5f0",
                    strokeWidth: 0.6,
                    outline: "none",
                  },
                  hover: {
                    fill: "#d2cabc",
                    outline: "none",
                  },
                  pressed: {
                    fill: "#d2cabc",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
        {hasMarker ? (
          <Marker coordinates={[lng, lat]}>
            <circle r={6} fill="#6f5d43" stroke="#ffffff" strokeWidth={2} />
            <text
              textAnchor="middle"
              y={-14}
              style={{ fill: "#3f3627", fontSize: "10px", fontWeight: "600" }}
            >
              {label}
            </text>
          </Marker>
        ) : null}
      </ComposableMap>
    </div>
  );
}
