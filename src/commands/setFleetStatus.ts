import { Command } from "@sapphire/framework";

export class SlashCommand extends Command {

	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "set-fleet-status-channel",
			description: "Set the channel used to view live info about the Makhado Fleet",
		});  
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override chatInputRun(interaction: Command.ChatInputCommandInteraction) {

		return interaction.reply({
			embeds: []
		});
	}
}