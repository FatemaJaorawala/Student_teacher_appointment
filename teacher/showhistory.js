document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Fetch all appointments for the logged-in teacher
                const appointmentsSnapshot = await db.collection('appointments')
                    .where('teacherID', '==', user.uid)
                    .get();

                if (appointmentsSnapshot.empty) {
                    document.getElementById('historyContainer').innerHTML = '<p>No past appointments found.</p>';
                } else {
                    let historyHtml = '';

                    // Use Promise.all to ensure all student names are fetched before updating the HTML
                    const historyPromises = appointmentsSnapshot.docs.map(async (doc) => {
                        const appointment = doc.data();
                        
                        // Fetch the student name using the studentID
                        const studentSnapshot = await db.collection('students').doc(appointment.studentID).get();
                        const studentName = studentSnapshot.exists ? studentSnapshot.data().fullName : "Unknown Student";

                        return `
                            <div class="appointment-history">
                                <p><strong>Student:</strong> ${studentName}</p>
                                <p><strong>Date:</strong> ${appointment.date}</p>
                                <p><strong>Time:</strong> ${appointment.time}</p>
                                <p><strong>Status:</strong> ${appointment.status}</p>
                            </div>
                        `;
                    });

                    // Wait for all promises to resolve
                    const historyArray = await Promise.all(historyPromises);
                    historyHtml = historyArray.join('');

                    document.getElementById('historyContainer').innerHTML = historyHtml;
                }
            } catch (error) {
                console.error('Error fetching appointment history:', error);
                document.getElementById('historyContainer').innerHTML = '<p>Error fetching appointment history.</p>';
            }
        } else {
            console.log('No user is signed in.');
            window.location.href = 'teacher_login.html';
        }
    });
});
