document.addEventListener('DOMContentLoaded', function() {
    loadCarMakes();
});

let carMakes = [];

async function loadCarMakes() {
    try {
        const response = await fetch('http://localhost:3000/api/cars');
        const data = await response.json();
        carMakes = data.map(car => car.make);
        console.log('Car makes loaded:', carMakes); // Debugging line
    } catch (error) {
        console.error('Error fetching car makes:', error);
    }
}

function filterMakes(inputId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toLowerCase();
    const dropdown = document.getElementById(`dropdown${inputId.slice(-1)}`);
    dropdown.innerHTML = '';

    console.log('Filtering makes for:', filter); // Debugging line

    const filteredMakes = carMakes.filter(make => make.toLowerCase().includes(filter));
    filteredMakes.forEach(make => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = make;
        item.onclick = () => selectMake(inputId, make);
        dropdown.appendChild(item);
    });

    if (filter === '') {
        dropdown.innerHTML = '';
    }
}

function selectMake(inputId, makeName) {
    document.getElementById(inputId).value = makeName;
    document.getElementById(`dropdown${inputId.slice(-1)}`).innerHTML = '';
}

async function compareCars() {
    const brand1 = document.getElementById('brand1').value.toLowerCase();
    const brand2 = document.getElementById('brand2').value.toLowerCase();
    const model1 = document.getElementById('model1').value.toLowerCase();
    const model2 = document.getElementById('model2').value.toLowerCase();
    const mileage1 = document.getElementById('mileage1').value;
    const mileage2 = document.getElementById('mileage2').value;

    try {
        const response1 = await fetch(`http://localhost:3000/api/cars?make=${brand1}&model=${model1}`);
        const response2 = await fetch(`http://localhost:3000/api/cars?make=${brand2}&model=${model2}`);
        const data1 = await response1.json();
        const data2 = await response2.json();

        if (data1.length && data2.length) {
            const winner = compareCarData(data1[0], data2[0]);
            displayComparison(winner, data1[0], data2[0]);
        } else {
            displayError("One or both cars were not found.");
        }
    } catch (error) {
        console.error('Error fetching car data:', error);
        displayError("Error fetching car data.");
    }
}

function compareCarData(data1, data2) {
    if (data1.rating > data2.rating) {
        return data1;
    } else {
        return data2;
    }
}

function displayComparison(winner, data1, data2) {
    const resultDiv = document.getElementById('comparisonResult');
    resultDiv.innerHTML = `
        <h2>Comparison Result</h2>
        <p>Car 1: ${data1.make} ${data1.model} - Mileage: ${data1.mileage} - Rating: ${data1.rating}</p>
        <p>Car 2: ${data2.make} ${data2.model} - Mileage: ${data2.mileage} - Rating: ${data2.rating}</p>
        <h3>Winner: ${winner.make} ${winner.model}</h3>
    `;
}

function displayError(message) {
    const resultDiv = document.getElementById('comparisonResult');
    resultDiv.innerHTML = `<p style="color: red;">${message}</p>`;
}
