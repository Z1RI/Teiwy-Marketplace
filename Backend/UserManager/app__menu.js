import {app} from "./firebase.js" 
import {auth} from "./firebase.js" 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

const database = getDatabase(app);
onAuthStateChanged(auth, async (user) => {
    onValue(ref(database, '/users/' + user.uid), async (snapshot) => {
        const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
        const userStatus = (snapshot.val() && snapshot.val().userStatus) || false;
        //console.log(userType);

        if (userStatus === false){
            auth.signOut().then(() => {
                // La sesión se cerró con éxito
                console.log('Sesión cerrada');
                setSessionStatus(false);
                location.href = 'Login.html';
            }).catch((error) => {
                // Hubo un error al cerrar la sesión
                console.error('Error al cerrar sesión:', error);
            });
        }
        

document.getElementById('closeSession').addEventListener('click', () => {
    // Cierra la sesión del usuario
    auth.signOut().then(() => {
        // La sesión se cerró con éxito
        console.log('Sesión cerrada');
        setSessionStatus(false);
        location.href = 'Login.html';
    }).catch((error) => {
        // Hubo un error al cerrar la sesión
        console.error('Error al cerrar sesión:', error);
    });
});

if (userType === 5) {
    document.getElementById('menuCarrito').style.display = "none";
}

document.getElementById('VerPerfilMenuButton').addEventListener('click', () => {
    location.href = 'menu_verPerfil.html';
}); 

document.getElementById('menuCarrito').addEventListener('click', () => {
    location.href = 'Store/shoppingCart.html';
  }); 

    });
});