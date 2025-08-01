// Global variables
let currentMailType = 'fnol';
let currentMailId = null;
let currentFilterStatus = 'all';
let currentSortOption = 'date-desc'; // Default sort: newest first
let chart = null;
let barChart = null;
let darkMode = localStorage.getItem('darkMode') === 'enabled';

// API URLs
const API_URLS = {
    fnolMails: 'http://127.0.0.1:8000/FNOL_mails',
    nonFnolMails: 'http://127.0.0.1:8000/non_FNOL_mails',
    tracing: 'http://127.0.0.1:8000/tracing',
    followupMails: 'http://127.0.0.1:8000/followup_mails'
};

// Data storage
let fnolMailsData = [];
let nonFnolMailsData = [];
let followupMailsData = [];
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
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out'
    });
    
    // Apply theme based on saved preference
    updateTheme();
    
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
    
    // Fetch data from APIs in parallel
    await Promise.all([
        fetchFnolMails(),
        fetchNonFnolMails(),
        fetchFollowupMails(),
        fetchTracingStats()
    ]);
    
    // Calculate statistics
    calculateStats();
    
    // Initial display of mail list
    loadMailList();
    
    // Hide loading indicators
    showLoading(false);
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
        return data;
    } catch (error) {
        console.error('Error fetching FNOL mails:', error);
        return [];
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
        statsData.emails_received = data.emails_received;
        statsData.incomplete_info_emails = data.incomplete_info_emails;
        statsData.followup_emails_sent = data.followup_emails_sent;
        statsData.claims_generated = data.claims_generated;
        statsData.daily_stats = data.daily_stats;
        statsData.last_updated = data.last_updated;
        
        // Calculate additional statistics if needed
        enhanceStatsData();
        
        // Update the UI with new stats data
        updateStatsDisplay();
        updateDailyStatsTable();
        
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
            if (dayStats.emails_received !== undefined && dayStats.non_fnol_emails === undefined) {
                // Estimate non-FNOL emails (could be inaccurate but better than nothing)
                // On average, assuming non-FNOL emails are approximately 30% of total
                dayStats.non_fnol_emails = Math.round(dayStats.emails_received * 0.3);
            }
        });
    }
}

// Function to calculate overall statistics
function calculateStats() {
    // If we haven't fetched the stats from the API yet, calculate basic stats from mail data
    if (!statsData.last_updated) {
        // Calculate total emails
        statsData.emails_received = fnolMailsData.length + nonFnolMailsData.length;
        
        // Calculate incomplete emails (new status)
        statsData.incomplete_info_emails = fnolMailsData.filter(mail => mail.status === 'new').length;
    }
    
    // Update the stats display
    updateStatsDisplay();
}

// Update the statistics display
function updateStatsDisplay() {
    document.getElementById('analytics-emails-received').textContent = statsData.emails_received;
    document.getElementById('analytics-incomplete').textContent = statsData.incomplete_info_emails;
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
            <td>${dayStats.emails_received}</td>
            <td>${dayStats.incomplete_info_emails}</td>
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
    const mailListElement = document.getElementById('mail-list');
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
        document.getElementById('mail-date').textContent = formatDateTime(mailData.date);
        document.getElementById('mail-status').textContent = mailData.status || 'Unknown';
        document.getElementById('mail-policy').textContent = mailData.extracted_data?.extracted_data?.policy_number || 'Not found';
        document.getElementById('mail-incident-date').textContent = mailData.extracted_data?.extracted_data?.InputLossDate || 'Not specified';
        document.getElementById('mail-description').textContent = mailData.extracted_data?.body_text || 'No description available';
        
        // Display extracted info
        displayExtractedData(mailData.extracted_data?.extracted_data || {});
    } else if (currentMailType === 'claims') {
        // Follow-up mail format
        document.getElementById('mail-from').textContent = mailData.extracted_data?.email_id || 'Unknown';
        document.getElementById('mail-subject').textContent = mailData.extracted_data?.subject || 'No subject';
        document.getElementById('mail-date').textContent = formatDateTime(mailData.date);
        document.getElementById('mail-status').textContent = 'Follow-up';
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
    
    // Handle additional info section
    const mailAdditionalInfo = document.getElementById('mail-additional-info');
    if (mailAdditionalInfo) {
        if (currentMailType === 'claims') {
            const parentId = mailData.parent_id || '';
            mailAdditionalInfo.innerHTML = `
                <div class="mb-3">
                    <strong>Related to:</strong>
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
    
    const emailsData = dates.map(date => statsData.daily_stats[date].emails_received);
    const incompleteData = dates.map(date => statsData.daily_stats[date].incomplete_info_emails);
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
                        label: 'Emails Received',
                        data: emailsData.length > 0 ? emailsData : [0],
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Incomplete Info',
                        data: incompleteData.length > 0 ? incompleteData : [0],
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
            const fnolCount = dayStats.emails_received - (dayStats.non_fnol_emails || 0);
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
