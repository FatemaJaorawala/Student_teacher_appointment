document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Add event listener for the signup form
    const signupForm = document.getElementById('signupFormElement');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const email = document.getElementById('email').value;
            const fullName = document.getElementById('fullName').value;
            const teacherID = document.getElementById('teacherID').value;
            const department = document.getElementById('department').value;
            const yearOfExperience = document.getElementById('yearOfExperience').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                // Create a new user with email and password
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Add teacher data to Firestore
                await db.collection('teachers').doc(user.uid).set({
                    username: username,
                    email: email,
                    fullName: fullName,
                    teacherID: teacherID,
                    department: department,
                    yearOfExperience: yearOfExperience,
                });

                alert('Registration successful!');
                showLoginForm(); // Optionally show the login form after successful registration
            } catch (error) {
                console.error('Error registering teacher: ', error);
                alert('Error registering teacher.');
            }
        });
    }

    // Add event listener for the login form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
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

            try {
                // Sign in the user with email and password
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                console.log('User logged in:', userCredential.user);

                // Redirect to the pending appointments page upon successful login
                // Ensure that the authentication state is properly updated before redirection
                auth.onAuthStateChanged(user => {
                    if (user) {
                        console.log('User is authenticated:', user);
                        window.location.href = 'pendingappointments.html';
                    } else {
                        console.log('No user is signed in.');
                        alert('User not authenticated. Please log in.');
                    }
                });
            } catch (error) {
                console.error('Error logging in:', error);
                alert('Error logging in: ' + error.message);
            }
        });
    }

    // Show signup form
    function showSignupForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    }

    // Show login form
    function showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
    }

    // Monitor authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User is authenticated:', user);
            // Optionally redirect or update UI based on authentication status
        } else {
            console.log('No user is signed in.');
            // Handle the case where no user is signed in
        }
    });
});
