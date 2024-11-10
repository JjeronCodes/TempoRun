// index.js
/*import express from 'express';
import bodyParser from 'body-parser';


const express = require('express');
const bodyParser = require('body-parser');
const processData = require('./getRecommendations');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/api', processData);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

function handleInput(goalTime, intervalsBPMs) {
    console.log("Received goalTime:", goalTime);
    console.log("Received intervalsBPMs:", intervalsBPMs);

    // Example usage of the input data
    const totalBPM = intervalsBPMs.reduce((sum, bpm) => sum + bpm, 0);
    const averageBPM = totalBPM / intervalsBPMs.length;

    console.log(`Total BPM: ${totalBPM}`);
    console.log(`Average BPM: ${averageBPM}`);
    console.log(`Goal Time: ${goalTime} minutes`);
}
*/

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS to allow requests from different origins
app.use(express.json()); // Parse JSON request bodies

// Endpoint to receive data
//export let goalTime = 0;
//export let intervalsBPM = [];
app.post('/api/processData', (req, res) => {
    const { goalTime, intervalsBPMs } = req.body;

    if (!goalTime || !intervalsBPMs || !Array.isArray(intervalsBPMs)) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    console.log('Received goalTime:', goalTime);
    console.log('Received intervalsBPMs:', intervalsBPMs);

    // Example response
    const responseData = {
        message: 'Data received successfully',
        totalBPM: intervalsBPMs.reduce((sum, bpm) => sum + bpm, 0),
        averageBPM: intervalsBPMs.reduce((sum, bpm) => sum + bpm, 0) / intervalsBPMs.length,
        goalTime
    };

    res.status(200).json(responseData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
