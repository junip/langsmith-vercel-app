import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { traceable } from 'langsmith/traceable';
import { wrapOpenAI } from 'langsmith/wrappers';
import { UserRequest } from '../model/UserRequest';
import { setCorsHeaders } from '../utility/request-handler';


//@ts-ignore
const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));



const pipeline = traceable(async (userRequest: UserRequest) => {
 
  // @ts-ignore
  const result = await client.responses.create({
    model: userRequest.model || 'gpt-4',
    input: userRequest.input,
    temperature: userRequest.temperature || 0.2,
    text: userRequest.text,
    store: userRequest.store || true,
    previous_response_id: userRequest.previous_response_id || null,
    service_tier: userRequest.service_tier || 'default',
    top_p: userRequest.top_p || 1.0,
  });

  return result;
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const requestData: any = req.body;
  
  try {
    const response = await pipeline(requestData);
    res.status(200).json({ response });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
