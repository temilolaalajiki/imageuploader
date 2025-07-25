# Deployment Guide

## Vercel Deployment

### 1. Environment Variables

You need to set up environment variables in your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-app-name.vercel.app/api` (replace with your actual Vercel app URL)

### 2. Update CORS Configuration

In `api/server.js`, update the CORS origins to match your actual Vercel domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-actual-app-name.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy

### 4. Alternative: Use Cloud Storage

For a production app, you should use cloud storage instead of memory storage:

#### Option A: Cloudinary (Recommended)
1. Sign up for Cloudinary
2. Install: `npm install cloudinary`
3. Update the server to upload to Cloudinary instead of using memory storage

#### Option B: AWS S3
1. Set up AWS S3 bucket
2. Install: `npm install aws-sdk multer-s3`
3. Configure S3 upload

### 5. Local Development

For local development, create a `.env.local` file in the root directory:

```
VITE_API_URL=http://localhost:3001
```

### 6. Current Limitations

- Images are stored in memory (temporary solution)
- Data URLs are used instead of file URLs
- Maximum file size is 2MB
- Images are not permanently stored

### 7. Production Recommendations

1. **Use Cloud Storage**: Implement Cloudinary or AWS S3 for permanent file storage
2. **Add Authentication**: Implement user authentication
3. **Add Rate Limiting**: Prevent abuse
4. **Add File Validation**: Validate file types and sizes
5. **Add Error Handling**: Better error messages and logging
6. **Add Image Optimization**: Compress and optimize images
7. **Add CDN**: Use a CDN for faster image delivery

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Vercel domain is added to the CORS origins
2. **Upload Fails**: Check the file size limit (2MB) and file type
3. **Environment Variables**: Ensure `VITE_API_URL` is set correctly in Vercel
4. **API Not Found**: Make sure the API routes are configured correctly in `vercel.json`

### Debug Steps

1. Check browser console for errors
2. Check Vercel function logs
3. Test the API endpoint directly
4. Verify environment variables are set correctly 