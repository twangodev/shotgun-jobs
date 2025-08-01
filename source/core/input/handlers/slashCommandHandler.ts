import {InputHandler, InputContext, HandlerResult} from '../types.js';
import {Command} from '../../commands/commandTypes.js';
import {helpCommand} from '../../commands/help.js';
import {profileCommand} from '../../commands/profile.js';
import {applyCommand} from '../../commands/apply.js';
import {clearCommand} from '../../commands/clear.js';

// Command registry
const commands: Record<string, Command> = {
	help: helpCommand,
	profile: profileCommand,
	apply: applyCommand,
	clear: clearCommand,
};

export class SlashCommandHandler implements InputHandler {
	name = 'SlashCommandHandler';
	priority = 90; // High priority, but after URL handler

	canHandle(context: InputContext): boolean {
		return context.trimmed.startsWith('/');
	}

	async handle(context: InputContext): Promise<HandlerResult> {
		const parts = context.trimmed.slice(1).split(' ');
		const commandName = parts[0]?.toLowerCase();
		const args = parts.slice(1);

		if (!commandName) {
			return {
				handled: true,
				result: {
					success: false,
					message: 'Please enter a command name after the slash.',
				},
			};
		}

		// Find command by name
		const command = commands[commandName];
		if (command) {
			const result = await command.execute(args);
			return {
				handled: true,
				result,
			};
		}

		// Check aliases
		for (const cmd of Object.values(commands)) {
			if (cmd.aliases?.includes(commandName)) {
				const result = await cmd.execute(args);
				return {
					handled: true,
					result,
				};
			}
		}

		return {
			handled: true,
			result: {
				success: false,
				message: `Unknown command: /${commandName}. Type /help for available commands.`,
			},
		};
	}

	static getAvailableCommands(): Command[] {
		return Object.values(commands);
	}
}
