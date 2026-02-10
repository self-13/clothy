import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
});

export default api;
