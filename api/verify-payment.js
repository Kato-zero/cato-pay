// Payment Verification Endpoint
// Query Lipila to check payment status

const LIPILA_API_KEY = process.env.LIPILA_API_KEY || 'YOUR_API_KEY_HERE';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { referenceId } = req.query;
    
    if (!referenceId) {
      return res.status(400).json({ error: 'referenceId is required' });
    }
    
    if (!LIPILA_API_KEY || LIPILA_API_KEY === 'YOUR_API_KEY_HERE') {
      return res.status(500).json({ 
        error: 'Payment service not configured' 
      });
    }
    
    // Note: Lipila might have a specific endpoint to check payment status
    // If not available, you would need to store the transaction in your database
    // and update it via webhook when payment completes
    
    // For now, we'll return a simulated response
    // In production, you should implement the actual Lipila status check endpoint
    // or use a database to track webhook updates
    
    // Simulate status check (replace with actual API call when available)
    // const response = await fetch(`https://api.lipila.dev/api/v1/collections/status/${referenceId}`, {
    //   headers: { 'x-api-key': LIPILA_API_KEY }
    // });
    
    // For demo purposes, return pending status
    // In real implementation, you would:
    // 1. Check your database for webhook updates
    // 2. Or call Lipila's status endpoint if available
    
    return res.status(200).json({
      referenceId: referenceId,
      status: 'Pending', // This would be fetched from your database or Lipila API
      message: 'Payment status check - implement actual Lipila status endpoint or database storage'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
