import fs from "fs";
import { parse } from "csv-parse";
import path from "path";
import { RedisClientType } from "redis";

export interface coordinates {
    x: number,
    y: number
}

// Fetch the coordinates of an airport from Redis database given its ICAO code
export default async function fetchAirportCoordinates (airportICAO: string, redisClient: RedisClientType): Promise<coordinates | undefined> {

	const coordinates: coordinates = {x: 0, y: 0};

	// Check if ICAO code exists in database
	const exists = await redisClient.exists(airportICAO);

	if (exists) {
		const latitude = await redisClient.hGet(airportICAO, "latitude_deg");
		const longitude = await redisClient.hGet(airportICAO, "longitude_deg");

		coordinates.x = Number(latitude);
		coordinates.y = Number(longitude);
		return coordinates;
	}
	else {
		return undefined;
	}

}