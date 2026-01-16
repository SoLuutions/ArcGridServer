// /api/check-access.js
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }
    
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }
        
        // Your Systeme.io API credentials from environment variables
        const API_KEY = process.env.SYSTEME_API_KEY;
        const TAG_ID = process.env.ARC_GRID_TAG_ID;
        const COURSE_ID = process.env.ARC_GRID_COURSE_ID;
        const REGISTRATION_URL = process.env.REGISTRATION_URL || 'https://commandresults.com/register';
        
        if (!API_KEY || !TAG_ID || !COURSE_ID) {
            console.error('Missing environment variables');
            return res.status(500).json({ 
                success: false, 
                message: 'Server configuration error' 
            });
        }
        
        // Step 1: Check if contact exists in Systeme.io
        const contact = await findContactByEmail(email, API_KEY);
        
        if (!contact) {
            // Contact doesn't exist - needs to register
            return res.status(200).json({
                success: false,
                requiresRegistration: true,
                registrationUrl: REGISTRATION_URL,
                message: 'Please register first, then return here for book access.'
            });
        }
        
        // Step 2: Contact exists - add tag
        const tagAdded = await addTagToContact(contact.id, TAG_ID, API_KEY);
        
        // Step 3: Enroll in course
        const enrolled = await enrollInCourse(contact.id, COURSE_ID, API_KEY);
        
        return res.status(200).json({
            success: true,
            contactId: contact.id,
            tagAdded,
            enrolled,
            message: 'Access granted to ARC Grid book'
        });
        
    } catch (error) {
        console.error('Server error:', error);
        
        // Handle specific error cases
        if (error.message.includes('rate limit')) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please wait a moment and try again.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.'
        });
    }
}

// Helper function to find contact by email
async function findContactByEmail(email, apiKey) {
    try {
        const response = await fetch(
            `https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}&limit=1`,
            {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('rate limit exceeded');
            }
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.items && data.items.length > 0 ? data.items[0] : null;
        
    } catch (error) {
        console.error('Error finding contact:', error);
        throw error;
    }
}

// Helper function to add tag to contact
async function addTagToContact(contactId, tagId, apiKey) {
    try {
        const response = await fetch(
            `https://api.systeme.io/api/contacts/${contactId}/tags`,
            {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tagId: parseInt(tagId) })
            }
        );
        
        // 204 = success, 422 = tag might already be assigned (which is fine)
        if (response.status === 204 || response.status === 422) {
            return true;
        }
        
        console.warn(`Unexpected response when adding tag: ${response.status}`);
        return false;
        
    } catch (error) {
        console.error('Error adding tag:', error);
        return false;
    }
}

// Helper function to enroll contact in course
async function enrollInCourse(contactId, courseId, apiKey) {
    try {
        const response = await fetch(
            `https://api.systeme.io/api/school/courses/${courseId}/enrollments`,
            {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contactId: parseInt(contactId),
                    accessType: 'full_access'
                })
            }
        );
        
        // 201 = created, 422 = might already be enrolled (which is fine)
        if (response.status === 201 || response.status === 422) {
            return true;
        }
        
        console.warn(`Unexpected response when enrolling: ${response.status}`);
        return false;
        
    } catch (error) {
        console.error('Error enrolling in course:', error);
        return false;
    }
}
