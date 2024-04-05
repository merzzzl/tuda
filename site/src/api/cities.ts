import { City } from "../models/City";
import { host } from "./api";

export const fetchCities = async (): Promise<{ [key: string]: City }> => {
    const response = await fetch('http://' + host + '/api/cities');

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};
