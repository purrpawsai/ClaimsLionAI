// Debug script to identify 504 timeout issues
// Run this with: node debug-504.js

const fetch = require('node-fetch');

const API_BASE = process.env.NETLIFY_FUNCTIONS_URL || 'http://localhost:8888/.netlify/functions';

async function testAnalysisEndpoint(analysisId) {
  console.log(`🔍 Testing analysis endpoint for ID: ${analysisId}`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE}/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysisId }),
      timeout: 65000, // 65 second timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error Response: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Success Response:`, JSON.stringify(data, null, 2));
    return true;
    
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return false;
  }
}

async function testGetAnalysesEndpoint() {
  console.log(`🔍 Testing get-analyses endpoint`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${API_BASE}/get-analyses`, {
      method: 'GET',
      timeout: 30000, // 30 second timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error Response: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.length} analysis results`);
    
    if (data.length > 0) {
      console.log(`📋 Latest analysis:`, {
        id: data[0].id,
        filename: data[0].filename,
        status: data[0].jsonResponse?.status,
        hasData: !!data[0].jsonResponse?.Alerts || !!data[0].jsonResponse?.Recommendations
      });
      
      // Test the specific analysis
      return await testAnalysisEndpoint(data[0].id);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting 504 Debug Script');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('='.repeat(50));
  
  // Test get-analyses first
  const getAnalysesSuccess = await testGetAnalysesEndpoint();
  
  console.log('='.repeat(50));
  
  if (getAnalysesSuccess) {
    console.log('✅ All tests passed!');
  } else {
    console.log('❌ Tests failed - check the logs above');
  }
}

// Run the debug script
main().catch(console.error); 