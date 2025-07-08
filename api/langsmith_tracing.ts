// api/langsmith.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { traceable } from 'langsmith/traceable';
import { wrapOpenAI } from 'langsmith/wrappers';


//@ts-ignore
const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));


// export const templateJs = {
//     "model": "gpt-4",
//     "temperature": 0.2,
//     "messages": [
//         {
//             "role": "system",
//             "content": "You are a system assistant, you can provide colors to the user based on user question based on file"
//         },
//         {
//             "role": "user",
//             "content": "you are a color guider"
//         }
//     ]
// }

const pipeline = traceable(async (userRequest: any) => {
  // Use the userRequest (which will be the templateJs object) to make the API call
  // @ts-ignore
  const result = await client.responses.create({
    model: userRequest.model || 'gpt-4',
    input: userRequest.messages || [{ role: 'user', content: 'Hello' }],
    temperature: userRequest.temperature || 0.2
  });
  
  return result
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Received request:', req.body.input?.[0].content?.[0]?.text);
  const requestData = req.body

  try {
    const response = await pipeline(requestData);
    res.status(200).json({ response });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
