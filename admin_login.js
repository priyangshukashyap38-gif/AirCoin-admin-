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
const adminLoginForm = document.getElementById('adminLoginForm');
const adminMessage = document.getElementById('adminMessage');

// Admin emails (in production, use Firebase Admin SDK or database flags)
// For beta, we'll check against a list of admin emails
const ADMIN_EMAILS = [
    'admin@aircoin.com',
    'admin@gmail.com',
    // Add more admin emails as needed
];

// Check if already logged in as admin
auth.onAuthStateChanged((user) => {
    if (user && isAdminEmail(user.email)) {
        // Already logged in as admin, redirect to dashboard
        window.location.href = 'admin_dashboard.html';
    }
});

// Admin login form submission
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Basic validation
    if (!email || !password) {
        showMessage('Please enter both email and password', 'error');
        return;
    }
    
    try {
        // Attempt to login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user is admin (by email in this beta version)
        if (isAdminEmail(user.email)) {
            showMessage('Admin login successful! Redirecting...', 'success');
            
            // Redirect to admin dashboard after short delay
            setTimeout(() => {
                window.location.href = 'admin_dashboard.html';
            }, 1500);
        } else {
            // Not an admin email, sign out and show error
            await auth.signOut();
            showMessage('Access denied. Admin email required.', 'error');
        }
    } catch (error) {
        // Handle login errors
        showMessage(getErrorMessage(error), 'error');
    }
});

// Helper function to check if email is admin
function isAdminEmail(email) {
    // In beta, we check against hardcoded list
    // In production, you would check a database flag or use Firebase Admin SDK
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Show message
function showMessage(text, type) {
    adminMessage.textContent = text;
    adminMessage.className = `message ${type}`;
    adminMessage.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            adminMessage.style.display = 'none';
        }, 3000);
    }
}

// Get user-friendly error message
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-not-found':
            return 'User not found';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/too-many-requests':
            return 'Too many attempts. Try again later';
        default:
            return error.message;
    }
}
