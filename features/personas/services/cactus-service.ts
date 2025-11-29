import { CactusLM } from 'cactus-react-native';

export type CactusModel = 'qwen3-0.6' | 'lfm2-350m' | 'qwen3-1.5';

export interface CompletionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionOptions {
  messages: CompletionMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionResult {
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class CactusService {
  private instance: CactusLM | null = null;
  private currentModel: CactusModel | null = null;

  async initialize(model: CactusModel = 'qwen3-0.6'): Promise<void> {
    if (this.instance && this.currentModel === model) {
      return; // Already initialized with this model
    }

    this.instance = new CactusLM({ model });
    this.currentModel = model;
  }

  async downloadModel(model: CactusModel = 'qwen3-0.6'): Promise<void> {
    if (!this.instance || this.currentModel !== model) {
      await this.initialize(model);
    }

    if (!this.instance) {
      throw new Error('Failed to initialize Cactus');
    }

    await this.instance.download();
  }

  async complete(options: CompletionOptions): Promise<CompletionResult> {
    if (!this.instance) {
      throw new Error('Cactus not initialized. Call initialize() first.');
    }

    const result = await this.instance.complete({
      messages: options.messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });

    return {
      response: result.response,
      usage: result.usage,
    };
  }

  async isModelDownloaded(model: CactusModel): Promise<boolean> {
    // This would need to check if model files exist
    // For now, we'll return false and rely on download to handle it
    return false;
  }

  getAvailableModels(): CactusModel[] {
    return ['qwen3-0.6', 'lfm2-350m', 'qwen3-1.5'];
  }

  getCurrentModel(): CactusModel | null {
    return this.currentModel;
  }

  isInitialized(): boolean {
    return this.instance !== null;
  }
}

// Singleton instance
export const cactusService = new CactusService();
