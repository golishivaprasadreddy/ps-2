import axios from "axios";

// Use Vite env variable for API base URL
const baseURL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL,
  withCredentials: false,
});

export default API;