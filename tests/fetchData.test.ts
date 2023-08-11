import fetchFlightData from "../src/functions/fetchFlightData";
import generateMap, { aircraft, airportCoordinates } from "../src/functions/generateMap";
import { error } from "console";

describe("FTW API Functions", () => {

	const aircraftList: Array<aircraft> = [];
	const aiports: Array<airportCoordinates> = [];

	it("fetches data from the FTW API", async () => {
		const data = await fetchFlightData();
		error(data);
		expect(1).toBe(1);
	}, 20000);

	/*
	it.todo("generates a leaflet map", async () => {
		//await generateMap(aircraftList, aiports);
	});
    */

});
