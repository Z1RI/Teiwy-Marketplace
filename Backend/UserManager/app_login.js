import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { auth, app } from "./firebase.js";


document.getElementById('buttonRegistrarLogin').addEventListener('click', () => {
    location.href = 'registro.html';
});

//funcion ingresar
document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('correoIngreso').value;
    const password = document.getElementById('contrasenaIngreso').value;

    // Inicia sesión con correo electrónico y contraseña
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Inicio de sesión exitoso
            const user = userCredential.user;
            //console.log('Usuario autenticado:', user);

            // Obtener el estado del usuario desde la base de datos
            const database = getDatabase(app);
            const userRef = ref(database, '/users/' + user.uid);

            onValue(userRef, (snapshot) => {
                const userStatus = snapshot.val().userStatus;

                if (userStatus) {
                    // El usuario tiene un userStatus de true, redirige a la página deseada
                    location.href = 'menu_temporal.html';
                } else {
                    // El usuario tiene un userStatus de false, mostrar mensaje o tomar otra acción
                    console.log('El usuario no está habilitado para iniciar sesión.');
                    document.getElementById("modalBan").style.display = "block";
                    // Puedes mostrar un mensaje al usuario o tomar otra acción aquí
                }
            });
        })
        .catch((error) => {
            // Error durante el inicio de sesión
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error al iniciar sesión:', errorCode, errorMessage);

            // Mostrar el cuadro modal de error al hacer clic en el botón
            document.getElementById("modalError").style.display = "block";

            // Cerrar el cuadro modal al hacer clic en la "X"
        });
});

document.getElementById("cerrarModal").addEventListener("click", function () {
    document.getElementById("modalError").style.display = "none";
});

document.getElementById("cerrarModal2").addEventListener("click", function () {
    document.getElementById("modalBan").style.display = "none";
});
