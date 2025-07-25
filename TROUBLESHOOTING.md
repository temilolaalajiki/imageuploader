# Troubleshooting Vercel Deployment Issues

## Common Issues and Solutions

### 1. Build Failures

**Issue**: "All checks have failed" after pushing to Git

**Solutions**:
- Check the Vercel deployment logs in your dashboard
- Ensure all dependencies are properly installed
- Verify the build command is correct

### 2. Environment Variables

**Issue**: API calls failing in production

**Solution**: Set the environment variable in Vercel:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `VITE_API_URL` = `https://imageuploader-pied.vercel.app/api`

### 3. CORS Issues

**Issue**: CORS errors in browser console

**Solution**: The CORS configuration is already updated for your domain

### 4. API Not Found

**Issue**: 404 errors for API endpoints

**Solution**: Check that the `vercel.json` routes are correct

## Debug Steps

1. **Check Vercel Logs**:
   - Go to your Vercel dashboard
   - Click on the latest deployment
   - Check the "Functions" tab for API errors
   - Check the "Build" tab for build errors

2. **Test API Endpoints**:
   - Visit: `https://imageuploader-pied.vercel.app/api/test`
   - Should return: `{"message":"API is working!","environment":"production","timestamp":"..."}`

3. **Check Environment Variables**:
   - Verify `VITE_API_URL` is set correctly
   - Value should be: `https://imageuploader-pied.vercel.app/api`

4. **Local Testing**:
   - Run `npm run build` locally to check for build errors
   - Run `npm run lint` to check for linting errors

## Current Configuration

- **Frontend**: React + Vite
- **Backend**: Express.js serverless function
- **File Storage**: Memory storage (temporary)
- **CORS**: Configured for your domain
- **Build**: Static build with API functions

## Next Steps After Fix

1. Push the updated code to GitHub
2. Check Vercel deployment logs
3. Set environment variables in Vercel dashboard
4. Test the API endpoints
5. Test the upload functionality 