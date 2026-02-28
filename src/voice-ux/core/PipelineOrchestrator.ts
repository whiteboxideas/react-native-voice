import type { PipelineConfig, PipelineResult, PipelineStageListener, LLMResponse } from '../types/pipeline';
import type { CommandRegistry } from './CommandRegistry';
import { CommandExecutor } from './CommandExecutor';
import { PromptBuilder } from './PromptBuilder';

export class PipelineOrchestrator {
  private promptBuilder = new PromptBuilder();

  constructor(
    private config: PipelineConfig,
    private registry: CommandRegistry,
  ) {}

  updateConfig(config: Partial<PipelineConfig>): void {
    Object.assign(this.config, config);
  }

  async process(audioUri: string, onStage?: PipelineStageListener): Promise<PipelineResult> {
    const startTime = Date.now();

    try {
      // Stage 1: Transcribe
      onStage?.('transcribing', 'Transcribing your speech...');
      const transcript = await this.config.sttProvider.transcribe(audioUri);

      if (!transcript.trim()) {
        return {
          success: false,
          transcript: '',
          actions: [],
          commandResults: [],
          error: 'Could not transcribe audio. Please try again.',
          durationMs: Date.now() - startTime,
        };
      }

      // Stage 2: LLM understanding
      onStage?.('understanding', 'Understanding your command...');
      const systemPrompt = this.promptBuilder.build(this.registry);
      const llmRaw = await this.config.llmProvider.complete(systemPrompt, transcript);
      const llmResponse = this.parseLLMResponse(llmRaw);

      // Stage 3: Execute commands
      onStage?.('executing', 'Executing...');
      const executor = new CommandExecutor(this.registry);
      const commandResults = await executor.execute(llmResponse.actions);

      // Stage 4: TTS response
      const ttsMessage = llmResponse.message ||
        commandResults.map((r) => r.message).join('. ') ||
        'Done.';

      if (this.config.ttsEnabled !== false && this.config.ttsProvider) {
        onStage?.('speaking', ttsMessage);
        await this.config.ttsProvider.speak(ttsMessage);
      }

      onStage?.('done');

      return {
        success: commandResults.every((r) => r.success),
        transcript,
        actions: llmResponse.actions,
        commandResults,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      onStage?.('error', error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        transcript: '',
        actions: [],
        commandResults: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };
    }
  }

  private parseLLMResponse(raw: string): LLMResponse {
    // Strip markdown code fences if present (common with Anthropic)
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    try {
      const parsed = JSON.parse(cleaned);
      return {
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        message: typeof parsed.message === 'string' ? parsed.message : undefined,
      };
    } catch {
      return {
        actions: [],
        message: 'I had trouble understanding that. Please try again.',
      };
    }
  }
}
