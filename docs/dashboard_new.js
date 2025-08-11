// Global variables
let currentMailType = 'fnol';
let currentMailId = null;
let currentFilterStatus = 'all';
let currentSortOption = 'date-desc'; // Default sort: newest first
let chart = null;
let barChart = null;
let userMailsPieChart = null; // Pie chart for mails by user category
let darkMode = localStorage.getItem('darkMode') === 'enabled';

// API URLs
const API_URLS = {
    fnolMails: 'http://127.0.0.1:8000/FNOL_mails',
    nonFnolMails: 'http://127.0.0.1:8000/non_FNOL_mails',
    tracing: 'http://127.0.0.1:8000/tracing',
    followupMails: 'http://127.0.0.1:8000/followup_mails',
    download: 'http://127.0.0.1:8000/download'
};

// Data storage
let fnolMailsData = [];
let nonFnolMailsData = [];
let followupMailsData = [];
let statsData = {
    fnol_emails_received: 0,
    non_fnol_mails: 0,
    followup_emails_sent: 0,
    claims_generated: 0,
    daily_stats: {},
    Mails_by_user: {},
    last_updated: new Date().toISOString()
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    
    // Show loading state immediately
    showLoading(true);
    
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out'
    });
    
    // Apply theme based on saved preference
    updateTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
    
    // Fetch data from APIs
    loadAllData();
});

// Function to load all data
async function loadAllData() {
    // Show loading indicators
    showLoading(true);
    
    try {
        // Fetch data from APIs in parallel
        await Promise.all([
            fetchFnolMails(),
            fetchNonFnolMails(),
            fetchFollowupMails(),
            fetchTracingStats()
        ]);
        
        // Calculate statistics
        calculateStats();
        
        // Hide loading indicators
        showLoading(false);
        
        // Load mail list after data is fetched
        loadMailList();
        
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        showLoading(false);
        loadMailList(); // Still load the mail list even if there's an error
    }
}

// Fetch data from APIs
async function fetchFnolMails() {
    try {
        const response = await fetch(API_URLS.fnolMails);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        fnolMailsData = data;
        updateMailCounts();
        
        // Refresh mail list if currently viewing FNOL mails
        if (currentMailType === 'fnol') {
            loadMailList();
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching FNOL mails:', error);
        // Generate sample test data with summary points for testing
        const testData = [];
        for (let i = 1; i <= 5; i++) {
            const mail = {
                id: `fnol-${i}`,
                status: i % 2 === 0 ? 'processed' : 'unprocessed',
                claim_id: `08DDAE4F0755F42${i}`, // Add claim ID for testing
                extracted_data: {
                    email_id: `test${i}@example.com`,
                    subject: `Test FNOL Email ${i}`,
                    body_text: `This is a test email body for FNOL report ${i}. It contains incident details.`,
                    sent_time: new Date(2025, 6, i + 15).toISOString(),
                    attachment_path: i <= 2 ? [  // Add attachments for first 2 emails
                        `attachments\\test_document_${i}.pdf`,
                        `attachments\\incident_photo_${i}.jpg`,
                        `attachments\\police_report_${i}.docx`
                    ] : [], // No attachments for others
                    extracted_data: {
                        policy_number: `PAUTO4Q2025-${i}`,
                        InputLossDate: `July ${15 + i}, 2025`
                    }
                }
            };
            
            // Add summary points to the first email
            if (i === 1) {
                mail.summary_points = [
                    "The FNOL report was submitted by Vineet Kapoor via email, indicating their involvement as the policyholder.",
                    "The policy associated  this claim is identified as PAUTO4Q2025, which should be verified for coverage details.",
                    "The incident reported is a car accident that occurred at 456 Elm Street, Los Angeles, CA, 90001, providing a specific location for investigation.",
                    "The vehicle involved sustained damage specifically to the car engine, which requires a detailed assessment to determine the extent of the damage.",
                    "The report does not include a detailed description of the loss, suggesting the need for follow-up to gather additional information about the incident.",
                    "The FNOL was reported on July 17, 2025, at 07:16:36 UTC, but the exact date and time of the incident are not provided and should be clarified."
                ];
            }
            
            testData.push(mail);
        }
        
        // Update the global data
        fnolMailsData = testData;
        updateMailCounts();
        return testData;
    }
}

async function fetchNonFnolMails() {
    try {
        const response = await fetch(API_URLS.nonFnolMails);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        nonFnolMailsData = data;
        updateMailCounts();
        
        // Refresh mail list if currently viewing non-FNOL mails
        if (currentMailType === 'non-fnol') {
            loadMailList();
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching non-FNOL mails:', error);
        return [];
    }
}

async function fetchFollowupMails() {
    try {
        const response = await fetch(API_URLS.followupMails);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        followupMailsData = data;
        updateMailCounts();
        
        // Refresh mail list if currently viewing follow-up mails
        if (currentMailType === 'claims') {
            loadMailList();
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching follow-up mails:', error);
        return [];
    }
}

// Fetch tracing statistics data
async function fetchTracingStats() {
    try {
        const response = await fetch(API_URLS.tracing);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Update stats data with API response
        statsData.fnol_emails_received = data.fnol_emails_received;
        statsData.non_fnol_mails = data.non_fnol_mails;
        statsData.followup_emails_sent = data.followup_emails_sent;
        statsData.claims_generated = data.claims_generated;
        statsData.daily_stats = data.daily_stats;
        statsData.Mails_by_user = data.Mails_by_user || {};
        statsData.last_updated = data.last_updated;
        
        // Calculate additional statistics if needed
        enhanceStatsData();
        
        // Update the UI with new stats data
        updateStatsDisplay();
        updateDailyStatsTable();
        updateUserMailsPieChart();
        
        return data;
    } catch (error) {
        console.error('Error fetching tracing stats:', error);
        return {};
    }
}

// Enhance stats data with additional calculations
function enhanceStatsData() {
    // Ensure all daily stats have non_fnol_emails count
    if (statsData.daily_stats) {
        Object.keys(statsData.daily_stats).forEach(date => {
            const dayStats = statsData.daily_stats[date];
            
            // If we don't have non_fnol_emails data but have emails_received
            if (dayStats.fnol_emails_received !== undefined && dayStats.non_fnol_emails === undefined) {
                // Estimate non-FNOL emails (could be inaccurate but better than nothing)
                // On average, assuming non-FNOL emails are approximately 30% of total
                dayStats.non_fnol_emails = Math.round(dayStats.fnol_emails_received * 0.3);
            }
        });
    }
}

// Function to calculate overall statistics
function calculateStats() {
    // If we haven't fetched the stats from the API yet, calculate basic stats from mail data
    if (!statsData.last_updated) {
        // Calculate total emails
        statsData.fnol_emails_received = fnolMailsData.length + nonFnolMailsData.length;
        

        // Calculate non-FNOL mails
        statsData.non_fnol_mails = fnolMailsData.filter(mail => mail.status === 'new').length;
    }
    
    // Update the stats display
    updateStatsDisplay();
}

// Update the statistics display
function updateStatsDisplay() {
    document.getElementById('analytics-fnol-emails-received').textContent = statsData.fnol_emails_received;
    document.getElementById('analytics-non-fnol').textContent = statsData.non_fnol_mails;
    document.getElementById('analytics-followups').textContent = statsData.followup_emails_sent;
    document.getElementById('analytics-claims').textContent = statsData.claims_generated;
    
    // Update the last updated timestamp if available
    if (statsData.last_updated) {
        const lastUpdated = document.getElementById('last-updated-timestamp');
        if (lastUpdated) {
            lastUpdated.textContent = `Last updated: ${statsData.last_updated}`;
        }
    }
    
    // Update charts if they exist
    updateCharts();
}

// Update the daily statistics table
function updateDailyStatsTable() {
    const dailyStatsBody = document.getElementById('daily-stats-body');
    if (!dailyStatsBody) return;
    
    // Clear existing rows
    dailyStatsBody.innerHTML = '';
    
    if (!statsData.daily_stats || Object.keys(statsData.daily_stats).length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = '<td colspan="5" class="text-center">No daily data available</td>';
        dailyStatsBody.appendChild(noDataRow);
        return;
    }
    
    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(statsData.daily_stats).sort().reverse();
    
    // Add rows for each date
    sortedDates.forEach(date => {
        const dayStats = statsData.daily_stats[date];
        const row = document.createElement('tr');
        
        // Format date for display (YYYY-MM-DD to more readable format)
        const displayDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${displayDate}</td>
            <td>${dayStats.fnol_emails_received}</td>
            <td>${dayStats.non_fnol_mails}</td>
            <td>${dayStats.followup_emails_sent}</td>
            <td>${dayStats.claims_generated}</td>
        `;
        
        dailyStatsBody.appendChild(row);
    });
}

// Update mail counts based on fetched data
function updateMailCounts() {
    // Update FNOL mail counts
    document.getElementById('fnol-count').textContent = fnolMailsData.length;
    
    // Update non-FNOL mail counts
    document.getElementById('non-fnol-count').textContent = nonFnolMailsData.length;
    
    // Update follow-up mail counts
    document.getElementById('claims-count').textContent = followupMailsData.length;
    
    // Update status counts
    updateStatusCounts();
}

function updateStatusCounts() {
    let allMailsCount, processedMailsCount, unprocessedMailsCount;
    
    if (currentMailType === 'fnol') {
        allMailsCount = fnolMailsData.length;
        processedMailsCount = fnolMailsData.filter(mail => mail.status !== 'new').length;
        unprocessedMailsCount = fnolMailsData.filter(mail => mail.status === 'new').length;
    } else if (currentMailType === 'non-fnol') {
        allMailsCount = nonFnolMailsData.length;
        processedMailsCount = nonFnolMailsData.filter(mail => mail.status !== 'Non FNOL Mail').length;
        unprocessedMailsCount = nonFnolMailsData.filter(mail => mail.status === 'Non FNOL Mail').length;
    } else if (currentMailType === 'claims') {
        allMailsCount = followupMailsData.length;
        processedMailsCount = followupMailsData.filter(mail => mail.status === 'followup').length;
        unprocessedMailsCount = followupMailsData.filter(mail => mail.status !== 'followup').length;
    }
    
    document.getElementById('all-mails-count').textContent = allMailsCount;
    document.getElementById('processed-mails-count').textContent = processedMailsCount;
    document.getElementById('unprocessed-mails-count').textContent = unprocessedMailsCount;
}

// Function to show/hide loading indicators
function showLoading(isLoading) {
    const mailListElement = document.getElementById('mail-list');
    
    if (isLoading) {
        // Remove any existing content and show loader
        mailListElement.innerHTML = `
            <div class="mail-list-loader text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading mails...</p>
            </div>
        `;
    } else {
        // Remove loader if it exists
        const loader = mailListElement.querySelector('.mail-list-loader');
        if (loader) {
            loader.remove();
        }
    }
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
    
    // Add event listener for analytics tab
    const analyticsTab = document.getElementById('analytics-tab');
    if (analyticsTab) {
        analyticsTab.addEventListener('shown.bs.tab', function (e) {
            // Refresh stats when the analytics tab is shown
            refreshStats();
        });
    }
    
    // Setup theme toggle (from theme_toggle.js)
    if (typeof setupThemeToggle === 'function') {
        setupThemeToggle();
    }
    
    // Initialize theme based on stored preference
    updateTheme();
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
    
    // Show/hide mail status filter based on mail type
    const mailStatusFilter = document.getElementById('mail-status-filter');
    if (cardType === 'fnol') {
        // Show radio buttons only for FNOL mails
        mailStatusFilter.style.display = 'block';
    } else {
        // Hide radio buttons for follow-up and non-FNOL mails
        mailStatusFilter.style.display = 'none';
        // Reset filter to 'all' when switching to non-FNOL or follow-up
        currentFilterStatus = 'all';
        document.getElementById('allMailsRadio').checked = true;
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
            sortedMails.sort((a, b) => {
                // Get the appropriate date field based on current mail type
                let dateA, dateB;
                if (currentMailType === 'fnol') {
                    dateA = a.extracted_data?.sent_time || 0;
                    dateB = b.extracted_data?.sent_time || 0;
                } else if (currentMailType === 'claims') {
                    dateA = a.extracted_data?.sent_time || a.date || 0;
                    dateB = b.extracted_data?.sent_time || b.date || 0;
                } else {
                    dateA = a.date || 0;
                    dateB = b.date || 0;
                }
                return new Date(dateB) - new Date(dateA);
            });
            break;
        case 'date-asc':
            sortedMails.sort((a, b) => {
                // Get the appropriate date field based on current mail type
                let dateA, dateB;
                if (currentMailType === 'fnol') {
                    dateA = a.extracted_data?.sent_time || 0;
                    dateB = b.extracted_data?.sent_time || 0;
                } else if (currentMailType === 'claims') {
                    dateA = a.extracted_data?.sent_time || a.date || 0;
                    dateB = b.extracted_data?.sent_time || b.date || 0;
                } else {
                    dateA = a.date || 0;
                    dateB = b.date || 0;
                }
                return new Date(dateA) - new Date(dateB);
            });
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
    const mailListElement = document.getElementById('mail-list');
    
    // Remove any existing loader
    const existingLoader = mailListElement.querySelector('.mail-list-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    // Clear the mail list content
    mailListElement.innerHTML = '';
    
    let mailsToDisplay = [];
    
    // Get appropriate data based on current mail type
    if (currentMailType === 'fnol') {
        mailsToDisplay = fnolMailsData;
    } else if (currentMailType === 'non-fnol') {
        mailsToDisplay = nonFnolMailsData;
    } else if (currentMailType === 'claims') {
        mailsToDisplay = followupMailsData;
    } else {
        mailsToDisplay = [];
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
        } else if (currentMailType === 'claims') {
            // For follow-up mails, use the status "followup" as processed
            if (currentFilterStatus === 'processed') {
                mailsToDisplay = mailsToDisplay.filter(mail => mail.status === 'followup');
            } else if (currentFilterStatus === 'unprocessed') {
                mailsToDisplay = mailsToDisplay.filter(mail => mail.status !== 'followup');
            }
        }
    }
    
    // Apply sorting
    mailsToDisplay = sortMails(mailsToDisplay, currentSortOption);
    
    // Display the mails
    if (mailsToDisplay.length === 0) {
        mailListElement.innerHTML = '<div class="text-center py-4"><p class="text-muted">No mails to display</p></div>';
    } else {
        // Clear any existing GSAP animations
        if (window.gsap) {
            gsap.killTweensOf(".mail-item");
        }
        
        mailsToDisplay.forEach((mail, index) => {
            const mailItem = document.createElement('div');
            mailItem.className = 'mail-item';
            mailItem.setAttribute('data-id', mail.id);
            mailItem.style.opacity = 0; // Start invisible for animation
            mailItem.style.transform = 'translateY(20px)'; // Start slightly below
            
            // Set the data-type attribute based on mail type
            if (currentMailType === 'fnol') {
                mailItem.setAttribute('data-type', 'fnol');
            } else if (currentMailType === 'non-fnol') {
                mailItem.setAttribute('data-type', 'non-fnol');
            } else if (currentMailType === 'claims') {
                // For follow-up mails, use a new type
                mailItem.setAttribute('data-type', 'followup');
            }
            
            mailItem.onclick = () => showMailDetails(mail.id);
            
            // Format date based on mail type
            let mailDate;
            if (currentMailType === 'fnol') {
                // FNOL mails use sent_time field
                mailDate = mail.extracted_data?.sent_time && mail.extracted_data?.sent_time !== 'Unknown' ? 
                    new Date(mail.extracted_data.sent_time) : new Date();
            } else if (currentMailType === 'claims') {
                // Claims mails might have either sent_time or date, check both
                const claimsDateValue = mail.extracted_data?.sent_time || mail.date;
                mailDate = claimsDateValue && claimsDateValue !== 'Unknown' ? new Date(claimsDateValue) : new Date();
            } else {
                // Non-FNOL mails use date field
                mailDate = mail.date && mail.date !== 'Unknown' ? new Date(mail.date) : new Date();
            }

            console.log("Processing mail item:", mail.id);
            console.log("Mail type:", currentMailType);
            console.log("Date field used:", currentMailType === 'fnol' ? 'extracted_data.sent_time' : currentMailType === 'claims' ? 'sent_time or date' : 'date');
            console.log("Raw date value:", currentMailType === 'fnol' ? mail.extracted_data?.sent_time : currentMailType === 'claims' ? (mail.extracted_data?.sent_time || mail.date) : mail.date);
            
            const formattedDate = mailDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            console.log("Formatted date:", formattedDate);
            console.log("-----------------------------------------------")
            // Get appropriate subject and preview based on mail type
            let subject, preview, from;
            if (currentMailType === 'fnol') {
                subject = mail.extracted_data?.subject || 'No subject';
                preview = mail.extracted_data?.body_text || 'No preview available';
                from = mail.extracted_data?.email_id || 'Unknown';
                
            } else if (currentMailType === 'claims') {
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
            } else if (currentMailType === 'claims') {
                if (mail.status === 'followup') {
                    statusClass = 'bg-primary';
                    statusText = 'Follow-up';
                } else {
                    statusClass = 'bg-secondary';
                    statusText = mail.status || 'Unknown';
                }
            }
            
            // Truncate preview text
            const truncatedPreview = preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
            
            // Determine the appropriate icon based on mail type
            let typeIcon = '';
            let typeLabel = '';
            
            if (currentMailType === 'fnol') {
                typeIcon = '<i class="fas fa-file-alt mail-type-icon"></i>';
                typeLabel = 'FNOL';
            } else if (currentMailType === 'non-fnol') {
                typeIcon = '<i class="fas fa-envelope mail-type-icon"></i>';
                typeLabel = 'Regular';
            } else if (currentMailType === 'claims') {
                typeIcon = '<i class="fas fa-reply mail-type-icon"></i>';
                typeLabel = 'Follow-up';
            }
            
            mailItem.innerHTML = `
                <div class="mail-header d-flex justify-content-between align-items-center mb-2">
                    <div class="mail-subject-container">
                        ${typeIcon}
                        <span class="mail-subject">${subject}</span>
                    </div>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="mail-preview text-muted">${truncatedPreview}</div>
                <div class="mail-footer d-flex justify-content-between align-items-center mt-2">
                    <div class="mail-meta">
                        <small class="mail-from">${from}</small>
                        <small class="mail-type-label">${typeLabel}</small>
                    </div>
                    <small class="mail-date">${formattedDate}</small>
                </div>
            `;
            
            mailListElement.appendChild(mailItem);
        });
        
        // Animate mail items with GSAP for a more impressive entrance
        if (window.gsap) {
            gsap.to('.mail-item', {
                opacity: 1,
                y: 0,
                stagger: 0.08,  // Staggered animation for each item
                duration: 0.6,
                ease: "power2.out",
                clearProps: "transform",  // Clean up transform after animation
                onComplete: () => {
                    // Add a subtle hover animation to the first item to draw attention
                    gsap.to('.mail-item:first-child', {
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                        duration: 0.4,
                        repeat: 1,
                        yoyo: true
                    });
                }
            });
        } else {
            // Fallback if GSAP is not available
            document.querySelectorAll('.mail-item').forEach(item => {
                item.style.opacity = 1;
                item.style.transform = 'none';
            });
        }
    }
}

// Function to clear mail details
function clearMailDetails() {
    document.getElementById('no-mail-selected').classList.remove('d-none');
    document.getElementById('mail-data').classList.add('d-none');
    currentMailId = null;
    
    // Clear summary points
    document.getElementById('mail-summary-points-container').classList.add('d-none');
}

// Function to render basic markdown text
function renderMarkdown(text) {
    if (!text) return '';
    
    // Convert markdown to HTML
    let html = text
        // Remove leading dash for list items
        .replace(/^-\s*/, '')
        // Bold text: **text** or __text__
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic text: *text* or _text_
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
        .replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>')
        // Code: `code`
        .replace(/`([^`]+)`/g, '<code class="bg-light px-1 rounded">$1</code>')
        // Links: [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-decoration-none">$1 <i class="fas fa-external-link-alt ms-1" style="font-size: 0.8em;"></i></a>')
        // Line breaks
        .replace(/\n/g, '<br>');
    
    return html;
}

// Function to display summary points
function displaySummaryPoints(summaryPoints) {
    const summaryPointsContainer = document.getElementById('mail-summary-points-container');
    const summaryPointsList = document.getElementById('mail-summary-points');
    
    console.log("Display Summary Points called with:", summaryPoints);
    
    // Clear existing summary points
    summaryPointsList.innerHTML = '';
    
    // Check if there are any summary points to display
    if (summaryPoints && summaryPoints.length > 0) {
        console.log("Found summary points to display:", summaryPoints.length);
        
        // Display each summary point as a list item with markdown rendering
        summaryPoints.forEach((point, index) => {
            console.log(`Adding point ${index}:`, point);
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            
            // Render markdown content
            const renderedContent = renderMarkdown(point);
            listItem.innerHTML = renderedContent;
            
            summaryPointsList.appendChild(listItem);
        });
        
        // Show the summary points container
        summaryPointsContainer.classList.remove('d-none');
        console.log("Summary points container displayed");
    } else {
        console.log("No summary points to display, hiding container");
        // Hide the summary points container if no points available
        summaryPointsContainer.classList.add('d-none');
    }
}

// Function to show mail details
function showMailDetails(mailId) {
    // Remove active class from previously selected mail
    document.querySelectorAll('.mail-item.active').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the selected mail
    const selectedMailItem = document.querySelector(`.mail-item[data-id="${mailId}"]`);
    if (selectedMailItem) {
        selectedMailItem.classList.add('active');
        
        // Determine color based on mail type
        let highlightColor, glowColor, typeClass;
        const mailType = selectedMailItem.getAttribute('data-type');
        
        if (mailType === 'fnol') {
            highlightColor = "rgba(52, 152, 219, 0.5)";  // Blue
            glowColor = "rgba(52, 152, 219, 0.3)";
            typeClass = "fnol-detail";
        } else if (mailType === 'non-fnol') {
            highlightColor = "rgba(231, 76, 60, 0.5)";   // Red
            glowColor = "rgba(231, 76, 60, 0.3)";
            typeClass = "non-fnol-detail";
        } else if (mailType === 'followup') {
            highlightColor = "rgba(155, 89, 182, 0.5)";  // Purple
            glowColor = "rgba(155, 89, 182, 0.3)";
            typeClass = "followup-detail";
        } else {
            highlightColor = "rgba(52, 152, 219, 0.5)";  // Default blue
            glowColor = "rgba(52, 152, 219, 0.3)";
            typeClass = "fnol-detail";
        }
        
        // Apply type-specific styling to details pane
        const detailsContent = document.getElementById('mail-details-content');
        detailsContent.classList.remove('fnol-detail', 'non-fnol-detail', 'followup-detail');
        detailsContent.classList.add(typeClass);
        
        // Use GSAP for a more impressive highlight effect
        if (window.gsap) {
            // Initial quick highlight for mail item
            gsap.fromTo(selectedMailItem, 
                { 
                    boxShadow: `0 5px 15px ${glowColor}`,
                    scale: 1
                },
                { 
                    boxShadow: `0 10px 30px ${highlightColor}`,
                    scale: 1.02,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        // Subtle pulsing effect after initial highlight
                        gsap.to(selectedMailItem, {
                            boxShadow: `0 8px 20px ${glowColor}`,
                            scale: 1.01,
                            duration: 1.2,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut"
                        });
                    }
                }
            );
            
            // Animate the details content appearance
            gsap.fromTo(detailsContent, 
                { 
                    opacity: 0.8,
                    y: 10
                },
                { 
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.1,
                    ease: "power2.out"
                }
            );
        }
    }
    
    currentMailId = mailId;
    
    // Find the mail in the appropriate data source
    let mailData;
    if (currentMailType === 'fnol') {
        mailData = fnolMailsData.find(mail => mail.id === mailId);
    } else if (currentMailType === 'non-fnol') {
        mailData = nonFnolMailsData.find(mail => mail.id === mailId);
    } else if (currentMailType === 'claims') {
        mailData = followupMailsData.find(mail => mail.id === mailId);
    } else {
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
        document.getElementById('mail-date').textContent = formatDateTime(mailData.extracted_data?.sent_time);
        document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
        document.getElementById('mail-policy').textContent = mailData.extracted_data?.extracted_data?.policy_number || 'Not found';
        document.getElementById('mail-incident-date').textContent = mailData.extracted_data?.extracted_data?.InputLossDate || 'Not specified';
        document.getElementById('mail-description').textContent = mailData.extracted_data?.body_text || 'No description available';
        if (mailData.claim_id) {
            document.getElementById('mail-claim-id').parentElement.classList.remove('d-none');
            document.getElementById('mail-claim-id').textContent = mailData.claim_id || 'Not available';
        }
        else {
            document.getElementById('mail-claim-id').textContent = 'Not available';
            document.getElementById('mail-claim-id').parentElement.classList.add('d-none');
        }

        
        // Debug log to see mail data structure
        console.log("Mail Data Structure:", mailData);
        console.log("Summary Points Path:", mailData.extracted_data?.summary_points);
        
        // Display summary points if available - fix nesting level
        // The summary_points may be directly in mailData rather than in extracted_data
        const summaryPoints = mailData.summary_points || mailData.extracted_data?.summary_points || [];
        console.log("Using Summary Points:", summaryPoints);
        displaySummaryPoints(summaryPoints);
        
        // Display extracted info
        displayExtractedData(mailData.extracted_data?.extracted_data || {});
    } else if (currentMailType === 'claims') {
        // Follow-up mail format - check if it has sent_time or date field
        document.getElementById('mail-from').textContent = mailData.extracted_data?.email_id || 'Unknown';
        document.getElementById('mail-subject').textContent = mailData.extracted_data?.subject || 'No subject';
        // Claims might have either sent_time or date, check both
        const claimsDate = mailData.extracted_data?.sent_time || mailData.date;
        document.getElementById('mail-date').textContent = formatDateTime(claimsDate);
        document.getElementById('mail-status').textContent = 'Follow-up';
        document.getElementById('mail-policy').textContent = mailData.extracted_data?.extracted_data?.policy_number || 'Not found';
        document.getElementById('mail-incident-date').textContent = mailData.extracted_data?.extracted_data?.InputLossDate || 'Not specified';
        document.getElementById('mail-description').textContent = mailData.extracted_data?.body_text || 'No description available';
        
        // Debug log to see mail data structure
        console.log("Claims Mail Data Structure:", mailData);
        console.log("Claims Summary Points Path:", mailData.extracted_data?.summary_points);
        
        // Display summary points if available - fix nesting level
        // The summary_points may be directly in mailData rather than in extracted_data
        const summaryPoints = mailData.summary_points || mailData.extracted_data?.summary_points || [];
        console.log("Using Claims Summary Points:", summaryPoints);
        displaySummaryPoints(summaryPoints);
        
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
        
        // Debug log to see mail data structure
        console.log("Non-FNOL Mail Data Structure:", mailData);
        console.log("Non-FNOL Summary Points Path:", mailData.summary_points);
        
        // Check for summary points in non-FNOL mail
        const summaryPoints = mailData.summary_points || [];
        console.log("Using Non-FNOL Summary Points:", summaryPoints);
        displaySummaryPoints(summaryPoints);
        
        // Clear extracted info for non-FNOL mails
        displayExtractedData({});
    }
    
    // Handle additional info section
    const mailAdditionalInfo = document.getElementById('mail-additional-info');
    if (mailAdditionalInfo) {
        let additionalInfoHtml = '';

        // Display claim ID for FNOL mails if available
        if (currentMailType === 'fnol' && mailData.claim_number) {
            additionalInfoHtml += `
                <div class="mb-3 claim-number-container">
                    <strong><i class="fas fa-file-invoice me-2"></i>Claim Number:</strong>
                    <span class="badge" style="font-size: 1.05rem; padding: 0.6rem 0.85rem;">
                        <i class="fas fa-star me-2"></i>${mailData.claim_number}
                    </span>
                </div>
            `;
        }

        // Display parent ID for follow-up mails
        if (currentMailType === 'claims') {
            const parentId = mailData.parent_id || '';
            additionalInfoHtml += `
                <div class="mb-3">
                    <strong><i class="fas fa-reply me-2"></i>Related to:</strong>
                    <span>${parentId || 'No parent mail'}</span>
                </div>
                ${parentId ? `
                <div class="mb-3">
                    <button class="btn btn-info" onclick="viewParentMail('${parentId}')">
                        <i class="fas fa-eye me-2"></i>View Original Mail
                    </button>
                </div>
                ` : ''}
            `;
            
            // Display claim ID for follow-up mails if available
            if (mailData.claim_id) {
                additionalInfoHtml += `
                    <div class="mb-3 claim-id-container" style="padding-left: 1.5rem;">
                    <strong><i class="fas fa-file-invoice me-2"></i>Claim ID:</strong>
                        <span class="badge" style="font-size: 1.05rem; padding: 0.6rem 0.85rem;">
                            <i class="fas fa-star me-2"></i>${mailData.claim_id}
                        </span>
                    </div>
                `;
            }
        }

        if (additionalInfoHtml) {
            mailAdditionalInfo.innerHTML = additionalInfoHtml;
            mailAdditionalInfo.classList.remove('d-none');
        } else {
            mailAdditionalInfo.innerHTML = '';
            mailAdditionalInfo.classList.add('d-none');
        }
    }
    
    // Update mail detail title
    let mailTypeTitle = 'Mail';
    if (currentMailType === 'fnol') {
        mailTypeTitle = 'FNOL Mail';
    } else if (currentMailType === 'non-fnol') {
        mailTypeTitle = 'Non-FNOL Mail';
    } else if (currentMailType === 'claims') {
        mailTypeTitle = 'Follow-up Mail';
    }
    document.getElementById('mail-detail-title').textContent = `Mail Details - ${mailTypeTitle}`;
    
    // Display attachments if available
    displayAttachments(mailData);
}

// Function to display attachments
function displayAttachments(mailData) {
    const attachmentContainer = document.getElementById('mail-attachments-container');
    if (!attachmentContainer) return;
    
    // Check if this mail has a claim ID and attachments
    const hasClaimId = mailData.claim_id && mailData.claim_id.trim() !== '';
    const attachmentPaths = mailData.extracted_data?.attachment_path || [];
    
    console.log("Mail Data for attachments:", mailData);
    console.log("Claim ID:", mailData.claim_id);
    console.log("Attachment Paths:", attachmentPaths);
    
    // Only show attachments if there's a claim ID and attachment paths
    if (!hasClaimId || !attachmentPaths || attachmentPaths.length === 0) {
        attachmentContainer.classList.add('d-none');
        return;
    }
    
    // Clear existing attachments
    const attachmentList = document.getElementById('mail-attachments-list');
    attachmentList.innerHTML = '';
    
    // Create attachment items
    attachmentPaths.forEach((attachmentPath, index) => {
        // Extract filename from path
        const filename = attachmentPath.split('\\').pop() || attachmentPath.split('/').pop() || attachmentPath;
        
        // Determine file type and icon
        const fileExtension = filename.split('.').pop().toLowerCase();
        let fileIcon = 'fas fa-file';
        let fileTypeClass = 'text-secondary';
        
        switch (fileExtension) {
            case 'pdf':
                fileIcon = 'fas fa-file-pdf';
                fileTypeClass = 'text-danger';
                break;
            case 'doc':
            case 'docx':
                fileIcon = 'fas fa-file-word';
                fileTypeClass = 'text-primary';
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                fileIcon = 'fas fa-file-image';
                fileTypeClass = 'text-success';
                break;
            case 'xls':
            case 'xlsx':
                fileIcon = 'fas fa-file-excel';
                fileTypeClass = 'text-success';
                break;
            case 'txt':
                fileIcon = 'fas fa-file-alt';
                fileTypeClass = 'text-info';
                break;
            default:
                fileIcon = 'fas fa-file';
                fileTypeClass = 'text-secondary';
        }
        
        // Create attachment item
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item d-flex justify-content-between align-items-center p-3 mb-2 border rounded';
        attachmentItem.style.cursor = 'pointer';
        attachmentItem.style.transition = 'all 0.3s ease';
        
        attachmentItem.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="${fileIcon} ${fileTypeClass} me-3" style="font-size: 1.5rem;"></i>
                <div>
                    <div class="fw-bold text-dark">${filename}</div>
                    <small class="text-muted">${fileExtension.toUpperCase()} File</small>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" onclick="previewAttachment('${mailData.claim_id}', '${filename}')" title="Preview">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-sm" onclick="downloadAttachment('${mailData.claim_id}', '${filename}', event)" title="Download">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        
        // Add hover effects
        attachmentItem.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });
        
        attachmentItem.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.boxShadow = 'none';
        });
        
        attachmentList.appendChild(attachmentItem);
    });
    
    // Show the attachments container
    attachmentContainer.classList.remove('d-none');
}

// Function to download attachment
async function downloadAttachment(claimId, filename, event) {
    try {
        // Show loading indicator
        const downloadBtn = event ? event.target.closest('button') : null;
        let originalContent = '';
        if (downloadBtn) {
            originalContent = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            downloadBtn.disabled = true;
        }
        
        // Construct the download URL
        const container = 'fnol-data'; // Fixed container name
        const folder = `${claimId}/attachments`; // Folder structure: claim_id/attachments
        const downloadUrl = `${API_URLS.download}?container=${encodeURIComponent(container)}&folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(filename)}`;
        
        console.log("Downloading from URL:", downloadUrl);
        
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showNotification(`Successfully downloaded ${filename}`, 'success');
        
    } catch (error) {
        console.error('Error downloading attachment:', error);
        showNotification(`Failed to download ${filename}`, 'error');
    } finally {
        // Restore button state
        if (event) {
            const downloadBtn = event.target.closest('button');
            if (downloadBtn) {
                downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
                downloadBtn.disabled = false;
            }
        }
    }
}

// Function to preview attachment (for images and PDFs)
async function previewAttachment(claimId, filename) {
    try {
        const fileExtension = filename.split('.').pop().toLowerCase();
        const container = 'fnol-data'; // Fixed container name
        const folder = `${claimId}/attachments`; // Folder structure: claim_id/attachments
        const previewUrl = `${API_URLS.download}?container=${encodeURIComponent(container)}&folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(filename)}`;
        
        console.log("Previewing from URL:", previewUrl);
        
        // For images, show in modal
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension)) {
            showImagePreviewModal(previewUrl, filename, claimId);
        } 
        // For PDFs and documents, open in new tab
        else {
            window.open(previewUrl, '_blank');
        }
        
    } catch (error) {
        console.error('Error previewing attachment:', error);
        showNotification(`Failed to preview ${filename}`, 'error');
    }
}

// Function to show image preview modal
function showImagePreviewModal(imageUrl, filename, claimId = null) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('attachment-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'attachment-preview-modal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Attachment Preview</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="preview-image" src="" alt="Attachment Preview" class="img-fluid" style="max-height: 70vh;">
                        <div id="preview-loading" class="d-none">
                            <i class="fas fa-spinner fa-spin fa-3x"></i>
                            <p class="mt-2">Loading preview...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <span id="preview-filename" class="me-auto"></span>
                        <button type="button" id="modal-download-btn" class="btn btn-primary">
                            <i class="fas fa-download me-2"></i>Download
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal content
    const previewImage = document.getElementById('preview-image');
    const previewLoading = document.getElementById('preview-loading');
    const previewFilename = document.getElementById('preview-filename');
    const downloadBtn = document.getElementById('modal-download-btn');
    
    previewLoading.classList.remove('d-none');
    previewImage.style.display = 'none';
    previewFilename.textContent = filename;
    
    // Update download button onclick handler
    if (claimId) {
        downloadBtn.onclick = function(event) {
            downloadAttachment(claimId, filename, event);
        };
    } else {
        downloadBtn.style.display = 'none';
    }
    
    // Load image
    previewImage.onload = function() {
        previewLoading.classList.add('d-none');
        previewImage.style.display = 'block';
    };
    
    previewImage.onerror = function() {
        previewLoading.classList.add('d-none');
        previewImage.style.display = 'none';
        showNotification('Failed to load image preview', 'error');
    };
    
    previewImage.src = imageUrl;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Function to show notifications
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Function to display extracted data
function displayExtractedData(extractedData) {
    const extractedDataContainer = document.getElementById('extracted-data-cards');
    extractedDataContainer.innerHTML = '';
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
        extractedDataContainer.innerHTML = '<div class="col-12 py-4 text-center"><div class="p-4 rounded bg-light text-muted"><i class="fas fa-info-circle fa-2x mb-3"></i><p class="lead">No extracted data available</p></div></div>';
        return;
    }
    
    // Sort keys alphabetically
    const sortedKeys = Object.keys(extractedData).sort();
    
    // Create a category mapping to group related fields together with icons and colors
    const categories = {
        'policy': {
            fields: ['policy_number', 'insured_name', 'policy_type', 'policy_status', 'policy_start_date', 'policy_end_date'],
            icon: 'fas fa-file-contract',
            color: '#3498db'
        },
        'incident': {
            fields: ['InputLossDate', 'incidentDate', 'incident_date', 'incident_time', 'incident_location', 'incident_description'],
            icon: 'fas fa-car-crash',
            color: '#e74c3c'
        },
        'contact': {
            fields: ['email_id', 'phone_number', 'reporter_name', 'contact_method', 'address'],
            icon: 'fas fa-address-card',
            color: '#2ecc71'
        },
        'vehicle': {
            fields: ['vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_vin', 'license_plate'],
            icon: 'fas fa-car',
            color: '#f39c12'
        },
        'claim': {
            fields: ['claim_number', 'claim_status', 'claim_type', 'claim_description'],
            icon: 'fas fa-clipboard-list',
            color: '#9b59b6'
        }
    };
    
    // Function to determine category for a key
    const getCategory = (key) => {
        const lowerKey = key.toLowerCase();
        for (const [category, info] of Object.entries(categories)) {
            if (info.fields.some(field => lowerKey.includes(field.toLowerCase()))) {
                return category;
            }
        }
        return 'other';
    };
    
    // Group keys by category
    const groupedKeys = {};
    sortedKeys.forEach(key => {
        const value = extractedData[key];
        if (value !== null && value !== undefined && value !== '') {
            const category = getCategory(key);
            if (!groupedKeys[category]) {
                groupedKeys[category] = [];
            }
            groupedKeys[category].push(key);
        }
    });
    
    // Get icon for each category
    const categoryIcons = {
        'policy': 'fas fa-file-contract',
        'incident': 'fas fa-car-crash',
        'contact': 'fas fa-address-book',
        'vehicle': 'fas fa-car',
        'claim': 'fas fa-clipboard-list',
        'other': 'fas fa-info-circle'
    };
    
    // Create cards for each category
    for (const [category, keys] of Object.entries(groupedKeys)) {
        // Skip empty categories
        if (keys.length === 0) continue;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'col-md-6 mb-3';
        
        let cardContent = `
            <div class="card data-category-card h-100">
                <div class="card-header bg-light">
                    <h6 class="mb-0">
                        <i class="${categoryIcons[category] || 'fas fa-info-circle'} me-2"></i>
                        ${category.charAt(0).toUpperCase() + category.slice(1)} Information
                    </h6>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
        `;
        
        // Add each field to the card
        keys.forEach(key => {
            const value = extractedData[key];
            cardContent += `
                <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 py-2">
                    <div class="fw-bold text-muted">${formatLabel(key)}</div>
                    <span class="ms-2 text-break text-end">${value}</span>
                </li>
            `;
        });
        
        cardContent += `
                    </ul>
                </div>
            </div>
        `;
        
        categoryCard.innerHTML = cardContent;
        extractedDataContainer.appendChild(categoryCard);
    }
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
    } else if (currentMailType === 'claims') {
        fetchFollowupMails().then(() => {
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
    // Prepare data for charts from the statsData
    const dates = Object.keys(statsData.daily_stats || {}).sort();
    const formattedDates = dates.map(date => {
        const d = new Date(date);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    });
    
    // Initialize the user mails pie chart
    updateUserMailsPieChart();
    
    const fnolEmailsData = dates.map(date => statsData.daily_stats[date].fnol_emails_received);
    const nonfnol = dates.map(date => statsData.daily_stats[date].non_fnol_mails);
    const followupData = dates.map(date => statsData.daily_stats[date].followup_emails_sent);
    const claimsData = dates.map(date => statsData.daily_stats[date].claims_generated);
    
    // Trend chart
    const trendChartCtx = document.getElementById('trendChart');
    if (trendChartCtx) {
        chart = new Chart(trendChartCtx, {
            type: 'line',
            data: {
                labels: formattedDates.length > 0 ? formattedDates : ['No Data'],
                datasets: [
                    {
                        label: 'FNOL Emails Received',
                        data: fnolEmailsData.length > 0 ? fnolEmailsData : [0],
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Non-FNOL Emails',
                        data: nonfnol.length > 0 ? nonfnol : [0],
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Follow-ups Sent',
                        data: followupData.length > 0 ? followupData : [0],
                        borderColor: '#0dcaf0',
                        backgroundColor: 'rgba(13, 202, 240, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Claims Generated',
                        data: claimsData.length > 0 ? claimsData : [0],
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
    
    // Daily mail status bar chart
    const incidentBarChartCtx = document.getElementById('incidentBarChart');
    if (incidentBarChartCtx) {
        // Get the last 7 days of data or all available days if less than 7
        const dates = Object.keys(statsData.daily_stats || {}).sort().reverse();
        const displayDates = dates.slice(0, 7);
        
        // Format dates for display
        const formattedDates = displayDates.map(date => {
            const d = new Date(date);
            return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
        });
        
        // Prepare data arrays for each category
        const fnolData = [];
        const nonFnolData = [];
        const followupData = [];
        const claimsData = [];
        
        // Populate data arrays from statistics
        displayDates.forEach(date => {
            const dayStats = statsData.daily_stats[date];
            
            // Calculate FNOL mails (total emails - non-fnol emails)
            const fnolCount = dayStats.fnol_emails_received - (dayStats.non_fnol_emails || 0);
            fnolData.push(fnolCount);
            
            // Use available data or default to 0
            nonFnolData.push(dayStats.non_fnol_emails || 0);
            followupData.push(dayStats.followup_emails_sent || 0);
            claimsData.push(dayStats.claims_generated || 0);
        });
        
        barChart = new Chart(incidentBarChartCtx, {
            type: 'bar',
            data: {
                labels: formattedDates,
                datasets: [
                    {
                        label: 'FNOL Mails',
                        data: fnolData,
                        backgroundColor: 'rgba(13, 110, 253, 0.8)',
                        borderColor: 'rgba(13, 110, 253, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Non-FNOL Mails',
                        data: nonFnolData,
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Follow-up Mails',
                        data: followupData,
                        backgroundColor: 'rgba(13, 202, 240, 0.8)',
                        borderColor: 'rgba(13, 202, 240, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Claims Generated',
                        data: claimsData,
                        backgroundColor: 'rgba(25, 135, 84, 0.8)',
                        borderColor: 'rgba(25, 135, 84, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        stacked: false,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    title: {
                        display: true,
                        text: 'Daily Mail Status'
                    }
                }
            }
        });
    }
}

// Function to update all charts based on the current theme
function updateCharts() {
    if (chart) {
        updateChartTheme(chart);
    }
    
    if (barChart) {
        updateChartTheme(barChart);
    }
    
    if (userMailsPieChart) {
        updateChartTheme(userMailsPieChart);
    }
}

// Function to update the user mails pie chart
function updateUserMailsPieChart() {
    // Get the canvas element
    const userMailsPieChartCtx = document.getElementById('userMailsPieChart');
    if (!userMailsPieChartCtx) return;
    
    // Check if we have data for the pie chart
    if (!statsData.Mails_by_user || Object.keys(statsData.Mails_by_user).length === 0) {
        console.log('No Mails_by_user data available for pie chart');
        return;
    }
    
    // Destroy existing chart if it exists
    if (userMailsPieChart) {
        userMailsPieChart.destroy();
    }
    
    // Extract labels and data from Mails_by_user
    const labels = Object.keys(statsData.Mails_by_user);
    const data = labels.map(key => statsData.Mails_by_user[key]);
    
    // Custom colors for each category
    const backgroundColors = [
        'rgba(54, 162, 235, 0.8)',   // Blue for Brokers
        'rgba(255, 99, 211, 0.8)',    // Pink for Customers
        'rgba(255, 206, 86, 0.8)',    // Yellow (for any additional categories)
        'rgba(75, 192, 192, 0.8)',    // Green (for any additional categories)
        'rgba(153, 102, 255, 0.8)'    // Purple (for any additional categories)
    ];
    
    // Create the pie chart
    userMailsPieChart = new Chart(userMailsPieChartCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Mails by User Category',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Function to refresh stats
async function refreshStats() {
    try {
        await fetchTracingStats();
        // Re-initialize charts with the new data
        if (chart) {
            chart.destroy();
        }
        if (barChart) {
            barChart.destroy();
        }
        initCharts();
    } catch (error) {
        console.error('Error refreshing stats:', error);
        // Fallback to calculated stats if API fails
        calculateStats();
    }
}

// Function to ensure the correct sun/moon icon is displayed based on dark mode state
function updateThemeIcon() {
    const moonIcon = document.querySelector('.fa-moon');
    const sunIcon = document.querySelector('.fa-sun');
    
    if (darkMode) {
        moonIcon.classList.add('d-none');
        sunIcon.classList.remove('d-none');
    } else {
        moonIcon.classList.remove('d-none');
        sunIcon.classList.add('d-none');
    }
}

// This function updates the theme based on the dark mode setting
function updateTheme() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Update icon visibility
    updateThemeIcon();
    
    // Update charts if they exist
    updateCharts();
}

// Fallback function for updating chart themes if theme_toggle.js is not loaded yet
if (typeof updateChartTheme !== 'function') {
    function updateChartTheme(chartInstance) {
        if (!chartInstance) return;
        
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
}

// Add function to navigate to parent mail
function viewParentMail(parentMailId) {
    // First select the FNOL card since parent mails are always FNOL type
    selectCard('fnol');
    
    // Then show the details of the parent mail
    setTimeout(() => {
        showMailDetails(parentMailId);
    }, 100); // Small timeout to ensure card selection completes
}
