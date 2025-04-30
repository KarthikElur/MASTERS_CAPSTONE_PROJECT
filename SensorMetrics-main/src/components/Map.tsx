import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { Box, Paper, Typography } from "@mui/material";
import "leaflet/dist/leaflet.css";
import type { AQIData, MapPosition } from "../types";
import { generateColorFromLatLong } from "../utils/aqi";
import LocateMeButton from "./LocateMeButton";
import AQIGraph from "./AQIGraph";
import FlyToLocation from "./FlyToLocation";
import SensorDetails from "./SensorDetails";
import { getInitialData } from "../utils/requests";

interface MapProps {
  aqiData: AQIData[];
  searchPosition: [number, number] | null; // Added searchPosition prop
}

export default function Map({ aqiData, searchPosition }: MapProps) {
  const [position, setPosition] = useState<MapPosition>({
    lat: 47.8064,
    lng: -122.317,
  });

  const [showGraph, setShowGraph] = useState(false); // To control AQIGraph visibility
  const [selectedSensor, setSelectedSensor] = useState<AQIData | null>(null); // Track selected sensor

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        console.log("Using default location");
      }
    );
  }, []);

  const handleCircleClick = async (sensor: AQIData) => {
    setSelectedSensor(sensor);
    setShowGraph(true);
    // await getInitialData(sensor.region);
  };

  return (
    <>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        {/* Pass searchPosition to a child component */}
        {searchPosition && <FlyToLocation searchPosition={searchPosition} />}

        {aqiData.map((sensor) => (
          <Circle
            // key={sensor.id}
            center={[sensor.Latitude, sensor.Longitude]}
            radius={900}
            pathOptions={{
              color: generateColorFromLatLong(
                sensor.Latitude,
                sensor.Longitude
              ),
              fillColor: generateColorFromLatLong(
                sensor.Latitude,
                sensor.Longitude
              ),
              fillOpacity: 0.8,
            }}
            eventHandlers={{
              click: () => handleCircleClick(sensor),
            }}
          >
            <Popup minWidth={300}>
              <SensorDetails sensor={sensor} />
            </Popup>
          </Circle>
        ))}

        <LocateMeButton />
      </MapContainer>
    </>
  );
}
