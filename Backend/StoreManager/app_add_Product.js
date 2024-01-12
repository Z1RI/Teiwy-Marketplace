import { storage, db } from "../UserManager/firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { auth, app } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref as ref_database, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { mostrarAvisoError, mostrarAvisoExitoso } from "../notificaciones/notificaciones.js";

// Obtener instancia de la base de datos
const database = getDatabase(app);

// Observador de cambio de estado de autenticación
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Obtener el tipo de usuario desde la base de datos en tiempo real
    onValue(ref_database(database, '/users/' + user.uid), async (snapshot) => {
      const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
      console.log(userType);

      if (userType === 2) {
        // Agregar evento de clic al botón "agregarProductoButton"
        try {
          document.getElementById('agregarProductoButton').addEventListener('click', function (event) {
            event.preventDefault();

            // Obtener valores de los campos
            const nombre = document.getElementById('nombre').value;
            const precio = parseFloat(document.getElementById('precio').value);
            const imagenInput = document.getElementById('imagen');
            const description = document.getElementById('descripcion').value;
            const imagenFile = imagenInput.files[0];

            console.log(imagenFile);

            // Verificar que se haya seleccionado una imagen
            if (!imagenFile) {
              mostrarAvisoError("Seleccione una imagen para el producto.");
              return;
            }

            // Referencia de almacenamiento para la imagen
            const storageRef = ref(storage, `Store_img/${imagenFile.name}`);

            // Subir la imagen al almacenamiento y obtener la URL de descarga
            uploadBytes(storageRef, imagenFile).then((snapshot) => {
              getDownloadURL(snapshot.ref).then(url => {
                try {
                  // Agregar documento a la colección "Products" en Firestore
                  const docRef = addDoc(collection(db, "Products"), {
                    ProductName: nombre,
                    ProductPrice: Number(precio),
                    ProductImg: url,
                    ProductUserID: user.uid,
                    ProductDescription: description
                  });

                  console.log("Document written with ID: ", docRef.id);

                  // Limpiar los campos después de agregar con éxito
                  document.getElementById('nombre').value = '';
                  document.getElementById('precio').value = '';
                  document.getElementById('imagen').value = '';
                  document.getElementById('descripcion').value = '';

                  mostrarAvisoExitoso("Producto agregado con éxito");
                } catch (e) {
                  console.error("Error adding document: ", e);
                  mostrarAvisoError("Error al agregar el Producto");
                }
              });
            });
          });
        } catch (error) {
          mostrarAvisoError("Error al agregar el Producto");
        }
      } else {
        // Redirigir a otra página para usuarios que no son de tipo 2
        location.href = '../menu_verPerfil.html';
      }
    });
  } else {
    // Redirigir a la página de inicio de sesión si el usuario no está autenticado
    console.log("La sesión del usuario no se encontró");
    location.href = '../Login.html';
  }
});
