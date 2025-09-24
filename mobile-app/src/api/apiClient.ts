import axios from 'axios';

// This is the public URL for your backend server running on Render.
const LIVE_BACKEND_URL = 'https://memecoin-strategy-app.onrender.com/api';

const apiClient = axios.create({
  baseURL: LIVE_BACKEND_URL,
  timeout: 10000, // Increased timeout for a live server which may need to "wake up" on the free plan.
});

export default apiClient;
