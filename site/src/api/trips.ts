import { TripFrom } from "../models/Form";
import { TripsResult } from "../models/Find";

export const fetchTrips = async (form: TripFrom): Promise<TripsResult> => {
    const url = new URL("/api/find_trip");

    if (form.passport === undefined || form.startIATA === undefined || form.endIATA === undefined || form.maxSteps === undefined) {
        return {
            trips: [],
            final: true
        }
    }

    url.searchParams.append("passport", form.passport);
    url.searchParams.append("start_iata", form.startIATA);
    url.searchParams.append("end_iata", form.endIATA);
    url.searchParams.append("max_steps", form.maxSteps.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};
