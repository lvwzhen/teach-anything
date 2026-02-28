import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { OPENAI_API_KEY } = process.env;
  const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-3.5-turbo-0125";
  const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? "api.openai.com";

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "Missing required environment variable: OPENAI_API_KEY" });
    return;
  }

  let body: unknown = req.body;
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body);
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }
  const { prompt } = (body ?? {}) as { prompt?: string };

  if (!prompt) {
    res.status(400).json({ error: "No prompt in the request" });
    return;
  }

  const payload: OpenAIStreamPayload = {
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 768,
    stream: true,
    n: 1,
  };

  try {
    const stream = await OpenAIStream(payload, {
      apiKey: OPENAI_API_KEY,
      baseUrl: OPENAI_BASE_URL,
    });
    const reader = stream.getReader();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        res.write(value);
      }
    }

    res.end();
  } catch (error) {
    console.error("API generate error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate response";
    if (res.headersSent) {
      res.end();
      return;
    }
    res.status(500).json({ error: message, env: { hasKey: !!OPENAI_API_KEY, model: OPENAI_MODEL, baseUrl: OPENAI_BASE_URL } });
  }
};

export default handler;
