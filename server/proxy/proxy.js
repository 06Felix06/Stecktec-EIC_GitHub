const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Firebase Realtime Database base URL
// URL der eigenen Firebase Realtime Database (z. B. per Umgebungsvariable setzen)
const FIREBASE_BASE_URL = process.env.FIREBASE_BASE_URL || "https://YOUR-PROJECT-default-rtdb.europe-west1.firebasedatabase.app";

// Route to send new data (POST)
app.post('/send/:subdomain', async (req, res) => {
    try {
        const { subdomain } = req.params;
        const data = req.body;

        console.log(`Sending new data to subdomain: ${subdomain}`, data);

        // Create URL with subdomain
        const url = `${FIREBASE_BASE_URL}/${subdomain}.json`;

        // Send POST request to Firebase
        const firebaseResponse = await axios.post(url, data);

        console.log("Firebase response:", firebaseResponse.data);
        res.status(200).json({
            success: true,
            key: firebaseResponse.data.name, // Firebase returns the generated key
            message: "Data successfully sent"
        });
    } catch (error) {
        console.error('Error sending data to Firebase:', error.message);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
    }
});

// Route to overwrite data (PUT)
app.put('/update/:subdomain/:key?', async (req, res) => {
    try {
        const { subdomain, key } = req.params;
        const data = req.body;

        // Create URL with subdomain and optional key
        let url = `${FIREBASE_BASE_URL}/${subdomain}`;
        if (key) {
            url += `/${key}`;
        }
        url += '.json';

        console.log(`Updating data at: ${url}`, data);

        // Send PUT request to Firebase
        const firebaseResponse = await axios.put(url, data);

        console.log("Firebase response:", firebaseResponse.data);
        res.status(200).json({
            success: true,
            data: firebaseResponse.data,
            message: "Data successfully updated"
        });
    } catch (error) {
        console.error('Error updating data in Firebase:', error.message);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
    }
});

// Route to read data (GET)
app.get('/read/:subdomain/:key?', async (req, res) => {
    try {
        const { subdomain, key } = req.params;

        // Create URL with subdomain and optional key
        let url = `${FIREBASE_BASE_URL}/${subdomain}`;
        if (key) {
            url += `/${key}`;
        }
        url += '.json';

        console.log(`Reading data from: ${url}`);

        // Send GET request to Firebase
        const firebaseResponse = await axios.get(url);

        console.log("Firebase response:", firebaseResponse.data);
        res.status(200).json({
            success: true,
            data: firebaseResponse.data
        });
    } catch (error) {
        console.error('Error reading data from Firebase:', error.message);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
    }
});

// Legacy endpoint for backward compatibility
app.all('/proxy', async (req, res) => {
    try {
        const { method, body } = req;
        console.log("Received legacy request:", method, body);

        // Forward to sensor_data subdomain by default
        const url = `${FIREBASE_BASE_URL}/sensor_data.json`;

        // Forward the request to Firebase
        const firebaseResponse = await axios({
            method: method.toLowerCase(),
            url: url,
            data: body,
        });

        console.log("Firebase response:", firebaseResponse.data);
        res.status(firebaseResponse.status).json(firebaseResponse.data);
    } catch (error) {
        console.error('Error forwarding request to Firebase:', error.message);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
});