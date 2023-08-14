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
}