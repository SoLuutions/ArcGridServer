// Test the deployed API endpoint with detailed error logging
const email = 'clarklindleysuan@gmail.com';
const apiUrl = 'https://arc-grid-server.vercel.app/api/check-access';

console.log(`🔍 Testing API with email: ${email}\n`);

fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
})
    .then(async response => {
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);

        const text = await response.text();
        console.log('\n📄 Raw Response:');
        console.log(text.substring(0, 500)); // First 500 chars

        // Try to parse as JSON
        try {
            const data = JSON.parse(text);
            console.log('\n📊 Parsed JSON Response:');
            console.log(JSON.stringify(data, null, 2));

            if (data.success) {
                console.log('\n✅ ACCESS GRANTED');
                console.log(`   Contact ID: ${data.contactId}`);
                console.log(`   Tag Added: ${data.tagAdded}`);
                console.log(`   Enrolled: ${data.enrolled}`);
            } else if (data.requiresRegistration) {
                console.log('\n⚠️  REGISTRATION REQUIRED');
                console.log(`   Registration URL: ${data.registrationUrl}`);
            } else {
                console.log('\n❌ ERROR');
                console.log(`   Message: ${data.message}`);
            }
        } catch (e) {
            console.log('\n⚠️  Response is not JSON (likely HTML error page)');
            console.log('This usually means:');
            console.log('  1. The API route is not found (404)');
            console.log('  2. Environment variables are not configured');
            console.log('  3. The serverless function has an error');
        }
    })
    .catch(error => {
        console.error('\n❌ Request failed:', error.message);
    });
