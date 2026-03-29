export const BASE_URL = "https://api.jikan.moe/v4";

// Simple delay function to handle rate limiting manually (HTTP 429)
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJikanAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Basic Next.js cache strategy using ISR
  const defaultOptions: RequestInit = {
    next: { revalidate: 3600 }, // Cache for 1 hour by default
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // Explicit manual rate limit handler for HTTP 429
    if (response.status === 429) {
      console.warn("Jikan API rate limit exceeded (429). Delaying and retrying...");
      await delay(1500); // Backoff for 1.5 seconds
      const retryResponse = await fetch(url, mergedOptions);
      if (!retryResponse.ok) {
         throw new Error(`Failed on retry: HTTP ${retryResponse.status}`);
      }
      return await retryResponse.json();
    }
    
    if (!response.ok) {
      throw new Error(`Jikan API Error: HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching Jikan API:", error);
    // As per api_reference.md fallback data should ideally be returned by the calling component,
    // so we re-throw to be caught by the route or component boundary.
    throw error;
  }
}
