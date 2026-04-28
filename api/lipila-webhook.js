// Lipila Payment Webhook Handler
const crypto = require('crypto');

// IMPORTANT: Replace with your actual Lipila API key
// Get this from your Lipila dashboard
const LIPILA_API_KEY = 'lsk_019ab490-99b7-72c7-8bfa-23cce0bacf68';

// Remove the process.env line or use it as fallback
// const LIPILA_API_KEY = process.env.LIPILA_API_KEY || 'YOUR_ACTUAL_LIPILA_API_KEY_HERE';

function generateUUID() {
  return crypto.randomUUID();
}

module.exports = async (req, res) => {
  // Enable CORS for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Debug: Log API key status (first few characters only)
  const apiKeyPrefix = LIPILA_API_KEY ? LIPILA_API_KEY.substring(0, 15) + '...' : 'MISSING';
  console.log('API Key status:', LIPILA_API_KEY ? `Present (${apiKeyPrefix})` : 'MISSING');
  
  // Check if API key is configured
  if (!LIPILA_API_KEY || LIPILA_API_KEY === 'YOUR_ACTUAL_LIPILA_API_KEY_HERE') {
    console.error('Invalid API key configuration');
    return res.status(500).json({ 
      error: 'Payment service not configured',
      message: 'LIPILA_API_KEY is missing or has placeholder value',
      fix: 'Add your actual Lipila API key in the code or environment variables'
    });
  }
  
  try {
    const { accountNumber, amount, currency, narration, email, callbackUrl, redirectUrl, backUrl } = req.body;
    
    // Validate required fields
    if (!accountNumber) {
      return res.status(400).json({ error: 'accountNumber is required' });
    }
    if (!amount) {
      return res.status(400).json({ error: 'amount is required' });
    }
    if (!currency) {
      return res.status(400).json({ error: 'currency is required' });
    }
    
    const referenceId = generateUUID();
    
    // Prepare payload for Lipila API
    const payload = {
      callbackUrl: callbackUrl || `https://cato-pay.vercel.app/api/lipila-webhook`,
      referenceId: referenceId,
      amount: parseFloat(amount),
      narration: narration || 'Payment via Lipila',
      accountNumber: accountNumber,
      currency: currency,
      backUrl: backUrl || '',
      redirectUrl: redirectUrl || '',
      email: email || ''
    };
    
    console.log('Sending to Lipila:', { 
      referenceId, 
      amount: payload.amount, 
      accountNumber,
      currency 
    });
    
    // Make request to Lipila API
    const response = await fetch('https://api.lipila.io/api/v1/collections/mobile-money', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': LIPILA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    console.log('Lipila response status:', response.status);
    console.log('Lipila response:', responseData);
    
    if (!response.ok) {
      console.error('Lipila API error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.message || 'Lipila API request failed',
        details: responseData
      });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      referenceId: referenceId,
      status: responseData.status || 'Pending',
      paymentType: responseData.paymentType,
      amount: amount,
      currency: currency,
      accountNumber: accountNumber,
      message: 'Payment initiated successfully'
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
