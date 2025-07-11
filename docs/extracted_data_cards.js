// Updated function to display extracted data in individual cards
function displayExtractedData(extractedData) {
    const extractedDataContainer = document.getElementById('extracted-data-cards');
    extractedDataContainer.innerHTML = '';
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
        extractedDataContainer.innerHTML = '<div class="col-12 py-4 text-center"><div class="p-4 rounded bg-light text-muted"><i class="fas fa-info-circle fa-2x mb-3"></i><p class="lead">No extracted data available</p></div></div>';
        return;
    }
    
    // Sort keys alphabetically
    const sortedKeys = Object.keys(extractedData).sort();
    
    // Define icons for different types of data
    const iconMapping = {
        // Policy related
        'policy_number': 'fas fa-file-contract',
        'policy': 'fas fa-file-contract',
        'insured_name': 'fas fa-user-shield',
        'policy_type': 'fas fa-shield-alt',
        'policy_status': 'fas fa-check-circle',
        'policy_start_date': 'fas fa-calendar-plus',
        'policy_end_date': 'fas fa-calendar-times',
        
        // Incident related
        'InputLossDate': 'fas fa-calendar-day',
        'incident_date': 'fas fa-calendar-day',
        'incidentDate': 'fas fa-calendar-day',
        'incident_time': 'fas fa-clock',
        'incident_location': 'fas fa-map-marker-alt',
        'incident_description': 'fas fa-car-crash',
        'loss_date': 'fas fa-calendar-day',
        'loss_time': 'fas fa-clock',
        'loss_location': 'fas fa-map-marker-alt',
        
        // Contact related
        'email_id': 'fas fa-envelope',
        'phone_number': 'fas fa-phone',
        'reporter_name': 'fas fa-user',
        'contact_method': 'fas fa-comment',
        'address': 'fas fa-home',
        'reporter': 'fas fa-user-edit',
        
        // Vehicle related
        'vehicle_make': 'fas fa-car',
        'vehicle_model': 'fas fa-car',
        'vehicle_year': 'fas fa-calendar-alt',
        'vehicle_vin': 'fas fa-barcode',
        'license_plate': 'fas fa-id-card',
        'make': 'fas fa-car',
        'model': 'fas fa-car',
        'year': 'fas fa-calendar-alt',
        'vin': 'fas fa-barcode',
        'plate': 'fas fa-id-card',
        
        // Claim related
        'claim_number': 'fas fa-hashtag',
        'claim_status': 'fas fa-info-circle',
        'claim_type': 'fas fa-tag',
        'claim_description': 'fas fa-clipboard-list',
        'damage': 'fas fa-exclamation-triangle'
    };
    
    // Function to get icon for a key
    const getIcon = (key) => {
        const lowerKey = key.toLowerCase();
        
        // Check for exact matches
        if (iconMapping[key]) {
            return iconMapping[key];
        }
        
        // Check for partial matches
        for (const [pattern, icon] of Object.entries(iconMapping)) {
            if (lowerKey.includes(pattern.toLowerCase())) {
                return icon;
            }
        }
        
        // Default icon
        return 'fas fa-info-circle';
    };
    
    // Create an item card for each extracted data field
    sortedKeys.forEach((key, index) => {
        const value = extractedData[key];
        
        // Skip empty values
        if (value === null || value === undefined || value === '') {
            return;
        }
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'extracted-data-item';
        cardDiv.style.setProperty('--item-index', index); // For staggered animation
        
        // Format the key as a label
        const formattedLabel = formatLabel(key);
        
        // Get appropriate icon
        const icon = getIcon(key);
        
        // Create the card content
        cardDiv.innerHTML = `
            <div class="data-label">
                <i class="${icon}"></i>
                ${formattedLabel}
            </div>
            <div class="data-value">${value}</div>
        `;
        
        extractedDataContainer.appendChild(cardDiv);
    });
}

// Helper function to format field labels (ensuring it's available)
function formatLabel(key) {
    if (!key) return '';
    
    // Split camelCase or PascalCase into separate words
    const words = key.replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    
    // Capitalize first letter of each word
    return words.split(/[ _]/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}
