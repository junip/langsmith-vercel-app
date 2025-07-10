# LangSmith Integration with OpenAI - Vercel Serverless API

A serverless API built with Vercel that integrates OpenAI's GPT models with LangSmith 


## Prerequisites

- Node.js 18+ 
- Vercel CLI
- OpenAI API Key
- LangSmith API Key and Project

## Installation

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **install vercel globally**
4. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=your_langsmith_api_key_here
   LANGCHAIN_PROJECT=your_project_name
   ```

## Local Development

1. **Start the development server**
   ```bash
   npx run vercel
   ```
   
   The API will be available at `http://localhost:3000`

2. **Test the API endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/langsmith_tracing \
     -H "Content-Type: application/json" \
     -d '{
       "model": "gpt-4o",
       "temperature": 0.2,
       "input": [
         {
           "role": "system",
           "content": [
             {
               "type": "input_text",
               "text": "You are a helpful assistant."
             }
           ]
         },
         {
           "role": "user",
           "content": [
             {
               "type": "input_text", 
               "text": "Hello, how are you?"
             }
           ]
         }
       ],
       "text": {"format": {"type": "text"}},
       "store": true
     }'
   ```

## API Reference

### Endpoint: `POST` - `/api/langsmith_tracing`

## Frontend Integration Examples

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/langsmith_tracing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    temperature: 0.2,
    input: [
      {
        role: 'user',
        content: [{
          type: 'input_text',
          text: 'What is the capital of France?'
        }]
      }
    ],
    store: true
  })
});
```

## Deployment

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```
2. **Set environment variables in Vercel Dashboard**
3. **Update CORS settings** for production:
   ```typescript
   res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
   ```


## License

MIT License - see LICENSE file for details
