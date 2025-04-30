import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import React, { useState, useRef } from "react";
import { X } from "lucide-react";

// Define the types for the props
interface SearchProps {
  searchPosition: [number, number] | null;
  setSearchPosition: React.Dispatch<
    React.SetStateAction<[number, number] | null>
  >;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const Search = ({ searchPosition, setSearchPosition }: SearchProps) => {
  const [searchQuery, setSearchQuery] = useState(""); // For the search input
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); // To hold search suggestions
  const [loading, setLoading] = useState(false); // Loading state for fetching
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // Ref for debounce timer

  // Function to handle search and fetch suggestions with debounce
  const handleSearch = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true); // Set loading to true while fetching
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false); // Set loading to false once the fetch is done
      }
    }, 2000); // 2-second debounce
  };

  return (
    <>
      <Autocomplete
        sx={{ minWidth: "25vw", width: "auto" }}
        freeSolo
        options={suggestions.map((suggestion) => suggestion.display_name)}
        onInputChange={(event, newInputValue) => {
          setSearchQuery(newInputValue);
          handleSearch(newInputValue); // Trigger search with debounce
        }}
        onChange={(event, newValue) => {
          const selected = suggestions.find(
            (item) => item.display_name === newValue
          );
          if (selected) {
            const { lat, lon } = selected;
            setSearchPosition([parseFloat(lat), parseFloat(lon)]);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search Location or Sensor Name"
            variant="outlined"
            size="small"
            sx={{
              bgcolor: "white",
              borderRadius: 1,
              transition: "max-width 0.3s ease",
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : (
                    <X
                      onClick={() => {
                        setSearchQuery("");
                        handleSearch(""); // Clear search on clear button click
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option}
          </Box>
        )}
        disableClearable
        inputValue={searchQuery}
      />
    </>
  );
};

export default Search;
