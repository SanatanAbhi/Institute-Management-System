import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});


let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function notifySubscribers(error, accessToken = null) {
    const subscribers = [...refreshSubscribers];
    refreshSubscribers = [];

    subscribers.forEach((callback) => {
        callback(error, accessToken);
    });
}

function clearAuthTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

// Public pages must remain accessible without authentication.
const PUBLIC_PATHS = new Set([
    "/",
    "/about",
    "/courses",
    "/center-login",
    "/student-login",
    "/super-admin-login",
    "/events",
    "/downloads",
    "/contact",
    "/apply-now",
    "/centers",
    "/success-stories",
    "/gallery",
]);

function isPublicRoute() {
    const path = window.location.pathname;

    return (
        PUBLIC_PATHS.has(path) ||
        path.startsWith("/apply-now/")
    );
}

function redirectToLoginIfProtected() {
    // Never redirect users away from a public page.
    if (isPublicRoute()) {
        return;
    }

    const path = window.location.pathname;

    let loginPath = "/center-login";

    if (path.startsWith("/student")) {
        loginPath = "/student-login";
    } else if (path.startsWith("/super-admin")) {
        loginPath = "/super-admin-login";
    }

    if (path !== loginPath) {
        window.location.replace(loginPath);
    }
}

// Attach an access token when one exists.
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle expired access tokens.
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";

        // Do not intercept failed login attempts or token-refresh calls.
        // A wrong password should be handled by the login page itself.
        if (requestUrl.includes("/token/")) {
            return Promise.reject(error);
        }

        // Crucial fix: a public request that did not send an access token
        // must not trigger a refresh or redirect to a login page.
        const headers = originalRequest.headers;

        const authorizationHeader =
            headers?.Authorization ??
            headers?.authorization ??
            headers?.get?.("Authorization");

        if (!authorizationHeader) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            clearAuthTokens();
            redirectToLoginIfProtected();

            return Promise.reject(error);
        }

        // Wait for an existing refresh request, if there is one.
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((refreshError, newAccessToken) => {
                    if (refreshError || !newAccessToken) {
                        reject(
                            refreshError ||
                                new Error("Unable to refresh access token.")
                        );
                        return;
                    }

                    originalRequest.headers =
                        originalRequest.headers || {};

                    originalRequest.headers.Authorization =
                        `Bearer ${newAccessToken}`;

                    resolve(api(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            // Use plain axios to prevent recursively invoking this interceptor.
            const refreshResponse = await axios.post(
                `${api.defaults.baseURL}/token/refresh/`,
                {
                    refresh: refreshToken,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const newAccessToken = refreshResponse.data.access;

            if (!newAccessToken) {
                throw new Error("No access token returned from refresh.");
            }

            localStorage.setItem("accessToken", newAccessToken);

            // Release queued requests with the new token.
            notifySubscribers(null, newAccessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearAuthTokens();

            // Reject queued requests instead of leaving them pending.
            notifySubscribers(refreshError);

            // Redirect only when the user is on a protected page.
            redirectToLoginIfProtected();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;