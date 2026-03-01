import type { CommandRegistry } from './CommandRegistry';
import type { LLMAction, ConfirmationCallback } from '../types/pipeline';
import type { CommandResult } from '../types/commands';

export class CommandExecutor {
  constructor(
    private registry: CommandRegistry,
    private onConfirmation?: ConfirmationCallback,
  ) {}

  async execute(actions: LLMAction[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const action of actions) {
      const command = this.registry.get(action.command);
      if (!command) {
        results.push({
          success: false,
          message: `Unknown command: ${action.command}`,
        });
        continue;
      }

      // If the command requires confirmation and a callback is provided, ask first
      if (command.requiresConfirmation && this.onConfirmation) {
        try {
          const confirmed = await this.onConfirmation(action, command);
          if (!confirmed) {
            results.push({
              success: false,
              message: `Command "${action.command}" was cancelled by user.`,
            });
            continue;
          }
        } catch (error) {
          results.push({
            success: false,
            message: `Confirmation error for ${action.command}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
          continue;
        }
      }

      try {
        const result = await command.handler(action.params);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: `Error executing ${action.command}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return results;
  }
}
