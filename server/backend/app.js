import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import userRoutes from './routes/users.js';  // Add .js extension
import compareRoutes from './routes/compareRoutes.js'; // ✅ Import your new route
import { generateText } from './openAIService.js';  // Add .js extension


dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static PDFs
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Attach compare routes
app.use('/compare', compareRoutes); // now /compare/save-comparison works


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // Allow requests from React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
app.use('/compare', compareRoutes); // 👈 available at /compare/save-comparison



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

// initialize AI 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})


// Route to handle AI suggestions
app.post('/api/ai-suggestion', async (req, res) => {
    try {
        const { car1, car2, userPreferences } = req.body;

        console.log("Request Body:", req.body);

        if (!car1 || !car2 || !userPreferences) {
            return res.status(400).json({ message: "Missing car details or user preferences." });
        }
        console.log("Car 1 data:", car1);
        console.log("Car 2 data:", car2);

// Check the individual metrics for both cars
        console.log("Car 1 metrics:", {
            fuel_type: car1.fuel_type,
            cylinders: car1.cylinders,
            transmission: car1.transmission,
            drive: car1.drive,
            combination_mpg: car1.combination_mpg
        });

        console.log("Car 2 metrics:", {
            make: car1.make,
            
            fuel_type: car2.fuel_type,
            cylinders: car2.cylinders,
            transmission: car2.transmission,
            drive: car2.drive,
            combination_mpg: car2.combination_mpg
        });

        // Construct the prompt for OpenAI
        const prompt = `
            You are an AI car advisor helping users choose between two vehicles based on their preferences. The user is comparing two cars:

            **Car 1: ${car1.make} ${car1.model} (${car1.year})**
            - Fuel Efficiency: ${car1.combination_mpg || 'N/A'} MPG
            - Power: ${car1.cylinders || 'N/A'} cylinders
            - Safety: ${car1.safetyRating || 'N/A'}

            **Car 2: ${car2.make} ${car2.model} (${car2.year})**
            - Fuel Efficiency: ${car2.combination_mpg || 'N/A'} MPG
            - Power: ${car2.cylinders || 'N/A'} cylinders
            - Safety: ${car2.safetyRating || 'N/A'}

            User Preferences:
            - Occupation: ${userPreferences.occupation || 'N/A'}
            - Safety: ${userPreferences.safetyImportance || 'N/A'}/10
            - Fuel Efficiency: ${userPreferences.fuelEfficiencyImportance || 'N/A'}/10
            - Horsepower: ${userPreferences.horsepowerImportance || 'N/A'}/10
            - Primary Usage: ${userPreferences.carUsage || 'N/A'}

            Based on the user's preferences, recommend the best car with a clear, short, and confident explanation. Focus on the most important factors like safety, fuel efficiency, and power.

            **Recommendation:** [Car Choice]. Use emojis (e.g., "🚗 Car 1" or "🌟 Car 2").
            `;



        // Call OpenAI API
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 350,
        });

        console.log("OpenAI API Response:", aiResponse);
        

        const suggestion = aiResponse.choices[0].message.content;
        res.json({ suggestion });

    } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        res.status(500).json({ message: "Error generating AI suggestion" });
    }
});


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
