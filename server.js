require('dotenv').config(); // Load environment variables
const express = require('express');
const fetch = require('node-fetch').default; // Import node-fetch correctly
const cors = require('cors'); // Import the cors package

const app = express();
const port = process.env.PORT || 3000; // Use Vercel's port or default to 3000

// Enable CORS for all origins (for development)
app.use(cors());

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the YouTube Analytics Backend! Use /api/search or /api/channel.');
});

// Proxy endpoint for YouTube search
app.get('/api/search', async (req, res) => {
  const query = req.query.q; // Get search query from the front end
  const apiKey = process.env.API_KEY; // Access the API key from .env

  // Validate the query
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Construct the YouTube API URL
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&key=${apiKey}`;

  try {
    console.log('Fetching data from YouTube API:', searchUrl); // Log the URL being requested

    const response = await fetch(searchUrl);

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response from YouTube API
      console.error('YouTube API Error:', errorData);
      return res.status(response.status).json({ error: 'YouTube API Error', details: errorData });
    }

    const data = await response.json();
    console.log('YouTube API Response:', JSON.stringify(data, null, 2)); // Log the full response

    // Check if the response contains items
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'No channels found' });
    }

    // Return the search results
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from YouTube API:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

// Proxy endpoint for YouTube channel details
app.get('/api/channel', async (req, res) => {
  const channelId = req.query.id; // Get channel ID from the front end
  const apiKey = process.env.API_KEY; // Access the API key from .env

  // Validate the channel ID
  if (!channelId) {
    return res.status(400).json({ error: 'Channel ID parameter "id" is required' });
  }

  // Construct the YouTube API URL
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,status,brandingSettings&id=${channelId}&key=${apiKey}`;

  try {
    console.log('Fetching channel details from YouTube API:', channelUrl); // Log the URL being requested

    const response = await fetch(channelUrl);

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response from YouTube API
      console.error('YouTube API Error:', errorData);
      return res.status(response.status).json({ error: 'YouTube API Error', details: errorData });
    }

    const data = await response.json();
    console.log('YouTube API Response:', JSON.stringify(data, null, 2)); // Log the full response

    // Check if the response contains items
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Channel details not found' });
    }

    // Return the channel details
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from YouTube API:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});