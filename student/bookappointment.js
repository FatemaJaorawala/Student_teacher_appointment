// Ensure the Firebase configuration is imported and initialized
const auth = firebase.auth();
const db = firebase.firestore();

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
    }).catch(error => {
        console.error('Error fetching teachers: ', error);
    });

    // Handle appointment form submission
    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const teacherID = appointmentForm.teacher.value;
        const date = appointmentForm.date.value;
        const time = appointmentForm.time.value;
        const user = auth.currentUser;

        if (!user) {
            alert('User not authenticated. Please log in.');
            return;
        }

        // Check if the date is in the past
        const currentDate = new Date();
        const selectedDate = new Date(date + 'T' + time);
        if (selectedDate < currentDate) {
            alert('You cannot book an appointment in the past.');
            return;
        }

        try {
            // Add the appointment to Firestore with additional fields
            await db.collection('appointments').add({
                studentID: user.uid,
                studentName: user.displayName || 'Anonymous Student', // Ensure displayName is set
                teacherID: teacherID,
                date: date,
                time: time,
                status: 'Pending' // Set the initial status to "Pending"
            });

            confirmationMessage.textContent = 'Appointment booked successfully!';
            appointmentForm.reset();
        } catch (error) {
            console.error('Error booking appointment: ', error);
            alert('Error booking appointment.');
        }
    });
});
