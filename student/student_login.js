// Ensure the Firebase configuration is imported and initialized
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value;
  const fullName = document.getElementById('fullName').value;
  const studentID = document.getElementById('studentID').value;
  const department = document.getElementById('department').value;
  const yearOfStudy = document.getElementById('yearOfStudy').value;

  if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
  }

  try {
      // Create a new user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Add student data to Firestore
      await db.collection('students').doc(user.uid).set({
          username: username,
          email: email,
          fullName: fullName,
          studentID: studentID,
          department: department,
          yearOfStudy: yearOfStudy,
      });

      alert('Registration successful!');
      showLoginForm(); // Optionally show the login form after successful registration
  } catch (error) {
      console.error('Error registering student: ', error);
      alert('Error registering student.');
  }
});

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
        await auth.signInWithEmailAndPassword(email, password);
        // Redirect to the appointment booking page upon successful login
        window.location.href = 'bookappointment.html';
    } catch (error) {
        console.error('Error logging in: ', error);
        alert('Error logging in: ' + error.message);
    }
  });
  

function showSignupForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
}

// Ensure Firebase configuration is imported and initialized
//const auth = firebase.auth();
//const db = firebase.firestore();

// Event listener for appointment form submission
document.addEventListener('DOMContentLoaded', function () {
  const appointmentForm = document.getElementById('appointmentForm');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const teacherSelect = document.getElementById('teacher');

  // Populate teachers dropdown from Firestore
  db.collection('teachers').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = doc.data().fullName;
          teacherSelect.appendChild(option);
      });
  });

  // Handle appointment form submission
  appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const teacher = appointmentForm.teacher.value;
      const date = appointmentForm.date.value;
      const time = appointmentForm.time.value;
      const user = auth.currentUser;

      if (user) {
          db.collection('appointments').add({
              studentID: user.uid,
              teacherID: teacher,
              date: date,
              time: time,
          }).then(() => {
              confirmationMessage.textContent = 'Appointment booked successfully!';
              appointmentForm.reset();
          }).catch((error) => {
              console.error('Error booking appointment: ', error);
              alert('Error booking appointment.');
          });
      } else {
          alert('User not authenticated. Please log in.');
      }
  });
});

