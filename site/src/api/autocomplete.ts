import { Place } from "../models/Place";

export const fetchPlaces = async (type: string, term: string): Promise<Place[]> => {
    const url = new URL("/api/places", window.location.origin);

    url.searchParams.append("type", type);
    url.searchParams.append("term", term);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};
