// /api/verify-tag.js - Optional endpoint to verify tag exists
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        const API_KEY = process.env.SYSTEME_API_KEY;
        const TAG_ID = process.env.ARC_GRID_TAG_ID;
        
        if (!API_KEY || !TAG_ID) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }
        
        // Get the tag details
        const response = await fetch(
            `https://api.systeme.io/api/tags/${TAG_ID}`,
            {
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.status === 404) {
            return res.status(200).json({
                success: false,
                message: `Tag with ID ${TAG_ID} not found`,
                suggestion: 'Create the "ARC Grid Reader" tag in Systeme.io first'
            });
        }
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const tag = await response.json();
        
        res.status(200).json({
            success: true,
            tag: {
                id: tag.id,
                name: tag.name,
                exists: true
            },
            message: 'Tag verified successfully'
        });
        
    } catch (error) {
        console.error('Error verifying tag:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying tag',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}