async function compareCars() {
    const car1 = document.getElementById('car1').value;
    const car2 = document.getElementById('car2').value;

    try {
        const response1 = await fetch(`http://localhost:3000/api/cars/${car1}`);
        const response2 = await fetch(`http://localhost:3000/api/cars/${car2}`);
        const data1 = await response1.json();
        const data2 = await response2.json();
        displayComparison(data1, data2);
    } catch (error) {
        console.error('Error fetching car data:', error);
    }
}

function displayComparison(data1, data2) {
    const resultDiv = document.getElementById('comparisonResult');
    resultDiv.innerHTML = `
        <h2>Comparison Result</h2>
        <p>Car 1: ${data1.make} ${data1.model} (${data1.year})</p>
        <p>Car 2: ${data2.make} ${data2.model} (${data2.year})</p>
        <!-- Add more detailed comparison here -->
    `;
}
