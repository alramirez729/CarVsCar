const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios'); // Import axios for HTTP requests
const userRoutes = require('./routes/users'); // Import the combined user routes

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// MongoDB connection string from environment variable
const dbURI = process.env.DB_URL;

if (!dbURI) {
    console.error('DB_URL is not defined in the environment variables');
    process.exit(1);
}

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));

// Use the combined user routes
app.use('/users', userRoutes);

// Fetch car data from the free test API and serve it
app.get('/api/cars', async (req, res) => {
    try {
        const response = await axios.get('https://freetestapi.com/api/v1/cars');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching car data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Default route for health check or home
app.get('/', (req, res) => {
    res.send('Backend server is running');
});
