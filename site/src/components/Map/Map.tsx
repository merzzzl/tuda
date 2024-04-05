import React, { useEffect, CSSProperties, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import './index.css';
import { GeodesicLine } from "leaflet.geodesic"

export interface Point {
    lat: number;
    lon: number;
    name: string;
    info: string;
    country: string;
    onClick?: () => void
}

export interface Line {
    points: Point[]
    type: "main" | "temp" | "selected"
}

export interface MapProps {
    style?: CSSProperties;
    lines?: Line[];
};

export function Map(props: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersLayersRef = useRef<L.LayerGroup | null>(null);
    const geodesicLinesRef = useRef<GeodesicLine[]>([]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([0, 0], 3);
            mapRef.current.setMaxBounds(
                [
                    [-90, -220],
                    [90, 220]
                ]
            )
            mapRef.current.attributionControl.remove()
            mapRef.current.zoomControl.remove()

            L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                minZoom: 3,
            }).addTo(mapRef.current);
        }

        const map = mapRef.current;

        if (markersLayersRef.current) {
            markersLayersRef.current.clearLayers();
        } else {
            markersLayersRef.current = L.layerGroup().addTo(map);
        }

        geodesicLinesRef.current.forEach(line => line.remove());
        geodesicLinesRef.current = [];

        if (props.lines) {
            props.lines.forEach(line => {
                const latlngs = line.points.map(point => [point.lat, point.lon] as L.LatLngTuple);

                let color = "yellow"
                if (line.type === "selected") {
                    color = "red"
                } else if (line.type === "temp") {
                    color = "gray"
                }

                geodesicLinesRef.current.push(new GeodesicLine(latlngs, {
                    dashArray: '10, 10',
                    weight: 3,
                    color: color,
                }).addTo(map));

                if (props.lines?.length === 1) {
                    map.flyToBounds(latlngs)
                }

                line.points.forEach(point => {
                    const icon = L.icon({
                        iconUrl: "https://flagcdn.com/48x36/" + point.country.toLowerCase() + ".png",
                        iconSize: [24, 18],
                        iconAnchor: [12, 9]
                    });

                    const marker = L.marker([point.lat, point.lon])
                        .setIcon(icon)
                        .bindTooltip(`${point.info} (${point.name})`)
                        .on("click", () => {
                            if (point.onClick) point.onClick()
                        });

                    marker.addTo(markersLayersRef.current as L.LayerGroup);
                });
            })
        }
    }, [props.lines]);

    return <div id="map" style={props.style} />;
};
