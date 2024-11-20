const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios'); // Import axios for HTTP requests
const userRoutes = require('./routes/users'); // Import the combined user routes

// Load environment variables from .env file
dotenv.config();

const app = express();
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
        const apiKey = process.env.API_KEY;
        const { make, model } = req.query;

        let apiUrl = `https://api.api-ninjas.com/v1/cars?`;
        if (make) apiUrl += `make=${make}&`;
        if (model) apiUrl += `model=${model}&`;

        const response = await axios.get(apiUrl, {
            headers: { 'X-Api-Key': apiKey }
        });

        
        //this is kept to test the .json:
        console.log(response.data);
        console.log('Fetching data from:', apiUrl); // Log the API URL for debugging

        // Only return the necessary fields for comparison
        const carData = response.data.map(car => ({
            make: car.make,
            model: car.model,
            year: car.year,
            city_mpg: car.city_mpg,
            highway_mpg: car.highway_mpg,
            combination_mpg: car.combination_mpg,
            cylinders: car.cylinders,
            displacement: car.displacement,
            drive: car.drive,
            fuel_type: car.fuel_type,
            transmission: car.transmission,
            class: car.class,
        }));

        // Check if data exists
        if (carData.length === 0) {
            return res.status(404).json({ message: 'No cars found.' });
        }

        res.json(carData);
    } catch (error) {
        console.error('Error fetching car data:', error.message);

        if (error.response) {
            // Provide more specific error messages for failed external API calls
            return res.status(error.response.status).json({
                message: error.response.data || 'Error fetching data from external API'
            });
        }

        res.status(500).send('Internal Server Error');
    }
});




// Default route for health check or home
app.get('/', (req, res) => {
    res.send('Backend server is running');
});
