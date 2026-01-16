// Test the deployed API endpoint
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
    .then(response => {
        console.log(`Status: ${response.status} ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        console.log('\n📊 API Response:');
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
    })
    .catch(error => {
        console.error('\n❌ Request failed:', error.message);
    });
