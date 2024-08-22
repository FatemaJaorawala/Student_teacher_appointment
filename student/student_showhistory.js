document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Fetch all appointments for the logged-in student
                const appointmentsSnapshot = await db.collection('appointments')
                    .where('studentID', '==', user.uid)
                    .get();

                if (appointmentsSnapshot.empty) {
                    document.getElementById('historyContainer').innerHTML = '<p>No past appointments found.</p>';
                } else {
                    let historyHtml = '';
                    for (const doc of appointmentsSnapshot.docs) {
                        const appointment = doc.data();
                        let teacherName = appointment.teacherName;

                        // If teacherName is not available, fetch it from the teacher collection
                        if (!teacherName) {
                            const teacherDoc = await db.collection('teachers').doc(appointment.teacherID).get();
                            if (teacherDoc.exists) {
                                teacherName = teacherDoc.data().fullName;
                            } else {
                                teacherName = 'Unknown Teacher'; // Fallback if teacher not found
                            }
                        }

                        historyHtml += `
                            <div class="appointment-history">
                                <p><strong>Teacher:</strong> ${teacherName}</p>
                                <p><strong>Date:</strong> ${appointment.date}</p>
                                <p><strong>Time:</strong> ${appointment.time}</p>
                                <p><strong>Status:</strong> ${appointment.status}</p>
                            </div>
                        `;
                    }
                    document.getElementById('historyContainer').innerHTML = historyHtml;
                }
            } catch (error) {
                console.error('Error fetching appointment history:', error);
                document.getElementById('historyContainer').innerHTML = '<p>Error fetching appointment history.</p>';
            }
        } else {
            console.log('No user is signed in.');
            window.location.href = 'student_login.html';
        }
    });
});
