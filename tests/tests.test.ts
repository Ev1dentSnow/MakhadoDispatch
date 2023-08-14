import fetchAirportCoordinates from "../src/functions/fetchAirportCoordinates";
import fetchFlightData from "../src/functions/fetchFlightData";
import populateAirportDatabase from "../src/functions/populateAirportDatabase";
import generateMap, { aircraft, airportCoordinates } from "../src/functions/generateMap";
import { RedisClientType, createClient } from "redis";
import { error } from "console";

describe("FTW API Data Functions", () => {

	const aircraftList: Array<aircraft> = [];
	const aiports: Array<airportCoordinates> = [];

	it.todo("Fetches data from the FTW API");

	it.todo("Destructures and processes the data from the FTW API");


});

describe("FTW Live Map Generation Functions", () => {

	

	// This test takes long, there is a 40 second timeout
	it("Updates the Redis database of airport information from the provided CSV file", async () => {
		
		const redisClient = createClient();
		redisClient.on("error", err => fail(err));

		// Populate/Refresh airport database
		await redisClient.connect();
		await populateAirportDatabase(<RedisClientType>redisClient);

		// Read the data from the database to ensure it was inserted properly and maintained integrity
		const airport1Data = await redisClient.hGet("FAOR", "latitude_deg");
		// eslint-disable-next-line no-debugger
		debugger;
		const airport2Data = await redisClient.hGet("FIMP", "name");

		expect(airport1Data).toBe("-26.1392");
		expect(airport2Data).toBe("Sir Seewoosagur Ramgoolam International Airport");
		redisClient.quit();
		
	}, 40000);
});
