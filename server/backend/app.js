const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const userRoutes = require('./routes/users');
const OpenAI = require('openai');
const { generateText } = require('./openAIService');


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // Allow requests from React app
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));


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

        if (!car1 || !car2 || !userPreferences) {
            return res.status(400).json({ message: "Missing car details or user preferences." });
        }

        // Construct the prompt for OpenAI
        const prompt = `
        You are an AI car advisor helping users pick the best car based on their unique needs.
        The user is comparing the following two vehicles:

        **Car 1: ${car1.make} ${car1.model} (${car1.year})**
        - Fuel Efficiency: ${car1.combination_mpg} MPG
        - Power: ${car1.cylinders} cylinders
        - Displacement: ${car1.displacement || 'N/A'} L
        - Safety Rating: ${car1.safetyRating || 'Unknown'}
        - Drive Type: ${car1.drive || 'N/A'}
        - Transmission: ${car1.transmission || 'N/A'}
        - Fuel Type: ${car1.fuel_type || 'N/A'}
        - Class: ${car1.class || 'N/A'}

        **Car 2: ${car2.make} ${car2.model} (${car2.year})**
        - Fuel Efficiency: ${car2.combination_mpg} MPG
        - Power: ${car2.cylinders} cylinders
        - Displacement: ${car2.displacement || 'N/A'} L
        - Safety Rating: ${car2.safetyRating || 'Unknown'}
        - Drive Type: ${car2.drive || 'N/A'}
        - Transmission: ${car2.transmission || 'N/A'}
        - Fuel Type: ${car2.fuel_type || 'N/A'}
        - Class: ${car2.class || 'N/A'}

        **User Preferences (Importance Scale 1-10):**
        - Occupation: ${userPreferences.occupation || 'Not specified'}
        - Annual Miles Driven: ${userPreferences.annualMiles} miles
        - Safety: ${userPreferences.safetyImportance}/10
        - Fuel Efficiency: ${userPreferences.fuelEfficiencyImportance}/10
        - Horsepower: ${userPreferences.horsepowerImportance}/10
        - Speed: ${userPreferences.speedImportance}/10
        - Primary Car Usage: ${userPreferences.carUsage || 'Not specified'}

        **AI Recommendation:**
        - Prioritize the car that best matches the user's **top preferences**.
        - If safety is the highest priority, lean toward the car with better safety indicators.
        - If fuel efficiency matters most, favor the vehicle with better MPG.
        - If performance is key, consider horsepower and displacement.
        - **Do NOT mention missing data explicitly**; instead, phrase it as: "Based on the provided data and user preferences..."
        - Use **natural, engaging language** rather than robotic or overly technical phrasing.
        - **Make a confident choice** and justify it clearly.
        - Avoid excessive numeric data; focus on **practical benefits** (e.g., "better for daily commutes" rather than "3 MPG more").
        - Keep the response as brief as you can
        - **ENSURE TO End with a definitive statement:** "**Final Recommendation: [Car Choice]**".   
        `;

        // Call OpenAI API
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 200,
        });

        const suggestion = aiResponse.choices[0].message.content;
        res.json({ suggestion });

    } catch (error) {
        console.error("Error fetching AI suggestion:", error);
        res.status(500).json({ message: "Error generating AI suggestion" });
    }
});

// OpenAI API route 
app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const response = await generateText(prompt);
        res.json({ response });
    } catch (error) {
        console.error("Error generating AI response:", error);
        res.status(500).json({ error: "Failed to generate response" });
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
