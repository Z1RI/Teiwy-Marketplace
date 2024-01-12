import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-functions.js";
import { auth } from "../UserManager/firebase.js";

const functions = getFunctions();

onAuthStateChanged(auth, async (user) => {
    if (user) {

        document.getElementById('realizarPagoButton').addEventListener('click', async () => {

            const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');

            // Pasa el UID del usuario como parámetro
            const context = { uid: user.uid };

            createStripeCheckout({}, { context })
                .then((response => {
                    const sessionId = response.data.id;
                    const sessionUrl = response.data.url;
                    console.log(sessionUrl);
                    window.location.href = sessionUrl;
                }))
                .catch((error) => {
                    console.error("Error al llamar a la función de Firebase:", error);
                });

        });
    } else {
        console.log("La sesión del usuario no se encontró");
        location.href = '../Login.html';
    }
});
