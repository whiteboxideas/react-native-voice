import type { CommandRegistry } from './CommandRegistry';
import type { LLMAction } from '../types/pipeline';
import type { CommandResult } from '../types/commands';

export class CommandExecutor {
  constructor(private registry: CommandRegistry) {}

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
