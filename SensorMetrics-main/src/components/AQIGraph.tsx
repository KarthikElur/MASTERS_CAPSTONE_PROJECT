import { useState } from "react";
import { Paper, IconButton, Box, Typography } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { X } from "lucide-react";
import type { AQIData } from "../types";

interface AQIGraphProps {
  aqiData: AQIData[];
  onClose: () => void; // Function to close the graph
}

// Mock historical data generator
const generateHistoricalData = (currentPM25: number) => {
  const data = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000); // Past 24 hours, hourly
    data.push({
      time: time.toLocaleTimeString(),
      pm25: Math.max(0, currentPM25 + (Math.random() - 0.5) * 10),
    });
  }
  return data;
};

export default function AQIGraph({ aqiData, onClose }: AQIGraphProps) {
  // Use the first sensor's data for demonstration
  const sensorData = aqiData[0];
  const historicalData = generateHistoricalData(sensorData?.pm25 || 0);

  // Prepare data for Nivo Line chart
  const chartData = [
    {
      id: "PM2.5",
      data: historicalData.map((d) => ({
        x: d.time,
        y: d.pm25,
      })),
    },
  ];

  return (
    <Paper
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        width: 500,
        zIndex: 9999,
        transition: "width 0.3s ease-in-out",
      }}
      elevation={3}
    >
      <Box
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" sx={{ ml: 1 }}>
          AQI History
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X />
        </IconButton>
      </Box>

      <Box sx={{ height: 300, p: 2 }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 50, left: 40 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: false,
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Time",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "PM2.5",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          colors={{ scheme: "nivo" }}
          lineWidth={3}
          enablePoints={false}
          enableArea={false}
          enableGridX={false}
          enableGridY={true}
          tooltip={({ point }) => (
            <strong>
              {point.serieId}: {point.data.yFormatted}
            </strong>
          )}
        />
      </Box>
    </Paper>
  );
}
