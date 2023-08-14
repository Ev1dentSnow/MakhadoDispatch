import fs from "fs";
import { parse } from "csv-parse";
import path from "path";

export interface coordinates {
    x: number,
    y: number
}

// Find the coordinates of an airport given its ICAO code
export default function fetchAirportCoordinates (airportICAO: string) {

	return new Promise<coordinates>((resolve, reject) => {

		const coordinates: coordinates = {x: 0, y: 0};

		// Asynchronously parse airport database csv file

	});


}