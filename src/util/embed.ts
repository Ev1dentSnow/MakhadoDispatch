import { RestOrArray, APIEmbedField, APISelectMenuOption, ActionRowBuilder, SelectMenuBuilder, EmbedBuilder, APIEmbed } from "discord.js";
import { YamlDoc } from "..";

/**
 * Returns a promise that creates a fleet status embed if there are aircraft in the yaml doc
 * @param yamlDocObject 
 * @returns
 */
export function buildStatusEmbed(yamlDocObject: YamlDoc) {

	return new Promise((resolve, reject) => {

		const embedFields: RestOrArray<APIEmbedField> = [];
		const selectMenuItems: RestOrArray<APISelectMenuOption> = [];
    
		yamlDocObject.aircraft.forEach(element => {
    
			const nameValue = `${Object.values(element)[0].icao} | ${Object.keys(element)[0]}`;
			const fieldValue = `${Object.values(element)[0].status} <@${Object.values(element)[0].lastStatusEditUserID}>`;
    
			embedFields.push({ name: nameValue, value: fieldValue, inline: false });
			selectMenuItems.push({ label: `${Object.values(element)[0].icao} | ${Object.keys(element)[0]}`, description: "Edit status", value: Object.keys(element)[0] });
		});

		// If no data is in embed, don't send embed as it will result in an error. This promise can never reject when using the /add-aircraft command because then the length is > 0
		if (embedFields.length === 0) {
			reject("no fields in embed");
		}
		else {
			// Generate and send embed with select menu
			const row = new ActionRowBuilder<SelectMenuBuilder>()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId("select")
						.setPlaceholder("Select an aircraft")
					// dynamically add options from yaml file
						.setOptions(selectMenuItems));

			const fleetStatusEmbed = new EmbedBuilder()
				.setColor("Aqua")
				.setTitle("Makhado Airways Fleet Status")
				.setDescription("What are our aircraft currently doing? Select an aircraft at the bottom to update it's status")
				.setFields(embedFields)
				.setThumbnail("https://i.gyazo.com/38fead66336b86b0d18d85f6bbd3f704.png");

			const obj = {
				row: row,
				embed: fleetStatusEmbed
			};
			resolve(obj);
		}
      
	});
}