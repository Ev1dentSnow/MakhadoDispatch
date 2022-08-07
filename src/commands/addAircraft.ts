import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import yaml from "js-yaml";
import fs from "fs";
import { Aircraft, YamlDoc } from "..";
import { buildStatusEmbed } from "../util/embed";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-aircraft")
		.setDescription("add an aircraft to the fleet list")
		.addStringOption(option =>
			option.setName("icao-aircraft-type")
				.setDescription("The ICAO designator for the aircraft e.g B739ER")
				.setRequired(true))
		.addStringOption(option =>
			option.setName("registration")
				.setDescription("The aircraft registration in capitals e.g ZS-ABC")
				.setRequired(true))
		.addStringOption(option => 
			option.setName("status")
				.setDescription("The status and location of this aircraft")
				.setRequired(true)),

	async execute(interaction: ChatInputCommandInteraction) {
		
		// Enusre only management can use this command
		const requiredRole = "1005835552672723085";
		//|| !interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)
		if (interaction.user.id !== "238360513082294284") {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}

		const ICAO = <string>interaction.options.getString("icao-aircraft-type");
		const registration = <string>interaction.options.getString("registration");
		const status = <string>interaction.options.getString("status");

		const newAircraft: Aircraft = {
			[registration]: {
				icao: ICAO,
				status: status,
				lastStatusEditUserID: interaction.user.id,
				booking: {
					booked: false,
					callsign: "",
					departureICAO: "",
					arrivalICAO: "",
					etd: "",
					pilotUserID: ""
				}
			}	
		};

		// Update existing YAML file
		const yamlDoc = <YamlDoc>yaml.load(fs.readFileSync("dist/config/fleet.yaml", "utf-8"));
		yamlDoc.aircraft.push(newAircraft);
		fs.writeFileSync("dist/config/fleet.yaml", yaml.dump(yamlDoc));

		// Delete old status embed to make to new one with new aircraft in it (only if an embed actually exists in the first place)
		if (yamlDoc.lastStatusChannelID != null && yamlDoc.lastStatusMessageID != null) {
			const channel = await interaction.client.channels.fetch(<string>yamlDoc.lastStatusChannelID) as TextChannel;
			await channel.messages.delete(yamlDoc.lastStatusMessageID)
				.catch(error => console.log(error));
		}

		buildStatusEmbed(yamlDoc)
			.then(async messageComponents => {
				//@ts-ignore
				await interaction.reply({ embeds: [messageComponents.embed], components: [messageComponents.row] });
			})
			.catch(async reason => await interaction.reply({ content: `${registration} added to fleet successfully`, ephemeral: true }));

	}
};