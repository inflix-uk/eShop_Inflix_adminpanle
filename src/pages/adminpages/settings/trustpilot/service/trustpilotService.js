import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export const getTrustpilotData = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}trustpilot`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Trustpilot data");
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error("Error fetching Trustpilot data:", error);
    return null;
  }
};

export const saveTrustpilotData = async (trustpilotData) => {
  try {
    const response = await fetch(`${BACKEND_URL}trustpilot`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(trustpilotData),
    });

    if (!response.ok) {
      throw new Error("Failed to save Trustpilot data");
    }

    const data = await response.json();
    toast.success("Trustpilot data saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving Trustpilot data:", error);
    toast.error("Failed to save Trustpilot data");
    throw error;
  }
};
