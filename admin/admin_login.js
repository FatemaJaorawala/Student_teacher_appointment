// Ensure the Firebase configuration is imported and initialized
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username) {
      alert('Username cannot be empty.');
      return;
  }

  const email = username + '@gmail.com';

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
      alert('Invalid email format.');
      return;
  }

  console.log('Attempting login with email:', email);

  try {
      // Sign in the user with email and password
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Check if the user has admin privileges
      const adminDoc = await db.collection('admins').doc(user.uid).get();

      if (adminDoc.exists && adminDoc.data().role === 'admin') {
          // Redirect to the admin dashboard upon successful login
          window.location.href = 'admin_dashboard.html';
      } else {
          alert('You do not have admin privileges.');
          auth.signOut(); // Sign out the user if not an admin
      }
  } catch (error) {
      console.error('Error logging in: ', error);
      alert('Error logging in: ' + error.message);
  }
});

// Function to show the login form (if you plan to add sign up functionality later)
function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
}

// Admin-specific functionality can be added here if needed
