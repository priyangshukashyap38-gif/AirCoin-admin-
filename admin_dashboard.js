// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBUNtVWVhJKfF8W2M7wdYiWPFkrovClQhM",
    authDomain: "aircoin-1.firebaseapp.com",
    databaseURL: "https://aircoin-1-default-rtdb.firebaseio.com",
    projectId: "aircoin-1",
    messagingSenderId: "910797248837",
    appId: "1:910797248837:web:ae6742d2ee9a705d93062c",
    measurementId: "G-PS997H01C2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const adminEmailElement = document.getElementById('adminEmail');
const totalUsersElement = document.getElementById('totalUsers');
const pendingRequestsElement = document.getElementById('pendingRequests');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const userSearchInput = document.getElementById('userSearch');

// Tab elements
const adminTabs = document.querySelectorAll('.admin-tab');
const tabContents = document.querySelectorAll('.tab-content');

// Request lists
const pendingRequestsList = document.getElementById('pendingRequestsList');
const approvedRequestsList = document.getElementById('approvedRequestsList');
const rejectedRequestsList = document.getElementById('rejectedRequestsList');
const usersList = document.getElementById('usersList');

// Modal
const requestModal = document.getElementById('requestModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.querySelector('.modal-close');

// Cache for user data
const userCache = new Map();
let currentAdmin = null;

// Check admin authentication
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Not logged in, redirect to admin login
        window.location.href = 'admin_login.html';
    } else {
        currentAdmin = user;
        adminEmailElement.textContent = user.email;
        
        // Load initial data
        await loadDashboardData();
        setupRealTimeListeners();
    }
});

// Tab switching
adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        adminTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}Tab`) {
                content.classList.add('active');
                
                // Load data for this tab if not already loaded
                if (tabName === 'pending') {
                    loadPendingRequests();
                } else if (tabName === 'users') {
                    loadAllUsers();
                } else if (tabName === 'approved') {
                    loadApprovedRequests();
                } else if (tabName === 'rejected') {
                    loadRejectedRequests();
                }
            }
        });
    });
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load counts
        await loadUserCount();
        await loadPendingCount();
        
        // Load current tab data
        const activeTab = document.querySelector('.admin-tab.active').dataset.tab;
        if (activeTab === 'pending') {
            await loadPendingRequests();
        } else if (activeTab === 'users') {
            await loadAllUsers();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load user count
async function loadUserCount() {
    const usersRef = database.ref('users');
    const snapshot = await usersRef.once('value');
    totalUsersElement.textContent = snapshot.numChildren();
}

// Load pending requests count
async function loadPendingCount() {
    const requestsRef = database.ref('coinRequests').orderByChild('status').equalTo('pending');
    const snapshot = await requestsRef.once('value');
    pendingRequestsElement.textContent = snapshot.numChildren();
}

// Load pending requests
async function loadPendingRequests() {
    try {
        pendingRequestsList.innerHTML = '<div class="loading">Loading pending requests...</div>';
        
        const requestsRef = database.ref('coinRequests').orderByChild('status').equalTo('pending');
        const snapshot = await requestsRef.once('value');
        
        if (!snapshot.exists()) {
            pendingRequestsList.innerHTML = '<div class="no-data">No pending requests</div>';
            return;
        }
        
        const requests = [];
        snapshot.forEach(childSnapshot => {
            const request = childSnapshot.val();
            request.id = childSnapshot.key;
            requests.push(request);
        });
        
        // Sort by timestamp (oldest first for processing)
        requests.sort((a, b) => a.timestamp - b.timestamp);
        
        // Clear and render requests
        pendingRequestsList.innerHTML = '';
        for (const request of requests) {
            const userData = await getUserData(request.userId);
            const requestCard = createRequestCard(request, userData, 'pending');
            pendingRequestsList.appendChild(requestCard);
        }
    } catch (error) {
        console.error('Error loading pending requests:', error);
        pendingRequestsList.innerHTML = '<div class="no-data">Error loading requests</div>';
    }
}

// Load approved requests
async function loadApprovedRequests() {
    try {
        approvedRequestsList.innerHTML = '<div class="loading">Loading approved requests...</div>';
        
        const requestsRef = database.ref('coinRequests').orderByChild('status').equalTo('approved');
        const snapshot = await requestsRef.once('value');
        
        if (!snapshot.exists()) {
            approvedRequestsList.innerHTML = '<div class="no-data">No approved requests</div>';
            return;
        }
        
        const requests = [];
        snapshot.forEach(childSnapshot => {
            const request = childSnapshot.val();
            request.id = childSnapshot.key;
            requests.push(request);
        });
        
        // Sort by timestamp (newest first)
        requests.sort((a, b) => b.timestamp - a.timestamp);
        
        // Clear and render requests
        approvedRequestsList.innerHTML = '';
        for (const request of requests) {
            const userData = await getUserData(request.userId);
            const requestCard = createRequestCard(request, userData, 'approved');
            approvedRequestsList.appendChild(requestCard);
        }
    } catch (error) {
        console.error('Error loading approved requests:', error);
        approvedRequestsList.innerHTML = '<div class="no-data">Error loading requests</div>';
    }
}

// Load rejected requests
async function loadRejectedRequests() {
    try {
        rejectedRequestsList.innerHTML = '<div class="loading">Loading rejected requests...</div>';
        
        const requestsRef = database.ref('coinRequests').orderByChild('status').equalTo('rejected');
        const snapshot = await requestsRef.once('value');
        
        if (!snapshot.exists()) {
            rejectedRequestsList.innerHTML = '<div class="no-data">No rejected requests</div>';
            return;
        }
        
        const requests = [];
        snapshot.forEach(childSnapshot => {
            const request = childSnapshot.val();
            request.id = childSnapshot.key;
            requests.push(request);
        });
        
        // Sort by timestamp (newest first)
        requests.sort((a, b) => b.timestamp - a.timestamp);
        
        // Clear and render requests
        rejectedRequestsList.innerHTML = '';
        for (const request of requests) {
            const userData = await getUserData(request.userId);
            const requestCard = createRequestCard(request, userData, 'rejected');
            rejectedRequestsList.appendChild(requestCard);
        }
    } catch (error) {
        console.error('Error loading rejected requests:', error);
        rejectedRequestsList.innerHTML = '<div class="no-data">Error loading requests</div>';
    }
}

// Load all users
async function loadAllUsers() {
    try {
        usersList.innerHTML = '<div class="loading">Loading users...</div>';
        
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        
        if (!snapshot.exists()) {
            usersList.innerHTML = '<div class="no-data">No users found</div>';
            return;
        }
        
        // Clear and render users
        usersList.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const userData = childSnapshot.val();
            userData.id = childSnapshot.key;
            const userCard = createUserCard(userData);
            usersList.appendChild(userCard);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<div class="no-data">Error loading users</div>';
    }
}

// Get user data with caching
async function getUserData(userId) {
    if (userCache.has(userId)) {
        return userCache.get(userId);
    }
    
    try {
        const userRef = database.ref('users/' + userId);
        const snapshot = await userRef.once('value');
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            userCache.set(userId, userData);
            return userData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Create request card
function createRequestCard(request, userData, status) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    const time = new Date(request.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const userName = userData ? userData.name : 'Unknown User';
    const userInitial = userName.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="request-header">
            <div class="request-user">${userName}</div>
            <div class="request-time">${time}</div>
        </div>
        <div class="request-body">
            <div class="request-photo">
                <div class="photo-container">
                    <img src="${request.photoLink}" alt="Submission" onerror="this.style.display='none';this.parentElement.innerHTML='<p>Image not available</p>';">
                </div>
                <div class="photo-links">
                    <a href="${request.photoLink}" target="_blank" class="photo-link">View Photo</a>
                    <a href="https://www.mediafire.com/folder/uzvkxg5c3ylnv/coin_requests" target="_blank" class="photo-link">MediaFire Folder</a>
                </div>
            </div>
            ${request.description ? `<div class="request-description">${request.description}</div>` : ''}
            ${status === 'pending' ? `
                <div class="request-actions">
                    <button class="btn-approve" data-request-id="${request.id}" data-user-id="${request.userId}">
                        ✅ Approve (+10 Coins)
                    </button>
                    <button class="btn-reject" data-request-id="${request.id}">
                        ❌ Reject
                    </button>
                </div>
            ` : `
                <button class="btn-view" data-request-id="${request.id}">
                    👁️ View Details
                </button>
            `}
        </div>
    `;
    
    // Add event listeners for action buttons
    if (status === 'pending') {
        const approveBtn = card.querySelector('.btn-approve');
        const rejectBtn = card.querySelector('.btn-reject');
        
        approveBtn.addEventListener('click', () => approveRequest(request.id, request.userId));
        rejectBtn.addEventListener('click', () => rejectRequest(request.id));
    } else {
        const viewBtn = card.querySelector('.btn-view');
        viewBtn.addEventListener('click', () => showRequestDetails(request, userData, status));
    }
    
    return card;
}

// Create user card
function createUserCard(userData) {
    const card = document.createElement('div');
    card.className = 'user-card';
    
    const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
    const joinDate = new Date(userData.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="user-header">
            <div class="user-avatar">${userInitial}</div>
            <div class="user-info">
                <h3>${userData.name}</h3>
                <div class="user-email">${userData.email}</div>
            </div>
        </div>
        <div class="user-details">
            <div class="detail-item">
                <span class="detail-label">Coins</span>
                <span class="detail-value coin-value">${userData.coins || 0} 🪙</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Joined</span>
                <span class="detail-value">${joinDate}</span>
            </div>
        </div>
        <div class="user-actions">
            <button class="btn-view-user" data-user-id="${userData.id}">
                View Details
            </button>
            <button class="btn-view-photo" data-photo-link="${userData.regPhotoLink || ''}">
                View Photo
            </button>
        </div>
    `;
    
    // Add event listeners
    const viewUserBtn = card.querySelector('.btn-view-user');
    const viewPhotoBtn = card.querySelector('.btn-view-photo');
    
    viewUserBtn.addEventListener('click', () => showUserDetails(userData));
    viewPhotoBtn.addEventListener('click', () => {
        if (userData.regPhotoLink) {
            window.open(userData.regPhotoLink, '_blank');
        } else {
            alert('No registration photo available');
        }
    });
    
    return card;
}

// Approve request
async function approveRequest(requestId, userId) {
    if (!confirm('Approve this request and award 10 coins?')) return;
    
    try {
        // Update request status
        await database.ref(`coinRequests/${requestId}`).update({
            status: 'approved',
            reviewedBy: currentAdmin.email,
            reviewedAt: Date.now()
        });
        
        // Award coins to user
        const userRef = database.ref(`users/${userId}/coins`);
        const snapshot = await userRef.once('value');
        const currentCoins = snapshot.val() || 0;
        await userRef.set(currentCoins + 10);
        
        // Show success message
        alert('✅ Request approved! 10 coins awarded to user.');
        
        // Refresh data
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Error approving request. Please try again.');
    }
}

// Reject request
async function rejectRequest(requestId) {
    if (!confirm('Reject this request?')) return;
    
    try {
        // Update request status
        await database.ref(`coinRequests/${requestId}`).update({
            status: 'rejected',
            reviewedBy: currentAdmin.email,
            reviewedAt: Date.now()
        });
        
        // Show success message
        alert('Request rejected.');
        
        // Refresh data
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error rejecting request. Please try again.');
    }
}

// Show request details in modal
function showRequestDetails(request, userData, status) {
    const userName = userData ? userData.name : 'Unknown User';
    const userEmail = userData ? userData.email : 'N/A';
    const time = new Date(request.timestamp).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let statusBadge = '';
    if (status === 'approved') {
        statusBadge = '<span style="background:#10b981;color:white;padding:5px 10px;border-radius:20px;font-size:0.9rem;">✅ Approved</span>';
    } else if (status === 'rejected') {
        statusBadge = '<span style="background:#ef4444;color:white;padding:5px 10px;border-radius:20px;font-size:0.9rem;">❌ Rejected</span>';
    }
    
    modalContent.innerHTML = `
        <div style="display:grid;gap:25px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h3 style="margin:0;">Request Details</h3>
                ${statusBadge}
            </div>
            
            <div style="background:#f8fafc;padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 15px 0;">User Information</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                    <div>
                        <strong>Name:</strong><br>
                        ${userName}
                    </div>
                    <div>
                        <strong>Email:</strong><br>
                        ${userEmail}
                    </div>
                    <div>
                        <strong>Submitted:</strong><br>
                        ${time}
                    </div>
                    <div>
                        <strong>Reviewed By:</strong><br>
                        ${request.reviewedBy || 'Not reviewed'}
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="margin:0 0 15px 0;">Photo Submission</h4>
                <div style="text-align:center;margin-bottom:15px;">
                    <img src="${request.photoLink}" alt="Submission" 
                         style="max-width:100%;max-height:400px;border-radius:8px;border:1px solid #e2e8f0;"
                         onerror="this.style.display='none';">
                </div>
                <div style="text-align:center;">
                    <a href="${request.photoLink}" target="_blank" 
                       style="color:#3b82f6;text-decoration:none;font-weight:500;">
                        🔗 Open Photo Link
                    </a>
                </div>
            </div>
            
            ${request.description ? `
            <div style="background:#f8fafc;padding:20px;border-radius:12px;">
                <h4 style="margin:0 0 10px 0;">Description</h4>
                <p style="margin:0;">${request.description}</p>
            </div>
            ` : ''}
            
            <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:15px;">
                <strong>📝 Admin Note:</strong><br>
                Photos should be manually reviewed and deleted from MediaFire if no longer needed.
                Visit: <a href="https://www.mediafire.com/folder/uzvkxg5c3ylnv/coin_requests" target="_blank">
                    MediaFire Coin Requests Folder
                </a>
            </div>
        </div>
    `;
    
    requestModal.classList.add('active');
}

// Show user details in modal
function showUserDetails(userData) {
    const joinDate = new Date(userData.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalContent.innerHTML = `
        <div style="display:grid;gap:25px;">
            <div style="display:flex;align-items:center;gap:20px;">
                <div style="width:80px;height:80px;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:600;">
                    ${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <h3 style="margin:0 0 5px 0;">${userData.name}</h3>
                    <div style="color:#64748b;">${userData.email}</div>
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;">
                <div style="background:#f8fafc;padding:20px;border-radius:12px;text-align:center;">
                    <div style="font-size:0.9rem;color:#64748b;margin-bottom:10px;">Total Coins</div>
                    <div style="font-size:2rem;font-weight:700;color:#f59e0b;">${userData.coins || 0} 🪙</div>
                </div>
                
                <div style="background:#f8fafc;padding:20px;border-radius:12px;text-align:center;">
                    <div style="font-size:0.9rem;color:#64748b;margin-bottom:10px;">Member Since</div>
                    <div style="font-size:1.2rem;font-weight:600;color:#1e293b;">${joinDate}</div>
                </div>
            </div>
            
            <div>
                <h4 style="margin:0 0 15px 0;">Registration Photo</h4>
                <div style="text-align:center;margin-bottom:15px;">
                    ${userData.regPhotoLink ? `
                        <img src="${userData.regPhotoLink}" alt="Registration" 
                             style="max-width:100%;max-height:300px;border-radius:8px;border:1px solid #e2e8f0;"
                             onerror="this.style.display='none';">
                    ` : `
                        <div style="padding:40px;background:#f1f5f9;border-radius:8px;color:#64748b;">
                            No registration photo available
                        </div>
                    `}
                </div>
                ${userData.regPhotoLink ? `
                <div style="text-align:center;">
                    <a href="${userData.regPhotoLink}" target="_blank" 
                       style="color:#3b82f6;text-decoration:none;font-weight:500;margin-right:15px;">
                        🔗 View Photo
                    </a>
                    <a href="https://www.mediafire.com/folder/blkilikadu3so/registrations" target="_blank"
                       style="color:#8b5cf6;text-decoration:none;font-weight:500;">
                        📁 MediaFire Folder
                    </a>
                </div>
                ` : ''}
            </div>
            
            <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:15px;">
                <strong>📝 Admin Actions:</strong><br>
                • Manually verify registration photos<br>
                • Contact user if photo is invalid<br>
                • Delete invalid photos from MediaFire
            </div>
        </div>
    `;
    
    requestModal.classList.add('active');
}

// Setup real-time listeners
function setupRealTimeListeners() {
    // Listen for new users
    database.ref('users').on('value', (snapshot) => {
        totalUsersElement.textContent = snapshot.numChildren();
    });
    
    // Listen for pending requests
    database.ref('coinRequests')
        .orderByChild('status')
        .equalTo('pending')
        .on('value', (snapshot) => {
            pendingRequestsElement.textContent = snapshot.numChildren();
        });
    
    // Listen for request changes (real-time updates)
    database.ref('coinRequests').on('value', (snapshot) => {
        const activeTab = document.querySelector('.admin-tab.active').dataset.tab;
        
        if (activeTab === 'pending') {
            loadPendingRequests();
        } else if (activeTab === 'approved') {
            loadApprovedRequests();
        } else if (activeTab === 'rejected') {
            loadRejectedRequests();
        }
    });
}

// Event Listeners
adminLogoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'admin_login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
});

refreshBtn.addEventListener('click', () => {
    loadDashboardData();
});

modalClose.addEventListener('click', () => {
    requestModal.classList.remove('active');
});

// Close modal when clicking outside
requestModal.addEventListener('click', (e) => {
    if (e.target === requestModal) {
        requestModal.classList.remove('active');
    }
});

// User search functionality
userSearchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        loadAllUsers();
        return;
    }
    
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        
        if (!snapshot.exists()) {
            usersList.innerHTML = '<div class="no-data">No users found</div>';
            return;
        }
        
        const filteredUsers = [];
        snapshot.forEach(childSnapshot => {
            const userData = childSnapshot.val();
            userData.id = childSnapshot.key;
            
            // Search in name and email
            if (userData.name.toLowerCase().includes(searchTerm) || 
                userData.email.toLowerCase().includes(searchTerm)) {
                filteredUsers.push(userData);
            }
        });
        
        // Update UI
        usersList.innerHTML = '';
        if (filteredUsers.length === 0) {
            usersList.innerHTML = '<div class="no-data">No users match your search</div>';
        } else {
            filteredUsers.forEach(userData => {
                const userCard = createUserCard(userData);
                usersList.appendChild(userCard);
            });
        }
    } catch (error) {
        console.error('Error searching users:', error);
        usersList.innerHTML = '<div class="no-data">Error searching users</div>';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape' && requestModal.classList.contains('active')) {
        requestModal.classList.remove('active');
    }
    
    // Ctrl/Cmd + R refreshes
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadDashboardData();
    }
});

// Prevent back button after logout
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});
