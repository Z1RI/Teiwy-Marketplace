import { collection, query, where, getDocs, updateDoc, doc as doc_firestore, orderBy } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { auth, db } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref as ref_database, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

function convertirTimestampAFecha(timestamp) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
}

// Observador de cambio de estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref_database(getDatabase(), '/users/' + user.uid);

        // Observador de cambio en el valor del nodo del usuario
        onValue(userRef, async (snapshot) => {
            const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
            

            if (userType === 2) {
                // Usuario es de tipo 2, puede continuar

                const ordersRef = collection(db, `OrderHistory${user.uid}`);
                //const querySnapshot = await getDocs(ordersRef);
                const querySnapshot = await getDocs(query(ordersRef, orderBy("Orderdate", "desc")));


                for (const doc of querySnapshot.docs) {
                    const order = doc.data();
                    const orderDate = convertirTimestampAFecha(order.Orderdate);

                    const nombreDestinatario = order.OrderNombreDestinatario;
                    const direccion = order.OrderDireccion;
                    const ciudad = order.Orderciudad;
                    const codigoPostal = order.OrderCodigoPostal;
                    const orderEmail = order.OrderEmail;
                    const oderProductprice = order.ProductPrice;
                    const orderPayStatus = order.OrderPayStatus;
                    const orderPorductName = order.ProductName;
                    const orderAttentionStatus = order.OrderattentionStatus;

                    let orderStatusTrad = "Pendiente";

                    if (orderPayStatus == true) {
                        orderStatusTrad = "Pagado";
                    }

                    const OrdersContainer = document.getElementById('OrdersContainer');

                    const OrderDiv = document.createElement('tr');
                    //retirado <td>1</td>
                    OrderDiv.innerHTML = `
                        
                        <td>${orderDate.toLocaleString()}</td>
                        <td>${nombreDestinatario}</td>
                        <td>${direccion}</td>
                        <td>${ciudad}</td>
                        <td>${codigoPostal}</td>
                        <td>${orderEmail}</td>
                        <td>${oderProductprice}</td>
                        <td>${orderPorductName}</td>
                        <td>${orderStatusTrad}</td>
                        <td>
                            <input type="checkbox" id="miCheckbox${doc.id}" ${orderAttentionStatus ? 'checked' : ''}>
                            <label for="miCheckbox${doc.id}"></label>
                        </td>
                    `;
                    OrdersContainer.appendChild(OrderDiv);

                    const checkbox = document.getElementById(`miCheckbox${doc.id}`);
                    checkbox.addEventListener('change', async function() {
                        const orderHistoryRef = doc_firestore(db, `OrderHistory${user.uid}`, doc.id);
                        await updateDoc(orderHistoryRef, {
                            OrderattentionStatus: this.checked
                        });
                        console.log(this.checked);
                    }); 
                }
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
