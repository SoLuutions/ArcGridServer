// Test connectivity to Systeme.io API
// Run this locally to verify your API key and network connectivity

const API_KEY = process.env.SYSTEME_API_KEY || 'YOUR_API_KEY_HERE';

async function testConnectivity() {
    console.log('🔍 Testing Systeme.io API Connectivity...\n');

    // Test 1: Basic API connectivity
    console.log('Test 1: Checking API endpoint accessibility...');
    try {
        const response = await fetch('https://api.systeme.io/api/contacts?limit=1', {
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ API is accessible`);
            console.log(`   Response structure: ${JSON.stringify(Object.keys(data))}`);
        } else if (response.status === 401) {
            console.log('❌ Authentication failed - Check your API key');
        } else if (response.status === 403) {
            console.log('❌ Access forbidden - Check API permissions');
        } else {
            console.log(`⚠️  Unexpected response: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Connection failed: ${error.message}`);
        console.log('   Possible causes:');
        console.log('   - No internet connection');
        console.log('   - Firewall blocking requests');
        console.log('   - DNS resolution issues');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Search for a specific email (if provided)
    const testEmail = process.env.TEST_EMAIL;
    if (testEmail) {
        console.log(`Test 2: Searching for contact: ${testEmail}...`);
        try {
            const response = await fetch(
                `https://api.systeme.io/api/contacts?email=${encodeURIComponent(testEmail)}&limit=1`,
                {
                    headers: {
                        'X-API-Key': API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    console.log(`✅ Contact found!`);
                    console.log(`   Contact ID: ${data.items[0].id}`);
                    console.log(`   Email: ${data.items[0].email}`);
                } else {
                    console.log(`ℹ️  Contact not found in Systeme.io`);
                }
            } else {
                console.log(`❌ Search failed: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Search error: ${error.message}`);
        }
    } else {
        console.log('Test 2: Skipped (set TEST_EMAIL env variable to test)');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Network latency
    console.log('Test 3: Measuring API response time...');
    try {
        const startTime = Date.now();
        const response = await fetch('https://api.systeme.io/api/contacts?limit=1', {
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        const endTime = Date.now();
        const latency = endTime - startTime;

        console.log(`✅ Response time: ${latency}ms`);
        if (latency < 500) {
            console.log('   ⚡ Excellent connection speed');
        } else if (latency < 1000) {
            console.log('   👍 Good connection speed');
        } else if (latency < 2000) {
            console.log('   ⚠️  Slow connection');
        } else {
            console.log('   ❌ Very slow connection - may cause timeouts');
        }
    } catch (error) {
        console.log(`❌ Latency test failed: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('📊 Connectivity Test Complete\n');

    // Summary
    console.log('Next Steps:');
    console.log('1. If tests passed: Deploy to Vercel');
    console.log('2. If authentication failed: Check SYSTEME_API_KEY');
    console.log('3. If connection failed: Check network/firewall');
    console.log('4. Test with: TEST_EMAIL=user@example.com node test-connectivity.js');
}

// Run the test
testConnectivity().catch(console.error);
