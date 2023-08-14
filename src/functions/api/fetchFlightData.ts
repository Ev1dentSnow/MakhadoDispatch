import axios from "axios";

import "dotenv/config";
import processFlightData from "./processFlightData";

// Fetch flight FTWData from FTW API and process it for use by generateMap function
export default async function fetchFlightData() {
	
	const response = await axios.get(<string>process.env.FTWURL, { headers: {"readaccesskey": <string>process.env.FTWKEY} });

	// 200 = there are airplanes are curently flying
	if (response.status == 200) {
		const processedData = await processFlightData(response);
		return processedData;
	}
	// 404 = no aircraft currently flying
	else if (response.status == 404) {
		return { aircraftList: [], airports: [] };
	}
	else {
		throw Error(`Server responded with: ${response.status}: ${response.statusText}`);
	}
} 
	
