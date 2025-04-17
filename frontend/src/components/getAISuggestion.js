// src/api/getAISuggestion.js
export const getAISuggestion = async ({ make1, model1, year1, make2, model2, year2, fetchCarData, fetchUserPreferences }) => {
    if (!make1 || !model1 || !year1 || !make2 || !model2 || !year2) {
      throw new Error("Please select two cars before requesting AI suggestions.");
    }
  
    const userPreferences = await fetchUserPreferences();
    if (!userPreferences) {
      throw new Error("Error fetching user preferences.");
    }
  
    const [data1, data2] = await Promise.all([
      fetchCarData(make1, model1, year1),
      fetchCarData(make2, model2, year2),
    ]);
  
    if (data1.length === 0 || data2.length === 0) {
      throw new Error("Error fetching car data.");
    }
  
    const car1 = data1[0];
    const car2 = data2[0];
  
    const car1Metrics = {
      make: car1.make,
      model: car1.model,
      year: car1.year,
      fuel_type: car1.fuel_type,
      cylinders: car1.cylinders,
      transmission: car1.transmission,
      drive: car1.drive,
      combination_mpg: car1.combination_mpg,
    };
  
    const car2Metrics = {
      make: car2.make,
      model: car2.model,
      year: car2.year,
      fuel_type: car2.fuel_type,
      cylinders: car2.cylinders,
      transmission: car2.transmission,
      drive: car2.drive,
      combination_mpg: car2.combination_mpg,
    };
  
    const response = await fetch('https://car-vs-car-api.onrender.com/api/ai-suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        car1: car1Metrics,
        car2: car2Metrics,
        userPreferences,
      }),
    });
  
    const data = await response.json();
  
    if (!data.suggestion) {
      throw new Error("No suggestion returned from AI.");
    }
  
    return data.suggestion;
  };
  