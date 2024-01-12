import { collection, query, where, getDocs, updateDoc, doc as doc_firestore, orderBy  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { db } from "../UserManager/firebase.js";
import { auth } from "../UserManager/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

function convertirTimestampAFecha(timestamp) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const ordersRef = collection(db, `buyStorie${user.uid}`);
        //const querySnapshot = await getDocs(ordersRef);

        const querySnapshot = await getDocs(query(ordersRef, orderBy("Orderdate", "desc")));

        let num =1;

        for (const doc of querySnapshot.docs) {
            const order = doc.data();
            const orderDate = convertirTimestampAFecha(order.Orderdate);

            const nombreDestinatario = order.OrderNombreDestinatario;
            const direccion = order.OrderDireccion;
            const ciudad = order.Orderciudad;
            const codigoPostal = order.OrderCodigoPostal;
            const orderEmail = order.OrderEmail;
            const oderProductprice = order.OrderTotal;
            const orderPayStatus = order.OrderPayStatus
            const orderPorductName = order.ProductName;

            //console.log(orderPayStatus);
            var orderStatus = "Pendiente"

            if (orderPayStatus == true){
                orderStatus = "Completa"
            }else{
                orderStatus = "Pendiente"
            }


            const OrdersHistoryContainer = document.getElementById('OrdersHistoryContainer');

            const OrderDiv = document.createElement('tr');
            //retirado <td>${num}</td>
            OrderDiv.innerHTML = `    
                <td>${orderDate.toLocaleString()}</td>
                <td>${nombreDestinatario}</td>
                <td>${direccion}</td>
                <td>${ciudad}</td>
                <td>${codigoPostal}</td>
                <td>${orderEmail}</td>
                <td>${orderStatus}</td>
                <td>${oderProductprice}</td>
            `;
            OrdersHistoryContainer.appendChild(OrderDiv);

            num++;
        }
    } else {
        console.log("La sesión del usuario no se encontró");
        location.href = '../Login.html';
    }
});
