import { Map as MapIcon } from "lucide-react";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Map from "./components/Map";
import { theme } from "./utils/theme";
import { useEffect, useState } from "react";
import Search from "./components/Search";
import GoogleAuth from "./utils/GoogleAuth";
import UploadCsvModal from "./components/UploadCsvModal";
import { getInitialData } from "./utils/requests";

function App() {
  const [searchPosition, setSearchPosition] = useState<[number, number] | null>(
    null
  );

  const region: string | undefined = undefined; // Can be a string or undefined

  // States for AQI data, loading, and error
  const [aqiData, setAqiData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted components

    const fetchAQIData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getInitialData(region);
        if (isMounted) {
          setAqiData(data || []); // Ensure aqiData is always an array
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAQIData();

    const interval = setInterval(fetchAQIData, 300000); // Refetch every 5 minutes
    return () => {
      isMounted = false;
      clearInterval(interval); // Cleanup interval
    };
  }, []);

  if (error) {
    // Handle error state
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MapIcon />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
              SENSOR
            </Typography>
            <UploadCsvModal />
            {/* Search Input */}
            <Search
              searchPosition={searchPosition}
              setSearchPosition={setSearchPosition}
            />
            {/* Authentication */}
            <GoogleAuth />
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, position: "relative" }}>
          {isLoading ? (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Map aqiData={aqiData || []} searchPosition={searchPosition} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
