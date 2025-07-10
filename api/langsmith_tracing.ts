import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { traceable } from 'langsmith/traceable';
import { wrapOpenAI } from 'langsmith/wrappers';
import { UserRequest } from '../model/UserRequest';


//@ts-ignore
const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));



const pipeline = traceable(async (userRequest: UserRequest) => {
  console.log('User Request:', userRequest);
  
  const messages = userRequest.input.map(item => ({
    role: item.role,
    content: item.content.map(c => c.text).join(' ')
  }));

  const result = await client.chat.completions.create({
    model: userRequest.model || 'gpt-4',
    messages: messages,
    temperature: userRequest.temperature || 0.2,
    top_p: userRequest.top_p || 1.0,
  });
  
  return result;
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
  const requestData: UserRequest = req.body;
  
  try {
    const response = await pipeline(requestData);
    res.status(200).json({ response });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
