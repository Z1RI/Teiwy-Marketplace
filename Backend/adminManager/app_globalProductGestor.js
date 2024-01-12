// Importar módulos de Firebase
import { collection, getDocs, deleteDoc, doc as doc_firestore, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { db } from "../UserManager/firebase.js";
import { auth } from "../UserManager/firebase.js";
import { getDatabase, ref as ref_database, onValue, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {mostrarAvisoError, mostrarAvisoExitoso, mostrarAvisoExitosoConTiempo} from "../notificaciones/notificaciones.js"


const database = getDatabase();

document.getElementById("cerrarModalCambioProducto").addEventListener("click", function() {
    document.getElementById("modalCambioProducto").style.display = "none";
});

// Observador de cambio de estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref_database(database, '/users/' + user.uid);

        // Observador de cambio en el valor del nodo del usuario
        onValue(userRef, async (snapshot) => {
            const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';

            if (userType === 5) {
                // Usuario es de tipo 2, puede continuar

                const storeRef = collection(db, "Products");

                const querySnapshot = await getDocs(storeRef);
                querySnapshot.forEach(async (doc) => {
                    const productImg = doc.data().ProductImg;
                    const productName = doc.data().ProductName;
                    const productPrice = doc.data().ProductPrice;
                    const productDescription = doc.data().ProductDescription;
                    const productUserID = doc.data().ProductUserID; // Nuevo: Obtener el ID del usuario

                    function mostrarProductos() {
                        const productosContainer = document.getElementById('productosContainer');
                        const productoDiv = document.createElement(`div`);
                        productoDiv.id = doc.id;
                        productoDiv.innerHTML = `
                            <img src="${productImg}" alt="${productName}">
                            <h3>${productName}</h3>
                            <p>Precio: $${productPrice}</p>
                            <p>${productDescription}</p>
                            <button id="Detalle${doc.id}ProductoButton">Detalles Producto</button>
                            <button id="eliminar${doc.id}ProductoButton">Eliminar Producto</button>
                        `;
                        productosContainer.appendChild(productoDiv);
                    }

                    // Llama a la función para mostrar los productos
                    mostrarProductos();

                    document.getElementById(`eliminar${doc.id}ProductoButton`).addEventListener('click', async () => {
                        try {
                            console.log(`Eliminando producto con ID: ${doc.id}`);
                            await deleteDoc(doc_firestore(db, "Products", `${doc.id}`));
                            console.log(`Producto con ID ${doc.id} eliminado exitosamente`);
                            location.reload();
                        } catch (error) {
                            console.error(`Error al eliminar el producto: ${error.message}`);
                        }
                    });
                    

                    document.getElementById(`Detalle${doc.id}ProductoButton`).addEventListener('click', async () => {
                        document.getElementById("nombreProducto").textContent = `Nombre: ${productName}`;
                        document.getElementById("precioProducto").textContent = `Precio: $${productPrice}`;
                        document.getElementById('profilePicture').src = productImg;
                        document.getElementById("descripcionProducto").textContent = `Descripción: ${productDescription}`;

                        const userSnapshot = await get(ref_database(database, `/users/${productUserID}`));
                        const userDetail = userSnapshot.val();

                        const profileRef = doc_firestore(db, `/Profile_Pictures/${userDetail.profilePicture}`);
                        const profileSnapshot = await getDoc(profileRef);

                        console.log(profileSnapshot.ProfileImg);

                        if (profileSnapshot.exists()) {
                            const profileImgUrl = profileSnapshot.data().ProfileImg;
                            document.getElementById('profilePictureUsuario').src = profileImgUrl;
                        } else {
                            console.log("No such document!");
                        }

                        document.getElementById("nombreUsuario").textContent = `Usuario: ${userDetail.username}`;
                        document.getElementById("correoUsuario").textContent = `Correo: ${userDetail.email}`;

                        document.getElementById('modalCambioProducto').style.display = 'block';
                    });
                });
            } else {
                // Redirigir a la página de inicio de sesión si el usuario no es de tipo 2
                console.log("Acceso no autorizado");
                location.href = '../menu_verPerfil.html';
            }
        });

    } else {
        // Redirigir a la página de inicio de sesión si el usuario no está autenticado
        console.log("La sesión del usuario no se encontró");
        location.href = '../Login.html';
    }
});
