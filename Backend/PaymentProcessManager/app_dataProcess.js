import { collection, query, where, getDocs, deleteDoc, addDoc, Timestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { db } from "../UserManager/firebase.js";
import { auth } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

export let datoGlobal = null;
// Manejo de eventos para el botón de volver al carrito

document.getElementById('volverCarritoButton').addEventListener('click', () => {
    location.href = '../Store/shoppingCart.html';
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Manejo de eventos para el botón de enviar formulario
        document.getElementById('sendFormDatabutton').addEventListener('click', async () => {
            
            document.getElementById("contPayment").style.display = "block";
            document.getElementById("realizarPagoButton").style.display = "block";

            // Obtener datos del formulario
            const nombreDestinatario = document.getElementById('nombreDestinatario').value;
            const direccion = document.getElementById('direccion').value;
            const ciudad = document.getElementById('ciudad').value;
            const codigoPostal = document.getElementById('codigoPostal').value;
            const email = user.email;

            // Obtener productos del carrito y calcular el total
            const storeRef = collection(db, `cartShop${user.uid}`);
            const q = query(storeRef, where("ProductName", "!=", null));
            const querySnapshot = await getDocs(q);

            let total = 0;

            for (const doc of querySnapshot.docs) {
                const Producto = doc.data();
                const storeRef2 = collection(db, "Products");
                const productQuery = query(storeRef2, where("ProductName", "==", Producto.ProductName));
                const productSnapshots = await getDocs(productQuery);

                if (productSnapshots.size > 0) {
                    const productDoc = productSnapshots.docs[0];
                    const precio = productDoc.data().ProductPrice;
                    total += precio;
                    console.log(`Total de precios: $${total}`);
                } else {
                    // El producto no existe, eliminarlo del carrito
                    await deleteDoc(doc.ref);
                }
            }

            // Crear una nueva orden en la base de datos
            const docRef = await addDoc(collection(db, `buyStorie${user.uid}`), {
                OrderNombreDestinatario: nombreDestinatario,
                OrderDireccion: direccion,
                Orderciudad: ciudad,
                OrderCodigoPostal: codigoPostal,
                OrderEmail: email,
                OrderTotal: total,
                Orderdate: Timestamp.fromDate(new Date()),
                OrderPayStatus: false
            });

            console.log(docRef.id);
            datoGlobal = docRef.id;
            localStorage.setItem('datoGlobal', datoGlobal);
            // Manejo de eventos para el botón de realizar pago
            /*
            document.getElementById('realizarPagoButton').addEventListener('click', async () => {
                await pagoConfirmado(docRef.id);
            }); */
            
            
        });

        /*
        // Función para limpiar el carrito
        async function limpiarCarrito() {
            const storeRef = collection(db, `cartShop${user.uid}`);
            const q = query(storeRef, where("ProductName", "!=", null));
            const querySnapshot = await getDocs(q);

            for (const doc of querySnapshot.docs) {
                await deleteDoc(doc.ref);
            }
        }
        
        // Función listar productos del carrito
        async function generarOrdenProveedores() {
            const storeRef = collection(db, `cartShop${user.uid}`);
            const q = query(storeRef, where("ProductName", "!=", null));
            const querySnapshot = await getDocs(q);
            // Obtener datos del formulario
            const nombreDestinatario = document.getElementById('nombreDestinatario').value;
            const direccion = document.getElementById('direccion').value;
            const ciudad = document.getElementById('ciudad').value;
            const codigoPostal = document.getElementById('codigoPostal').value;
            const email = user.email;

            for (const doc of querySnapshot.docs) {
                const productProveerId = doc.data().ProductUserID;
                const idproductis = doc.id
                console.log("id del proveedor: "+ productProveerId);
                console.log("id de los productos: "+ idproductis);

                const docRef =   addDoc(collection(db, `OrderHistory${productProveerId}`), {
                    ProductName: doc.data().ProductName,
                    ProductPrice: doc.data().ProductPrice,
                    OrderNombreDestinatario: nombreDestinatario,
                    OrderDireccion: direccion,
                    Orderciudad: ciudad,
                    OrderCodigoPostal: codigoPostal,
                    OrderEmail: email,
                    Orderdate: Timestamp.fromDate(new Date()),
                    OrderPayStatus: true,
                    OrderattentionStatus: false
                });

            }
        }

        // Manejo de eventos para el botón de realizar pago
        async function pagoConfirmado(id) {
            const buyStorieRef = doc(db, `buyStorie${user.uid}`, id);
            await updateDoc(buyStorieRef, {
                OrderPayStatus: true
            });


            //Enviar la orden de compra de los productos a los proveedores
            await generarOrdenProveedores();
            // Llamar a la función para limpiar el carrito
            await limpiarCarrito();
            location.href = '../Store/shoppingCart.html';

            console.log("Orden Aceptada");
        }
        */
    } else {
        console.log("La sesión del usuario no se encontró");
        location.href = '../Login.html';
    }
});
