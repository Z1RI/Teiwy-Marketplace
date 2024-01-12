import { collection, query, where, getDocs, addDoc, setDoc, doc as doc_firestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { db } from "../UserManager/firebase.js"
import { auth, app } from "../UserManager/firebase.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, onValue} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {mostrarAvisoError, mostrarAvisoExitoso, mostrarAvisoExitosoConTiempo} from "../notificaciones/notificaciones.js"



const storeRef = collection(db, "Products");
const q = query(storeRef, where("ProductName", "!=", null));
const database = getDatabase(app);

//console.log (q)

onAuthStateChanged(auth, async (user) => {
  if (user) {
    onValue(ref(database, '/users/' + user.uid), async (snapshot) => {
      const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
      console.log(userType);
        

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      //console.log(doc.id, " => ", doc.data());
      //console.log(doc.data().ProductName);
      const img = doc.data().ProductImg;
      const Nombre = doc.data().ProductName;
      const Price = doc.data().ProductPrice;
      const Description = doc.data().ProductDescription;
      const ProductUserId = doc.data().ProductUserID;

      //console.log(img , Nombre, Price, Description);

      function mostrarProductos() {
        const productosContainer = document.getElementById('productosContainer');
        if (userType === 5) {

        const productoDiv = document.createElement('div');
         productoDiv.classList.add('productoDiv');
        productoDiv.innerHTML = `
            <img src="${img}" alt="${Nombre}">
            <h3>${Nombre}</h3>
            <p>Precio: L.${Price}</p>
            <p>${Description}</p>
            <button id="agregarCarrito${doc.id}ProductoButton" style="display: none">Agregar al Carrito</button>
        `;
        productosContainer.appendChild(productoDiv);

        }else{
          const productoDiv = document.createElement('div');
          productoDiv.classList.add('productoDiv');
         productoDiv.innerHTML = `
             <img src="${img}" alt="${Nombre}">
             <h3>${Nombre}</h3>
             <p>Precio: L.${Price}</p>
             <p>${Description}</p>
             <button id="agregarCarrito${doc.id}ProductoButton">Agregar al Carrito</button>

         `;
         productosContainer.appendChild(productoDiv);

        }
        console.log(Price);

      }

      // Llama a la función para mostrar los productos
      mostrarProductos();
      document.getElementById(`agregarCarrito${doc.id}ProductoButton`).addEventListener('click', async () => {
        try {
          console.log(ProductUserId);
          const docRef = await setDoc(doc_firestore(db, `cartShop${user.uid}`, `${doc.id}`), {
            ProductName: Nombre,
            ProductPrice: Price,
            ProductImg: img,
            ProductUserID: ProductUserId,
            ProductDescription: Description
          });
          mostrarAvisoExitosoConTiempo("Producto agregado con exito", 1500)
          //console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ");
          mostrarAvisoError("Fallo al agregar el producto")
        }
      });
    });
  });
  } else {
    console.log("La sesión del usuario no se encontró" + error);
    location.href = '../Login.html';
  }
 
});





