import {  updatePassword, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getDatabase, onValue, set, ref as ref_database } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { storage, db } from "../UserManager/firebase.js"
import { ref as ref_storage, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { addDoc, collection  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {mostrarAvisoError, mostrarAvisoExitoso, mostrarAvisoExitosoConTiempo} from "../notificaciones/notificaciones.js"



//import {app} from "./firebase.js" 
import {auth, app} from "./firebase.js" 
//import { toggleAuthUI } from './app_user_observer.js';


const database = getDatabase(app);
onAuthStateChanged(auth, async (user) => {
    if (user) {
      //const uid = user.uid;
      onValue(ref_database(database, '/users/' + user.uid), async (snapshot) => {
        const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
        const email = (snapshot.val() && snapshot.val().email) || 'Anonymous';
        const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
        const carShopId = (snapshot.val() && snapshot.val().carShopId) || 'Anonymous';
        const profilePicture = (snapshot.val() && snapshot.val().profilePicture) || 'Anonymous';
        const userStatus = (snapshot.val() && snapshot.val().userStatus) || false;

        console.log(userStatus);

        document.getElementById("nombreRegistroActual").textContent = username;
        document.getElementById("correoRegistroActual").textContent = email;

        document.getElementById('editarContraseña').addEventListener('click', () => {
   
            const newPassword = document.getElementById('newContrasenaRegistro').value; //aqui debe ir antes una funcion que compruebe que las constraseñas este verificada
              
              updatePassword(user, newPassword).then(() => {
                  console.log("Contraseña actualizada con exito") //aqui tiene que ir un aviso o pop up
                  document.getElementById('newContrasenaRegistro').value = '';
                  document.getElementById('newconfirmar_contrasena').value = '';

                  set(ref_database(database, 'users/' + user.uid), {
                      password: newPassword,
                      userStatus: userStatus,   
                      username: username,
                      email: email,
                      profilePicture: profilePicture,  // Establece el ID del documento de la imagen
                      userType: userType,
                      carShopId: carShopId
                  });
      
                //Modal 
                mostrarAvisoExitoso("Contraseña actualizada con exito");
      
                }).catch((error) => {
                    console.log(error);
                    mostrarAvisoError("Error al actualizar la contraseña")
                }); 
          });   
    });


    } else {
        console.log("La sesion del usuario no se encontro"+ error);
        location.href = 'Login.html';
    }
  });

 /////////////////////////////////////////////////////////////////////////////////////

 onAuthStateChanged(auth, async (user) => {
  if (user) {

    const userRef = ref_database(getDatabase(), '/users/' + user.uid);

    onValue(userRef, async (snapshot) => {

        const userType = (snapshot.val() && snapshot.val().userType) || 'Anonymous';
        const carShopId = (snapshot.val() && snapshot.val().carShopId) || 'Anonymous';
        const password = (snapshot.val() && snapshot.val().password) || 'Anonymous';
        const userStatus = (snapshot.val() && snapshot.val().userStatus) || false;

        //console.log(userType, carShopId, password)
        document.getElementById('editarPerfil').addEventListener('click', function (event) {
            event.preventDefault();
            const Nuevonombre = document.getElementById('Nuevonombre').value;
            const Nuevocorreo = document.getElementById('NuevocorreoRegistro').value;
            const imagenInput = document.getElementById('imagenPerfilEditar');
            const imagenFile = imagenInput.files[0];
  
            console.log(imagenFile.name)
            const storageRef = ref_storage(storage, `Profile_Img/${imagenFile.name}`);
            uploadBytes(storageRef, imagenFile).then((snapshot) => {
                getDownloadURL(snapshot.ref).then(url => {
                    // Sube la imagen y obtén su URL
  
                    try {
                        const docRef = addDoc(collection(db, "Profile_Pictures"), {
                            ProfileImg: url
                        }).then(docRef => {
                          console.log(docRef.id);
                          console.log(Nuevocorreo);
  
                          set(ref_database(database, 'users/' + user.uid), {
                            username: Nuevonombre,
                            email: Nuevocorreo,
                            profilePicture: docRef.id,  // Establece el ID del documento de la imagen
                            userType: userType,
                            carShopId: carShopId,
                            userStatus: userStatus,   
                            password: password
                            
                        });
                      });
                      
  
                        // Ahora que tenemos el ID de la imagen, actualiza el perfil del usuario
                        /*
                        set(ref_database(database, 'users/' + user.uid), {
                            username: Nuevonombre,
                            email: Nuevocorreo,
                            profile_picture: docRef.id  // Establece el ID del documento de la imagen
                        });
                        */  

                        document.getElementById('Nuevonombre').value = '';
                        document.getElementById('NuevocorreoRegistro').value = '';
                        document.getElementById('imagenPerfilEditar').value = '';

                        console.log("Document written with ID: ", docRef.id);
                        mostrarAvisoExitoso("Perfil actualizado con exito");
                    } catch (e) {
                        console.error("Error adding document: ", e);
                        mostrarAvisoError("Error al actualizar el perfil")
                    }
                });
            });
        });



    });

  } else {
      console.log("La sesión del usuario no se encontró" );
      location.href = 'Login.html';
  }
});


 /////////////////////////////////////////////////////////////////////////////////////

document.getElementById('editarPerfilMenuButton').addEventListener('click', () => {
    location.href = 'menu_verPerfil.html';
}); 


