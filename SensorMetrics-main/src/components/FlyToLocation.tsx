import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { Typography } from "@mui/material";

const MapIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function FlyToLocation({
  searchPosition,
}: {
  searchPosition: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (searchPosition) {
      map.flyTo(searchPosition, 13);
    }
  }, [searchPosition, map]);

  return (
    searchPosition && (
      <Marker position={searchPosition} icon={MapIcon}>
        <Popup>
          <Typography>Search Location</Typography>
        </Popup>
      </Marker>
    )
  );
}

export default FlyToLocation;
