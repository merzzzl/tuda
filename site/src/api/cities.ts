import { City } from "../models/City";

export const fetchCities = async (): Promise<{ [key: string]: City }> => {
    const response = await fetch('/api/cities');

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};
