import { loginUser, getUserData, sendPasswordResetEmail } from './firebase.js';

const loginForm = document.getElementById('login-form');
const createAccountBtn = document.getElementById('create-account-btn');
const forgotPasswordBtn = document.getElementById('forgot-password-btn');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  try {
    // Inicia sesión con las credenciales proporcionadas
    const userCredential = await loginUser(email, password);
    const user = userCredential.user;

    // Obtén los datos del usuario
    const userDataDoc = await getUserData(user.uid);
    if (!userDataDoc.exists()) {
      throw new Error('Datos del usuario no encontrados');
    }

    const userData = userDataDoc.data();
    const role = userData.role;
    const hasCompletedProfile = userData.fullName && userData.age && userData.major && userData.semester && userData.phone && userData.gender;

    // Redirige según el rol y si el perfil del estudiante está completo
    if (role === 'administrador') {
      window.location.href = 'admin.html';
    } else if (role === 'jurado') {
      window.location.href = 'jurado.html';
    } else if (role === 'estudiante') {
      if (hasCompletedProfile) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'student-info.html';
      }
    } else {
      throw new Error('Rol desconocido');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    loginError.textContent = 'Error al iniciar sesión. Verifica tus credenciales y vuelve a intentarlo.';
    loginError.style.display = 'block';
  }
});

createAccountBtn.addEventListener('click', () => {
  window.location.href = 'register.html';
});

forgotPasswordBtn.addEventListener('click', () => {
  const email = prompt('Por favor ingresa tu correo electrónico:');
  if (email) {
    sendPasswordResetEmail(email)
      .then(() => {
        alert('Se ha enviado un correo electrónico para restablecer tu contraseña.');
      })
      .catch((error) => {
        console.error('Error al enviar el correo de restablecimiento:', error);
        alert('Error al enviar el correo de restablecimiento. Por favor intenta de nuevo.');
      });
  }
});
