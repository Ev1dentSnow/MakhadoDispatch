import { AxiosResponse } from "axios";
import { coordinates } from "../database/fetchAirportCoordinates";
import fetchAirportCoordinates from "../database/fetchAirportCoordinates";
import { aircraft, airportCoordinates } from "../generateMap";


export interface FTWResponseData {
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

export interface processedFlightData {
    aircraftList: Array<aircraft>,
    airports: Array<airportCoordinates>
}


export default async function processFlightData(APIResponse: AxiosResponse): Promise<processedFlightData> {

	const aircraft: Array<aircraft> = [];
	const airports: Array<airportCoordinates> = [];

	const FTWData = <Array<FTWResponseData>>APIResponse.data;
	// Iterate through list of live flights returned by API
	for (let i = 0; i < FTWData.length; i++) {
		const departureICAO = FTWData[i].departureICAO;
		const arrivalICAO = FTWData[i].arrivalICAO;
		const callsign = FTWData[i].flightNumber;
		const aircraftCoordinates = { x: FTWData[i].lastPositionLatitude, y: FTWData[i].lastPositionLongitude };
		let departureAirportCoordinates: coordinates = {x: 0, y: 0};
		let arrivalAirportCoordinates: coordinates = {x: 0, y: 0};
		// Get airport coordinates

		departureAirportCoordinates = await fetchAirportCoordinates(departureICAO);
		arrivalAirportCoordinates = await fetchAirportCoordinates(arrivalICAO);

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
	return { aircraftList: aircraft, airports: airports };
}