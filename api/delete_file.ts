import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { wrapOpenAI } from 'langsmith/wrappers';
import formidable from 'formidable';
import fs from 'fs';
import { setCorsHeaders } from '../utility/request-handler';

//@ts-ignore
const client = wrapOpenAI(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const fileId = req.body.fileId;

    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }

    console.log("Deleting file with ID:", fileId);

    // @ts-ignore
    const response = await client.files.delete(fileId);
    
    console.log("response", response);
    res.status(200).json({ 
      file: response.file,
      id: response.id,
      deleted: true,
    });
  } catch (error: any) {
    console.error('File delete error:', error);
    res.status(500).json({ 
      error: 'File delete failed',
      message: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parser for FormData
  },
};


