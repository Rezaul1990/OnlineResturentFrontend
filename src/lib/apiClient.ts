const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    next: {
      revalidate: 30
    }
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "API request failed");
  }

  return payload.data as T;
};

