import type { ICaptionService } from "./interfaces/caption.js";

const FALLBACK_CAPTION = "A beautiful moment captured";

export class OpenAICaptionService implements ICaptionService {
  private endpoint: string | null;
  private apiKey: string | null;

  constructor(endpoint: string | null, apiKey: string | null) {
    // Constructor MUST NOT throw — Enhancement service
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async generateCaption(imageBuffer: Buffer, mimeType: string): Promise<string> {
    if (!this.endpoint || !this.apiKey) {
      return FALLBACK_CAPTION;
    }

    try {
      const base64Image = imageBuffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64Image}`;

      const response = await fetch(
        `${this.endpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": this.apiKey,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Describe this photo in one short, warm sentence suitable for a couples scrapbook caption.",
                  },
                  {
                    type: "image_url",
                    image_url: { url: dataUri },
                  },
                ],
              },
            ],
            max_tokens: 100,
          }),
        }
      );

      if (!response.ok) {
        return FALLBACK_CAPTION;
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      return data.choices[0]?.message?.content?.trim() ?? FALLBACK_CAPTION;
    } catch {
      return FALLBACK_CAPTION;
    }
  }
}
