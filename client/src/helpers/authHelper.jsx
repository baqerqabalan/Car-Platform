import axios from "axios";
import Cookies from "js-cookie";
import Notification from "../utils/Notification";

export const storeToken = (token) => {
  Cookies.set("token", token);
};

export const getToken = () => {
  return Cookies.get("token");
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const clearToken = () => {
  Cookies.remove("token");
};

export const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

axios.interceptors.response.use(
  (response) => {
    // Return response if successful
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data.message;

      // Check the specific message returned from the server
      if (
        errorMessage === "Your session expired, Log in again" ||
        errorMessage === "Invalid token, please log in again"
      ) {
        // Clear the token
        clearToken();

        // Show an alert or message (you can also use a custom message component here)
        <Notification message={"Your session has expired. Please log in again."} />

        // Redirect to the login page (using window.location or a router like React Router)
        window.location.href = "/login"; // Redirect to your login route
      }
    }

    // Return the error for further handling
    return Promise.reject(error);
  }
);

const decodeToken = (token) => {
  if (!token) return null;
  
  // Split the token into its parts
  const parts = token.split('.');

  // Ensure the token has three parts
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  // Decode the payload (the second part of the token)
  const payload = parts[1];

  // Decode base64Url to base64
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

  // Decode the base64 string to JSON string
  const jsonPayload = decodeURIComponent(escape(atob(base64)));

  // Parse and return the JSON object
  return JSON.parse(jsonPayload);
};

export const getUserIdFromToken = () => {
  const token = getToken(); // Your function to get the token from cookies
  const decoded = decodeToken(token);
  
  return decoded ? decoded.id : null; // Adjust `decoded.id` based on your token's payload structure
};
