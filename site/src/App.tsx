import React, { CSSProperties, useState, useRef, useEffect } from 'react';
import { Menu } from './components/Menu';
import { Map } from './components/Map';
import { fetchTrips } from './api/trips';
import { TicketProps } from './components/Ticket';
import { calculateTripHash, findTripPoints, findRoadPoints, hopsToNum, findCityName } from './utils/utils';
import { RoadFrom, TripFrom } from './models/Form';
import { City } from './models/City';
import { fetchCities } from './api/cities';
import { fetchRoads } from './api/roads';
import { Trip } from './models/Find';
import { Line } from './components/Map/Map';

function App() {
  const styles = useStyles()

  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [cities, setCities] = useState<{ [key: string]: City }>({});
  const [searchProgress, setSearchProgress] = useState<boolean>(false);
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [infinityTrip, setInfinityTrip] = useState<Trip | null>(null);
  const [infinityMode, setInfinityMode] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      const fetchedCities = await fetchCities();
      setCities(fetchedCities);
    };

    fetchData();
  }, []);

  const menuRefs = {
    passportRef: useRef<HTMLInputElement>(null),
    startIATARef: useRef<HTMLInputElement>(null),
    endIATARef: useRef<HTMLInputElement>(null),
    maxStepsRef: useRef<HTMLInputElement>(null),
  }

  const findTrips = async () => {
    const form: TripFrom = {
      passport: menuRefs.passportRef.current?.getAttribute("iata-code") || "",
      startIATA: menuRefs.startIATARef.current?.getAttribute("iata-code") || "",
      endIATA: menuRefs.endIATARef.current?.getAttribute("iata-code") || "",
      maxSteps: hopsToNum(menuRefs.maxStepsRef.current?.value) || 0,
    }

    setSearchProgress(true)

    while (true) {
      const tripsRes = await fetchTrips(form)

      setTickets(tripsRes.trips.sort((a, b) => (a.full_price < b.full_price ? -1 : 1)).map(trip => {
        const index = calculateTripHash(trip)

        const onClick = () => {
          setSelectedTrip(index)
          setLines([{
            type: "main",
            points: findTripPoints(trip.roads, cities)
          }])
        }

        return {
          onClick: onClick,
          tripInfo: trip,
          tripNum: index
        };
      }));

      if (tripsRes.final) {
        break
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    setSearchProgress(false)
  }

  const markerClick = (trip: Trip, lines: Line[]) => {
    if (searchProgress) {
      return
    }

    const ticket = {
      tripInfo: trip,
      tripNum: calculateTripHash(trip)
    }

    setTickets([ticket])
    setSelectedTrip(ticket.tripNum)
    setLines(lines)
    setInfinityTrip(trip)

    if (menuRefs.startIATARef.current) {
      menuRefs.startIATARef.current.setAttribute("iata-code", trip.roads[trip.roads.length - 1].to_iata)
      menuRefs.startIATARef.current.value = findCityName(trip.roads[trip.roads.length - 1].to_iata, cities)
    }
  }

  const findRoads = async () => {
    setSearchProgress(true)

    let localLines: Line[] = []
    if (infinityTrip) {
      localLines.push({
        type: "main",
        points: findTripPoints(infinityTrip.roads, cities)
      })
    }
    setLines(localLines)

    const form: RoadFrom = {
      passport: menuRefs.passportRef.current?.getAttribute("iata-code") || "",
      startIATA: menuRefs.startIATARef.current?.getAttribute("iata-code") || "",
    }

    const roadRes = await fetchRoads(form)

    localLines = roadRes.roads.map((road): Line => {
      return {
        points: findRoadPoints(road, cities),
        type: "temp"
      }
    })

    if (infinityTrip) {
      localLines.push({
        type: "main",
        points: findTripPoints(infinityTrip.roads, cities)
      })
    }

    roadRes.roads.forEach((road, index) => {
      const trip = {
        roads: [...infinityTrip?.roads || []],
        full_price: (infinityTrip?.full_price || 0) + road.flight.price
      }
      trip.roads.push(road)

      const markerLines = [...localLines]
      markerLines[index] = { ...markerLines[index] }
      markerLines[index].type = "selected"

      localLines[index].points[1].onClick = () => {
        markerClick(trip, markerLines)
      }
    })

    setLines(localLines)
    setSearchProgress(false)
  }

  const infinityModeSwith = (state: boolean) => {
    setInfinityTrip(null)
    setSelectedTrip("")
    setTickets([])
    setLines([])
    setInfinityMode(state)
  }

  const handleButtonClick = async () => {
    if (infinityMode) {
      findRoads()
    } else {
      findTrips()
    }
  };

  return (
    <div style={styles.root} className="App">
      <Map style={styles.map} lines={lines} />
      <Menu style={styles.menu} ticketProps={tickets} onClickSearch={handleButtonClick} searchProgress={searchProgress} cities={Object.keys(cities)} selectedTicket={selectedTrip} refs={menuRefs} isInvifityMode={(state) => infinityModeSwith(state)} />
    </div>
  );
}

export default App;

function useStyles(): { root: CSSProperties, menu: CSSProperties, map: CSSProperties } {
  return {
    menu: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      marginTop: '20px',
      left: '20px',
      width: '270px',
      height: 'calc(100% - 30px)'
    },
    map: {
      position: 'relative',
      top: '10px',
      left: '10px',
      width: 'calc(100vw - 310px)',
      height: 'calc(100vh - 30px)',
      flexShrink: 0,
      borderRadius: '30px',
      border: '5px solid #1E1E1E',
    },
    root: {
      display: 'flex',
      width: '100vw',
      height: '100vh',
    },
  };
};
