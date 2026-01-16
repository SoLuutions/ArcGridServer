# ARC Grid Access Server

Vercel serverless function for managing ARC Grid book access via Systeme.io integration.

## Featuress

- ✅ Email validation and contact lookup
- ✅ Automatic tag assignment for ARC Grid access
- ✅ Course enrollment automation
- ✅ Registration redirect for new users
- ✅ CORS-enabled for frontend integration
- ✅ Comprehensive error handling
- ✅ Rate limiting protection

## Setup Instructions

### 1. Deploy to Vercel

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel
```

#### Option B: Deploy via GitHub

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration

### 2. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SYSTEME_API_KEY` | Your Systeme.io API key | `sk_live_...` |
| `ARC_GRID_TAG_ID` | Tag ID for ARC Grid access | `123` |
| `ARC_GRID_COURSE_ID` | Course ID for enrollment | `arc-grid-course-id` |
| `REGISTRATION_URL` | Registration page URL | `https://commandresults.com/register` |

3. Click **Save**
4. Redeploy your project for changes to take effect

### 3. Get Your Systeme.io Credentials

#### API Key
1. Log in to [Systeme.io](https://systeme.io)
2. Go to **Settings** → **API**
3. Generate a new API key
4. Copy and save it securely

#### Tag ID
1. Go to **Contacts** → **Tags**
2. Find or create the "ARC Grid Access" tag
3. Click on the tag to view details
4. The Tag ID will be in the URL: `systeme.io/contacts/tags/{TAG_ID}`

#### Course ID
1. Go to **School** → **Courses**
2. Find your ARC Grid course
3. Click to edit
4. The Course ID will be in the URL or course settings

### 4. Test the API

Once deployed, your API endpoint will be:
```
https://your-project-name.vercel.app/api/check-access
```

Test with curl:
```bash
curl -X POST https://your-project-name.vercel.app/api/check-access \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## API Endpoint

### POST `/api/check-access`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (Registered User):**
```json
{
  "success": true,
  "contactId": 12345,
  "tagAdded": true,
  "enrolled": true,
  "message": "Access granted to ARC Grid book"
}
```

**Response (Unregistered User):**
```json
{
  "success": false,
  "requiresRegistration": true,
  "registrationUrl": "https://commandresults.com/register",
  "message": "Please register first, then return here for book access."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Frontend Integration

Update your frontend HTML to call this API:

```javascript
const API_ENDPOINT = 'https://your-project-name.vercel.app/api/check-access';

async function checkAccess(email) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Grant access to book
    console.log('Access granted!');
  } else if (data.requiresRegistration) {
    // Redirect to registration
    window.location.href = data.registrationUrl;
  } else {
    // Show error message
    console.error(data.message);
  }
}
```

## Project Structure

```
ArcGridServer/
├── api/
│   └── check-access.js    # Main serverless function
├── .env.example           # Environment variables template
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## Security Notes

- ✅ API keys are stored securely in Vercel environment variables
- ✅ Never commit `.env` files to version control
- ✅ CORS is configured to allow all origins (adjust as needed)
- ✅ Input validation prevents malformed requests
- ✅ Rate limiting protection included

## Troubleshooting

### "Server configuration error"
- Check that all environment variables are set in Vercel
- Redeploy after adding environment variables

### "Method not allowed"
- Ensure you're using POST requests, not GET

### "Invalid email format"
- Verify email format matches standard pattern

### API returns 500 error
- Check Vercel function logs in dashboard
- Verify Systeme.io API key is valid
- Ensure Tag ID and Course ID are correct

## Support

For issues or questions:
1. Check Vercel function logs
2. Verify environment variables
3. Test Systeme.io API credentials separately
4. Review CORS settings if frontend integration fails

## License

MIT
