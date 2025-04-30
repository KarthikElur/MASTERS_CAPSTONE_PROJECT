import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  FileUp,
  CloudUpload,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { uploadCSVData } from "../utils/requests";
import { getBatchData } from "../utils/aqi";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

const UploadCsvModal: React.FC = () => {
  const [mlVariant, setMlVariant] = useState<string>("ml1");
  const [open, setOpen] = useState(false);
  const [jsonData, setJsonData] = useState<object[] | []>([]);

  const [isUploading, setIsUploading] = useState<Boolean>(false);

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [completedBatches, setCompletedBatches] = useState<number[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [currentUploadState, setCurrentUploadState] = useState<string>("");

  let batchSize = totalRecords >= 1000 ? 1000 : totalRecords >= 100 ? 100 : 10;

  const handleClose = () => {
    setOpen(false);
    setIsUploading(false);
    setUploadProgress(0);
    setJsonData([]);
    setCompletedBatches([]);
  };

  useEffect(() => {
    setTotalRecords(jsonData?.length - 1 || 0);
  }, [jsonData]);

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file && file.type === "text/csv") {
  //     const reader = new FileReader();

  //     reader.onload = (e) => {
  //       const text = e.target?.result as string;
  //       const rows = text.split("\n").filter((row) => row.trim());
  //       const headers = rows[0].split(",");
  //       const data = rows.slice(1).map((row) => {
  //         const values = row.split(",");
  //         return headers.reduce((acc, header, index) => {
  //           acc[header.trim()] = values[index]?.trim() || "";
  //           return acc;
  //         }, {} as Record<string, string>);
  //       });
  //       setJsonData(data);
  //     };

  //     reader.readAsText(file);
  //   } else {
  //     alert("Please upload a valid CSV file.");
  //   }
  // };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split("\n").filter((row) => row.trim());
        const headers = rows[0].split(",");

        const data = rows
          .slice(1)
          .map((row) => {
            const values = row.split(",");
            const record = headers.reduce((acc, header, index) => {
              acc[header.trim()] = values[index]?.trim() || "";
              return acc;
            }, {} as Record<string, string>);

            // Check if any value is blank, discard record if true
            if (Object.values(record).includes("")) {
              return null;
            }

            return record;
          })
          .filter((record) => record !== null); // Remove null records

        setJsonData(data); // Set filtered data
      };

      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(1);
    setCompletedBatches([]);

    let batch = 1;
    const totalBatches = Math.ceil(totalRecords / batchSize);
    const maxRetries = 3;

    while (batch <= totalBatches) {
      let success = false;
      let attempts = 0;

      const start = (batch - 1) * batchSize;
      const end = Math.min(start + batchSize - 1, totalRecords);

      while (!success && attempts < maxRetries) {
        try {
          setCurrentUploadState(`Batch ${batch} uploading ...`);

          const response = await uploadCSVData({
            range: `${start} to ${end}`,
            data: getBatchData(jsonData, start, end),
          });

          if (response === 200) {
            setCompletedBatches((prev) => [...prev, batch - 1]); // Mark batch as completed
            setUploadProgress(batch); // Update progress
            setCurrentUploadState(`Batch ${batch} uploaded successfully.`);
            success = true;

            await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure UI updates
          } else {
            throw new Error(
              `Batch ${batch} failed with status ${response.status}`
            );
          }
        } catch (error) {
          attempts++;
          setCurrentUploadState(
            `Attempt ${attempts} failed for batch ${batch}`
          );
          console.error(
            `Attempt ${attempts} failed for batch ${batch}:`,
            error
          );

          if (attempts >= maxRetries) {
            setCurrentUploadState(
              `Batch ${batch} failed after ${maxRetries} attempts.`
            );
          }
        }
      }

      batch++;
    }

    setUploadProgress(0);
    setCurrentUploadState("All batches processed.");
  };

  return (
    <>
      <Tooltip
        title="Upload CSV File"
        arrow
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <IconButton onClick={() => setOpen(true)} sx={{ mr: "1vw" }}>
          <FileUp color="white" size={30} />
        </IconButton>
      </Tooltip>
      <Modal open={open}>
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "-21vh",
            }}
          >
            <IconButton onClick={() => handleClose()} size="small">
              <X />
            </IconButton>
          </Box>
          {isUploading ? (
            <Box>
              <Typography variant="h6">Uploading Data</Typography>
              <Divider sx={{ my: 2 }} />

              <Accordion>
                <AccordionSummary
                  expandIcon={<ChevronDown />}
                  id="panel1a-header"
                >
                  <Typography>{currentUploadState}</Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    maxHeight: "400px", // Set the maximum height
                    overflowY: "auto", // Enable vertical scrolling
                  }}
                >
                  <List>
                    {Array.from(
                      { length: Math.ceil(totalRecords / batchSize) },
                      (_, i) => {
                        const start = i * batchSize + 1;
                        const end = Math.min(
                          start + batchSize - 1,
                          totalRecords
                        );

                        return (
                          <ListItem key={i}>
                            <ListItemText
                              primary={`Uploading ${start}-${end}`}
                            />
                            <ListItemIcon>
                              {completedBatches.includes(i) ? (
                                <CheckCircle color="green" size={24} />
                              ) : uploadProgress === i + 1 ? (
                                <CircularProgress size={24} />
                              ) : null}
                            </ListItemIcon>
                          </ListItem>
                        );
                      }
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                Upload CSV File
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <FormControl variant="standard" sx={{ width: 120, mt: 2 }}>
                  <InputLabel>ML Calibrated</InputLabel>
                  <Select
                    value={mlVariant}
                    onChange={(e) => setMlVariant(e.target.value)}
                    label="ML Calibrated"
                  >
                    <MenuItem value="ml1">ML1</MenuItem>
                    <MenuItem value="ml2">ML2</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  sx={{ mt: 2 }}
                  onClick={() =>
                    document?.getElementById("file-upload")?.click()
                  }
                >
                  <CloudUpload size={60} />
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleFileUpload}
                  />
                </IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="contained" onClick={handleUpload}>
                  Upload
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default UploadCsvModal;
