import axios from 'axios';
const LIVE_BACKEND_URL = 'https://memecoin-strategy-app.onrender.com/api';
const apiClient = axios.create({ baseURL: LIVE_BACKEND_URL, timeout: 10000 });
export default apiClient;
