export interface Coordinates {
    lat: number;
    lon: number;
}

export interface City {
    country_code: string;
    code: string;
    name: string;
    coordinates: Coordinates;
}
