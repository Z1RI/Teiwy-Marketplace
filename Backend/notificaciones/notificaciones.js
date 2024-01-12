export function mostrarAvisoExitoso(mensaje) {
    mostrarAviso('success', mensaje);
  }

export function mostrarAvisoExitosoConTiempo(mensaje, tiempo) {
    mostrarAviso('success', mensaje);
    setTimeout(cerrarModal, tiempo);
  }
  
export function mostrarAvisoError(mensaje) {
    mostrarAviso('error', mensaje);
  }
  
  function mostrarAviso(tipo, mensaje) {
    var modal = document.getElementById('myModal');
    var mensajeModal = document.getElementById('mensajeModal');
  
    mensajeModal.innerHTML = mensaje;
    modal.style.display = 'block';
  
    // Puedes personalizar los estilos y agregar animaciones según tus necesidades.
    // Aquí se muestra un modal simple para propósitos de demostración.
  }

  document.getElementById("cerrarModalM").addEventListener('click',  () => {
    cerrarModal();
  });

  function cerrarModal() {
    var modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }