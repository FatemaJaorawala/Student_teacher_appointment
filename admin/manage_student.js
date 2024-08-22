document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    const studentList = document.getElementById('studentList');

    // Function to render the list of students
    function renderStudents(students) {
        studentList.innerHTML = '';
        students.forEach(doc => {
            const student = doc.data();
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            studentItem.innerHTML = `
                <p><strong>Name:</strong> ${student.fullName}</p>
                <p><strong>Department:</strong> ${student.department}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <button class="approveBtn" data-id="${doc.id}">Approve</button>
                <button class="rejectBtn" data-id="${doc.id}">Reject</button>
            `;
            studentList.appendChild(studentItem);
        });

        document.querySelectorAll('.approveBtn').forEach(button => {
            button.addEventListener('click', handleApprove);
        });

        document.querySelectorAll('.rejectBtn').forEach(button => {
            button.addEventListener('click', handleReject);
        });
    }

    // Fetch and render students on page load
    db.collection('students').where('isApproved', '==', false).onSnapshot(snapshot => {
        console.log("Snapshot docs:", snapshot.docs); // Debugging line
        if (snapshot.empty) {
            studentList.innerHTML = '<p>No pending student registrations found.</p>';
        } else {
            renderStudents(snapshot.docs);
        }
    });

    // Handle approving a student
    async function handleApprove(e) {
        const id = e.target.getAttribute('data-id');
        try {
            await db.collection('students').doc(id).update({
                isApproved: true
            });
            alert('Student approved successfully.');
        } catch (error) {
            console.error('Error approving student:', error);
            alert('Error approving student. Please try again.');
        }
    }

    // Handle rejecting a student
    async function handleReject(e) {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to reject this student?')) {
            try {
                await db.collection('students').doc(id).delete();
                alert('Student rejected successfully.');
            } catch (error) {
                console.error('Error rejecting student:', error);
                alert('Error rejecting student. Please try again.');
            }
        }
    }
});
