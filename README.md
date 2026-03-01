# react-native-voice

A modular voice command library for React Native apps — STT, LLM tool-calling, TTS pipeline with pluggable providers.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)]()

## Features

- **Full voice pipeline** — Record → Transcribe → LLM → Execute → Speak, all in one press-and-hold interaction
- **Pluggable providers** — Swap STT, LLM, and TTS implementations without changing app code
- **Built-in providers** — Whisper STT, OpenAI LLM, Anthropic LLM, Expo Speech TTS
- **Command registry** — Declarative command definitions with typed parameters, categories, and confirmation support
- **Ready-to-use UI** — `VoiceButton` (FAB), `VoiceBubble` (status overlay), animated `RecordingIndicator`
- **React hooks** — `useVoiceCommand`, `useAudioRecording`, `useAudioPlayback` for custom UIs
- **Secure API key management** — `expo-secure-store` with env variable fallback
- **Tree-shakeable** — Subpath exports so you only bundle what you use

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Recording   │────▶│  STT Provider │────▶│  LLM Provider  │────▶│  Command     │
│  (expo-av)   │     │  (Whisper)    │     │  (OpenAI /     │     │  Executor    │
│              │     │              │     │   Anthropic)   │     │              │
└─────────────┘     └──────────────┘     └───────────────┘     └──────┬───────┘
                                                                       │
                                                                       ▼
                                                               ┌──────────────┐
                                                               │  TTS Provider │
                                                               │  (Expo Speech)│
                                                               └──────────────┘

Pipeline stages: idle → recording → transcribing → understanding → executing → speaking → done
```

## Installation

```bash
npm install react-native-voice
# or
yarn add react-native-voice
```

### Peer dependencies (required)

```bash
npx expo install expo-av
```

### Optional dependencies

Install based on which features you use:

| Dependency | Required for |
|---|---|
| `expo-haptics` | Haptic feedback in `VoiceButton` |
| `react-native-reanimated` | Animations in `VoiceBubble` and `RecordingIndicator` |
| `expo-speech` | `ExpoSpeechTTSProvider` |
| `expo-secure-store` | `createExpoApiKeyResolver` (secure key storage) |
| `expo-constants` | `createExpoApiKeyResolver` (env variable fallback) |
| `expo-file-system` | File existence check in `WhisperSTTProvider` |

```bash
# Install all optional deps at once
npx expo install expo-haptics react-native-reanimated expo-speech expo-secure-store expo-constants expo-file-system
```

### Provider-specific packages

```bash
# OpenAI (Whisper STT + OpenAI LLM)
# No extra packages — uses fetch against the OpenAI REST API

# Anthropic (Claude LLM)
# No extra packages — uses fetch against the Anthropic REST API

# Expo Speech (TTS)
npx expo install expo-speech
```

## Quick Start

### 1. Define your commands

```tsx
import type { CommandDefinition } from 'react-native-voice';

const commands: CommandDefinition[] = [
  {
    name: 'set_theme',
    description: 'Change the app theme to light or dark mode',
    category: 'settings',
    parameters: [
      {
        name: 'theme',
        type: 'string',
        description: 'The theme to set',
        required: true,
        enum: ['light', 'dark'],
      },
    ],
    handler: async (params) => {
      setTheme(params.theme as string);
      return { success: true, message: `Theme set to ${params.theme}` };
    },
  },
  {
    name: 'navigate',
    description: 'Navigate to a screen in the app',
    category: 'navigation',
    parameters: [
      {
        name: 'screen',
        type: 'string',
        description: 'The screen name to navigate to',
        required: true,
      },
    ],
    handler: async (params) => {
      router.push(params.screen as string);
      return { success: true, message: `Navigated to ${params.screen}` };
    },
  },
];
```

### 2. Set up providers and registry

```tsx
import {
  CommandRegistry,
  createExpoApiKeyResolver,
} from 'react-native-voice';
import { WhisperSTTProvider, OpenAILLMProvider } from 'react-native-voice/providers/openai';
import { ExpoSpeechTTSProvider } from 'react-native-voice/providers/expo-speech';

const resolveApiKey = createExpoApiKeyResolver();

const registry = new CommandRegistry();
registry.registerAll(commands);

const pipelineConfig = {
  sttProvider: new WhisperSTTProvider(resolveApiKey),
  llmProvider: new OpenAILLMProvider(resolveApiKey), // defaults to gpt-4o-mini
  ttsProvider: new ExpoSpeechTTSProvider(),
  ttsEnabled: true,
};
```

### 3. Wrap your app with VoiceProvider

```tsx
import { VoiceProvider } from 'react-native-voice';

export default function App() {
  return (
    <VoiceProvider config={pipelineConfig} registry={registry}>
      <YourApp />
    </VoiceProvider>
  );
}
```

### 4. Add the voice UI

```tsx
import { VoiceButton, VoiceBubble } from 'react-native-voice/ui';

function YourApp() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      <VoiceBubble />
      <VoiceButton />
    </View>
  );
}
```

Press and hold the mic button to record, release to process. The bubble shows pipeline progress, the transcript, and command results.

## API Reference

### Subpath Exports

| Import path | Contents |
|---|---|
| `react-native-voice` | Core classes, hooks, types, `VoiceProvider`, `createExpoApiKeyResolver` |
| `react-native-voice/ui` | `VoiceButton`, `VoiceBubble`, `RecordingIndicator` |
| `react-native-voice/providers/openai` | `WhisperSTTProvider`, `OpenAILLMProvider` |
| `react-native-voice/providers/anthropic` | `AnthropicLLMProvider` |
| `react-native-voice/providers/expo-speech` | `ExpoSpeechTTSProvider` |

---

### Core

#### `CommandRegistry`

Manages command definitions. Passed to `VoiceProvider` and `PipelineOrchestrator`.

```ts
const registry = new CommandRegistry();

registry.register(command);        // Register a single command
registry.registerAll(commands);    // Register an array of commands
registry.get('command_name');      // Get a command by name
registry.getAll();                 // Get all registered commands
registry.getByCategory('nav');     // Get commands in a category
registry.toPromptDescription();    // Serialize commands for LLM system prompt
```

#### `PipelineOrchestrator`

Runs the full STT → LLM → Execute → TTS pipeline. Used internally by `useVoiceCommand`, but available for custom integrations.

```ts
const orchestrator = new PipelineOrchestrator(pipelineConfig, registry);

const result = await orchestrator.process(audioUri, (stage, detail) => {
  console.log(stage, detail); // 'transcribing', 'understanding', etc.
});

// Update config at runtime
orchestrator.updateConfig({ ttsEnabled: false });
```

**Returns:** `PipelineResult`

```ts
interface PipelineResult {
  success: boolean;
  transcript: string;
  actions: LLMAction[];
  commandResults: CommandResult[];
  error?: string;
  durationMs: number;
}
```

#### `CommandExecutor`

Executes LLM-parsed actions against registered commands. Handles confirmation flow.

```ts
const executor = new CommandExecutor(registry, onConfirmation);
const results = await executor.execute(actions);
```

#### `PromptBuilder`

Builds the LLM system prompt from the command registry. Automatically serializes command names, descriptions, parameters, and expected JSON response format.

```ts
const builder = new PromptBuilder();
const systemPrompt = builder.build(registry, optionalContext);
```

---

### Hooks

#### `useVoiceCommand(options)`

High-level hook that orchestrates the full voice pipeline. Used internally by `VoiceProvider`.

```ts
const {
  startListening,  // () => Promise<void> — start recording
  stopListening,   // () => Promise<void> — stop recording and process
  dismiss,         // () => void — reset to idle
  isListening,     // boolean — currently recording
  isProcessing,    // boolean — pipeline is running (post-recording)
  stage,           // PipelineStage — current pipeline stage
  lastResult,      // PipelineResult | null — last pipeline result
  recordingUri,    // string | null — URI of last recording (kept on error)
  error,           // string | null — error message
} = useVoiceCommand({ config, registry });
```

#### `useAudioRecording()`

Low-level hook for managing microphone recording via `expo-av`.

```ts
const {
  startRecording,  // () => Promise<void>
  stopRecording,   // () => Promise<AudioRecordingResult | null>
  isRecording,     // boolean
  recordingState,  // RecordingState: 'idle' | 'requesting_permission' | 'recording' | 'stopping'
  error,           // string | null
} = useAudioRecording();
```

`stopRecording` returns `{ uri: string; durationMs: number }` or `null` if no recording was captured.

#### `useAudioPlayback(uri)`

Hook for audio playback (used by `VoiceBubble` for error replay).

```ts
const {
  play,         // () => Promise<void>
  pause,        // () => Promise<void>
  seekTo,       // (seconds: number) => Promise<void>
  isPlaying,    // boolean
  isLoaded,     // boolean
  currentTime,  // number (seconds)
  duration,     // number (seconds)
} = useAudioPlayback(uri); // pass null to unload
```

---

### Components

#### `VoiceProvider` / `useVoice()`

React context provider that wraps `useVoiceCommand` and makes voice state available to child components.

```tsx
<VoiceProvider config={pipelineConfig} registry={registry}>
  {children}
</VoiceProvider>
```

Access the context with `useVoice()`:

```ts
const {
  startListening, stopListening, dismiss,
  isListening, isProcessing, stage,
  lastResult, recordingUri, error,
  registry,
} = useVoice();
```

#### `VoiceButton`

Floating action button with press-and-hold to record. Uses `expo-haptics` for feedback and renders a built-in mic icon.

```tsx
import { VoiceButton } from 'react-native-voice/ui';

<VoiceButton
  size={60}              // Button diameter (default: 60)
  color="#4A90D9"        // Idle color (default: '#4A90D9')
  activeColor="#E53935"  // Recording color (default: '#E53935')
  bottom={90}            // Position from bottom (default: 90)
  right={20}             // Position from right (default: 20)
/>
```

Must be used inside a `VoiceProvider`. Automatically disables during pipeline processing.

#### `VoiceBubble`

Animated status overlay that shows pipeline stage, transcript, command results, errors, and audio playback controls on error.

```tsx
import { VoiceBubble } from 'react-native-voice/ui';

<VoiceBubble
  backgroundColor="#1E1E1E"  // Bubble background (default: '#1E1E1E')
  textColor="#F0F0F0"        // Text color (default: '#F0F0F0')
  accentColor="#6AB0FF"      // Accent/highlight color (default: '#6AB0FF')
/>
```

Features:
- Shows current pipeline stage with animated indicator
- Displays transcript ("You said: ...")
- Shows command results (green for success, red for failure)
- On error: audio playback controls + re-record button
- Auto-dismisses 3 seconds after reaching "done" stage
- Tap backdrop to dismiss

Requires `react-native-reanimated`.

#### `RecordingIndicator`

Animated pulsing ring shown around the voice button during recording.

```tsx
import { RecordingIndicator } from 'react-native-voice/ui';

<RecordingIndicator
  isRecording={true}     // Controls animation (default: false)
  color="#E53935"        // Pulse color (default: '#E53935')
  size={80}              // Ring diameter (default: 80)
/>
```

Requires `react-native-reanimated`.

---

### Providers

All providers accept an `ApiKeyResolver` for key management. Keys are resolved lazily on each API call.

#### `WhisperSTTProvider`

OpenAI Whisper speech-to-text. Sends audio as `audio/m4a` to the Whisper API.

```ts
import { WhisperSTTProvider } from 'react-native-voice/providers/openai';

const stt = new WhisperSTTProvider(resolveApiKey);
const transcript = await stt.transcribe(audioUri);
```

Resolves the `'openai'` provider key.

#### `OpenAILLMProvider`

OpenAI chat completions with JSON response mode.

```ts
import { OpenAILLMProvider } from 'react-native-voice/providers/openai';

const llm = new OpenAILLMProvider(resolveApiKey);              // defaults to gpt-4o-mini
const llm = new OpenAILLMProvider(resolveApiKey, 'gpt-4o');    // specify model

const response = await llm.complete(systemPrompt, userMessage);
```

Resolves the `'openai'` provider key.

#### `AnthropicLLMProvider`

Anthropic Claude chat completions.

```ts
import { AnthropicLLMProvider } from 'react-native-voice/providers/anthropic';

const llm = new AnthropicLLMProvider(resolveApiKey);                      // defaults to claude-sonnet-4-6
const llm = new AnthropicLLMProvider(resolveApiKey, 'claude-haiku-4-5');  // specify model

const response = await llm.complete(systemPrompt, userMessage);
```

Resolves the `'anthropic'` provider key.

#### `ExpoSpeechTTSProvider`

Text-to-speech using `expo-speech`. No API key needed.

```ts
import { ExpoSpeechTTSProvider } from 'react-native-voice/providers/expo-speech';

const tts = new ExpoSpeechTTSProvider();
await tts.speak('Hello!');
tts.stop();
```

---

### Utils

#### `createExpoApiKeyResolver()`

Factory that returns an `ApiKeyResolver` function. Checks two sources in order:

1. **`expo-secure-store`** — looks for key `voice_ux_api_key_{provider}` (e.g. `voice_ux_api_key_openai`)
2. **Environment variable** — looks for `EXPO_PUBLIC_OPENAI_API_KEY` or `EXPO_PUBLIC_ANTHROPIC_API_KEY` via `expo-constants`

```ts
import { createExpoApiKeyResolver } from 'react-native-voice';

const resolveApiKey = createExpoApiKeyResolver();

// Use with providers
const stt = new WhisperSTTProvider(resolveApiKey);
const llm = new OpenAILLMProvider(resolveApiKey);
```

Dependencies (`expo-secure-store`, `expo-constants`) are dynamically imported — the library won't crash if they're not installed, it will just skip that source.

---

## Defining Commands

Commands are defined as `CommandDefinition` objects and registered with a `CommandRegistry`:

```ts
interface CommandDefinition {
  name: string;                    // Unique identifier (used by LLM in actions)
  description: string;             // Natural language description (sent to LLM)
  category: string;                // Grouping key
  parameters?: CommandParameter[]; // Typed parameter definitions
  requiresConfirmation?: boolean;  // If true, triggers onConfirmation callback before executing
  handler: (params: Record<string, unknown>) => CommandResult | Promise<CommandResult>;
}

interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required?: boolean;
  enum?: string[];                 // Constrain values (sent to LLM)
}

interface CommandResult {
  success: boolean;
  message: string;                 // Displayed in VoiceBubble and spoken by TTS
  data?: unknown;
}
```

### Confirmation support

For destructive or sensitive commands, set `requiresConfirmation: true` and provide an `onConfirmation` callback in the pipeline config:

```ts
const commands: CommandDefinition[] = [
  {
    name: 'delete_item',
    description: 'Delete an item permanently',
    category: 'data',
    requiresConfirmation: true,
    parameters: [{ name: 'id', type: 'string', description: 'Item ID', required: true }],
    handler: async (params) => {
      await deleteItem(params.id as string);
      return { success: true, message: 'Item deleted' };
    },
  },
];

const pipelineConfig: PipelineConfig = {
  sttProvider: new WhisperSTTProvider(resolveApiKey),
  llmProvider: new OpenAILLMProvider(resolveApiKey),
  onConfirmation: async (action, command) => {
    // Show a confirmation dialog, return true/false
    return await showConfirmDialog(`Execute ${command.name}?`);
  },
};
```

## API Key Management

### Option 1: Environment variables (development)

Add keys to your `.env` or `app.config.js`:

```bash
# .env
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

### Option 2: Secure Store (production)

Store keys at runtime using `expo-secure-store`:

```ts
import * as SecureStore from 'expo-secure-store';

// Save a key (e.g., from a settings screen)
await SecureStore.setItemAsync('voice_ux_api_key_openai', 'sk-...');
await SecureStore.setItemAsync('voice_ux_api_key_anthropic', 'sk-ant-...');
```

`createExpoApiKeyResolver()` checks Secure Store first, then falls back to env variables.

### Option 3: Custom resolver

Implement your own `ApiKeyResolver` for any key source (remote config, auth token exchange, etc.):

```ts
type ApiKeyResolver = (provider: string) => Promise<string | null>;

const customResolver: ApiKeyResolver = async (provider) => {
  const response = await fetch(`https://your-api.com/keys/${provider}`);
  const { key } = await response.json();
  return key;
};

const stt = new WhisperSTTProvider(customResolver);
```

## Custom Providers

Implement the provider interfaces to bring your own STT, LLM, or TTS:

```ts
interface STTProvider {
  transcribe(audioUri: string): Promise<string>;
}

interface LLMProvider {
  complete(systemPrompt: string, userMessage: string): Promise<string>;
}

interface TTSProvider {
  speak(text: string): Promise<void>;
  stop(): void;
}
```

Example — custom STT provider:

```ts
class MySTTProvider implements STTProvider {
  async transcribe(audioUri: string): Promise<string> {
    // Send audio to your own API
    const formData = new FormData();
    formData.append('audio', { uri: audioUri, type: 'audio/m4a', name: 'audio.m4a' } as any);
    const res = await fetch('https://my-api.com/transcribe', { method: 'POST', body: formData });
    const data = await res.json();
    return data.text;
  }
}
```

## Pipeline Stages

The `PipelineStage` type tracks where the pipeline is in its lifecycle:

| Stage | Description |
|---|---|
| `idle` | No activity |
| `recording` | Microphone is active |
| `transcribing` | Audio is being sent to the STT provider |
| `understanding` | Transcript is being processed by the LLM |
| `executing` | Commands are being executed |
| `speaking` | TTS is speaking the response |
| `done` | Pipeline completed successfully |
| `error` | An error occurred at any stage |

Listen for stage changes via `useVoiceCommand`, `useVoice()`, or the `onStage` callback on `PipelineOrchestrator.process()`.

## Types

All types are exported from the main entry point:

```ts
import type {
  // Commands
  CommandDefinition,
  CommandParameter,
  CommandResult,

  // Pipeline
  LLMAction,
  LLMResponse,
  PipelineStage,
  PipelineConfig,
  PipelineResult,
  PipelineStageListener,
  ConfirmationCallback,

  // Providers
  ApiKeyResolver,
  STTProvider,
  LLMProvider,
  TTSProvider,

  // Audio
  RecordingState,
  AudioRecordingConfig,
  AudioRecordingResult,
} from 'react-native-voice';
```

## Example App

The `example/` directory contains a full Expo SDK 54 app demonstrating:

- Command registration and categories
- Provider setup with `createExpoApiKeyResolver`
- `VoiceButton` + `VoiceBubble` integration
- Tab-based navigation with expo-router

To run the example:

```bash
cd example
yarn install
npx expo start
```

## License

MIT
