import { BageProps } from "../components/Bage";
import { FlightProps } from "../components/Flight";
import { Point } from "../components/Map";
import { City } from "../models/City";
import { Road, Trip } from "../models/Find";
import { sha256 } from 'js-sha256';

export function convertToBageProps(roads: Road[]): BageProps[] {
    if (roads.length === 0) {
        return [];
    }

    const firstRoad = roads[0];
    const bageProps: BageProps[] = [
        { code: firstRoad.from_iata },
        { code: firstRoad.to_iata },
    ];

    for (let i = 1; i < roads.length; i++) {
        bageProps.push({ code: roads[i].to_iata });
    }

    return bageProps;
};

export function convertToFlightProps(roads: Road[]): FlightProps[] {
    if (roads.length === 0) {
        return [];
    }

    const flightProps: FlightProps[] = [];

    roads.forEach(item => {
        flightProps.push({
            from: item.from_iata,
            to: item.to_iata,
            number: `${item.flight.airline} ${item.flight.flight_number}`,
            duration: item.flight.duration,
            price: item.flight.price,
            link: item.flight.link
        })
    })

    return flightProps;
};

export function hopsToNum(val?: string): number | undefined {
    if (val === undefined) {
        return undefined
    }

    return parseInt(val.match(/\d+/)?.[0] || "0", 10)
}

export function calculateTripHash(trip: Trip): string {
    const str = JSON.stringify(trip);
    const hash = sha256(str);
    return `${hash.slice(0, 4)}`;
}

export function findTripPoints(roads: Road[], cities: { [key: string]: City }): Point[] {
    if (roads.length === 0) {
        return [];
    }

    const firstRoad = roads[0];
    const iataCodes: string[] = [
        firstRoad.from_iata,
        firstRoad.to_iata,
    ];

    for (let i = 1; i < roads.length; i++) {
        iataCodes.push(roads[i].to_iata);
    }

    return iataCodes.map(iata => {
        const city = cities[iata];
        if (!city) {
            throw new Error(`Airport not found for IATA code: ${iata}`);
        }

        return { lat: city.coordinates.lat, lon: city.coordinates.lon, name: iata, country: city.country_code, info: city.name };
    });
}

export function findCityName(iata: string, cities: { [key: string]: City}): string {
    return cities[iata].name
}

export function findRoadPoints(road: Road, cities: { [key: string]: City }): Point[] {
    const iataCodes: string[] = [
        road.from_iata,
        road.to_iata,
    ];

    return iataCodes.map(iata => {
        const city = cities[iata];
        if (!city) {
            throw new Error(`Airport not found for IATA code: ${iata}`);
        }

        return { lat: city.coordinates.lat, lon: city.coordinates.lon, name: iata, country: city.country_code, info: city.name };
    });
}
