export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface CommandDefinition {
  name: string;
  description: string;
  category: string;
  parameters?: CommandParameter[];
  handler: (params: Record<string, unknown>) => CommandResult | Promise<CommandResult>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
}
