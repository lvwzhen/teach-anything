export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
}

export async function OpenAIStream(payload: OpenAIStreamPayload, config: OpenAIConfig) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch(
    `https://${config.baseUrl}/v1/chat/completions`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    let errorMessage = `OpenAI request failed with status ${res.status}`;
    try {
      const errorBody = await res.text();
      if (errorBody) {
        errorMessage = `${errorMessage}: ${errorBody}`;
      }
    } catch {
      // Ignore errors while reading the error response.
    }
    throw new Error(errorMessage);
  }

  if (!res.body) {
    throw new Error("OpenAI response body is empty");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          controller.close();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (!trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }
    },
  });

  return stream;
}
