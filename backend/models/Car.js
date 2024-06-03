const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
    Make: {
        type: String,
        required: true
    },
    Model: {
        type: String,
        required: true,
        unique: true
    },
    Year: {
        type: Number,
        required: true
    },
    Mileage: {
        type: Number,
        required: false 
    },
    Horsepower: {
        type: Number,
        required: false
    },
    Torque: {
        type: Number,
        required: false
    }

}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
