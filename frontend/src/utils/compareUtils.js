// compareUtils.js

// Max values used for normalization
const maxMpg = 50; // Amplified movement
const maxCylinders = 16; // Typical high-end supercar cylinders

// Weights for overall rating calculation
const weightFuelEfficiency = 1.2;
const weightPower = 0.3;

// Normalize fuel efficiency
export const calculateFuelEfficiencyScore = (mpg) => {
  return Math.min((mpg / maxMpg) * 100, 100);
};

// Normalize power directly into 0-10 range
export const calculatePowerScore = (cylinders) => {
  return Math.min((cylinders / maxCylinders) * 10, 10);
};

// Overall Rating calculation
export const calculateOverallRating = (fuelEfficiency, cylinders) => {
  const fuelEfficiencyScore = calculateFuelEfficiencyScore(fuelEfficiency * 2);
  const powerScore = calculatePowerScore(cylinders);

  return Math.round(
    (fuelEfficiencyScore * weightFuelEfficiency + powerScore * weightPower) /
    (weightFuelEfficiency + weightPower)
  );
};

// Prepare speedometer values
export const extractSpeedometerValues = (car) => ({
  fuelEfficiency: car?.combination_mpg || 0,
  power: calculatePowerScore(car?.cylinders || 0), // ✅ now properly normalized
  overallRating: calculateOverallRating(car?.combination_mpg || 0, car?.cylinders || 0)
});
