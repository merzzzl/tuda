import { RoadFrom } from "../models/Form";
import { RoadResult } from "../models/Find";

export const fetchRoads = async (form: RoadFrom): Promise<RoadResult> => {
    const url = new URL("/api/find_road");

    if (form.passport === undefined || form.startIATA === undefined) {
        return {
            roads: [],
        }
    }

    url.searchParams.append("passport", form.passport);
    url.searchParams.append("start_iata", form.startIATA);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
};
