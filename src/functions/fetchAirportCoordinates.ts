import fs from "fs";
import { parse } from "csv-parse";

export interface coordinates {
    x: number,
    y: number
}

// find the coordinates of an airport given its ICAO code
export default function fetchAirportCoordinates (airportICAO: string) {

	return new Promise<coordinates>((resolve, reject) => {

		const coordinates: coordinates = {x: 0, y: 0};

		fs.createReadStream("../util/airport_data/airports.csv")
			.pipe(parse((({ delimiter: ",", from_line: 2 }))))
			.on("row", (row: Array<string>) => {
				if (row[1] === airportICAO) {
					coordinates.x = Number(row[4]);
					coordinates.y = Number(row[5]);
				}
			})
			.on("end", () => {
				resolve(coordinates);
			})
			.on("error", (error) => {
				reject(error);
			});
	});


}