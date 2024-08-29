import { City } from "../models/City";

export const fetchCities = async (): Promise<{ [key: string]: City }> => {
    const url = new URL("/api/cities", window.location.origin);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};
