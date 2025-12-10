// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCH6zWkL-l9pcc8w4cOD-IWluiSPNJ6dck",
    authDomain: "cashclash-e8224.firebaseapp.com",
    projectId: "cashclash-e8224",
    storageBucket: "cashclash-e8224.firebasestorage.app",
    messagingSenderId: "421326452259",
    appId: "1:421326452259:web:a1ecd18d2d8129f0a5a396",
    measurementId: "G-6WQSMSTWBR"
};

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Check if user is logged in
function checkAuth() {
    const currentPage = window.location.pathname;
    
    auth.onAuthStateChanged((user) => {
        if (!user && !currentPage.includes('login.html')) {
            window.location.href = 'login.html';
        } else if (user && currentPage.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
    });
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        
        try {
            console.log('Attempting login with:', email);
            const result = await auth.signInWithEmailAndPassword(email, password);
            console.log('Login successful:', result.user);
            alert('Login successful! Redirecting...');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Login failed: ';
            switch(error.code) {
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email format';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'This account has been disabled';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'No user found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password';
                    break;
                case 'auth/invalid-credential':
                    errorMessage += 'Invalid email or password';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            alert(errorMessage);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
}

// Logout function
async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
}

// Initialize on page load
checkAuth();

