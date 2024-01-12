import { collection, query, where, getDocs, deleteDoc, addDoc, Timestamp, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { db } from "../UserManager/firebase.js";
import { auth } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const datoGlobal = localStorage.getItem('datoGlobal');
console.log(datoGlobal);
document.getElementById('botonRegresarSuccess').addEventListener('click', async () => {
    window.location.href = '../menu_temporal.html';
});

onAuthStateChanged(auth, async (user) => {
    if (user) {

        async function limpiarCarrito() {
            const storeRef = collection(db, `cartShop${user.uid}`);
            const q = query(storeRef, where("ProductName", "!=", null));
            const querySnapshot = await getDocs(q);

            for (const doc of querySnapshot.docs) {
                await deleteDoc(doc.ref);
            }
        }

        async function generarOrdenProveedores() {
            const storeRef = collection(db, `cartShop${user.uid}`);
            const q = query(storeRef, where("ProductName", "!=", null));
            const querySnapshot = await getDocs(q);

            // Encuentra los datos de la orden generada
            const storeDataRef = doc(db, `buyStorie${user.uid}`, datoGlobal);
            const storeDataSnapshot = await getDoc(storeDataRef); // Cambio aquí
            const orderData = storeDataSnapshot.data();

            // Obtener datos del formulario
            const nombreDestinatario = orderData.OrderNombreDestinatario;
            const direccion = orderData.OrderDireccion;
            const ciudad = orderData.Orderciudad;
            const codigoPostal = orderData.OrderCodigoPostal;
            const email = orderData.OrderEmail;

            for (const doc of querySnapshot.docs) {
                const productProveerId = doc.data().ProductUserID;
                const idproductis = doc.id;
                console.log("id del proveedor: " + productProveerId);
                console.log("id de los productos: " + idproductis);

                await addDoc(collection(db, `OrderHistory${productProveerId}`), {
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

        if (datoGlobal !== null) {
            //console.log(datoGlobal);

            // Manejo de eventos para el botón de realizar pago
            async function pagoConfirmado(datoGlobal) {
                const buyStorieRef = doc(db, `buyStorie${user.uid}`, datoGlobal);
                await updateDoc(buyStorieRef, {
                    OrderPayStatus: true
                });

                // Enviar la orden de compra de los productos a los proveedores
                await generarOrdenProveedores();
                // Llamar a la función para limpiar el carrito
                await limpiarCarrito();
                //window.location.href = '../Store/shoppingCart.html';

                console.log("Orden Aceptada");
            }

            pagoConfirmado(datoGlobal);

        } else {
            console.error("datoGlobal no disponible.");
            // Por ejemplo, redirigir a otra página
            window.location.href = '../Login.html';
        }

    } else {
        console.log("La sesión del usuario no se encontró");
        window.location.href = '../Login.html';
    }
});
