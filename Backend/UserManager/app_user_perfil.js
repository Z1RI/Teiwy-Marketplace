import { collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { storage, db } from "../UserManager/firebase.js"
import { auth, app } from "./firebase.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const database = getDatabase(app);
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('Usuario autenticado:', user.uid);


        // Escuchar cambios en el nodo de usuario
        onValue(ref(database, '/users/' + user.uid), async (snapshot) => {
            const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            const email = (snapshot.val() && snapshot.val().email) || 'Anonymous';
            const ProfilepictureExtract = (snapshot.val() && snapshot.val().profilePicture) || 'Anonymous';
            const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
            const userStatus = (snapshot.val() && snapshot.val().userStatus) || false;
            console.log('Usuario tipo:', userStatus);

            if (userStatus === false){
                auth.signOut().then(() => {
                    // La sesión se cerró con éxito
                    console.log('Sesión cerrada');
                    setSessionStatus(false);
                    location.href = 'Login.html';
                }).catch((error) => {
                    // Hubo un error al cerrar la sesión
                    console.error('Error al cerrar sesión:', error);
                });
            }


            if (userType === 2) {
                // Crear y agregar los botones al div contenedor "userTypeseller"
                const userTypesellerContainer = document.getElementById("contMenuHorizontal");

                // Botón 1: Agregar Producto
                const agregarProductoButton = document.createElement("button");
                agregarProductoButton.textContent = "Agregar Producto";
                agregarProductoButton.id = "AgregarProductoPerfilMenuButton";
                agregarProductoButton.classList.add("btnHorizontal"); // Agrega la clase utilizando classList
                userTypesellerContainer.appendChild(agregarProductoButton);

                // Botón 2: Gestionar Producto
                const gestionarProductoButton = document.createElement("button");
                gestionarProductoButton.textContent = "Gestionar Producto";
                gestionarProductoButton.id = "GestionarductoPerfilMenuButton";
                gestionarProductoButton.classList.add("btnHorizontal"); // Agrega la clase utilizando classList
                userTypesellerContainer.appendChild(gestionarProductoButton);

                // Botón 3: Gestionar Pedidos
                const gestionarPedidosButton = document.createElement("button");
                gestionarPedidosButton.textContent = "Gestionar Pedidos";
                gestionarPedidosButton.id = "GestionarPedidosMenuButton";
                gestionarPedidosButton.classList.add("btnHorizontal"); // Agrega la clase utilizando classList
                userTypesellerContainer.appendChild(gestionarPedidosButton);

                document.getElementById('AgregarProductoPerfilMenuButton').addEventListener('click', () => {
                    location.href = 'Store/AddProduct.html';
                });

                document.getElementById('GestionarductoPerfilMenuButton').addEventListener('click', () => {
                    location.href = 'Store/product_Manager.html';
                });

                document.getElementById('GestionarPedidosMenuButton').addEventListener('click', () => {
                    location.href = 'Store/Order_Manager.html';
                });
            }

            if (userType === 5) {
                // Crear y agregar los botones al div contenedor "userTypeseller"
                const userTypesellerContainer = document.getElementById("contMenuHorizontal");
                document.getElementById('GestionHistorialPedidos').style.display = "none";


                // Botón 1: Gestionar tienda principal
                const agregarProductoButton = document.createElement("button");
                agregarProductoButton.textContent = "Gestor Tienda";
                agregarProductoButton.id = "storeGestorOption";
                agregarProductoButton.classList.add("btnHorizontal"); // Agrega la clase utilizando classList
                userTypesellerContainer.appendChild(agregarProductoButton);

                // Botón 2: Gestionar Usuarios
                const gestionarProductoButton = document.createElement("button");
                gestionarProductoButton.textContent = "Gestionar Usuarios";
                gestionarProductoButton.id = "usersGestorOption";
                gestionarProductoButton.classList.add("btnHorizontal"); // Agrega la clase utilizando classList
                userTypesellerContainer.appendChild(gestionarProductoButton);

                // Botón 3: 
                /*
                const gestionarPedidosButton = document.createElement("button");
                gestionarPedidosButton.textContent = "Gestionar Pedidos";
                gestionarPedidosButton.id = "GestionarPedidosMenuButton";
                gestionarPedidosButton.classList.add("btnHorizontal"); // Agrega la clase utilizando classList
                userTypesellerContainer.appendChild(gestionarPedidosButton);
                */
                document.getElementById('storeGestorOption').addEventListener('click', () => {
                    location.href = 'admin/globalProductGestor.html';
                });

                document.getElementById('usersGestorOption').addEventListener('click', () => {
                    location.href = 'admin/userGestor.html';
                });
                /*
                document.getElementById('GestionarPedidosMenuButton').addEventListener('click', () => {
                    location.href = 'Store/Order_Manager.html';
                });
                */
            }




            document.getElementById("UserPerfil").textContent = username;
            document.getElementById("emailPerfil").textContent = email;

            // Consulta la referencia de la imagen del perfil y obtén el documento
            const ProfileRef = doc(db, "Profile_Pictures", ProfilepictureExtract);
            const docSnap = await getDoc(ProfileRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data().ProfileImg);
                document.getElementById('profilePicture').src = docSnap.data().ProfileImg;
            } else {
                console.log("No such document!");
            }

        });

    } else {
        console.log("La sesion del usuario no se encontro")
        location.href = 'Login.html';
    }
});

document.getElementById('Regresar').addEventListener('click', () => {
    location.href = 'menu_temporal.html';
});

document.getElementById('editarPerfilMenu').addEventListener('click', () => {
    location.href = 'menu_editarPerfil.html';
});

document.getElementById('GestionHistorialPedidos').addEventListener('click', () => {
    location.href = 'Store/Order_History.html';
});



