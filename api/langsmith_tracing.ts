
import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { traceable } from 'langsmith/traceable';
import { wrapOpenAI } from 'langsmith/wrappers';


//@ts-ignore
const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));




const pipeline = traceable(async (userRequest: any) => {
  // @ts-ignore
  console.log('User Request:', typeof userRequest);
  const parsed = JSON.parse(userRequest);
  // @ts-ignore
  const result = await client.responses.create({
    model: parsed.model || 'gpt-4',
    input: parsed.input,
    temperature: parsed.temperature || 0.2,
    text: parsed.text,
    store: parsed.store || true
  });
  
  return result
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Received request:', req.body);
  const requestData = req.body
  
  try {
    const response = await pipeline(requestData);
    res.status(200).json({ response });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
