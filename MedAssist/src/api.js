const API_BASE = "http://localhost:5269/api";

export async function fetchAuth(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        // Setam JSON doar daca body-ul EXISTA si NU este un FormData
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Daca url este complet, il folosim direct.
    // Daca este relativ, il construim cu API_BASE.
    const finalUrl = url.startsWith("http")
        ? url
        : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;

    const response = await fetch(finalUrl, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    return response;
}

export function getCurrentUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

export function getToken() {
    return localStorage.getItem("token");
}