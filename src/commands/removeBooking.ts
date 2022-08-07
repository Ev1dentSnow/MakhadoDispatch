import { CommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove-booking")
		.setDescription("remove a booking for a pilot"),

	async execute(interaction: CommandInteraction) {
		// Enusre only management can use this command
		const requiredRole = "1005835552672723085";
		if (!interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache.has(requiredRole)) {
			await interaction.reply({ content: "This command is for use by management only", ephemeral: true });
			return;
		}
	}
};