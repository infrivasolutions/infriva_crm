export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.infrivasolutions.com/api/v1";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("infriva_token");
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("infriva_token");
  localStorage.removeItem("infriva_user");
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !endpoint.includes("/auth/login")
    ) {
      clearAuth();
    }

    throw new Error(data?.message || "Something went wrong");
  }

  return data;
};
