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
