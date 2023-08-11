import axios from "axios";
import fetchAirportCoordinates from "../functions/fetchAirportCoordinates";
import { aircraft, airportCoordinates } from "../functions/generateMap";
import { coordinates } from "../functions/fetchAirportCoordinates";

interface FTWResponseData {
    username: string,
    flightNumber: string,
    flightCreatedAt: string,
    airplaneType: string,
    airplaneID: number,
    airplaneRegistration: string,
    flightRoute: string,
    departureICAO: string,
    arrivalICAO: string,
    passengerCount: number,
    cargoWeight: number,
    passengerWeight: number,
    fuelAmountKg: number,
    consumedFuelAmountKg: number,
    flownMiles: number,
    flownTime: number,
    lastPositionLatitude: number,
    lastPositionLongitude: number
}

interface processedFlightData {
    aircraftList: Array<aircraft>,
    airports: Array<airportCoordinates>
}

// Fetch flight FTWData from FTW API and process it for generateMap function
async function fetchFlightData(): Promise<processedFlightData | undefined> {

    let aircraft: Array<aircraft> = [];
    let airports: Array<airportCoordinates> = [];

    try {
        const response = await axios.get(<string>process.env.FTWURL, { headers: {"readaccesskey": <string>process.env.FTWKEY} });
        
        // There are airplanes are curently flying
        if (response.status == 200) {

            const FTWData = <Array<FTWResponseData>>response.data;

            // Iterate through list of live flights returned by API
            for (let i = 0; i < FTWData.length; i++) {
                const departureICAO = FTWData[i].departureICAO;
                const arrivalICAO = FTWData[i].arrivalICAO;
                const callsign = FTWData[i].flightNumber;
                const aircraftCoordinates = { x: FTWData[i].lastPositionLatitude, y: FTWData[i].lastPositionLongitude };
                let departureAirportCoordinates: coordinates = {x: 0, y: 0};
                let arrivalAirportCoordinates: coordinates = {x: 0, y: 0};
                // Get airport coordinates
                try {

                    departureAirportCoordinates = (await fetchAirportCoordinates(departureICAO));
                    arrivalAirportCoordinates = (await fetchAirportCoordinates(arrivalICAO));

                    // Add current aircraft to respective array
                    aircraft.push({
                        callsign: callsign,
                        coordinates: {
                            x: aircraftCoordinates.x,
                            y: aircraftCoordinates.y
                        }
                    });

                    // Add departure and arrival airport to respective array
                    airports.push({
                        departureCoordinates: {
                            x: departureAirportCoordinates.x,
                            y: departureAirportCoordinates.y
                        },
                        arrivalCoordinates: {
                            x: arrivalAirportCoordinates.x,
                            y: arrivalAirportCoordinates.y
                        }
                    });

                }
                catch (error) {
                    console.error(error);
                }
            }
            return { aircraftList: aircraft, airports: airports }
        }
        // No aircraft flying
        else if (response.status == 404) {
            return;
        }
        else {
            return;
        }

    } 
    catch (error) {
        console.error(error);
    }
}