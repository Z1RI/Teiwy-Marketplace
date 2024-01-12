// Importar módulos de Firebase
import { collection, query, where, getDocs, deleteDoc, doc as doc_firestore, setDoc  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { db, storage } from "../UserManager/firebase.js"
import { auth } from "../UserManager/firebase.js"
import { getDatabase, ref as ref_database, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {mostrarAvisoError, mostrarAvisoExitoso, mostrarAvisoExitosoConTiempo} from "../notificaciones/notificaciones.js"

const database = getDatabase();

// Observador de cambio de estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref_database(database, '/users/' + user.uid);
        
        // Observador de cambio en el valor del nodo del usuario
        onValue(userRef, async (snapshot) => {
            const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
            console.log(userType);

            if (userType === 2) {
                // Usuario es de tipo 2, puede continuar

                const storeRef = collection(db, "Products");
                const q = query(storeRef, where("ProductUserID", "==", user.uid));

                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    const img = doc.data().ProductImg;
                    const Nombre = doc.data().ProductName;
                    const Price = doc.data().ProductPrice;
                    const Description = doc.data().ProductDescription;

                    console.log(doc.id);

                    function mostrarProductos() {
                        const productosContainer = document.getElementById('productosContainer');
                        const productoDiv = document.createElement(`div`);
                        productoDiv.id = doc.id;
                        productoDiv.innerHTML = `
                            <img src="${img}" alt="${Nombre}">
                            <h3>${Nombre}</h3>
                            <p>Precio: $${Price}</p>
                            <p>${Description}</p>
                            <button id="editar${doc.id}ProductoButton">Editar Producto</button>
                            <button id="eliminar${doc.id}ProductoButton">Eliminar Producto</button>
                        `;
                        productosContainer.appendChild(productoDiv);
                    }

                    // Llama a la función para mostrar los productos
                    mostrarProductos();

                    document.getElementById(`eliminar${doc.id}ProductoButton`).addEventListener('click', async () => {
                        await deleteDoc(doc_firestore(db, "Products", `${doc.id}`));
                        location.reload();
                    });

                    document.getElementById(`editar${doc.id}ProductoButton`).addEventListener('click', async () => {
                        //console.log("hola");

                        // Obtiene los valores actuales
                        const nombre = document.getElementById("nombre").value || Nombre;
                        const precio = parseFloat(document.getElementById("precio").value) || Price;
                        const descripcion = document.getElementById("descripcion").value || Description;

                        // ... (otros campos similares)

                        // Preenlaza los campos de entrada con los valores actuales
                        document.getElementById("nombre").value = Nombre;
                        document.getElementById("precio").value = Price;
                        document.getElementById("descripcion").value = Description;
                        // ... (otros campos similares)

                        document.getElementById("nombreProducto").textContent = `Nombre: ${Nombre}`;
                        document.getElementById("precioProducto").textContent = `Precio: L.${Price}`;
                        document.getElementById('profilePicture').src = img;
                        document.getElementById("descripcionProducto").textContent = `Descripcion actual: ${Description}`;
                        
                        const existingGuardarCambiosButton = document.getElementById("guardarCambiosButton");
                        if (existingGuardarCambiosButton) {
                            existingGuardarCambiosButton.remove();
                        }

                        const guardarCambiosContainer = document.getElementById('guardarCambiosbuttonContainer');
                        const guardarCambiosButton = document.createElement('button');
                        guardarCambiosButton.id = 'guardarCambiosButton';
                        guardarCambiosButton.textContent = 'Guardar Cambios';

                        guardarCambiosContainer.appendChild(guardarCambiosButton);

                        var modal = document.getElementById('modalCambioProducto');
                        modal.style.display = 'block';

                        document.getElementById(`guardarCambiosButton`).addEventListener('click', async () => {
                            const nombre = document.getElementById('nombre').value;
                            const precio = parseFloat(document.getElementById('precio').value);
                            const imagenInput = document.getElementById('imagen');
                            const description = document.getElementById('descripcion').value;
                            const imagenFile = imagenInput.files[0];
                            //console.log(nombre, precio, imagenInput, description, imagenFile);

                            if (imagenFile) {
                                const storageRef = ref(storage, `Store_img/${imagenFile.name}`);
                                uploadBytes(storageRef, imagenFile).then((snapshot) => {
                                    getDownloadURL(snapshot.ref).then(async url  =>  { 
                                        try {
                                          // Agregar documento a la colección "Products" en Firestore
                                                             await setDoc(doc_firestore(db, "Products", `${doc.id}`), {
                                                              ProductDescription: description,
                                                              ProductImg: url,
                                                              ProductName: nombre,
                                                              ProductPrice: precio,
                                                              ProductUserID: user.uid
                                                            });
                                                            
                                          console.log("Document written with ID: ", doc.id);
                                          mostrarAvisoExitoso("Cambios guardados con exito")

                                        } catch (e) {
                                          console.error("Error adding document: ");
                                          mostrarAvisoError("Error al actualizar el producto")
                                        }
                                      });
                                })
                            }else{
                                try {
                                    // Agregar documento a la colección "Products" en Firestore
                                                       await setDoc(doc_firestore(db, "Products", `${doc.id}`), {
                                                        ProductDescription: description,
                                                        ProductImg: img,
                                                        ProductName: nombre,
                                                        ProductPrice: precio,
                                                        ProductUserID: user.uid
                                                      });
                                                      
                                    console.log("Document written with ID: ", doc.id);
                                    mostrarAvisoExitoso("Cambios guardados con exito")
                                  } catch (e) {
                                    console.error("Error adding document: ", e);
                                    mostrarAvisoError("Error al actualizar el producto")
                                  }
                            }
    
                            //console.log(doc.id);
                            //const storageRef = ref(storage, `Store_img/${imagenFile.name}`);              
                            });
                    });

                    


                        document.getElementById("cerrarModalCambioProducto").addEventListener("click", function() {
                        document.getElementById("modalCambioProducto").style.display = "none";

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
