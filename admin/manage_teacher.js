document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
  
    const teacherForm = document.getElementById('teacherForm');
    const teachersList = document.getElementById('teachersList');
  
    // Function to render the list of teachers
    function renderTeachers(teachers) {
      teachersList.innerHTML = '';
      teachers.forEach(doc => {
        const teacher = doc.data();
        const teacherItem = document.createElement('div');
        teacherItem.className = 'teacher-item';
        teacherItem.innerHTML = `
          <p><strong>Name:</strong> ${teacher.fullName}</p>
          <p><strong>Department:</strong> ${teacher.department}</p>
          <p><strong>Email:</strong> ${teacher.email}</p>
          <p><strong>Experience:</strong> ${teacher.yearOfExperience} years</p>
          <button class="updateBtn" data-id="${doc.id}">Update</button>
          <button class="deleteBtn" data-id="${doc.id}">Delete</button>
        `;
        teachersList.appendChild(teacherItem);
      });
  
      document.querySelectorAll('.updateBtn').forEach(button => {
        button.addEventListener('click', handleUpdate);
      });
  
      document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', handleDelete);
      });
    }
  
    // Fetch and render teachers on page load
    db.collection('teachers').onSnapshot(snapshot => {
      renderTeachers(snapshot.docs);
    });
  
    // Handle adding a new teacher
    teacherForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('teacherName').value;
      const department = document.getElementById('teacherDepartment').value;
      const email = document.getElementById('teacherEmail').value;
      const experience = document.getElementById('teacherExperience').value;
  
      try {
        await db.collection('teachers').add({
          fullName: name,
          department: department,
          email: email,
          yearOfExperience: experience
        });
        teacherForm.reset();
      } catch (error) {
        console.error('Error adding teacher:', error);
      }
    });
  
    // Handle updating a teacher
    async function handleUpdate(e) {
      const id = e.target.getAttribute('data-id');
      const newExperience = prompt('Enter new experience in years:');
      if (newExperience) {
        try {
          await db.collection('teachers').doc(id).update({
            yearOfExperience: newExperience
          });
        } catch (error) {
          console.error('Error updating teacher:', error);
        }
      }
    }
  
    // Handle deleting a teacher
    async function handleDelete(e) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this teacher?')) {
        try {
          await db.collection('teachers').doc(id).delete();
        } catch (error) {
          console.error('Error deleting teacher:', error);
        }
      }
    }
  });
  