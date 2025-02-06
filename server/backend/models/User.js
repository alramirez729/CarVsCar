const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: false,
    },
    biography: {
        type: String, // Adding biography field
        default: '', // Default value to avoid undefined
    },
    preferences: {  
        occupation: { type: String, default: '' },
        annualMiles: { type: Number, default: 0 },
        safetyImportance: { type: Number, min: 1, max: 10, default: 5 },
        fuelEfficiencyImportance: { type: Number, min: 1, max: 10, default: 5 },
        horsepowerImportance: { type: Number, min: 1, max: 10, default: 5 },
        speedImportance: { type: Number, min: 1, max: 10, default: 5 },
        carUsage: { type: String, default: '' },
    }
}, { timestamps: true });

// Middleware to hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
});

// Virtual Field to Calculate Age
userSchema.virtual('calculatedAge').get(function () {
    if (this.birthdate) {
        const today = new Date();
        const birthDate = new Date(this.birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    return null;
});
  

const User = mongoose.model('User', userSchema);

module.exports = User;
