import type { ICaptionService } from './interfaces/captions.js';
import type { AppConfig } from './config.js';

export class OpenAICaptionService implements ICaptionService {
    private endpoint: string;
    private apiKey: string;
    private configured: boolean;

    constructor(config: AppConfig) {
        this.endpoint = config.azureOpenAiEndpoint;
        this.apiKey = config.azureOpenAiApiKey;
        this.configured = !!(this.endpoint && this.apiKey);
    }

    async generateCaption(imageUrl: string): Promise<string> {
        if (!this.configured) {
            return this.fallbackCaption();
        }
        try {
            const response = await fetch(`${this.endpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey,
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Generate a short, warm, sentimental caption for this couples scrapbook photo. Keep it under 150 characters. Just the caption text, no quotes.' },
                                { type: 'image_url', image_url: { url: imageUrl } },
                            ],
                        },
                    ],
                    max_tokens: 100,
                }),
            });
            if (!response.ok) {
                return this.fallbackCaption();
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim() || this.fallbackCaption();
        } catch {
            return this.fallbackCaption();
        }
    }

    async health(): Promise<boolean> {
        return this.configured;
    }

    private fallbackCaption(): string {
        const captions = [
            'A beautiful moment captured together.',
            'Making memories, one photo at a time.',
            'Together is our favorite place to be.',
            'Another page in our love story.',
        ];
        return captions[Math.floor(Math.random() * captions.length)];
    }
}
