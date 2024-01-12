import { collection, query, where, getDocs, deleteDoc, doc as doc_firestore, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getDatabase, ref, onValue, child, get, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { db } from "../UserManager/firebase.js";
import { auth, app } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const database = getDatabase(app);
const dbRef_data = ref(database);

let usuarios = [];

document.getElementById('RegresarButton').addEventListener('click', () => {
  location.href = '../menu_temporal.html';
});

document.getElementById('ProcederPagoButton').addEventListener('click', () => {
  location.href = '../Store/dataFormProductPay.html';
});

// Función para mostrar productos
function mostrarProductos(producto, id) {
  const productosContainer = document.getElementById('productosContainer');
  const img = producto.ProductImg;
  const Nombre = producto.ProductName;
  const Price = producto.ProductPrice;
  const Description = producto.ProductDescription;

  const productoDiv = document.createElement('div');
  productoDiv.classList.add('productoDiv');
  productoDiv.innerHTML = `
      <img src="${img}" alt="${Nombre}">
      <h3>${Nombre}</h3>
      <p>Precio: L.${Price}</p>
      <p>${Description}</p>
      <button id="quitar${id}ProductoButton">Quitar</button>
  `;
  productosContainer.appendChild(productoDiv);

  // Manejar el evento para quitar el producto
  document.getElementById(`quitar${id}ProductoButton`).addEventListener('click', async () => {
    await deleteProductFromCart(id);
    location.reload();
  });
}

// Función para eliminar un producto del carrito
async function deleteProductFromCart(productId) {
  const user = auth.currentUser;
  if (user) {
    const storeRef = collection(db, `cartShop${user.uid}`);
    const q = query(storeRef, where("ProductName", "==", productId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      const doc = querySnapshot.docs[0];
      await deleteDoc(doc.ref);
    }
  }
}

// Función para calcular el total de precios de los productos
function calcularTotal() {
  const productosContainer = document.getElementById('productosContainer');
  const productos = productosContainer.getElementsByTagName('div');
  let total = 0;

  for (const producto of productos) {
    const precioString = producto.querySelector('p').textContent.split('L.')[1];
    const precio = parseFloat(precioString);
    total += precio;
  }

  return total.toFixed(2);
}

// Llamar a la función para mostrar productos
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const cartShopRef = collection(db, `cartShop${user.uid}`);
    const querySnapshot = await getDocs(cartShopRef);

    for (const doc of querySnapshot.docs) {
      const productID = doc.id;

      // Obtener el documento correspondiente en la colección 'Products'
      const productRef = doc_firestore(db, "Products", productID);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();

        // Actualizar los datos del carrito con los datos del producto
        await setDoc(doc_firestore(db, `cartShop${user.uid}`, productID), {
          ProductDescription: productData.ProductDescription,
          ProductImg: productData.ProductImg,
          ProductName: productData.ProductName,
          ProductPrice: productData.ProductPrice,
          ProductUserID: productData.ProductUserID,
        });

        mostrarProductos(productData, productID);

        document.getElementById(`quitar${productID}ProductoButton`).addEventListener('click', async () => {
          await deleteDoc(doc.ref);
          location.reload();
        });
      } else {
        // El producto no existe en la colección 'Products', eliminarlo del carrito
        await deleteDoc(doc.ref);
      }
    }

    // Mostrar el total de precios
    const totalContainer = document.getElementById('totalContainer');
    totalContainer.innerHTML = `<h1>Total: L.${calcularTotal()}</h1>`;
  } else {
    console.log("La sesión del usuario no se encontró");
    location.href = '../Login.html';
  }
});
