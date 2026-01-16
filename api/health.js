// /api/health.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // Check if environment variables are set
        const hasApiKey = !!process.env.SYSTEME_API_KEY;
        const hasTagId = !!process.env.ARC_GRID_TAG_ID;
        const hasCourseId = !!process.env.ARC_GRID_COURSE_ID;
        
        const status = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: {
                api_key_configured: hasApiKey,
                tag_id_configured: hasTagId,
                course_id_configured: hasCourseId,
                node_env: process.env.NODE_ENV || 'production'
            },
            endpoints: {
                check_access: '/api/check-access',
                verify_tag: '/api/verify-tag'
            }
        };
        
        // Check if we can connect to Systeme.io API
        if (hasApiKey) {
            try {
                const testResponse = await fetch('https://api.systeme.io/api/tags?limit=1', {
                    headers: {
                        'X-API-Key': process.env.SYSTEME_API_KEY
                    },
                    timeout: 5000
                });
                
                status.environment.api_connection = testResponse.ok ? 'connected' : 'failed';
                status.environment.api_status = testResponse.status;
            } catch (apiError) {
                status.environment.api_connection = 'error';
                status.environment.api_error = apiError.message;
            }
        }
        
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}