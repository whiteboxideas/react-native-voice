import type { CommandRegistry } from './CommandRegistry';

export class PromptBuilder {
  build(registry: CommandRegistry, context?: string): string {
    const commandList = registry.toPromptDescription();

    return `You are a voice command assistant. The user will speak a command, and you must identify the appropriate action(s) to take.

Available commands:
${commandList}

${context ? `Additional context: ${context}\n` : ''}
You MUST respond with valid JSON only. No markdown, no explanation — just the JSON object.

Response format:
{
  "actions": [
    { "command": "command_name", "params": { "param_name": "value" } }
  ],
  "message": "Brief confirmation message to speak back to the user"
}

Rules:
- Match the user's intent to one or more commands from the list above.
- If the user's request doesn't match any command, return: { "actions": [], "message": "I didn't understand that command." }
- Use the exact command names and parameter names from the list.
- The "message" field should be a brief, natural-sounding confirmation.`;
  }
}
