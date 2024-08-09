import { saveTask, getTasks, onGetTasks, deleteTask, getTask, updateTask, observeAuthState, logoutUser, getUserAcceptanceStatus } from './firebase.js';

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');
const taskCard = document.getElementById('task-card');
const logoutButton = document.getElementById('logout-button');

let editStatus = false;
let id = '';

window.addEventListener('DOMContentLoaded', async () => {
  observeAuthState(async user => {
    if (user) {
      const isAccepted = await getUserAcceptanceStatus(user.uid);
      if (!isAccepted) {
        alert('Su preinscripción no ha sido aceptada. No puede acceder a esta sección.');
        window.location.href = 'preinscripcion.html';
        return;
      }

      taskCard.style.display = 'block';

      onGetTasks((querySnapshot) => {
        let html = '';

        querySnapshot.forEach((doc) => {
          const task = doc.data();
          html += `
            <div class="card mt-3">
              <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <button class="btn btn-danger btn-delete" data-id="${doc.id}">Delete</button>
                <button class="btn btn-warning btn-edit" data-id="${doc.id}">Edit</button>
              </div>
            </div>
          `;
        });

        tasksContainer.innerHTML = html;

        const btnsDelete = tasksContainer.querySelectorAll('.btn-delete');
        btnsDelete.forEach((btn) => {
          btn.addEventListener('click', ({ target: { dataset } }) => {
            deleteTask(dataset.id);
          });
        });

        const btnsEdit = tasksContainer.querySelectorAll('.btn-edit');
        btnsEdit.forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const doc = await getTask(e.target.dataset.id);
            const task = doc.data();

            taskForm['task-title'].value = task.title;
            taskForm['task-description'].value = task.description;

            editStatus = true;
            id = e.target.dataset.id;
            taskForm['btn-task-save'].innerText = 'Update';
          });
        });
      });
    } else {
      window.location.href = 'login.html';
    }
  });
});

logoutButton.addEventListener('click', async () => {
  try {
    await logoutUser();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error logging out:', error);
    alert('Failed to logout. Please try again.');
  }
});

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = taskForm['task-title'].value.trim();
  const description = taskForm['task-description'].value.trim();

  if (title === '' || description === '') {
    alert('Please fill in all fields.');
    return;
  }

  if (!editStatus) {
    saveTask(title, description);
  } else {
    updateTask(id, { title, description });
    editStatus = false;
    taskForm['btn-task-save'].innerText = 'Save';
  }

  taskForm.reset();
});
