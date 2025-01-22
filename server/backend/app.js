const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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

app.use('/users', userRoutes);

// Fetch car makes
app.get('/api/carmakes', async (req, res) => {
    try {
        const apiKey = process.env.API_KEY;

        const response = await axios.get(`https://api.api-ninjas.com/v1/carmakes`, {
            headers: { 'X-Api-Key': apiKey },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching car makes:', error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                message: error.response.data || 'Error fetching car makes',
            });
        }

        res.status(500).send('Internal Server Error');
    }
});

// Fetch car models
app.get('/api/carmodels', async (req, res) => {
    try {
        const { make } = req.query;
        const response = await axios.get(`https://api.api-ninjas.com/v1/carmodels?make=${make}`, {
            headers: { 'X-Api-Key': process.env.API_KEY },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching car models:', error.message);
        res.status(500).json({ error: 'Failed to fetch car models' });
    }
});


// Fetch car details
app.get('/api/cars', async (req, res) => {
    try {
        const apiKey = process.env.API_KEY;
        const { make, model, year, limit = 10, offset = 0 } = req.query;

        if (!make || !model) {
            return res.status(400).json({ message: 'Make and Model are required to fetch car details' });
        }

        let apiUrl = `https://api.api-ninjas.com/v1/cars?make=${make}&model=${model}&limit=${limit}&offset=${offset}`;
        if (year) apiUrl += `&year=${year}`;

        const response = await axios.get(apiUrl, {
            headers: { 'X-Api-Key': apiKey },
        });

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

        if (carData.length === 0) {
            return res.status(404).json({ message: 'No cars found.' });
        }

        res.json(carData);
    } catch (error) {
        console.error('Error fetching car data:', error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                message: error.response.data || 'Error fetching car data',
            });
        }

        res.status(500).send('Internal Server Error');
    }
});

// Default route for health check
app.get('/', (req, res) => {
    res.send('Backend server is running');
});
