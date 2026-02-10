import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
});

// Global error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Auto logout on 401 Unauthorized
            localStorage.removeItem("user");
            // Optional: Redirect to login or dispatch logout action if possible
            // location.href = "/auth/login"; // Careful with this in SPA
        }
        return Promise.reject(error);
    }
);

export default api;
