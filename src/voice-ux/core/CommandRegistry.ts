import type { CommandDefinition } from '../types/commands';

export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();

  register(command: CommandDefinition): void {
    this.commands.set(command.name, command);
  }

  registerAll(commands: CommandDefinition[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }

  get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  getByCategory(category: string): CommandDefinition[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  toPromptDescription(): string {
    const cmds = this.getAll();
    if (cmds.length === 0) return 'No commands available.';

    return cmds
      .map((cmd) => {
        const params = cmd.parameters?.length
          ? `\n    Parameters: ${cmd.parameters
              .map((p) => {
                let desc = `${p.name} (${p.type}${p.required ? ', required' : ', optional'}): ${p.description}`;
                if (p.enum) desc += ` [values: ${p.enum.join(', ')}]`;
                return desc;
              })
              .join('; ')}`
          : '';
        return `  - ${cmd.name}: ${cmd.description}${params}`;
      })
      .join('\n');
  }
}
