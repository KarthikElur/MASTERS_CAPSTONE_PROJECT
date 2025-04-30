import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;
const CSV_UPLOAD_URL = API_URL + import.meta.env.VITE_APP_CSV_UPLOAD;
const CSV_ALL_REGIONS_URL = API_URL + import.meta.env.VITE_APP_ALL_REGIONS;

// const CSV_UPLOAD_URL = import.meta.env.VITE_APP_CSV_UPLOAD;

interface Payload {
  range: string;
  data: object[];
}

export const uploadCSVData = async (payload: Payload): Promise<any> => {
  try {
    const response = await axios.post(CSV_UPLOAD_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      // withCredentials: true,
    });
    console.log(response);

    return response.status;
  } catch (error: any) {
    console.error("Axios Error:", error.response || error.message);
    throw error;
  }
};

export const getInitialData = async (region?: string): Promise<any> => {
  try {
    // Append `region` as a query parameter if provided
    const url = region
      ? `${CSV_ALL_REGIONS_URL}?region=${region}`
      : CSV_ALL_REGIONS_URL;

    const response = await axios.get(url, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Axios Error:", error.response || error.message);
    throw error;
  }
};
