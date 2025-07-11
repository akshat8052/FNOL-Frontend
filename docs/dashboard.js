// // Global variables
// let currentMailType = 'fnol';
// let currentMailId = null;
// let currentFilterStatus = 'all';
// let currentSortOption = 'date-desc'; // Default sort: newest first
// let chart = null;
// let barChart = null;
// let darkMode = localStorage.getItem('darkMode') === 'enabled';

// // API URLs - use the proxy server endpoints to avoid CORS issues
// const API_URLS = {
//     fnolMails: '/api/fnol_mails',
//     nonFnolMails: '/api/non_fnol_mails'
// };

// // Data storage
// let fnolMailsData = [];
// let nonFnolMailsData = [];
// let statsData = {
//     emails_received: 0,
//     incomplete_info_emails: 0,
//     followup_emails_sent: 0,
//     claims_generated: 0,
//     daily_stats: {},
//     last_updated: new Date().toISOString()
// };

// // Initialize dashboard when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Dashboard initializing...');
//     // Initialize AOS animations
//     AOS.init({
//         duration: 800,
//         easing: 'ease-in-out'
//     });
    
//     // Fetch data from APIs
//     loadAllData();
    
//     // Setup event listeners
//     setupEventListeners();
    
//     // Initialize charts
//     initCharts();
// });

// // Function to load all data
// async function loadAllData() {
//     // Show loading indicators
//     showLoading(true);
    
//     // Fetch data from APIs in parallel
//     await Promise.all([
//         fetchFnolMails(),
//         fetchNonFnolMails()
//     ]);
    
//     // Calculate statistics
//     calculateStats();
    
//     // Initial display of mail list
//     loadMailList();
    
//     // Hide loading indicators
//     showLoading(false);
// }

// // Fetch data from APIs
// async function fetchFnolMails() {
//     try {
//         console.log('Fetching FNOL mails from:', API_URLS.fnolMails);
//         const response = await fetch(API_URLS.fnolMails, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//             },
//             mode: 'cors', // Try with cors mode explicitly
//         });
        
//         console.log('FNOL mails response status:', response.status);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log('FNOL mails data received:', data);
        
//         if (Array.isArray(data) && data.length > 0) {
//             fnolMailsData = data;
//             console.log('FNOL mails stored successfully:', fnolMailsData.length, 'items');
//         } else {
//             console.warn('FNOL mails data is empty or not an array', data);
//             // Use mock data as fallback if the API returns empty data
//             fnolMailsData = getMockFnolMails();
//         }
        
//         updateMailCounts();
//         return fnolMailsData;
//     } catch (error) {
//         console.error('Error fetching FNOL mails:', error);
//         // Use mock data as fallback if the API fails
//         console.log('Using mock FNOL mail data as fallback');
//         fnolMailsData = getMockFnolMails();
//         updateMailCounts();
//         return fnolMailsData;
//     }
// }

// async function fetchNonFnolMails() {
//     try {
//         console.log('Fetching non-FNOL mails from:', API_URLS.nonFnolMails);
//         const response = await fetch(API_URLS.nonFnolMails, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//             },
//             mode: 'cors', // Try with cors mode explicitly
//         });
        
//         console.log('Non-FNOL mails response status:', response.status);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log('Non-FNOL mails data received:', data);
        
//         if (Array.isArray(data) && data.length > 0) {
//             nonFnolMailsData = data;
//             console.log('Non-FNOL mails stored successfully:', nonFnolMailsData.length, 'items');
//         } else {
//             console.warn('Non-FNOL mails data is empty or not an array', data);
//             // Use mock data as fallback if the API returns empty data
//             nonFnolMailsData = getMockNonFnolMails();
//         }
        
//         updateMailCounts();
//         return nonFnolMailsData;
//     } catch (error) {
//         console.error('Error fetching non-FNOL mails:', error);
//         // Use mock data as fallback if the API fails
//         console.log('Using mock non-FNOL mail data as fallback');
//         nonFnolMailsData = getMockNonFnolMails();
//         updateMailCounts();
//         return nonFnolMailsData;
//     }
// }

// // Mock data for fallback
// // Use mock data from mock_data.js file
// function getMockFnolMails() {
//     console.log('Using mockFnolMails from external file');
//     // Check if mockFnolMails is defined in the global scope (from mock_data.js)
//     return typeof mockFnolMails !== 'undefined' ? mockFnolMails : [
//         {
//             id: "mock-fnol-fallback",
//             date: "2025-07-07T10:30:00",
//             status: "new",
//             extracted_data: {
//                 email_id: "fallback@example.com",
//                 subject: "FNOL mail (Fallback)",
//                 extracted_data: {
//                     CauseOfLoss: "car accident",
//                     policy_number: "FALLBACK123"
//                 },
//                 body_text: "This is fallback data when mock_data.js is not loaded"
//             }
//         }
//     ];
// }

// function getMockNonFnolMails() {
//     console.log('Using mockNonFnolMails from external file');
//     // Check if mockNonFnolMails is defined in the global scope (from mock_data.js)
//     return typeof mockNonFnolMails !== 'undefined' ? mockNonFnolMails : [
//         {
//             id: "mock-non-fnol-fallback",
//             from: "fallback@example.com",
//             date: "2025-07-07T09:15:00",
//             subject: "Non-FNOL mail (Fallback)",
//             status: "Non FNOL Mail",
//             body: "This is fallback data when mock_data.js is not loaded"
//         }
//     ];
// }

// // Function to calculate overall statistics
// function calculateStats() {
//     // Calculate total emails
//     statsData.emails_received = fnolMailsData.length + nonFnolMailsData.length;
    
//     // Calculate incomplete emails (new status)
//     statsData.incomplete_info_emails = fnolMailsData.filter(mail => mail.status === 'new').length;
    
//     // Update the stats display
//     updateStatsDisplay();
// }

// // Update the statistics display
// function updateStatsDisplay() {
//     document.getElementById('analytics-emails-received').textContent = statsData.emails_received;
//     document.getElementById('analytics-incomplete').textContent = statsData.incomplete_info_emails;
//     document.getElementById('analytics-followups').textContent = statsData.followup_emails_sent;
//     document.getElementById('analytics-claims').textContent = statsData.claims_generated;
    
//     // Update charts if they exist
//     updateCharts();
// }

// // Update mail counts based on fetched data
// function updateMailCounts() {
//     // Update FNOL mail counts
//     document.getElementById('fnol-count').textContent = fnolMailsData.length;
    
//     // Update non-FNOL mail counts
//     document.getElementById('non-fnol-count').textContent = nonFnolMailsData.length;
    
//     // Update follow-up mail counts (placeholder for now)
//     document.getElementById('claims-count').textContent = '0';
    
//     // Update status counts
//     updateStatusCounts();
// }

// function updateStatusCounts() {
//     const allMailsCount = (currentMailType === 'fnol' ? fnolMailsData : nonFnolMailsData).length;
//     document.getElementById('all-mails-count').textContent = allMailsCount;
    
//     const processedMailsCount = (currentMailType === 'fnol' ? 
//         fnolMailsData.filter(mail => mail.status !== 'new').length : 
//         nonFnolMailsData.filter(mail => mail.status !== 'Non FNOL Mail').length);
//     document.getElementById('processed-mails-count').textContent = processedMailsCount;
    
//     const unprocessedMailsCount = (currentMailType === 'fnol' ? 
//         fnolMailsData.filter(mail => mail.status === 'new').length : 
//         nonFnolMailsData.filter(mail => mail.status === 'Non FNOL Mail').length);
//     document.getElementById('unprocessed-mails-count').textContent = unprocessedMailsCount;
// }

// // Function to show/hide loading indicators
// function showLoading(isLoading) {
//     const loaderElements = document.querySelectorAll('.mail-list-loader');
//     loaderElements.forEach(loader => {
//         if (isLoading) {
//             loader.classList.remove('d-none');
//         } else {
//             loader.classList.add('d-none');
//         }
//     });
// }

// // Function to setup event listeners
// function setupEventListeners() {
//     // Card selection
//     document.getElementById('fnol-card').addEventListener('click', () => selectCard('fnol'));
//     document.getElementById('non-fnol-card').addEventListener('click', () => selectCard('non-fnol'));
//     document.getElementById('claims-card').addEventListener('click', () => selectCard('claims'));
    
//     // Mail filter radios
//     document.getElementById('allMailsRadio').addEventListener('click', () => filterMailsByStatus('all'));
//     document.getElementById('processedMailsRadio').addEventListener('click', () => filterMailsByStatus('processed'));
//     document.getElementById('unprocessedMailsRadio').addEventListener('click', () => filterMailsByStatus('unprocessed'));
    
//     // Mail sort dropdown
//     document.getElementById('mailSortSelect').addEventListener('change', (e) => sortMailList(e.target.value));
// }

// // Function to select a card
// function selectCard(cardType) {
//     // Remove active class from all cards
//     document.querySelectorAll('.dashboard-card').forEach(card => {
//         card.classList.remove('active');
//     });
    
//     // Add active class to selected card
//     document.getElementById(`${cardType}-card`).classList.add('active');
    
//     // Update current mail type
//     currentMailType = cardType;
    
//     // Update mail list title
//     const mailListTitle = document.getElementById('mail-list-title');
//     if (cardType === 'fnol') {
//         mailListTitle.textContent = 'FNOL Mails';
//     } else if (cardType === 'non-fnol') {
//         mailListTitle.textContent = 'Non-FNOL Mails';
//     } else {
//         mailListTitle.textContent = 'Follow-up Mails';
//     }
    
//     // Update status counts
//     updateStatusCounts();
    
//     // Load mail list for selected type
//     loadMailList();
    
//     // Clear mail details
//     clearMailDetails();
// }

// // Function to filter mails by status
// function filterMailsByStatus(status) {
//     currentFilterStatus = status;
//     loadMailList();
// }

// // Function to sort mail list
// function sortMailList(sortOption) {
//     currentSortOption = sortOption;
//     loadMailList();
// }

// // Function to sort mails based on option
// function sortMails(mails, sortOption) {
//     const sortedMails = [...mails];
    
//     switch (sortOption) {
//         case 'date-desc':
//             sortedMails.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
//             break;
//         case 'date-asc':
//             sortedMails.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
//             break;
//         case 'subject-asc':
//             sortedMails.sort((a, b) => {
//                 const subjectA = currentMailType === 'fnol' ? 
//                     (a.extracted_data?.subject || '') : (a.subject || '');
//                 const subjectB = currentMailType === 'fnol' ? 
//                     (b.extracted_data?.subject || '') : (b.subject || '');
//                 return subjectA.localeCompare(subjectB);
//             });
//             break;
//         case 'subject-desc':
//             sortedMails.sort((a, b) => {
//                 const subjectA = currentMailType === 'fnol' ? 
//                     (a.extracted_data?.subject || '') : (a.subject || '');
//                 const subjectB = currentMailType === 'fnol' ? 
//                     (b.extracted_data?.subject || '') : (b.subject || '');
//                 return subjectB.localeCompare(subjectA);
//             });
//             break;
//         case 'status-asc':
//             sortedMails.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
//             break;
//     }
    
//     return sortedMails;
// }

// // Function to load mail list based on current selections
// function loadMailList() {
//     console.log('Loading mail list for type:', currentMailType);
//     const mailListElement = document.getElementById('mail-list');
//     mailListElement.innerHTML = '';
    
//     let mailsToDisplay = [];
    
//     // Get appropriate data based on current mail type
//     if (currentMailType === 'fnol') {
//         mailsToDisplay = fnolMailsData;
//         console.log('FNOL mails to display:', mailsToDisplay.length, 'items');
//     } else if (currentMailType === 'non-fnol') {
//         mailsToDisplay = nonFnolMailsData;
//         console.log('Non-FNOL mails to display:', mailsToDisplay.length, 'items');
//     } else {
//         // For the "claims" section, we can implement later
//         mailsToDisplay = [];
//         console.log('Claims section selected, no data to display yet');
//     }
    
//     // Apply status filter if needed
//     if (currentFilterStatus !== 'all') {
//         if (currentMailType === 'fnol') {
//             if (currentFilterStatus === 'processed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'new');
//             } else if (currentFilterStatus === 'unprocessed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'new');
//             }
//         } else if (currentMailType === 'non-fnol') {
//             if (currentFilterStatus === 'processed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'Non FNOL Mail');
//             } else if (currentFilterStatus === 'unprocessed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'Non FNOL Mail');
//             }
//         }
//     }
    
//     // Apply sorting
//     mailsToDisplay = sortMails(mailsToDisplay, currentSortOption);
    
//     // Display the mails
//     if (mailsToDisplay.length === 0) {
//         mailListElement.innerHTML = '<div class="text-center py-4"><p class="text-muted">No mails to display</p></div>';
//     } else {
//         mailsToDisplay.forEach(mail => {
//             const mailItem = document.createElement('div');
//             mailItem.className = 'mail-item';
//             mailItem.setAttribute('data-id', mail.id);
//             mailItem.onclick = () => showMailDetails(mail.id);
            
//             // Format date
//             const mailDate = mail.date !== 'Unknown' && mail.date ? new Date(mail.date) : new Date();
//             const formattedDate = mailDate.toLocaleDateString('en-US', { 
//                 month: 'short', 
//                 day: 'numeric', 
//                 hour: '2-digit', 
//                 minute: '2-digit' 
//             });
            
//             // Get appropriate subject and preview based on mail type
//             let subject, preview, from;
//             if (currentMailType === 'fnol') {
//                 subject = mail.extracted_data?.subject || 'No subject';
//                 preview = mail.extracted_data?.body_text || 'No preview available';
//                 from = mail.extracted_data?.email_id || 'Unknown';
//             } else {
//                 subject = mail.subject || 'No subject';
//                 preview = mail.body || 'No preview available';
//                 from = mail.from || 'Unknown';
//             }
            
//             // Create status badge
//             let statusClass = 'bg-secondary';
//             let statusText = mail.status || 'Unknown';
            
//             if (currentMailType === 'fnol') {
//                 if (mail.status === 'new') {
//                     statusClass = 'bg-warning';
//                     statusText = 'New';
//                 } else if (mail.status === 'processed') {
//                     statusClass = 'bg-success';
//                     statusText = 'Processed';
//                 }
//             } else if (currentMailType === 'non-fnol') {
//                 statusClass = 'bg-info';
//                 statusText = 'Non-FNOL';
//             }
            
//             // Truncate preview text
//             const truncatedPreview = preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
            
//             mailItem.innerHTML = `
//                 <div class="d-flex justify-content-between mb-1">
//                     <span class="mail-subject">${subject}</span>
//                     <span class="badge ${statusClass}">${statusText}</span>
//                 </div>
//                 <div class="mail-preview text-muted">${truncatedPreview}</div>
//                 <div class="d-flex justify-content-between mt-1">
//                     <small class="mail-from">${from}</small>
//                     <small class="mail-date">${formattedDate}</small>
//                 </div>
//             `;
            
//             mailListElement.appendChild(mailItem);
//         });
//     }
// }

// // Function to clear mail details
// function clearMailDetails() {
//     document.getElementById('no-mail-selected').classList.remove('d-none');
//     document.getElementById('mail-data').classList.add('d-none');
//     currentMailId = null;
// }

// // Function to show mail details
// function showMailDetails(mailId) {
//     currentMailId = mailId;
    
//     // Find the mail in the appropriate data source
//     let mailData;
//     if (currentMailType === 'fnol') {
//         mailData = fnolMailsData.find(mail => mail.id === mailId);
//     } else if (currentMailType === 'non-fnol') {
//         mailData = nonFnolMailsData.find(mail => mail.id === mailId);
//     } else {
//         // For future implementation (claims)
//         return;
//     }
    
//     if (!mailData) {
//         console.error('Mail not found with ID:', mailId);
//         return;
//     }
    
//     // Hide the "no mail selected" message
//     document.getElementById('no-mail-selected').classList.add('d-none');
    
//     // Show the mail data container
//     document.getElementById('mail-data').classList.remove('d-none');
    
//     // Populate the mail details based on mail type
//     if (currentMailType === 'fnol') {
//         // FNOL mail format
//         document.getElementById('mail-from').textContent = mailData.extracted_data?.email_id || 'Unknown';
//         document.getElementById('mail-subject').textContent = mailData.extracted_data?.subject || 'No subject';
//         document.getElementById('mail-date').textContent = formatDateTime(mailData.date);
//         document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
//         document.getElementById('mail-policy').textContent = mailData.extracted_data?.extracted_data?.policy_number || 'Not found';
//         document.getElementById('mail-incident-date').textContent = mailData.extracted_data?.extracted_data?.InputLossDate || 'Not specified';
//         document.getElementById('mail-description').textContent = mailData.extracted_data?.body_text || 'No description available';
        
//         // Display extracted info
//         displayExtractedData(mailData.extracted_data?.extracted_data || {});
//     } else {
//         // Non-FNOL mail format
//         document.getElementById('mail-from').textContent = mailData.from || 'Unknown';
//         document.getElementById('mail-subject').textContent = mailData.subject || 'No subject';
//         document.getElementById('mail-date').textContent = mailData.date !== 'Unknown' ? formatDateTime(mailData.date) : 'Unknown';
//         document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
//         document.getElementById('mail-policy').textContent = 'N/A';
//         document.getElementById('mail-incident-date').textContent = 'N/A';
//         document.getElementById('mail-description').textContent = mailData.body || 'No description available';
        
//         // Clear extracted info for non-FNOL mails
//         displayExtractedData({});
//     }
    
//     // Update mail detail title
//     document.getElementById('mail-detail-title').textContent = `Mail Details - ${currentMailType === 'fnol' ? 'FNOL Mail' : 'Non-FNOL Mail'}`;
// }

// // Function to display extracted data
// function displayExtractedData(extractedData) {
//     const extractedDataContainer = document.getElementById('extracted-data-cards');
//     extractedDataContainer.innerHTML = '';
    
//     if (!extractedData || Object.keys(extractedData).length === 0) {
//         extractedDataContainer.innerHTML = '<div class="col-12"><p class="text-muted">No extracted data available</p></div>';
//         return;
//     }
    
//     // Sort keys alphabetically
//     const sortedKeys = Object.keys(extractedData).sort();
    
//     sortedKeys.forEach(key => {
//         const value = extractedData[key];
//         if (value !== null && value !== undefined && value !== '') {
//             const card = document.createElement('div');
//             card.className = 'col';
//             card.innerHTML = `
//                 <div class="data-card">
//                     <div class="data-field">${formatLabel(key)}</div>
//                     <div class="data-value">${value}</div>
//                 </div>
//             `;
//             extractedDataContainer.appendChild(card);
//         }
//     });
// }

// // Helper function to format date and time
// function formatDateTime(dateString) {
//     if (!dateString || dateString === 'Unknown') return 'Unknown';
    
//     try {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     } catch (e) {
//         return dateString;
//     }
// }

// // Helper function to format field labels
// function formatLabel(key) {
//     if (!key) return '';
    
//     // Split camelCase or PascalCase into separate words
//     const words = key.replace(/([a-z])([A-Z])/g, '$1 $2')
//         .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    
//     // Capitalize first letter of each word
//     return words.split(/[ _]/).map(word => 
//         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//     ).join(' ');
// }

// // Function to refresh mail list
// function refreshMailList() {
//     showLoading(true);
    
//     // Fetch fresh data
//     if (currentMailType === 'fnol') {
//         fetchFnolMails().then(() => {
//             loadMailList();
//             showLoading(false);
//         });
//     } else if (currentMailType === 'non-fnol') {
//         fetchNonFnolMails().then(() => {
//             loadMailList();
//             showLoading(false);
//         });
//     } else {
//         showLoading(false);
//     }
// }

// // Function to process email (placeholder)
// function processEmail(mailId) {
//     alert(`Processing email with ID: ${mailId}`);
// }

// // Function to generate claim (placeholder)
// function generateClaim(mailId) {
//     alert(`Generating claim for email with ID: ${mailId}`);
// }

// // Function to request more info (placeholder)
// function requestMoreInfo(mailId) {
//     alert(`Requesting more information for email with ID: ${mailId}`);
// }

// // Function to initialize charts
// function initCharts() {
//     // Trend chart
//     const trendChartCtx = document.getElementById('trendChart');
//     if (trendChartCtx) {
//         chart = new Chart(trendChartCtx, {
//             type: 'line',
//             data: {
//                 labels: ['Jul 1', 'Jul 2', 'Jul 3', 'Jul 4', 'Jul 5', 'Jul 6', 'Jul 7'],
//                 datasets: [
//                     {
//                         label: 'Emails Received',
//                         data: [8, 12, 15, 10, 8, 5, 20],
//                         borderColor: '#0d6efd',
//                         backgroundColor: 'rgba(13, 110, 253, 0.1)',
//                         borderWidth: 2,
//                         tension: 0.4,
//                         fill: true
//                     },
//                     {
//                         label: 'Claims Generated',
//                         data: [0, 1, 0, 2, 0, 0, 1],
//                         borderColor: '#198754',
//                         backgroundColor: 'rgba(25, 135, 84, 0.1)',
//                         borderWidth: 2,
//                         tension: 0.4,
//                         fill: true
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'top'
//                     },
//                     tooltip: {
//                         mode: 'index',
//                         intersect: false
//                     }
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             precision: 0
//                         }
//                     }
//                 }
//             }
//         });
//     }
    
//     // Incident bar chart
//     const incidentBarChartCtx = document.getElementById('incidentBarChart');
//     if (incidentBarChartCtx) {
//         barChart = new Chart(incidentBarChartCtx, {
//             type: 'bar',
//             data: {
//                 labels: ['Car Accident', 'Property Damage', 'Theft', 'Water Damage', 'Fire', 'Other'],
//                 datasets: [
//                     {
//                         label: 'Incidents by Type',
//                         data: [25, 15, 8, 5, 3, 7],
//                         backgroundColor: [
//                             'rgba(13, 110, 253, 0.8)',
//                             'rgba(220, 53, 69, 0.8)',
//                             'rgba(255, 193, 7, 0.8)',
//                             'rgba(13, 202, 240, 0.8)',
//                             'rgba(255, 128, 0, 0.8)',
//                             'rgba(108, 117, 125, 0.8)'
//                         ],
//                         borderColor: [
//                             'rgba(13, 110, 253, 1)',
//                             'rgba(220, 53, 69, 1)',
//                             'rgba(255, 193, 7, 1)',
//                             'rgba(13, 202, 240, 1)',
//                             'rgba(255, 128, 0, 1)',
//                             'rgba(108, 117, 125, 1)'
//                         ],
//                         borderWidth: 1
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             precision: 0
//                         }
//                     }
//                 },
//                 plugins: {
//                     legend: {
//                         display: false
//                     }
//                 }
//             }
//         });
//     }
// }

// // Function to update charts
// function updateCharts() {
//     if (chart) {
//         // Update chart data if needed
//     }
    
//     if (barChart) {
//         // Update bar chart data if needed
//     }
// }

// // Function to refresh stats
// function refreshStats() {
//     calculateStats();
// }

// // This function updates the theme based on the dark mode setting
// function updateTheme() {
//     if (darkMode) {
//         document.body.classList.add('dark-mode');
//     } else {
//         document.body.classList.remove('dark-mode');
//     }
    
//     // Update charts if they exist
//     updateCharts();
// }
// Global variables
let currentMailType = 'fnol';
let currentMailId = null;
let currentFilterStatus = 'all';
let currentSortOption = 'date-desc'; // Default sort: newest first
let chart = null;
// let barChart = null;
// let darkMode = localStorage.getItem('darkMode') === 'enabled';

// // API URLs - use the proxy server endpoints to avoid CORS issues
// const API_URLS = {
//     fnolMails: '/api/fnol_mails',
//     nonFnolMails: '/api/non_fnol_mails'
// };

// // Data storage
// let fnolMailsData = [];
// let nonFnolMailsData = [];
// let statsData = {
//     emails_received: 0,
//     incomplete_info_emails: 0,
//     followup_emails_sent: 0,
//     claims_generated: 0,
//     daily_stats: {},
//     last_updated: new Date().toISOString()
// };

// // Initialize dashboard when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Dashboard initializing...');
//     // Initialize AOS animations
//     AOS.init({
//         duration: 800,
//         easing: 'ease-in-out'
//     });
    
//     // Fetch data from APIs
//     loadAllData();
    
//     // Setup event listeners
//     setupEventListeners();
    
//     // Initialize charts
//     initCharts();
// });

// // Function to load all data
// async function loadAllData() {
//     // Show loading indicators
//     showLoading(true);
    
//     // Fetch data from APIs in parallel
//     await Promise.all([
//         fetchFnolMails(),
//         fetchNonFnolMails()
//     ]);
    
//     // Calculate statistics
//     calculateStats();
    
//     // Initial display of mail list
//     loadMailList();
    
//     // Hide loading indicators
//     showLoading(false);
// }

// // Fetch data from APIs
// async function fetchFnolMails() {
//     try {
//         console.log('Fetching FNOL mails from:', API_URLS.fnolMails);
//         const response = await fetch(API_URLS.fnolMails, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//             },
//             mode: 'cors', // Try with cors mode explicitly
//         });
        
//         console.log('FNOL mails response status:', response.status);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log('FNOL mails data received:', data);
        
//         if (Array.isArray(data) && data.length > 0) {
//             fnolMailsData = data;
//             console.log('FNOL mails stored successfully:', fnolMailsData.length, 'items');
//         } else {
//             console.warn('FNOL mails data is empty or not an array', data);
//             // Use mock data as fallback if the API returns empty data
//             fnolMailsData = getMockFnolMails();
//         }
        
//         updateMailCounts();
//         return fnolMailsData;
//     } catch (error) {
//         console.error('Error fetching FNOL mails:', error);
//         // Use mock data as fallback if the API fails
//         console.log('Using mock FNOL mail data as fallback');
//         fnolMailsData = getMockFnolMails();
//         updateMailCounts();
//         return fnolMailsData;
//     }
// }

// async function fetchNonFnolMails() {
//     try {
//         console.log('Fetching non-FNOL mails from:', API_URLS.nonFnolMails);
//         const response = await fetch(API_URLS.nonFnolMails, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//             },
//             mode: 'cors', // Try with cors mode explicitly
//         });
        
//         console.log('Non-FNOL mails response status:', response.status);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         console.log('Non-FNOL mails data received:', data);
        
//         if (Array.isArray(data) && data.length > 0) {
//             nonFnolMailsData = data;
//             console.log('Non-FNOL mails stored successfully:', nonFnolMailsData.length, 'items');
//         } else {
//             console.warn('Non-FNOL mails data is empty or not an array', data);
//             // Use mock data as fallback if the API returns empty data
//             nonFnolMailsData = getMockNonFnolMails();
//         }
        
//         updateMailCounts();
//         return nonFnolMailsData;
//     } catch (error) {
//         console.error('Error fetching non-FNOL mails:', error);
//         // Use mock data as fallback if the API fails
//         console.log('Using mock non-FNOL mail data as fallback');
//         nonFnolMailsData = getMockNonFnolMails();
//         updateMailCounts();
//         return nonFnolMailsData;
//     }
// }

// // Mock data for fallback
// // Use mock data from mock_data.js file
// function getMockFnolMails() {
//     console.log('Using mockFnolMails from external file');
//     // Check if mockFnolMails is defined in the global scope (from mock_data.js)
//     return typeof mockFnolMails !== 'undefined' ? mockFnolMails : [
//         {
//             id: "mock-fnol-fallback",
//             date: "2025-07-07T10:30:00",
//             status: "new",
//             extracted_data: {
//                 email_id: "fallback@example.com",
//                 subject: "FNOL mail (Fallback)",
//                 extracted_data: {
//                     CauseOfLoss: "car accident",
//                     policy_number: "FALLBACK123"
//                 },
//                 body_text: "This is fallback data when mock_data.js is not loaded"
//             }
//         }
//     ];
// }

// function getMockNonFnolMails() {
//     console.log('Using mockNonFnolMails from external file');
//     // Check if mockNonFnolMails is defined in the global scope (from mock_data.js)
//     return typeof mockNonFnolMails !== 'undefined' ? mockNonFnolMails : [
//         {
//             id: "mock-non-fnol-fallback",
//             from: "fallback@example.com",
//             date: "2025-07-07T09:15:00",
//             subject: "Non-FNOL mail (Fallback)",
//             status: "Non FNOL Mail",
//             body: "This is fallback data when mock_data.js is not loaded"
//         }
//     ];
// }

// // Function to calculate overall statistics
// function calculateStats() {
//     // Calculate total emails
//     statsData.emails_received = fnolMailsData.length + nonFnolMailsData.length;
    
//     // Calculate incomplete emails (new status)
//     statsData.incomplete_info_emails = fnolMailsData.filter(mail => mail.status === 'new').length;
    
//     // Update the stats display
//     updateStatsDisplay();
// }

// // Update the statistics display
// function updateStatsDisplay() {
//     document.getElementById('analytics-emails-received').textContent = statsData.emails_received;
//     document.getElementById('analytics-incomplete').textContent = statsData.incomplete_info_emails;
//     document.getElementById('analytics-followups').textContent = statsData.followup_emails_sent;
//     document.getElementById('analytics-claims').textContent = statsData.claims_generated;
    
//     // Update charts if they exist
//     updateCharts();
// }

// // Update mail counts based on fetched data
// function updateMailCounts() {
//     // Update FNOL mail counts
//     document.getElementById('fnol-count').textContent = fnolMailsData.length;
    
//     // Update non-FNOL mail counts
//     document.getElementById('non-fnol-count').textContent = nonFnolMailsData.length;
    
//     // Update follow-up mail counts (placeholder for now)
//     document.getElementById('claims-count').textContent = '0';
    
//     // Update status counts
//     updateStatusCounts();
// }

// function updateStatusCounts() {
//     const allMailsCount = (currentMailType === 'fnol' ? fnolMailsData : nonFnolMailsData).length;
//     document.getElementById('all-mails-count').textContent = allMailsCount;
    
//     const processedMailsCount = (currentMailType === 'fnol' ? 
//         fnolMailsData.filter(mail => mail.status !== 'new').length : 
//         nonFnolMailsData.filter(mail => mail.status !== 'Non FNOL Mail').length);
//     document.getElementById('processed-mails-count').textContent = processedMailsCount;
    
//     const unprocessedMailsCount = (currentMailType === 'fnol' ? 
//         fnolMailsData.filter(mail => mail.status === 'new').length : 
//         nonFnolMailsData.filter(mail => mail.status === 'Non FNOL Mail').length);
//     document.getElementById('unprocessed-mails-count').textContent = unprocessedMailsCount;
// }

// // Function to show/hide loading indicators
// function showLoading(isLoading) {
//     const loaderElements = document.querySelectorAll('.mail-list-loader');
//     loaderElements.forEach(loader => {
//         if (isLoading) {
//             loader.classList.remove('d-none');
//         } else {
//             loader.classList.add('d-none');
//         }
//     });
// }

// // Function to setup event listeners
// function setupEventListeners() {
//     // Card selection
//     document.getElementById('fnol-card').addEventListener('click', () => selectCard('fnol'));
//     document.getElementById('non-fnol-card').addEventListener('click', () => selectCard('non-fnol'));
//     document.getElementById('claims-card').addEventListener('click', () => selectCard('claims'));
    
//     // Mail filter radios
//     document.getElementById('allMailsRadio').addEventListener('click', () => filterMailsByStatus('all'));
//     document.getElementById('processedMailsRadio').addEventListener('click', () => filterMailsByStatus('processed'));
//     document.getElementById('unprocessedMailsRadio').addEventListener('click', () => filterMailsByStatus('unprocessed'));
    
//     // Mail sort dropdown
//     document.getElementById('mailSortSelect').addEventListener('change', (e) => sortMailList(e.target.value));
// }

// // Function to select a card
// function selectCard(cardType) {
//     // Remove active class from all cards
//     document.querySelectorAll('.dashboard-card').forEach(card => {
//         card.classList.remove('active');
//     });
    
//     // Add active class to selected card
//     document.getElementById(`${cardType}-card`).classList.add('active');
    
//     // Update current mail type
//     currentMailType = cardType;
    
//     // Update mail list title
//     const mailListTitle = document.getElementById('mail-list-title');
//     if (cardType === 'fnol') {
//         mailListTitle.textContent = 'FNOL Mails';
//     } else if (cardType === 'non-fnol') {
//         mailListTitle.textContent = 'Non-FNOL Mails';
//     } else {
//         mailListTitle.textContent = 'Follow-up Mails';
//     }
    
//     // Update status counts
//     updateStatusCounts();
    
//     // Load mail list for selected type
//     loadMailList();
    
//     // Clear mail details
//     clearMailDetails();
// }

// // Function to filter mails by status
// function filterMailsByStatus(status) {
//     currentFilterStatus = status;
//     loadMailList();
// }

// // Function to sort mail list
// function sortMailList(sortOption) {
//     currentSortOption = sortOption;
//     loadMailList();
// }

// // Function to sort mails based on option
// function sortMails(mails, sortOption) {
//     const sortedMails = [...mails];
    
//     switch (sortOption) {
//         case 'date-desc':
//             sortedMails.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
//             break;
//         case 'date-asc':
//             sortedMails.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
//             break;
//         case 'subject-asc':
//             sortedMails.sort((a, b) => {
//                 const subjectA = currentMailType === 'fnol' ? 
//                     (a.extracted_data?.subject || '') : (a.subject || '');
//                 const subjectB = currentMailType === 'fnol' ? 
//                     (b.extracted_data?.subject || '') : (b.subject || '');
//                 return subjectA.localeCompare(subjectB);
//             });
//             break;
//         case 'subject-desc':
//             sortedMails.sort((a, b) => {
//                 const subjectA = currentMailType === 'fnol' ? 
//                     (a.extracted_data?.subject || '') : (a.subject || '');
//                 const subjectB = currentMailType === 'fnol' ? 
//                     (b.extracted_data?.subject || '') : (b.subject || '');
//                 return subjectB.localeCompare(subjectA);
//             });
//             break;
//         case 'status-asc':
//             sortedMails.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
//             break;
//     }
    
//     return sortedMails;
// }

// // Function to load mail list based on current selections
// function loadMailList() {
//     console.log('Loading mail list for type:', currentMailType);
//     const mailListElement = document.getElementById('mail-list');
//     mailListElement.innerHTML = '';
    
//     let mailsToDisplay = [];
    
//     // Get appropriate data based on current mail type
//     if (currentMailType === 'fnol') {
//         mailsToDisplay = fnolMailsData;
//         console.log('FNOL mails to display:', mailsToDisplay.length, 'items');
//     } else if (currentMailType === 'non-fnol') {
//         mailsToDisplay = nonFnolMailsData;
//         console.log('Non-FNOL mails to display:', mailsToDisplay.length, 'items');
//     } else {
//         // For the "claims" section, we can implement later
//         mailsToDisplay = [];
//         console.log('Claims section selected, no data to display yet');
//     }
    
//     // Apply status filter if needed
//     if (currentFilterStatus !== 'all') {
//         if (currentMailType === 'fnol') {
//             if (currentFilterStatus === 'processed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'new');
//             } else if (currentFilterStatus === 'unprocessed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'new');
//             }
//         } else if (currentMailType === 'non-fnol') {
//             if (currentFilterStatus === 'processed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'Non FNOL Mail');
//             } else if (currentFilterStatus === 'unprocessed') {
//                 mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'Non FNOL Mail');
//             }
//         }
//     }
    
//     // Apply sorting
//     mailsToDisplay = sortMails(mailsToDisplay, currentSortOption);
    
//     // Display the mails
//     if (mailsToDisplay.length === 0) {
//         mailListElement.innerHTML = '<div class="text-center py-4"><p class="text-muted">No mails to display</p></div>';
//     } else {
//         mailsToDisplay.forEach(mail => {
//             const mailItem = document.createElement('div');
//             mailItem.className = 'mail-item';
//             mailItem.setAttribute('data-id', mail.id);
//             mailItem.onclick = () => showMailDetails(mail.id);
            
//             // Format date
//             const mailDate = mail.date !== 'Unknown' && mail.date ? new Date(mail.date) : new Date();
//             const formattedDate = mailDate.toLocaleDateString('en-US', { 
//                 month: 'short', 
//                 day: 'numeric', 
//                 hour: '2-digit', 
//                 minute: '2-digit' 
//             });
            
//             // Get appropriate subject and preview based on mail type
//             let subject, preview, from;
//             if (currentMailType === 'fnol') {
//                 subject = mail.extracted_data?.subject || 'No subject';
//                 preview = mail.extracted_data?.body_text || 'No preview available';
//                 from = mail.extracted_data?.email_id || 'Unknown';
//             } else {
//                 subject = mail.subject || 'No subject';
//                 preview = mail.body || 'No preview available';
//                 from = mail.from || 'Unknown';
//             }
            
//             // Create status badge
//             let statusClass = 'bg-secondary';
//             let statusText = mail.status || 'Unknown';
            
//             if (currentMailType === 'fnol') {
//                 if (mail.status === 'new') {
//                     statusClass = 'bg-warning';
//                     statusText = 'New';
//                 } else if (mail.status === 'processed') {
//                     statusClass = 'bg-success';
//                     statusText = 'Processed';
//                 }
//             } else if (currentMailType === 'non-fnol') {
//                 statusClass = 'bg-info';
//                 statusText = 'Non-FNOL';
//             }
            
//             // Truncate preview text
//             const truncatedPreview = preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
            
//             mailItem.innerHTML = `
//                 <div class="d-flex justify-content-between mb-1">
//                     <span class="mail-subject">${subject}</span>
//                     <span class="badge ${statusClass}">${statusText}</span>
//                 </div>
//                 <div class="mail-preview text-muted">${truncatedPreview}</div>
//                 <div class="d-flex justify-content-between mt-1">
//                     <small class="mail-from">${from}</small>
//                     <small class="mail-date">${formattedDate}</small>
//                 </div>
//             `;
            
//             mailListElement.appendChild(mailItem);
//         });
//     }
// }

// // Function to clear mail details
// function clearMailDetails() {
//     document.getElementById('no-mail-selected').classList.remove('d-none');
//     document.getElementById('mail-data').classList.add('d-none');
//     currentMailId = null;
// }

// // Function to show mail details
// function showMailDetails(mailId) {
//     currentMailId = mailId;
    
//     // Find the mail in the appropriate data source
//     let mailData;
//     if (currentMailType === 'fnol') {
//         mailData = fnolMailsData.find(mail => mail.id === mailId);
//     } else if (currentMailType === 'non-fnol') {
//         mailData = nonFnolMailsData.find(mail => mail.id === mailId);
//     } else {
//         // For future implementation (claims)
//         return;
//     }
    
//     if (!mailData) {
//         console.error('Mail not found with ID:', mailId);
//         return;
//     }
    
//     // Hide the "no mail selected" message
//     document.getElementById('no-mail-selected').classList.add('d-none');
    
//     // Show the mail data container
//     document.getElementById('mail-data').classList.remove('d-none');
    
//     // Populate the mail details based on mail type
//     if (currentMailType === 'fnol') {
//         // FNOL mail format
//         document.getElementById('mail-from').textContent = mailData.extracted_data?.email_id || 'Unknown';
//         document.getElementById('mail-subject').textContent = mailData.extracted_data?.subject || 'No subject';
//         document.getElementById('mail-date').textContent = formatDateTime(mailData.date);
//         document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
//         document.getElementById('mail-policy').textContent = mailData.extracted_data?.extracted_data?.policy_number || 'Not found';
//         document.getElementById('mail-incident-date').textContent = mailData.extracted_data?.extracted_data?.InputLossDate || 'Not specified';
//         document.getElementById('mail-description').textContent = mailData.extracted_data?.body_text || 'No description available';
        
//         // Display extracted info
//         displayExtractedData(mailData.extracted_data?.extracted_data || {});
//     } else {
//         // Non-FNOL mail format
//         document.getElementById('mail-from').textContent = mailData.from || 'Unknown';
//         document.getElementById('mail-subject').textContent = mailData.subject || 'No subject';
//         document.getElementById('mail-date').textContent = mailData.date !== 'Unknown' ? formatDateTime(mailData.date) : 'Unknown';
//         document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
//         document.getElementById('mail-policy').textContent = 'N/A';
//         document.getElementById('mail-incident-date').textContent = 'N/A';
//         document.getElementById('mail-description').textContent = mailData.body || 'No description available';
        
//         // Clear extracted info for non-FNOL mails
//         displayExtractedData({});
//     }
    
//     // Update mail detail title
//     document.getElementById('mail-detail-title').textContent = `Mail Details - ${currentMailType === 'fnol' ? 'FNOL Mail' : 'Non-FNOL Mail'}`;
// }

// // Function to display extracted data
// function displayExtractedData(extractedData) {
//     const extractedDataContainer = document.getElementById('extracted-data-cards');
//     extractedDataContainer.innerHTML = '';
    
//     if (!extractedData || Object.keys(extractedData).length === 0) {
//         extractedDataContainer.innerHTML = '<div class="col-12"><p class="text-muted">No extracted data available</p></div>';
//         return;
//     }
    
//     // Sort keys alphabetically
//     const sortedKeys = Object.keys(extractedData).sort();
    
//     sortedKeys.forEach(key => {
//         const value = extractedData[key];
//         if (value !== null && value !== undefined && value !== '') {
//             const card = document.createElement('div');
//             card.className = 'col';
//             card.innerHTML = `
//                 <div class="data-card">
//                     <div class="data-field">${formatLabel(key)}</div>
//                     <div class="data-value">${value}</div>
//                 </div>
//             `;
//             extractedDataContainer.appendChild(card);
//         }
//     });
// }

// // Helper function to format date and time
// function formatDateTime(dateString) {
//     if (!dateString || dateString === 'Unknown') return 'Unknown';
    
//     try {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     } catch (e) {
//         return dateString;
//     }
// }

// // Helper function to format field labels
// function formatLabel(key) {
//     if (!key) return '';
    
//     // Split camelCase or PascalCase into separate words
//     const words = key.replace(/([a-z])([A-Z])/g, '$1 $2')
//         .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    
//     // Capitalize first letter of each word
//     return words.split(/[ _]/).map(word => 
//         word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//     ).join(' ');
// }

// // Function to refresh mail list
// function refreshMailList() {
//     showLoading(true);
    
//     // Fetch fresh data
//     if (currentMailType === 'fnol') {
//         fetchFnolMails().then(() => {
//             loadMailList();
//             showLoading(false);
//         });
//     } else if (currentMailType === 'non-fnol') {
//         fetchNonFnolMails().then(() => {
//             loadMailList();
//             showLoading(false);
//         });
//     } else {
//         showLoading(false);
//     }
// }

// // Function to process email (placeholder)
// function processEmail(mailId) {
//     alert(`Processing email with ID: ${mailId}`);
// }

// // Function to generate claim (placeholder)
// function generateClaim(mailId) {
//     alert(`Generating claim for email with ID: ${mailId}`);
// }

// // Function to request more info (placeholder)
// function requestMoreInfo(mailId) {
//     alert(`Requesting more information for email with ID: ${mailId}`);
// }

// // Function to initialize charts
// function initCharts() {
//     // Trend chart
//     const trendChartCtx = document.getElementById('trendChart');
//     if (trendChartCtx) {
//         chart = new Chart(trendChartCtx, {
//             type: 'line',
//             data: {
//                 labels: ['Jul 1', 'Jul 2', 'Jul 3', 'Jul 4', 'Jul 5', 'Jul 6', 'Jul 7'],
//                 datasets: [
//                     {
//                         label: 'Emails Received',
//                         data: [8, 12, 15, 10, 8, 5, 20],
//                         borderColor: '#0d6efd',
//                         backgroundColor: 'rgba(13, 110, 253, 0.1)',
//                         borderWidth: 2,
//                         tension: 0.4,
//                         fill: true
//                     },
//                     {
//                         label: 'Claims Generated',
//                         data: [0, 1, 0, 2, 0, 0, 1],
//                         borderColor: '#198754',
//                         backgroundColor: 'rgba(25, 135, 84, 0.1)',
//                         borderWidth: 2,
//                         tension: 0.4,
//                         fill: true
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'top'
//                     },
//                     tooltip: {
//                         mode: 'index',
//                         intersect: false
//                     }
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             precision: 0
//                         }
//                     }
//                 }
//             }
//         });
//     }
    
//     // Incident bar chart
//     const incidentBarChartCtx = document.getElementById('incidentBarChart');
//     if (incidentBarChartCtx) {
//         barChart = new Chart(incidentBarChartCtx, {
//             type: 'bar',
//             data: {
//                 labels: ['Car Accident', 'Property Damage', 'Theft', 'Water Damage', 'Fire', 'Other'],
//                 datasets: [
//                     {
//                         label: 'Incidents by Type',
//                         data: [25, 15, 8, 5, 3, 7],
//                         backgroundColor: [
//                             'rgba(13, 110, 253, 0.8)',
//                             'rgba(220, 53, 69, 0.8)',
//                             'rgba(255, 193, 7, 0.8)',
//                             'rgba(13, 202, 240, 0.8)',
//                             'rgba(255, 128, 0, 0.8)',
//                             'rgba(108, 117, 125, 0.8)'
//                         ],
//                         borderColor: [
//                             'rgba(13, 110, 253, 1)',
//                             'rgba(220, 53, 69, 1)',
//                             'rgba(255, 193, 7, 1)',
//                             'rgba(13, 202, 240, 1)',
//                             'rgba(255, 128, 0, 1)',
//                             'rgba(108, 117, 125, 1)'
//                         ],
//                         borderWidth: 1
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             precision: 0
//                         }
//                     }
//                 },
//                 plugins: {
//                     legend: {
//                         display: false
//                     }
//                 }
//             }
//         });
//     }
// }

// // Function to update charts
// function updateCharts() {
//     if (chart) {
//         // Update chart data if needed
//     }
    
//     if (barChart) {
//         // Update bar chart data if needed
//     }
// }

// // Function to refresh stats
// function refreshStats() {
//     calculateStats();
// }

// // This function updates the theme based on the dark mode setting
// function updateTheme() {
//     if (darkMode) {
//         document.body.classList.add('dark-mode');
//     } else {
//         document.body.classList.remove('dark-mode');
//     }
    
//     // Update charts if they exist
//     updateCharts();
// }




let barChart = null;
let darkMode = localStorage.getItem('darkMode') === 'enabled';

// Remove mock data toggle functionality
localStorage.removeItem('useMockData'); // Clear any existing setting

// API URLs - always use direct URLs to the API server
const API_URLS = {
    fnolMails: 'http://127.0.0.1:8000/FNOL_mails',
    nonFnolMails: 'http://127.0.0.1:8000/non_FNOL_mails'
};

// Data storage
let fnolMailsData = [];
let nonFnolMailsData = [];
let statsData = {
    emails_received: 0,
    incomplete_info_emails: 0,
    followup_emails_sent: 0,
    claims_generated: 0,
    daily_stats: {},
    last_updated: new Date().toISOString()
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    console.log('Current settings:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        API_URLs: API_URLS
    });
    
    // Remove mock data toggle from UI
    const mockDataToggle = document.getElementById('useMockDataToggle');
    if (mockDataToggle) {
        const toggleParent = mockDataToggle.closest('.form-check');
        if (toggleParent) {
            toggleParent.style.display = 'none';
        }
    }
    
    // Add refresh button handler
    const refreshButton = document.getElementById('refreshAllData');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadAllData();
        });
    }
    
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out'
    });
    
    // Fetch data from APIs
    loadAllData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
});

// Function to load all data
async function loadAllData() {
    // Show loading indicators
    showLoading(true);
    
    // Update API endpoint info display
    updateApiEndpointInfo();
    
    // Fetch data from APIs in parallel
    await Promise.all([
        fetchFnolMails(),
        fetchNonFnolMails()
    ]);
    
    // Calculate statistics
    calculateStats();
    
    // Initial display of mail list
    loadMailList();
    
    // Hide loading indicators
    showLoading(false);
}

// Function to update API endpoint info
function updateApiEndpointInfo() {
    const dataSourceInfo = document.getElementById('dataSourceInfo');
    if (dataSourceInfo) {
        dataSourceInfo.innerHTML = `
            <strong>API Endpoints:</strong>
            <ul class="mb-0 mt-1">
                <li>FNOL Mails: ${API_URLS.fnolMails}</li>
                <li>Non-FNOL Mails: ${API_URLS.nonFnolMails}</li>
            </ul>
            <button class="btn btn-sm btn-outline-primary ms-2" onclick="loadAllData()">
                <i class="fas fa-sync-alt"></i> Refresh Data
            </button>
        `;
        dataSourceInfo.style.display = 'block';
    }
}

// Fetch data from APIs
async function fetchFnolMails() {
    try {
        // Create a status message element to show the user what's happening
        const mailListElement = document.getElementById('mail-list');
        if (mailListElement) {
            mailListElement.innerHTML = `
                <div class="alert alert-info">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-2">Attempting to fetch FNOL mails from ${API_URLS.fnolMails}...</span>
                </div>
            `;
        }
        
        console.log('Fetching FNOL mails from:', API_URLS.fnolMails);
        
        // Set a timeout to avoid hanging the page if API is not reachable
        const fetchPromise = fetch(API_URLS.fnolMails, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors', // Explicitly request CORS mode
            cache: 'no-cache' // Don't cache results
        });
        
        // Create a timeout promise that rejects after 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out after 5 seconds')), 5000);
        });
        
        // Race the fetch against the timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('FNOL mails response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('FNOL mails data received:', data);
        
        if (Array.isArray(data) && data.length > 0) {
            fnolMailsData = data;
            console.log('FNOL mails stored successfully:', fnolMailsData.length, 'items');
            
            // Clear any status messages
            if (mailListElement) {
                mailListElement.innerHTML = '';
            }
            
            // Show success message briefly
            if (mailListElement) {
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success';
                successAlert.innerHTML = `Successfully loaded ${data.length} FNOL mails from API`;
                mailListElement.appendChild(successAlert);
                
                // Remove after 2 seconds
                setTimeout(() => {
                    if (successAlert.parentNode === mailListElement) {
                        mailListElement.removeChild(successAlert);
                    }
                    loadMailList(); // Reload the mail list
                }, 2000);
            }
        } else {
            console.warn('FNOL mails data is empty or not an array', data);
            // Show error about empty data
            fnolMailsData = []; // Empty array instead of mock data
            
            // Show error about empty data
            if (mailListElement) {
                mailListElement.innerHTML = `
                    <div class="alert alert-warning">
                        <strong>No FNOL mail data available.</strong>
                        <p>The API returned an empty dataset. There might not be any FNOL mails in the system.</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="refreshMailList()">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
        
        updateMailCounts();
        return fnolMailsData;
    } catch (error) {
        console.error('Error fetching FNOL mails:', error);
        fnolMailsData = []; // Empty array instead of mock data
        updateMailCounts();
        
        // Detect if this is likely a CORS issue from opening the file directly
        const isCORSIssue = error.message.includes('CORS') || 
                          error.message.includes('Cross-Origin') || 
                          error.message.includes('blocked by CORS policy') ||
                          (window.location.protocol === 'file:');
        
        // Show detailed error message to the user
        const mailListElement = document.getElementById('mail-list');
        if (mailListElement) {
            if (isCORSIssue) {
                mailListElement.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>Cannot access API due to browser security restrictions</strong>
                        <hr>
                        <p>When opening an HTML file directly in a browser (using file:// protocol), 
                        browsers block API requests to protect your security.</p>
                        <h5>To fix this issue, use one of these methods:</h5>
                        <div class="mt-3">
                            <h6>Option 1: Run the API and proxy server</h6>
                            <ol>
                                <li>Open PowerShell or Command Prompt</li>
                                <li>Navigate to your project folder: <code>cd "d:\\Projects\\FNOL Updated\\FNOL\\tracing"</code></li>
                                <li>Run the API server: <code>python api.py</code></li>
                                <li>Open another PowerShell/Command Prompt</li>
                                <li>Navigate to: <code>cd "d:\\Projects\\FNOL Updated\\frontend"</code></li>
                                <li>Run the proxy server: <code>python server.py</code></li>
                                <li>Open <a href="http://localhost:8080/dashboard.html" target="_blank">http://localhost:8080/dashboard.html</a></li>
                            </ol>
                        </div>
                        <div class="mt-3">
                            <h6>Option 2: Use a web server extension</h6>
                            <ol>
                                <li>Install a browser extension like "Web Server for Chrome" or "Live Server" for VS Code</li>
                                <li>Use it to serve your frontend folder</li>
                                <li>Make sure the API server is running as in Option 1</li>
                            </ol>
                        </div>
                        <button class="btn btn-primary mt-2" onclick="refreshMailList()">
                            <i class="fas fa-sync-alt"></i> Try Again
                        </button>
                    </div>
                `;
            } else {
                mailListElement.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>Error fetching data from API:</strong> ${error.message}
                        <hr>
                        <p>This could be due to:</p>
                        <ul>
                            <li>The API server is not running at ${API_URLS.fnolMails}</li>
                            <li>Network connection issues</li>
                            <li>Request timed out</li>
                        </ul>
                        <p>To fix this issue:</p>
                        <ol>
                            <li>Open PowerShell or Command Prompt</li>
                            <li>Navigate to your project folder: <code>cd "d:\\Projects\\FNOL Updated\\FNOL\\tracing"</code></li>
                            <li>Run the API server: <code>python api.py</code></li>
                        </ol>
                        <button class="btn btn-primary mt-2" onclick="refreshMailList()">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
        
        return fnolMailsData;
    }
}

async function fetchNonFnolMails() {
    try {
        console.log('Fetching non-FNOL mails from:', API_URLS.nonFnolMails);
        
        // Set a timeout to avoid hanging the page if API is not reachable
        const fetchPromise = fetch(API_URLS.nonFnolMails, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors', // Explicitly request CORS mode
            cache: 'no-cache' // Don't cache results
        });
        
        // Create a timeout promise that rejects after 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out after 5 seconds')), 5000);
        });
        
        // Race the fetch against the timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('Non-FNOL mails response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Non-FNOL mails data received:', data);
        
        if (Array.isArray(data) && data.length > 0) {
            nonFnolMailsData = data;
            console.log('Non-FNOL mails stored successfully:', nonFnolMailsData.length, 'items');
        } else {
            console.warn('Non-FNOL mails data is empty or not an array', data);
            // Set to empty array instead of using mock data
            nonFnolMailsData = [];
            
            // Show warning message when non-FNOL mail view is active
            if (currentMailType === 'non-fnol') {
                const mailListElement = document.getElementById('mail-list');
                if (mailListElement) {
                    mailListElement.innerHTML = `
                        <div class="alert alert-warning">
                            <strong>No Non-FNOL mail data available.</strong>
                            <p>The API returned an empty dataset. There might not be any non-FNOL mails in the system.</p>
                            <button class="btn btn-sm btn-primary mt-2" onclick="refreshMailList()">
                                <i class="fas fa-sync-alt"></i> Retry
                            </button>
                        </div>
                    `;
                }
            }
        }
        
        updateMailCounts();
        return nonFnolMailsData;
    } catch (error) {
        console.error('Error fetching non-FNOL mails:', error);
        // Set to empty array instead of using mock data
        nonFnolMailsData = [];
        updateMailCounts();
        
        // Only show error if this is the active view
        if (currentMailType === 'non-fnol') {
            // Detect if this is likely a CORS issue from opening the file directly
            const isCORSIssue = error.message.includes('CORS') || 
                              error.message.includes('Cross-Origin') || 
                              error.message.includes('blocked by CORS policy') ||
                              (window.location.protocol === 'file:');
            
            // Show detailed error message to the user
            const mailListElement = document.getElementById('mail-list');
            if (mailListElement) {
                if (isCORSIssue) {
                    mailListElement.innerHTML = `
                        <div class="alert alert-danger">
                            <strong>Cannot access API due to browser security restrictions</strong>
                            <hr>
                            <p>When opening an HTML file directly in a browser (using file:// protocol), 
                            browsers block API requests to protect your security.</p>
                            <p>Please follow the instructions shown in the FNOL mail section to fix this issue.</p>
                            <button class="btn btn-primary mt-2" onclick="refreshMailList()">
                                <i class="fas fa-sync-alt"></i> Try Again
                            </button>
                        </div>
                    `;
                } else {
                    mailListElement.innerHTML = `
                        <div class="alert alert-danger">
                            <strong>Error fetching non-FNOL mail data:</strong> ${error.message}
                            <hr>
                            <p>This could be due to:</p>
                            <ul>
                                <li>The API server is not running at ${API_URLS.nonFnolMails}</li>
                                <li>Network connection issues</li>
                                <li>Request timed out</li>
                            </ul>
                            <button class="btn btn-sm btn-primary mt-2" onclick="refreshMailList()">
                                <i class="fas fa-sync-alt"></i> Retry
                            </button>
                        </div>
                    `;
                }
            }
        }
        
        return nonFnolMailsData;
    }
}

// Function to calculate overall statistics
function calculateStats() {
    // Calculate total emails
    statsData.emails_received = fnolMailsData.length + nonFnolMailsData.length;
    
    // Calculate incomplete emails (new status)
    statsData.incomplete_info_emails = fnolMailsData.filter(mail => mail.status === 'new').length;
    
    // Update the stats display
    updateStatsDisplay();
}

// Update the statistics display
function updateStatsDisplay() {
    document.getElementById('analytics-emails-received').textContent = statsData.emails_received;
    document.getElementById('analytics-incomplete').textContent = statsData.incomplete_info_emails;
    document.getElementById('analytics-followups').textContent = statsData.followup_emails_sent;
    document.getElementById('analytics-claims').textContent = statsData.claims_generated;
    
    // Update charts if they exist
    updateCharts();
}

// Update mail counts based on fetched data
function updateMailCounts() {
    // Update FNOL mail counts
    document.getElementById('fnol-count').textContent = fnolMailsData.length;
    
    // Update non-FNOL mail counts
    document.getElementById('non-fnol-count').textContent = nonFnolMailsData.length;
    
    // Update follow-up mail counts (placeholder for now)
    document.getElementById('claims-count').textContent = '0';
    
    // Update status counts
    updateStatusCounts();
}

function updateStatusCounts() {
    const allMailsCount = (currentMailType === 'fnol' ? fnolMailsData : nonFnolMailsData).length;
    document.getElementById('all-mails-count').textContent = allMailsCount;
    
    const processedMailsCount = (currentMailType === 'fnol' ? 
        fnolMailsData.filter(mail => mail.status !== 'new').length : 
        nonFnolMailsData.filter(mail => mail.status !== 'Non FNOL Mail').length);
    document.getElementById('processed-mails-count').textContent = processedMailsCount;
    
    const unprocessedMailsCount = (currentMailType === 'fnol' ? 
        fnolMailsData.filter(mail => mail.status === 'new').length : 
        nonFnolMailsData.filter(mail => mail.status === 'Non FNOL Mail').length);
    document.getElementById('unprocessed-mails-count').textContent = unprocessedMailsCount;
}

// Function to show/hide loading indicators
function showLoading(isLoading) {
    const loaderElements = document.querySelectorAll('.mail-list-loader');
    loaderElements.forEach(loader => {
        if (isLoading) {
            loader.classList.remove('d-none');
        } else {
            loader.classList.add('d-none');
        }
    });
}

// Function to setup event listeners
function setupEventListeners() {
    // Card selection
    document.getElementById('fnol-card').addEventListener('click', () => selectCard('fnol'));
    document.getElementById('non-fnol-card').addEventListener('click', () => selectCard('non-fnol'));
    document.getElementById('claims-card').addEventListener('click', () => selectCard('claims'));
    
    // Mail filter radios
    document.getElementById('allMailsRadio').addEventListener('click', () => filterMailsByStatus('all'));
    document.getElementById('processedMailsRadio').addEventListener('click', () => filterMailsByStatus('processed'));
    document.getElementById('unprocessedMailsRadio').addEventListener('click', () => filterMailsByStatus('unprocessed'));
    
    // Mail sort dropdown
    document.getElementById('mailSortSelect').addEventListener('change', (e) => sortMailList(e.target.value));
}

// Function to select a card
function selectCard(cardType) {
    // Remove active class from all cards
    document.querySelectorAll('.dashboard-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected card
    document.getElementById(`${cardType}-card`).classList.add('active');
    
    // Update current mail type
    currentMailType = cardType;
    
    // Update mail list title
    const mailListTitle = document.getElementById('mail-list-title');
    if (cardType === 'fnol') {
        mailListTitle.textContent = 'FNOL Mails';
    } else if (cardType === 'non-fnol') {
        mailListTitle.textContent = 'Non-FNOL Mails';
    } else {
        mailListTitle.textContent = 'Follow-up Mails';
    }
    
    // Update status counts
    updateStatusCounts();
    
    // Load mail list for selected type
    loadMailList();
    
    // Clear mail details
    clearMailDetails();
}

// Function to filter mails by status
function filterMailsByStatus(status) {
    currentFilterStatus = status;
    loadMailList();
}

// Function to sort mail list
function sortMailList(sortOption) {
    currentSortOption = sortOption;
    loadMailList();
}

// Function to sort mails based on option
function sortMails(mails, sortOption) {
    const sortedMails = [...mails];
    
    switch (sortOption) {
        case 'date-desc':
            sortedMails.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            break;
        case 'date-asc':
            sortedMails.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            break;
        case 'subject-asc':
            sortedMails.sort((a, b) => {
                const subjectA = currentMailType === 'fnol' ? 
                    (a.extracted_data?.subject || '') : (a.subject || '');
                const subjectB = currentMailType === 'fnol' ? 
                    (b.extracted_data?.subject || '') : (b.subject || '');
                return subjectA.localeCompare(subjectB);
            });
            break;
        case 'subject-desc':
            sortedMails.sort((a, b) => {
                const subjectA = currentMailType === 'fnol' ? 
                    (a.extracted_data?.subject || '') : (a.subject || '');
                const subjectB = currentMailType === 'fnol' ? 
                    (b.extracted_data?.subject || '') : (b.subject || '');
                return subjectB.localeCompare(subjectA);
            });
            break;
        case 'status-asc':
            sortedMails.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
            break;
    }
    
    return sortedMails;
}

// Function to load mail list based on current selections
function loadMailList() {
    console.log('Loading mail list for type:', currentMailType);
    const mailListElement = document.getElementById('mail-list');
    mailListElement.innerHTML = '';
    
    let mailsToDisplay = [];
    
    // Get appropriate data based on current mail type
    if (currentMailType === 'fnol') {
        mailsToDisplay = fnolMailsData;
        console.log('FNOL mails to display:', mailsToDisplay.length, 'items');
    } else if (currentMailType === 'non-fnol') {
        mailsToDisplay = nonFnolMailsData;
        console.log('Non-FNOL mails to display:', mailsToDisplay.length, 'items');
    } else {
        // For the "claims" section, we can implement later
        mailsToDisplay = [];
        console.log('Claims section selected, no data to display yet');
    }
    
    // Apply status filter if needed
    if (currentFilterStatus !== 'all') {
        if (currentMailType === 'fnol') {
            if (currentFilterStatus === 'processed') {
                mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'new');
            } else if (currentFilterStatus === 'unprocessed') {
                mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'new');
            }
        } else if (currentMailType === 'non-fnol') {
            if (currentFilterStatus === 'processed') {
                mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'Non FNOL Mail');
            } else if (currentFilterStatus === 'unprocessed') {
                mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'Non FNOL Mail');
            }
        }
    }
    
    // Apply sorting
    mailsToDisplay = sortMails(mailsToDisplay, currentSortOption);
    
    // Display the mails
    if (mailsToDisplay.length === 0) {
        mailListElement.innerHTML = '<div class="text-center py-4"><p class="text-muted">No mails to display</p></div>';
    } else {
        mailsToDisplay.forEach(mail => {
            const mailItem = document.createElement('div');
            mailItem.className = 'mail-item';
            mailItem.setAttribute('data-id', mail.id);
            mailItem.onclick = () => showMailDetails(mail.id);
            
            // Format date
            const mailDate = mail.date !== 'Unknown' && mail.date ? new Date(mail.date) : new Date();
            const formattedDate = mailDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Get appropriate subject and preview based on mail type
            let subject, preview, from;
            if (currentMailType === 'fnol') {
                subject = mail.extracted_data?.subject || 'No subject';
                preview = mail.extracted_data?.body_text || 'No preview available';
                from = mail.extracted_data?.email_id || 'Unknown';
            } else {
                subject = mail.subject || 'No subject';
                preview = mail.body || 'No preview available';
                from = mail.from || 'Unknown';
            }
            
            // Create status badge
            let statusClass = 'bg-secondary';
            let statusText = mail.status || 'Unknown';
            
            if (currentMailType === 'fnol') {
                if (mail.status === 'new') {
                    statusClass = 'bg-warning';
                    statusText = 'New';
                } else if (mail.status === 'processed') {
                    statusClass = 'bg-success';
                    statusText = 'Processed';
                }
            } else if (currentMailType === 'non-fnol') {
                statusClass = 'bg-info';
                statusText = 'Non-FNOL';
            }
            
            // Truncate preview text
            const truncatedPreview = preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
            
            mailItem.innerHTML = `
                <div class="d-flex justify-content-between mb-1">
                    <span class="mail-subject">${subject}</span>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="mail-preview text-muted">${truncatedPreview}</div>
                <div class="d-flex justify-content-between mt-1">
                    <small class="mail-from">${from}</small>
                    <small class="mail-date">${formattedDate}</small>
                </div>
            `;
            
            mailListElement.appendChild(mailItem);
        });
    }
}

// Function to clear mail details
function clearMailDetails() {
    document.getElementById('no-mail-selected').classList.remove('d-none');
    document.getElementById('mail-data').classList.add('d-none');
    currentMailId = null;
}

// Function to show mail details
function showMailDetails(mailId) {
    currentMailId = mailId;
    
    // Find the mail in the appropriate data source
    let mailData;
    if (currentMailType === 'fnol') {
        mailData = fnolMailsData.find(mail => mail.id === mailId);
    } else if (currentMailType === 'non-fnol') {
        mailData = nonFnolMailsData.find(mail => mail.id === mailId);
    } else {
        // For future implementation (claims)
        return;
    }
    
    if (!mailData) {
        console.error('Mail not found with ID:', mailId);
        return;
    }
    
    // Hide the "no mail selected" message
    document.getElementById('no-mail-selected').classList.add('d-none');
    
    // Show the mail data container
    document.getElementById('mail-data').classList.remove('d-none');
    
    // Populate the mail details based on mail type
    if (currentMailType === 'fnol') {
        // FNOL mail format
        document.getElementById('mail-from').textContent = mailData.extracted_data?.email_id || 'Unknown';
        document.getElementById('mail-subject').textContent = mailData.extracted_data?.subject || 'No subject';
        document.getElementById('mail-date').textContent = formatDateTime(mailData.date);
        document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
        document.getElementById('mail-policy').textContent = mailData.extracted_data?.extracted_data?.policy_number || 'Not found';
        document.getElementById('mail-incident-date').textContent = mailData.extracted_data?.extracted_data?.InputLossDate || 'Not specified';
        document.getElementById('mail-description').textContent = mailData.extracted_data?.body_text || 'No description available';
        
        // Display extracted info
        displayExtractedData(mailData.extracted_data?.extracted_data || {});
    } else {
        // Non-FNOL mail format
        document.getElementById('mail-from').textContent = mailData.from || 'Unknown';
        document.getElementById('mail-subject').textContent = mailData.subject || 'No subject';
        document.getElementById('mail-date').textContent = mailData.date !== 'Unknown' ? formatDateTime(mailData.date) : 'Unknown';
        document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
        document.getElementById('mail-policy').textContent = 'N/A';
        document.getElementById('mail-incident-date').textContent = 'N/A';
        document.getElementById('mail-description').textContent = mailData.body || 'No description available';
        
        // Clear extracted info for non-FNOL mails
        displayExtractedData({});
    }
    
    // Update mail detail title
    document.getElementById('mail-detail-title').textContent = `Mail Details - ${currentMailType === 'fnol' ? 'FNOL Mail' : 'Non-FNOL Mail'}`;
}

// Function to display extracted data
function displayExtractedData(extractedData) {
    const extractedDataContainer = document.getElementById('extracted-data-cards');
    extractedDataContainer.innerHTML = '';
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
        extractedDataContainer.innerHTML = '<div class="col-12"><p class="text-muted">No extracted data available</p></div>';
        return;
    }
    
    // Sort keys alphabetically
    const sortedKeys = Object.keys(extractedData).sort();
    
    sortedKeys.forEach(key => {
        const value = extractedData[key];
        if (value !== null && value !== undefined && value !== '') {
            const card = document.createElement('div');
            card.className = 'col';
            card.innerHTML = `
                <div class="data-card">
                    <div class="data-field">${formatLabel(key)}</div>
                    <div class="data-value">${value}</div>
                </div>
            `;
            extractedDataContainer.appendChild(card);
        }
    });
}

// Helper function to format date and time
function formatDateTime(dateString) {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Helper function to format field labels
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

// Function to refresh mail list
function refreshMailList() {
    showLoading(true);
    
    // Fetch fresh data
    if (currentMailType === 'fnol') {
        fetchFnolMails().then(() => {
            loadMailList();
            showLoading(false);
        });
    } else if (currentMailType === 'non-fnol') {
        fetchNonFnolMails().then(() => {
            loadMailList();
            showLoading(false);
        });
    } else {
        showLoading(false);
    }
}

// Function to process email (placeholder)
function processEmail(mailId) {
    alert(`Processing email with ID: ${mailId}`);
}

// Function to generate claim (placeholder)
function generateClaim(mailId) {
    alert(`Generating claim for email with ID: ${mailId}`);
}

// Function to request more info (placeholder)
function requestMoreInfo(mailId) {
    alert(`Requesting more information for email with ID: ${mailId}`);
}

// Function to initialize charts
function initCharts() {
    // Trend chart
    const trendChartCtx = document.getElementById('trendChart');
    if (trendChartCtx) {
        chart = new Chart(trendChartCtx, {
            type: 'line',
            data: {
                labels: ['Jul 1', 'Jul 2', 'Jul 3', 'Jul 4', 'Jul 5', 'Jul 6', 'Jul 7'],
                datasets: [
                    {
                        label: 'Emails Received',
                        data: [8, 12, 15, 10, 8, 5, 20],
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Claims Generated',
                        data: [0, 1, 0, 2, 0, 0, 1],
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // Incident bar chart
    const incidentBarChartCtx = document.getElementById('incidentBarChart');
    if (incidentBarChartCtx) {
        barChart = new Chart(incidentBarChartCtx, {
            type: 'bar',
            data: {
                labels: ['Car Accident', 'Property Damage', 'Theft', 'Water Damage', 'Fire', 'Other'],
                datasets: [
                    {
                        label: 'Incidents by Type',
                        data: [25, 15, 8, 5, 3, 7],
                        backgroundColor: [
                            'rgba(13, 110, 253, 0.8)',
                            'rgba(220, 53, 69, 0.8)',
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(13, 202, 240, 0.8)',
                            'rgba(255, 128, 0, 0.8)',
                            'rgba(108, 117, 125, 0.8)'
                        ],
                        borderColor: [
                            'rgba(13, 110, 253, 1)',
                            'rgba(220, 53, 69, 1)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(13, 202, 240, 1)',
                            'rgba(255, 128, 0, 1)',
                            'rgba(108, 117, 125, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Function to update charts
function updateCharts() {
    if (chart) {
        // Update chart data if needed
    }
    
    if (barChart) {
        // Update bar chart data if needed
    }
}

// Function to refresh stats
function refreshStats() {
    calculateStats();
}

// This function updates the theme based on the dark mode setting
function updateTheme() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Update charts if they exist
    updateCharts();
}