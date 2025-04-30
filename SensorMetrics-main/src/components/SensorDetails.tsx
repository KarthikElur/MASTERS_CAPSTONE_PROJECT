import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { getInitialData } from "../utils/requests";

// Define TypeScript interfaces
interface Sensor {
  region: string;
  AQS_Site_ID: string;
}

interface SensorDetailsProps {
  sensor: Sensor;
}

interface Option {
  key: string;
  value: string;
}

function SensorDetails({ sensor }: SensorDetailsProps) {
  const [mlVariant, setMlVariant] = useState("ml1");
  const [options, setOptions] = useState<Option[]>([]); // Initialize as empty array
  const [selectedOption, setSelectedOption] = useState<String | "none">("none");
  // Fetch options when sensor.region changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInitialData(sensor.region);
        const formattedOptions: Option[] = data.map((item: string) => ({
          key: item,
          value: item,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the function inside useEffect
  }, [sensor.region]); // Re-run when sensor.region changes

  return (
    <Box pb={2} pt={0.2}>
      <Typography variant="body1" gutterBottom>
        <span style={{ fontWeight: "bold" }}>Sensor/Region: </span>
        {sensor.region}
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel id="id">Choose an ID</InputLabel>
        <Select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          label="Choose an ID"
        >
          <MenuItem key="none" value="none">
            None
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body1" gutterBottom>
        <span style={{ fontWeight: "bold" }}>AQS: </span>
        {sensor.AQS_Site_ID}
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel id="ml">ML Calibrated value</InputLabel>
        <Select
          value={mlVariant}
          onChange={(e) => setMlVariant(e.target.value)}
          label="ML Calibrated value"
          disabled
        >
          <MenuItem value="ml1">ML1</MenuItem>
          <MenuItem value="ml2">ML2</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default SensorDetails;
