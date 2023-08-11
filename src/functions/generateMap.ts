import * as Handlebars from "handlebars";
import Leaflet from "leaflet";
import puppeteer from "puppeteer";
import fs from "fs";
const arc = require("arc");

export interface handlebarsTemplateData {
  aircraft: Array<aircraft>,
  greatCircleRouteData: {

  }
}

export interface aircraft {
  callsign: string
  coordinates: {
    x: number,
    y: number
  }
}

export interface airportCoordinates {
  departureCoordinates: {
    x: number,
    y: number
  },
  arrivalCoordinates: {
    x: number,
    y: number
  }
}

async function generateMap(aircraftList: Array<aircraft>, airports: Array<airportCoordinates>) {

	// Data to be passed to handlebars template to generate markers etc on leaflet map
	const handleBarsTemplateData = {};

	for (let i = 0; i < aircraftList.length; i++) {

		/* Generate great circle routes
    const generator = new arc.greatCircle(airports[0].coordinates, airports[1].coordinates, {name:'Route'});
    const line = generator.Arc(100, {offset:10});
    const geoJSONOutput = line.json();
    */

		// Add respective aircraft to map
		const callsign = aircraftList[0].callsign;
		const xCoordinate = aircraftList[0].coordinates.x;
		const yCoordinate = aircraftList[0].coordinates.y;

		// Export data to handlebars template object to be rendered by leaflet
	}

	// Handlebars stuff

	const templatePath = "../../util/mapTemplate.handlebars";

	const mapTemplate = fs.readFileSync(templatePath, "utf-8");

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	const template = Handlebars.compile(mapTemplate);
	//await page.setContent();

	//await page.waitForSelector("#map");

	const screenshot = await page.screenshot();

    

}