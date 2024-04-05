export interface Flight {
    departure_at: string;
    price: number;
    duration: number;
    airline: string;
    flight_number: string;
    link: string;
}

export interface Road {
    from_iata: string;
    to_iata: string;
    flight: Flight;
}

export interface Trip {
    full_price: number;
    roads: Road[];
}

export interface TripsResult {
    trips: Trip[];
    final: boolean;
}

export interface RoadResult {
    roads: Road[];
}
