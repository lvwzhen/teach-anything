import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

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
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      const reader = res.body.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          parser.feed(decoder.decode(value));
        }
      }
    },
  });

  return stream;
}
