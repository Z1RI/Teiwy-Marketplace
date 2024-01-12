import { getDatabase, ref, onValue, child, get, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { auth, app } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const database = getDatabase(app);
const dbRef_data = ref(database);

// Definir la variable usuarios fuera de onValue para que sea accesible en todo el ámbito
let usuarios = [];

onAuthStateChanged(auth, async (user) => {
    onValue(ref(database, '/users/' + user.uid), async (snapshot) => {
        const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
        console.log(userType);
        if (user && userType == 5) {
            // Datos de ejemplo (puedes obtener estos datos de tu base de datos)
            get(child(dbRef_data, '/users/')).then((snapshot) => {
                usuarios = [];
                snapshot.forEach(childSnapshot => {
                    const usuario = childSnapshot.val();
                    usuario.id = childSnapshot.key; // Agregar el ID del usuario al objeto usuario
                    usuarios.push(usuario);
                });

                console.log(usuarios);
                mostrarUsuarios(usuarios);
            });
        } else {
            console.log("La sesión del usuario no se encontró");
            location.href = '../Login.html';
        }
    });


// Función para mostrar la lista de usuarios en la tabla
function mostrarUsuarios(usuarios) {
    const tablaBody = document.getElementById('tablaUsuariosBody');

    // Limpiar la tabla antes de agregar los datos
    tablaBody.innerHTML = '';

    // Agregar cada usuario a la tabla
    usuarios.forEach(usuario => {
        // Verificar si el usuario actual es el mismo que el usuario autenticado
        if (usuario.id !== user.uid) {
            const fila = document.createElement('tr');

            // Columnas con datos del usuario
            const nombreColumna = document.createElement('td');
            nombreColumna.textContent = usuario.username;
            fila.appendChild(nombreColumna);

            const emailColumna = document.createElement('td');
            emailColumna.textContent = usuario.email;
            fila.appendChild(emailColumna);

            // Columna con selección de rol
            const rolColumna = document.createElement('td');
            const rolSelect = document.createElement('select');
            rolSelect.addEventListener('change', () => cambiarRol(usuario, obtenerValorNumerico(rolSelect.value)));

            // Opciones de rol
            const roles = ['admin', 'comun', 'vendedor'];
            roles.forEach(rol => {
                const opcion = document.createElement('option');
                opcion.value = rol.toLowerCase();
                opcion.text = rol;

                // Establecer la opción seleccionada según el userType
                if (usuario.userType == 5 && rol.toLowerCase() === 'admin') {
                    opcion.selected = true;
                } else if (usuario.userType == 1 && rol.toLowerCase() === 'comun') {
                    opcion.selected = true;
                } else if (usuario.userType == 2 && rol.toLowerCase() === 'vendedor') {
                    opcion.selected = true;
                }

                rolSelect.appendChild(opcion);
            });

            rolColumna.appendChild(rolSelect);
            fila.appendChild(rolColumna);

            // Columna con acciones (select para habilitar/inhabilitar)
            const accionesColumna = document.createElement('td');
            const accionesSelect = document.createElement('select');
            const habilitadoOption = document.createElement('option');
            habilitadoOption.value = true;
            habilitadoOption.text = 'Habilitado';
            const inhabilitadoOption = document.createElement('option');
            inhabilitadoOption.value = false;
            inhabilitadoOption.text = 'Inhabilitado';

            // Establecer la opción seleccionada según el userStatus
            if (usuario.userStatus === false) {
                inhabilitadoOption.selected = true;
            } else {
                habilitadoOption.selected = true;
            }

            accionesSelect.appendChild(habilitadoOption);
            accionesSelect.appendChild(inhabilitadoOption);
            accionesSelect.addEventListener('change', () => inhabilitarHabilitarUsuario(usuario, accionesSelect.value));
            accionesColumna.appendChild(accionesSelect);

            fila.appendChild(accionesColumna);

            // Agregar la fila a la tabla
            tablaBody.appendChild(fila);
        }
    });
}

// Función para obtener el valor numérico correspondiente al rol seleccionado
function obtenerValorNumerico(rolSeleccionado) {
    switch (rolSeleccionado.toLowerCase()) {
        case 'admin':
            return 5;
        case 'comun':
            return 1;
        case 'vendedor':
            return 2;
        default:
            return 0; // Valor predeterminado o manejo de errores
    }
}

// Función para cambiar el rol de un usuario
function cambiarRol(usuario, nuevoRol) {
    console.log(usuario,
        usuario.username,
        usuario.email,
        usuario.carShopId,
        usuario.password,
        usuario.profilePicture,
        nuevoRol);

    // Actualizar el rol en la base de datos usando el ID del usuario
    console.log(usuario.id);
    
    set(ref(database, 'users/' + usuario.id), {
        username: usuario.username,
        email: usuario.email,
        carShopId: usuario.carShopId,
        password: usuario.password,
        profilePicture: usuario.profilePicture,
        userStatus: usuario.userStatus,
        userType: nuevoRol
    }); 

    // Actualizar el rol en el array local
    usuario.userType = nuevoRol;
    mostrarUsuarios(usuarios); // Volver a mostrar la tabla con el nuevo rol
}

// Función para inhabilitar o habilitar un usuario
function inhabilitarHabilitarUsuario(usuario, estado) {
    // Actualizar el estado en la base de datos usando el ID del usuario
    const estadoBooleano = estado === 'true';

    // Actualizar el estado en la base de datos usando el ID del usuario
    set(ref(database, 'users/' + usuario.id), {
        username: usuario.username,
        email: usuario.email,
        carShopId: usuario.carShopId,
        password: usuario.password,
        profilePicture: usuario.profilePicture,
        userType: usuario.userType,
        userStatus: estadoBooleano
    });

    // Actualizar el estado en el objeto local
    usuario.userStatus = estadoBooleano;

    // Volver a mostrar la tabla con el nuevo estado
    mostrarUsuarios(usuarios);
}


});
