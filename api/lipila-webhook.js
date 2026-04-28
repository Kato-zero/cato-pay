// Lipila Payment Webhook Handler
// This is the main payment initiation endpoint

const crypto = require('crypto');

// IMPORTANT: Set your Lipila API key in Vercel environment variables
// Go to Vercel Dashboard > Your Project > Settings > Environment Variables
// Add key: LIPILA_API_KEY with your actual API key
const LIPILA_API_KEY = process.env.LIPILA_API_KEY || 'lsk_019ab490-99b7-72c7-8bfa-23cce0bacf68';

// Generate UUID v4
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
  
  try {
    const { accountNumber, amount, currency, narration, email, callbackUrl, redirectUrl, backUrl } = req.body;
    
    // Validate required fields
    if (!accountNumber || !amount || !currency) {
      return res.status(400).json({ 
        error: 'Missing required fields: accountNumber, amount, currency' 
      });
    }
    
    // Validate API key
    if (!LIPILA_API_KEY || LIPILA_API_KEY === 'lsk_019ab490-99b7-72c7-8bfa-23cce0bacf68') {
      console.error('Lipila API key not configured');
      return res.status(500).json({ 
        error: 'Payment service not configured. Please set LIPILA_API_KEY environment variable.' 
      });
    }
    
    const referenceId = generateUUID();
    
    // Prepare payload for Lipila API
    const payload = {
      callbackUrl: callbackUrl || 'https://cato-pay.vercel.app/api/lipila-webhook',
      referenceId: referenceId,
      amount: parseFloat(amount),
      narration: narration || 'Payment via Lipila',
      accountNumber: accountNumber,
      currency: currency,
      backUrl: backUrl || '',
      redirectUrl: redirectUrl || '',
      email: email || ''
    };
    
    console.log('Initiating payment:', { referenceId, amount, accountNumber });
    
    // Make request to Lipila API
    const response = await fetch('https://api.lipila.dev/api/v1/collections/mobile-money', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-api-key': lsk_019ab490-99b7-72c7-8bfa-23cce0bacf68,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Lipila API error:', responseData);
      return res.status(response.status).json({ 
        error: responseData.message || 'Lipila API request failed',
        details: responseData
      });
    }
    
    // Return success response with reference ID
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
