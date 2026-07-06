export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.infrivasolutions.com/api/v1";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("infriva_token");
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("infriva_token");
      localStorage.removeItem("infriva_user");
    }

    throw new Error(data?.message || "Something went wrong");
  }

  return data;
};
