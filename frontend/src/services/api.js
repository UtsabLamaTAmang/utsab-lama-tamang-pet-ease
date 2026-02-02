import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    register: async (fullName, email, phone, password) => {
        const response = await api.post("/auth/register", {
            fullName,
            email,
            phone,
            password,
        });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    updateProfile: async (fullName, phone) => {
        const response = await api.put("/auth/update-profile", {
            fullName,
            phone,
        });
        return response.data;
    },

    verifyOTP: async (email, code) => {
        const response = await api.post("/auth/verify-otp", {
            email,
            code,
        });
        return response.data;
    },

    resendOTP: async (email) => {
        const response = await api.post("/auth/resend-otp", {
            email,
        });
        return response.data;
    },
};


export const paymentAPI = {
    initiate: async (data) => {
        const response = await api.post("/payment/initiate", data);
        return response.data;
    },
    verify: async (data) => {
        const response = await api.post("/payment/verify", data);
        return response.data;
    }
};

export const cartAPI = {
    getCart: async () => {
        const response = await api.get("/cart");
        return response.data;
    },
    addToCart: async (productId, quantity) => {
        const response = await api.post("/cart/add", { productId, quantity });
        return response.data;
    },
    removeFromCart: async (productId) => {
        const response = await api.delete(`/cart/${productId}`);
        return response.data;
    },
    updateQuantity: async (productId, quantity) => {
        const response = await api.put("/cart/update", { productId, quantity });
        return response.data;
    }
};







// Token management
export const tokenManager = {
    setToken: (token) => {
        localStorage.setItem("token", token);
    },

    getToken: () => {
        return localStorage.getItem("token");
    },

    removeToken: () => {
        localStorage.removeItem("token");
    },
};

export const petAPI = {
    create: async (data) => {
        const response = await api.post("/pets", data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/pets/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/pets/${id}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/pets/${id}`);
        return response.data;
    },
    getAll: async (params) => {
        const response = await api.get("/pets", { params });
        return response.data;
    }
};

export const uploadAPI = {
    upload: async (formData) => {
        const response = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    uploadMultiple: async (formData) => {
        const response = await api.post("/upload/multiple", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};

export const chatAPI = {
    initiate: async (petId) => {
        const response = await api.post("/chat/initiate", { petId });
        return response.data;
    },
    getMessages: async (chatId) => {
        const response = await api.get(`/chat/${chatId}`);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get("/chat");
        return response.data;
    }
};

export const wishlistAPI = {
    toggle: async (data) => {
        // data: { petId } or { productId }
        const response = await api.post("/wishlist/toggle", data);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get("/wishlist");
        return response.data;
    },
    checkStatus: async (petId) => {
        const response = await api.get(`/wishlist/check?petId=${petId}`);
        return response.data;
    }
};

export const adoptionAPI = {
    create: async (data) => {
        const response = await api.post("/adoptions", data);
        return response.data;
    },
    getAll: async (params) => {
        const response = await api.get("/adoptions", { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/adoptions/${id}`);
        return response.data;
    },
    updateStatus: async (id, status, adminNotes) => {
        const response = await api.patch(`/adoptions/${id}/status`, { status, adminNotes });
        return response.data;
    },
    cancel: async (id) => {
        const response = await api.patch(`/adoptions/${id}/cancel`);
        return response.data;
    }
};

// User management
export const userManager = {
    setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));
    },

    getUser: () => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    removeUser: () => {
        localStorage.removeItem("user");
    },
};

export const userAPI = {
    getPublicProfile: async (id) => {
        const response = await api.get(`/users/${id}/public-profile`);
        return response.data;
    }
};

export default api;
