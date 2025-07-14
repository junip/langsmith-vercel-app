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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const form = formidable({
      maxFileSize: 400 * 1024 * 1024, 
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const purpose = Array.isArray(fields.purpose) ? fields.purpose[0] : fields.purpose;
    
    if (!file) {
      res.status(400).json({ error: 'File is required' });
      return;
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    const fileObject = new File([fileBuffer], file.originalFilename || 'upload.pdf', {
      type: file.mimetype || 'application/pdf'
    });

    // @ts-ignore
    const response = await client.files.create({
      file: fileObject,
      purpose: purpose || 'assistants',
    });
    
    // Clean up temp file
    fs.unlinkSync(file.filepath);
    
    res.status(200).json({ 
      status: response.status,
      id: response.id,
      filename: response.filename,
      purpose: response.purpose,
      bytes: response.bytes
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      message: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parser for FormData
  },
};


