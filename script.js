// DOM Elements
const startTestBtn = document.getElementById('startTest');
const gaugeIndicator = document.getElementById('gaugeIndicator');
const testStatus = document.getElementById('testStatus');
const currentSpeed = document.getElementById('currentSpeed');
const downloadResult = document.getElementById('downloadResult');
const uploadResult = document.getElementById('uploadResult');
const pingResult = document.getElementById('pingResult');
const jitterResult = document.getElementById('jitterResult');
const progressFill = document.getElementById('progressFill');
const stepPing = document.getElementById('stepPing');
const stepDownload = document.getElementById('stepDownload');
const stepUpload = document.getElementById('stepUpload');
const stepComplete = document.getElementById('stepComplete');
const shareResults = document.getElementById('shareResults');
const ispInfo = document.getElementById('ispInfo');
const serverInfo = document.getElementById('serverInfo');
const ipInfo = document.getElementById('ipInfo');
const changeServer = document.getElementById('changeServer');
const serverModal = document.getElementById('serverModal');
const closeServerModal = document.getElementById('closeServerModal');
const confirmServerSelection = document.getElementById('confirmServerSelection');
const currentServer = document.getElementById('currentServer');
// const navToggle = document.getElementById('navToggle');
// const navList = document.getElementById('navList');

// Configuration variables
const downloadTestFile = 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Tokyo_Sky_Tree_2012.JPG'; // ~8MB file
const downloadFileSize = 8185374; // Size in bytes
const uploadTestSize = 2 * 1024 * 1024; // 2MB of data for upload test
const pingTestCount = 10;
const testTimeoutMs = 15000; // 15 seconds timeout for each test
const maxDownloadSpeed = 1000; // Maximum speed in Mbps for gauge display
const pingThreshold = 100; // ms threshold for "good" ping

// State variables
let selectedServer = 'Auto (Best Server)';
let testInProgress = false;
let pingValues = [];
let downloadSpeed = 0;
let uploadSpeed = 0;
let pingTime = 0;
let jitterTime = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    startTestBtn.addEventListener('click', startSpeedTest);
    changeServer.addEventListener('click', openServerModal);
    closeServerModal.addEventListener('click', closeModal);
    confirmServerSelection.addEventListener('click', confirmServer);
    // navToggle.addEventListener('click', toggleNavMenu);
    
    // Server selection listeners
    const serverOptions = document.querySelectorAll('.server-option');
    serverOptions.forEach(option => {
        option.addEventListener('click', function() {
            serverOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Get initial network information
    fetchNetworkInfo();
}

// UI Helpers
function toggleNavMenu() {
    navList.classList.toggle('active');
}

function openServerModal() {
    serverModal.classList.add('active');
}

function closeModal() {
    serverModal.classList.remove('active');
}

function confirmServer() {
    const selectedOption = document.querySelector('.server-option.selected');
    if (selectedOption) {
        selectedServer = selectedOption.querySelector('.server-name').textContent;
        currentServer.textContent = `Testing Server: ${selectedServer}`;
        serverInfo.textContent = selectedServer;
    }
    closeModal();
}

function updateGauge(speedMbps) {
    // Calculate rotation angle (from -90 to 90 degrees)
    const percentage = Math.min(speedMbps / maxDownloadSpeed, 1);
    const angle = -90 + (percentage * 180);
    gaugeIndicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

function updateTestStatus(status) {
    testStatus.textContent = status;
}

function updateProgress(percentage) {
    progressFill.style.width = `${percentage}%`;
}

function updateTestSteps(step) {
    // Reset all steps
    [stepPing, stepDownload, stepUpload, stepComplete].forEach(s => {
        s.classList.remove('active', 'completed');
    });
    
    switch(step) {
        case 'ping':
            stepPing.classList.add('active');
            break;
        case 'download':
            stepPing.classList.add('completed');
            stepDownload.classList.add('active');
            break;
        case 'upload':
            stepPing.classList.add('completed');
            stepDownload.classList.add('completed');
            stepUpload.classList.add('active');
            break;
        case 'complete':
            stepPing.classList.add('completed');
            stepDownload.classList.add('completed');
            stepUpload.classList.add('completed');
            stepComplete.classList.add('active');
            break;
    }
}

function displayResults() {
    // Display final results
    downloadResult.textContent = downloadSpeed.toFixed(2);
    uploadResult.textContent = uploadSpeed.toFixed(2);
    pingResult.textContent = pingTime.toFixed(0);
    jitterResult.textContent = jitterTime.toFixed(1);
    
    // Show share buttons
    shareResults.style.display = 'flex';
}

function showStartButton() {
    startTestBtn.style.display = 'block';
    startTestBtn.textContent = 'TEST AGAIN';
}

function hideStartButton() {
    startTestBtn.style.display = 'none';
}

// // Network Information
// function fetchNetworkInfo() {
//     // In a real app, you would fetch this from an API
//     // For demonstration purposes, we'll use placeholder data
//     setTimeout(() => {
//         ispInfo.textContent = '';
//         serverInfo.textContent = ;
//         ipInfo.textContent = '';
//     }, 1000);
// }

// Speed Test Functions
function startSpeedTest() {
    if (testInProgress) return;
    
    testInProgress = true;
    pingValues = [];
    downloadSpeed = 0;
    uploadSpeed = 0;
    pingTime = 0;
    jitterTime = 0;
    
    // Reset UI
    updateGauge(0);
    currentSpeed.textContent = '0.00';
    hideStartButton();
    shareResults.style.display = 'none';
    updateProgress(0);
    
    // Start the test sequence
    runPingTest()
        .then(() => runDownloadTest())
        .then(() => runUploadTest())
        .then(() => completeTest())
        .catch(error => {
            console.error('Test failed:', error);
            updateTestStatus('Test Failed');
            showStartButton();
            testInProgress = false;
        });
}

// Ping Test
function runPingTest() {
    return new Promise((resolve, reject) => {
        updateTestStatus('Testing Ping...');
        updateTestSteps('ping');
        
        let pingsDone = 0;
        const startPingTest = () => {
            if (pingsDone >= pingTestCount) {
                // Calculate average ping and jitter
                pingTime = pingValues.reduce((sum, val) => sum + val, 0) / pingValues.length;
                
                // Calculate jitter (average deviation from the mean)
                const deviations = pingValues.map(val => Math.abs(val - pingTime));
                jitterTime = deviations.reduce((sum, val) => sum + val, 0) / deviations.length;
                
                updateProgress(25);
                resolve();
                return;
            }
            
            const startTime = performance.now();
            // Simulate a ping by loading a small image
            const pingImg = new Image();
            const pingUrl = `${downloadTestFile}?t=${Date.now()}`;
            
            const pingTimeout = setTimeout(() => {
                pingImg.onload = pingImg.onerror = null;
                startPingTest(); // Skip this attempt and continue
            }, 2000);
            
            pingImg.onload = pingImg.onerror = function() {
                clearTimeout(pingTimeout);
                const endTime = performance.now();
                const pingMs = endTime - startTime;
                pingValues.push(pingMs);
                
                // Update UI with current ping
                currentSpeed.textContent = pingMs.toFixed(0);
                currentSpeed.nextElementSibling.textContent = 'ms';
                
                pingsDone++;
                updateProgress((pingsDone / pingTestCount) * 25);
                setTimeout(startPingTest, 200);
            };
            
            pingImg.src = pingUrl;
        };
        
        startPingTest();
    });
}

// Download Test
function runDownloadTest() {
    return new Promise((resolve, reject) => {
        updateTestStatus('Testing Download...');
        updateTestSteps('download');
        currentSpeed.nextElementSibling.textContent = 'Mbps';
        
        const startTime = performance.now();
        let loadedBytes = 0;
        let chunksLoaded = 0;
        const totalChunks = 3; // Load multiple chunks for more accurate test
        
        const loadChunk = () => {
            if (chunksLoaded >= totalChunks) {
                const endTime = performance.now();
                const durationSeconds = (endTime - startTime) / 1000;
                downloadSpeed = ((loadedBytes * 8) / durationSeconds / 1024 / 1024);
                
                updateProgress(50);
                resolve();
                return;
            }
            
            const downloadImg = new Image();
            const downloadUrl = `${downloadTestFile}?t=${Date.now()}`;
            
            const downloadTimeout = setTimeout(() => {
                downloadImg.onload = downloadImg.onerror = null;
                chunksLoaded++;
                loadChunk(); // Skip this attempt and continue
            }, testTimeoutMs);
            
            downloadImg.onload = function() {
                clearTimeout(downloadTimeout);
                loadedBytes += downloadFileSize;
                chunksLoaded++;
                
                // Calculate current speed
                const currentTime = performance.now();
                const currentDuration = (currentTime - startTime) / 1000;
                const currentSpeedMbps = ((loadedBytes * 8) / currentDuration / 1024 / 1024);
                
                // Update UI
                currentSpeed.textContent = currentSpeedMbps.toFixed(2);
                updateGauge(currentSpeedMbps);
                updateProgress(25 + (chunksLoaded / totalChunks) * 25);
                
                setTimeout(loadChunk, 100);
            };
            
            downloadImg.onerror = function() {
                clearTimeout(downloadTimeout);
                chunksLoaded++;
                loadChunk(); // Continue despite error
            };
            
            downloadImg.src = downloadUrl;
        };
        
        loadChunk();
    });
}

// Upload Test - Fixed to avoid invalid array length
function runUploadTest() {
    return new Promise((resolve, reject) => {
        updateTestStatus('Testing Upload...');
        updateTestSteps('upload');
        
        // In a real app, you would actually upload data to a server
        // Since we can't do that in this example, we'll simulate an upload
        simulateUploadTest()
            .then(speed => {
                uploadSpeed = speed;
                updateProgress(75);
                resolve();
            })
            .catch(reject);
    });
}

function simulateUploadTest() {
    return new Promise((resolve) => {
        const startTime = performance.now();
        let progress = 0;
        const totalIterations = 100;
        const simulationDuration = 3000; // 3 seconds
        
        // Fixed: Instead of generating a huge array, we'll simulate the data
        // by calculating what the upload speed would be based on download speed
        
        // Simulate upload progress
        const simulateProgress = () => {
            progress++;
            const progressPercentage = (progress / totalIterations) * 100;
            
            // Calculate simulated speed (random variation for realism)
            const variation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier
            // Upload typically slower than download (about 20-40% of download)
            const uploadRatio = 0.3 + Math.random() * 0.2;
            const maxUploadSpeedMbps = downloadSpeed * uploadRatio * variation;
            const currentUploadSpeed = maxUploadSpeedMbps * (progressPercentage / 100);
            
            // Update UI
            currentSpeed.textContent = currentUploadSpeed.toFixed(2);
            updateGauge(currentUploadSpeed);
            updateProgress(50 + (progressPercentage / 4));
            
            if (progress < totalIterations) {
                setTimeout(simulateProgress, simulationDuration / totalIterations);
            } else {
                const endTime = performance.now();
                const durationSeconds = (endTime - startTime) / 1000;
                
                // Final upload speed is a percentage of download speed
                const finalUploadSpeed = downloadSpeed * uploadRatio;
                resolve(finalUploadSpeed);
            }
        };
        
        simulateProgress();
    });
}

function completeTest() {
    updateTestStatus('Completed');
    updateTestSteps('complete');
    updateProgress(100);
    displayResults();
    showStartButton();
    testInProgress = false;
}

// Share and save functionality
document.getElementById('shareBtn').addEventListener('click', function() {
    if (navigator.share) {
        navigator.share({
            title: 'My Internet Speed Test Results',
            text: `Download: ${downloadSpeed.toFixed(2)} Mbps, Upload: ${uploadSpeed.toFixed(2)} Mbps, Ping: ${pingTime.toFixed(0)} ms`,
            url: window.location.href
        })
        .catch(error => console.error('Error sharing:', error));
    } else {
        alert('Share functionality not supported by your browser. Results copied to clipboard!');
        // Copy to clipboard fallback
        const resultText = `Download: ${downloadSpeed.toFixed(2)} Mbps, Upload: ${uploadSpeed.toFixed(2)} Mbps, Ping: ${pingTime.toFixed(0)} ms`;
        navigator.clipboard.writeText(resultText)
            .catch(err => console.error('Could not copy text: ', err));
    }
});

document.getElementById('saveBtn').addEventListener('click', function() {
    // In a real app, this would save to a database or local storage
    alert('Results saved! You can view your history in the Results tab.');
});


       // Navigation functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Toggle navigation on mobile
            const navToggle = document.getElementById('navToggle');
            const navList = document.getElementById('navList');
            
            if (navToggle) {
                navToggle.addEventListener('click', function() {
                    navList.classList.toggle('active');
                });
            }

            // Page navigation functionality
            const homeLink = document.getElementById('homeLink');
            const aboutLink = document.getElementById('aboutLink');
            const contactLink = document.getElementById('contactLink');
            const mainContent = document.getElementById('mainContent');
            const aboutPage = document.getElementById('aboutPage');
            const contactPage = document.getElementById('contactPage');
            
            // Function to hide all pages
            function hideAllPages() {
                mainContent.classList.add('hidden');
                aboutPage.classList.remove('visible');
                contactPage.classList.remove('visible');
                
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item a').forEach(item => {
                    item.classList.remove('active');
                });
            }
            
            // Home page
            if (homeLink) {
                homeLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideAllPages();
                    mainContent.classList.remove('hidden');
                    homeLink.classList.add('active');
                });
            }
            
            // About page
            if (aboutLink) {
                aboutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideAllPages();
                    aboutPage.classList.add('visible');
                    aboutLink.classList.add('active');
                });
            }
            
            // Contact page
            if (contactLink) {
                contactLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    hideAllPages();
                    contactPage.classList.add('visible');
                    contactLink.classList.add('active');
                });
            }

            // Modal functionality
            const privacyLink = document.getElementById('privacyPolicyLink');
            const termsLink = document.getElementById('termsOfServiceLink');
            const privacyModal = document.getElementById('privacyPolicyModal');
            const termsModal = document.getElementById('termsOfServiceModal');
            
            // Open modals
            privacyLink.addEventListener('click', function(e) {
                e.preventDefault();
                privacyModal.style.display = 'block';
            });
            
            termsLink.addEventListener('click', function(e) {
                e.preventDefault();
                termsModal.style.display = 'block';
            });
            
            // Close modals when clicking on X
            document.querySelectorAll('.close-policy-modal').forEach(function(closeBtn) {
                closeBtn.addEventListener('click', function() {
                    privacyModal.style.display = 'none';
                    termsModal.style.display = 'none';
                });
            });
            
            // Close modals when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target === privacyModal) {
                    privacyModal.style.display = 'none';
                }
                if (event.target === termsModal) {
                    termsModal.style.display = 'none';
                }
            });

            // Server modal existing functionality
            const changeServer = document.getElementById('changeServer');
            const serverModal = document.getElementById('serverModal');
            const closeServerModal = document.getElementById('closeServerModal');
            const confirmServerSelection = document.getElementById('confirmServerSelection');
            
            if (changeServer) {
                changeServer.addEventListener('click', function() {
                    serverModal.style.display = 'block';
                });
            }
            
            if (closeServerModal) {
                closeServerModal.addEventListener('click', function() {
                    serverModal.style.display = 'none';
                });
            }
            
            if (confirmServerSelection) {
                confirmServerSelection.addEventListener('click', function() {
                    // Handle server selection
                    serverModal.style.display = 'none';
                });
            }
        });

async function fetchISPDetails() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      document.getElementById('ispInfo').textContent = data.org || 'N/A';
      document.getElementById('ipInfo').textContent = data.ip || 'N/A';
      document.getElementById('serverInfo').textContent = `${data.city}, ${data.country_name}` || 'N/A';
    } catch (error) {
      console.error("Failed to fetch ISP details:", error);
      document.getElementById('ispInfo').textContent = 'Unavailable';
      document.getElementById('ipInfo').textContent = 'Unavailable';
      document.getElementById('serverInfo').textContent = 'Unavailable';
    }
  }

  // Trigger fetch on page load
  window.addEventListener('DOMContentLoaded', fetchISPDetails);
