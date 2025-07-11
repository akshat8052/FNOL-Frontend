// Global variables
let currentMailType = 'fnol';
let currentMailId = null;
let chart = null;
let barChart = null;
let darkMode = localStorage.getItem('darkMode') === 'enabled';

// Dark mode toggle function
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    themeToggle.addEventListener('click', () => {
        // Toggle dark mode class on body
        document.body.classList.toggle('dark-mode');
        
        // Toggle icon visibility
        document.querySelector('.fa-moon').classList.toggle('d-none');
        document.querySelector('.fa-sun').classList.toggle('d-none');
        
        // Save preference to localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkMode = true;
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkMode = false;
        }
        
        // Update charts if they exist to adapt to theme
        if (chart) {
            updateChartTheme(chart);
        }
        
        if (barChart) {
            updateChartTheme(barChart);
        }
    });
}

// Update chart theme based on dark mode
function updateChartTheme(chartInstance) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Update chart text colors
    chartInstance.options.scales.x.ticks.color = isDarkMode ? '#e0e0e0' : '#34495e';
    chartInstance.options.scales.y.ticks.color = isDarkMode ? '#e0e0e0' : '#34495e';
    chartInstance.options.plugins.legend.labels.color = isDarkMode ? '#e0e0e0' : '#34495e';
    
    // Update grid colors
    chartInstance.options.scales.x.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    chartInstance.options.scales.y.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    // Update tooltip styles
    chartInstance.options.plugins.tooltip.backgroundColor = isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    chartInstance.options.plugins.tooltip.titleColor = isDarkMode ? '#e0e0e0' : '#34495e';
    chartInstance.options.plugins.tooltip.bodyColor = isDarkMode ? '#e0e0e0' : '#34495e';
    
    // Update the chart
    chartInstance.update();
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    AOS.init({
        once: true,
        mirror: false
    });
    
    // Initialize dark mode if enabled
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.fa-moon').classList.add('d-none');
        document.querySelector('.fa-sun').classList.remove('d-none');
    }
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Load initial data
    loadStatsData();
    refreshMailList();
    updateDashboardCounts();
    
    // Initialize charts in analytics tab with a slight delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Initializing charts...');
        console.log('Trend chart element:', document.getElementById('trendChart'));
        console.log('Incident bar chart element:', document.getElementById('incidentBarChart'));
        
        initializeTrendChart();
        initializeIncidentBarChart();
        
        // Make sure charts are visible when switching to analytics tab
        document.getElementById('analytics-tab').addEventListener('shown.bs.tab', function (e) {
            console.log('Tab changed to Analytics, updating charts...');
            if (chart) chart.update();
            if (barChart) barChart.update();
        });
    }, 500);
    
    // Setup counter animation
    initializeCounterAnimation();
    
    // Set up tab transition enhancements
    setupTabTransitions();
});

// Initialize trend chart
function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.error('Trend chart canvas not found');
        return;
    }
    
    const ctxContext = ctx.getContext('2d');
    
    // Prepare chart data from mock data or API
    const mockData = {
        stats: {
            "daily_stats": {
                "2025-07-04": {
                    "emails_received": 38,
                    "incomplete_info_emails": 25,
                    "followup_emails_sent": 25,
                    "claims_generated": 2
                },
                "2025-07-06": {
                    "emails_received": 5,
                    "incomplete_info_emails": 0,
                    "followup_emails_sent": 0,
                    "claims_generated": 0
                },
                "2025-07-07": {
                    "emails_received": 20,
                    "incomplete_info_emails": 8,
                    "followup_emails_sent": 8,
                    "claims_generated": 1
                }
            }
        }
    };
    
    const dates = Object.keys(mockData.stats.daily_stats).sort();
    const emailsData = dates.map(date => mockData.stats.daily_stats[date].emails_received);
    const incompleteData = dates.map(date => mockData.stats.daily_stats[date].incomplete_info_emails);
    const followupData = dates.map(date => mockData.stats.daily_stats[date].followup_emails_sent);
    const claimsData = dates.map(date => mockData.stats.daily_stats[date].claims_generated);
    
    // Gradient backgrounds for chart
    const emailsGradient = ctxContext.createLinearGradient(0, 0, 0, 400);
    emailsGradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
    emailsGradient.addColorStop(1, 'rgba(52, 152, 219, 0.0)');
    
    const incompleteGradient = ctxContext.createLinearGradient(0, 0, 0, 400);
    incompleteGradient.addColorStop(0, 'rgba(243, 156, 18, 0.3)');
    incompleteGradient.addColorStop(1, 'rgba(243, 156, 18, 0.0)');
    
    const followupGradient = ctxContext.createLinearGradient(0, 0, 0, 400);
    followupGradient.addColorStop(0, 'rgba(46, 204, 113, 0.3)');
    followupGradient.addColorStop(1, 'rgba(46, 204, 113, 0.0)');
    
    const claimsGradient = ctxContext.createLinearGradient(0, 0, 0, 400);
    claimsGradient.addColorStop(0, 'rgba(231, 76, 60, 0.3)');
    claimsGradient.addColorStop(1, 'rgba(231, 76, 60, 0.0)');
    
    // Enhanced chart options
    Chart.defaults.font.family = "'Poppins', 'Segoe UI', sans-serif";
    Chart.defaults.color = darkMode ? '#e0e0e0' : '#34495e';
    Chart.defaults.elements.line.borderWidth = 3;
    Chart.defaults.elements.point.radius = 4;
    Chart.defaults.elements.point.hoverRadius = 7;
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Create chart with animation
    chart = new Chart(ctxContext, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Emails Received',
                    data: emailsData,
                    borderColor: '#3498db',
                    backgroundColor: emailsGradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#3498db',
                    pointHoverBackgroundColor: '#3498db',
                    pointHoverBorderColor: '#fff'
                },
                {
                    label: 'Incomplete Info',
                    data: incompleteData,
                    borderColor: '#f39c12',
                    backgroundColor: incompleteGradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#f39c12',
                    pointHoverBackgroundColor: '#f39c12',
                    pointHoverBorderColor: '#fff'
                },
                {
                    label: 'Follow-ups Sent',
                    data: followupData,
                    borderColor: '#2ecc71',
                    backgroundColor: followupGradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#2ecc71',
                    pointHoverBackgroundColor: '#2ecc71',
                    pointHoverBorderColor: '#fff'
                },
                {
                    label: 'Claims Generated',
                    data: claimsData,
                    borderColor: '#e74c3c',
                    backgroundColor: claimsGradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#e74c3c',
                    pointHoverBackgroundColor: '#e74c3c',
                    pointHoverBorderColor: '#fff'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            scales: {
                x: {
                    grid: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: darkMode ? '#e0e0e0' : '#34495e'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: darkMode ? '#e0e0e0' : '#34495e'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: darkMode ? '#e0e0e0' : '#34495e'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: darkMode ? '#e0e0e0' : '#34495e',
                    bodyColor: darkMode ? '#e0e0e0' : '#34495e',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 10
                }
            }
        }
    });
    
    console.log('Trend chart initialized');
}

// Initialize incident bar chart
function initializeIncidentBarChart() {
    const ctx = document.getElementById('incidentBarChart');
    if (!ctx) {
        console.error('Incident bar chart canvas not found');
        return;
    }
    
    const ctxContext = ctx.getContext('2d');
    
    // Sample data for incident types
    const incidentData = {
        labels: ['Collision', 'Weather Damage', 'Theft', 'Fire', 'Water Damage', 'Liability', 'Other'],
        values: [35, 28, 15, 7, 10, 5, 8]
    };
    
    // Create gradient for bars
    const barGradient = ctxContext.createLinearGradient(0, 0, 0, 400);
    barGradient.addColorStop(0, 'rgba(65, 88, 208, 0.8)');
    barGradient.addColorStop(1, 'rgba(52, 152, 219, 0.8)');
    
    // Destroy existing chart if it exists
    if (barChart) {
        barChart.destroy();
    }
    
    // Create bar chart
    barChart = new Chart(ctxContext, {
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
                        color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', 'Segoe UI', sans-serif",
                            size: 12
                        },
                        color: darkMode ? '#e0e0e0' : '#34495e'
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
                        color: darkMode ? '#e0e0e0' : '#34495e'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: darkMode ? '#e0e0e0' : '#34495e',
                        font: {
                            family: "'Poppins', 'Segoe UI', sans-serif",
                            size: 13
                        }
                    }
                },
                tooltip: {
                    backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: darkMode ? '#e0e0e0' : '#34495e',
                    bodyColor: darkMode ? '#e0e0e0' : '#34495e',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} incidents`;
                        }
                    }
                }
            }
        }
    });
    
    console.log('Incident bar chart initialized');
}

// Now let's add mock functions for the rest of the dashboard functionality to make it work
function loadStatsData() {
    console.log('Loading stats data');
    // Mock implementation
}

function refreshMailList() {
    console.log('Refreshing mail list');
    // Mock implementation
}

function updateDashboardCounts() {
    console.log('Updating dashboard counts');
    // Mock implementation
}

function initializeCounterAnimation() {
    console.log('Initializing counter animation');
    // Mock implementation
}

function setupTabTransitions() {
    console.log('Setting up tab transitions');
    // Mock implementation
}
