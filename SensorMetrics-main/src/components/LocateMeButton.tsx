import { Box, IconButton } from "@mui/material";
import { useMap } from "react-leaflet";
import { LocateFixed } from "lucide-react";
import { theme } from "../utils/theme";

function LocateMeButton() {
  const map = useMap();

  const handleLocateMe = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 13);
      },
      () => {
        console.log("Unable to fetch location");
      }
    );
  };

  return (
    <Box
      className="leaflet-bottom leaflet-right"
      sx={{
        position: "absolute",
        bottom: "15vh",
        right: "0.8vw",
        zIndex: 1000, // Ensure the button is above the map
        pointerEvents: "auto", // Enable pointer events for the button
        background: theme.palette.grey[200],
        borderRadius: "50%",
        border: `0.5px solid ${theme.palette.grey[400]}`,
      }}
    >
      <IconButton onClick={handleLocateMe} style={{ fontSize: "0.8rem" }}>
        <LocateFixed size={25} />
      </IconButton>
    </Box>
  );
}

export default LocateMeButton;
