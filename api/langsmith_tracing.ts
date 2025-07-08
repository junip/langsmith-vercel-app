// api/langsmith.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { traceable } from 'langsmith/traceable';
import { wrapOpenAI } from 'langsmith/wrappers';

// Auto-traced OpenAI client
const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

// Auto-traced function
const pipeline = traceable(async (user_input: string) => {
  const result = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: user_input }]
  });
  return result.choices[0]?.message?.content || '';
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const prompt = req.body?.prompt || 'Hello, world!';
  try {
    const response = await pipeline(prompt);
    res.status(200).json({ prompt, response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
