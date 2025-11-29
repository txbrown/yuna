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

export type DownloadProgressCallback = (progress: number) => void; // progress is 0-1

export class CactusService {
  private instance: CactusLM | null = null;
  private currentModel: CactusModel | null = null;
  private downloadProgressCallback: DownloadProgressCallback | null = null;

  async initialize(model: CactusModel = 'qwen3-0.6'): Promise<void> {
    if (this.instance && this.currentModel === model) {
      return; // Already initialized with this model
    }

    this.instance = new CactusLM({ model });
    this.currentModel = model;
  }

  setDownloadProgressCallback(callback: DownloadProgressCallback | null): void {
    this.downloadProgressCallback = callback;
  }

  async downloadModel(
    model: CactusModel = 'qwen3-0.6',
    onProgress?: DownloadProgressCallback
  ): Promise<void> {
    if (!this.instance || this.currentModel !== model) {
      await this.initialize(model);
    }

    if (!this.instance) {
      throw new Error('Failed to initialize Cactus');
    }

    // Use provided callback or the stored one
    const progressCallback =
      onProgress || this.downloadProgressCallback || undefined;

    try {
      // CactusLM download accepts onProgress callback
      await this.instance.download({
        onProgress: progressCallback,
      });

      // If download succeeds without error, the model is ready
    } catch (error) {
      // If download fails, it might mean the model isn't available or there's a network issue
      throw new Error(
        `Failed to download model ${model}: ${(error as Error).message}`
      );
    }
  }

  async complete(options: CompletionOptions): Promise<CompletionResult> {
    if (!this.instance) {
      throw new Error('Cactus not initialized. Call initialize() first.');
    }

    try {
      const result = await this.instance.complete({
        messages: options.messages,
        options: {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        },
      });

      return {
        response: result.response,
        usage: {
          promptTokens: result.prefillTokens,
          completionTokens: result.decodeTokens,
          totalTokens: result.totalTokens,
        },
      };
    } catch (error) {
      throw new Error(`Completion failed: ${(error as Error).message}`);
    }
  }

  async isModelDownloaded(model: CactusModel): Promise<boolean> {
    try {
      // Use CactusLM's getModels API to check if the model is already downloaded
      // This relies on the underlying CactusFileSystem.modelExists implementation
      const tempInstance = new CactusLM();
      // getModels returns metadata including an isDownloaded flag per model
      // The runtime implementation has this method even if TypeScript types don't expose it
      const models = await (tempInstance as any).getModels();
      const entry = models.find(
        (m: { slug: string; isDownloaded: boolean }) => m.slug === model
      );

      return entry?.isDownloaded ?? false;
    } catch {
      return false;
    }
  }

  async checkModelStatus(model: CactusModel): Promise<{
    downloaded: boolean;
    initialized: boolean;
    current: boolean;
  }> {
    const downloaded = await this.isModelDownloaded(model);
    const initialized = this.isInitialized() && this.currentModel === model;
    const current = this.currentModel === model;

    return {
      downloaded,
      initialized,
      current,
    };
  }

  async switchModel(model: CactusModel): Promise<void> {
    if (this.currentModel === model && this.instance) {
      return; // Already using this model
    }

    // Reinitialize with the new model
    await this.initialize(model);
  }

  reset(): void {
    this.instance = null;
    this.currentModel = null;
    this.downloadProgressCallback = null;
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

  getModelInfo(model: CactusModel): {
    name: string;
    size: string;
    description: string;
  } {
    const modelInfo: Record<
      CactusModel,
      { size: string; description: string }
    > = {
      'qwen3-0.6': {
        size: '~600MB',
        description: 'Fastest, smallest model. Good for quick responses.',
      },
      'lfm2-350m': {
        size: '~350MB',
        description: 'Lightweight model. Balanced speed and quality.',
      },
      'qwen3-1.5': {
        size: '~1.5GB',
        description: 'Larger model. Better quality, slower responses.',
      },
    };

    return {
      name: model,
      ...modelInfo[model],
    };
  }
}

// Singleton instance
export const cactusService = new CactusService();
