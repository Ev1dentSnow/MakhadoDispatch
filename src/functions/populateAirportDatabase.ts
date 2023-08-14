import { RedisClientType, RedisFlushModes } from "redis";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";

export default async function populateAirportDatabase(redisClient: RedisClientType) {

	// flush all existing data from Redis database and start fresh
	await redisClient.flushDb(RedisFlushModes.SYNC);

	const csvData: Array<Array<string>> = [];

	const filePath = path.join(__dirname, "..", "util", "airport_data", "airports.csv");
	
	const parser = fs.createReadStream(filePath)
		.pipe(parse({ delimiter: ",", from_line: 2 }));

	// push each airport as a hash to the Redis database
	let counter = 0;
	for await (const record of parser) {
		// eslint-disable-next-line no-debugger
		debugger;
		csvData.push(record);
		await redisClient.hSet(
			csvData[counter][1],
			{
				id: csvData[counter][0],
				ident: csvData[counter][1],
				name: csvData[counter][3],
				latitude_deg: csvData[counter][4],
				longitude_deg: csvData[counter][5]
			}
		);
		counter++;
	}

	




	/*
		.on("data", (row: Array<string>) => {
			// each "airport" is an array. Each "csv column" is represented as an element of that array. This csvData is a 2 dimensional array
			csvData.push(row);
		})
		.on("end", () => {

			// push each airport as a hash to the Redis database
			for (let i = 0; i < csvData.length; i++) {
				redisClient.hSet(
					// key = airport ICAO code (second CSV column)
					csvData[i][1],
					{
						id: csvData[i][0],
						ident: csvData[i][1],
						name: csvData[i][3],
						latitude_deg: csvData[i][4],
						longitude_deg: csvData[i][5]
					}
				);
			}
		})
		.on("error", (error) => {
			throw error;
		});
		*/
}