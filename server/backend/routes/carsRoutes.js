import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load car database from JSON file
const carsDbPath = path.join(__dirname, '../data/carsDatabase.json');
const loadCarsDatabase = () => {
  try {
    const rawData = fs.readFileSync(carsDbPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading cars database:', error);
    return { cars: [] };
  }
};

/**
 * GET /api/cars - Fetch cars filtered by make, model, year
 * Query parameters:
 *   - make: (string) Car make/brand (e.g., "Toyota")
 *   - model: (string, optional) Car model (e.g., "Camry")
 *   - year: (number, optional) Car year (e.g., 2023)
 *   - limit: (number, optional) Max results to return (default: 75)
 * 
 * Returns an array of car objects matching the filters
 */
router.get('/cars', (req, res) => {
  try {
    const { make, model, year, limit = 75 } = req.query;
    const database = loadCarsDatabase();
    
    let filteredCars = database.cars;

    // Filter by make
    if (make) {
      filteredCars = filteredCars.filter(car => 
        car.make.toLowerCase() === make.toLowerCase()
      );
    }

    // Filter by model
    if (model) {
      filteredCars = filteredCars.filter(car => 
        car.model.toLowerCase() === model.toLowerCase()
      );
    }

    // Filter by year
    if (year) {
      filteredCars = filteredCars.filter(car => 
        car.year === parseInt(year)
      );
    }

    // Apply limit
    const limitNum = parseInt(limit) || 75;
    const results = filteredCars.slice(0, limitNum);

    res.json(results);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

export default router;
