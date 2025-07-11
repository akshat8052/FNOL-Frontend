// Initialize incident bar chart
function initializeIncidentBarChart() {
    const ctx = document.getElementById('incidentBarChart').getContext('2d');
    
    // Sample data for incident types
    const incidentData = {
        labels: ['Collision', 'Weather Damage', 'Theft', 'Fire', 'Water Damage', 'Liability', 'Other'],
        values: [35, 28, 15, 7, 10, 5, 8]
    };
    
    // Create gradient for bars
    const barGradient = ctx.createLinearGradient(0, 0, 0, 400);
    barGradient.addColorStop(0, 'rgba(65, 88, 208, 0.8)');
    barGradient.addColorStop(1, 'rgba(52, 152, 219, 0.8)');
    
    // Create bar chart
    const barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: incidentData.labels,
            datasets: [{
                label: 'Number of Incidents',
                data: incidentData.values,
                backgroundColor: barGradient,
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(65, 88, 208, 1)',
                barThickness: 'flex',
                maxBarThickness: 60,
                minBarLength: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                delay: (context) => context.dataIndex * 100,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', 'Segoe UI', sans-serif",
                            size: 12
                        },
                        color: '#34495e'
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', 'Segoe UI', sans-serif",
                            size: 12
                        },
                        color: '#34495e'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            family: "'Poppins', 'Segoe UI', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#34495e',
                    titleFont: {
                        family: "'Poppins', 'Segoe UI', sans-serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: '#34495e',
                    bodyFont: {
                        family: "'Poppins', 'Segoe UI', sans-serif",
                        size: 13
                    },
                    borderColor: 'rgba(52, 152, 219, 0.3)',
                    borderWidth: 1,
                    caretSize: 8,
                    cornerRadius: 6,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label + ' Incidents';
                        },
                        label: function(context) {
                            return context.parsed.y + ' cases (' + (context.parsed.y / incidentData.values.reduce((a, b) => a + b, 0) * 100).toFixed(1) + '%)';
                        }
                    }
                }
            }
        }
    });
    
    // Add animation when tab changes to analytics
    document.getElementById('analytics-tab').addEventListener('click', function() {
        setTimeout(() => {
            barChart.update();
        }, 400);
    });
}
