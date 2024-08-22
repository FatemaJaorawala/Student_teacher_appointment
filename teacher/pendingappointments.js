document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Check if the user is authenticated
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User is authenticated:', user);

            // Fetch and display appointments
            try {
                const appointmentsSnapshot = await db.collection('appointments')
                    .where('teacherID', '==', user.uid) // Ensure the field name matches
                    .get();

                if (appointmentsSnapshot.empty) {
                    document.getElementById('appointmentsContainer').innerHTML = '<p>No pending appointments.</p>';
                } else {
                    let appointmentsHtml = '';
                    
                    // Use Promise.all to ensure all student names are fetched before updating the HTML
                    const appointmentPromises = appointmentsSnapshot.docs.map(async (doc) => {
                        const appointment = doc.data();
                        const appointmentId = doc.id; // Get the document ID
                        
                        // Assuming studentID is stored in the appointment
                        const studentSnapshot = await db.collection('students').doc(appointment.studentID).get();
                        const studentName = studentSnapshot.exists ? studentSnapshot.data().fullName : "Unknown Student";

                        return `
                            <div class="appointment">
                                <p><strong>Student:</strong> ${studentName}</p>
                                <p><strong>Date:</strong> ${appointment.date}</p>
                                <p><strong>Time:</strong> ${appointment.time}</p>
                                <p><strong>Status:</strong> ${appointment.status}</p>
                                <button class="approveBtn" data-id="${appointmentId}">Approve</button>
                                <button class="rejectBtn" data-id="${appointmentId}">Reject</button>
                            </div>
                        `;
                    });

                    // Wait for all promises to resolve
                    const appointmentsArray = await Promise.all(appointmentPromises);
                    appointmentsHtml = appointmentsArray.join('');

                    document.getElementById('appointmentsContainer').innerHTML = appointmentsHtml;

                    // Add event listeners to the Approve and Reject buttons
                    document.querySelectorAll('.approveBtn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const appointmentId = e.target.getAttribute('data-id');
                            await updateAppointmentStatus(appointmentId, 'Approved');
                        });
                    });

                    document.querySelectorAll('.rejectBtn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            const appointmentId = e.target.getAttribute('data-id');
                            await updateAppointmentStatus(appointmentId, 'Rejected');
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
                document.getElementById('appointmentsContainer').innerHTML = '<p>Error fetching appointments.</p>';
            }

        } else {
            console.log('No user is signed in.');
            // Redirect to login page if the user is not authenticated
            window.location.href = 'teacher_login.html';
        }
    });

    // Function to update the status of an appointment
    async function updateAppointmentStatus(appointmentId, status) {
        try {
            await db.collection('appointments').doc(appointmentId).update({
                status: status
            });
            alert(`Appointment ${status} successfully.`);
            location.reload(); // Refresh the page to show the updated status
        } catch (error) {
            console.error(`Error updating appointment status:`, error);
            alert(`Error updating appointment status.`);
        }
    }
});
