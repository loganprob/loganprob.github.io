// Sample data for the line chart
const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
        label: 'Sample Data',
        data: [10, 25, 18, 32, 28],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        fill: false,
    }]
};

// Configuration options for the chart
const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            max: 40,
        }
    }
};

// Get the canvas element and create the chart
const ctx = document.getElementById('myLineChart').getContext('2d');
const myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});
