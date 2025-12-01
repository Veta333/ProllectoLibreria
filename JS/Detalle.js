import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ⚠️ TU CONFIGURACIÓN REAL DE FIREBASE AQUÍ
const firebaseConfig = {
 apiKey: "AIzaSyBDZbfcKkvUstrB_b87ujOWKNY_SJ2YoSk",
    authDomain: "prollectolibreria.firebaseapp.com",
    projectId: "prollectolibreria",
    storageBucket: "prollectolibreria.firebasestorage.app",
    messagingSenderId: "329126591666",
    appId: "1:329126591666:web:c48091699a028cacfcddab"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ✅ Obtener el ID del libro desde la URL
const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");

// ✅ Referencias al DOM
const titulo = document.getElementById("tituloLibro");
const autor = document.getElementById("autorLibro");
const descripcion = document.getElementById("descripcionLibro");
const precio = document.getElementById("precioLibro");
const imagen = document.getElementById("imgLibro");

// ✅ Cargar datos del libro
function cargarLibro() {
    if (!libroId) {
        titulo.textContent = "Libro no encontrado";
        return;
    }

    const libroRef = ref(database, `libros/${libroId}`);

    get(libroRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                titulo.textContent = data.titulo;
                autor.textContent = data.autor;
                descripcion.textContent = data.descripcion;
                precio.textContent = data.precio + "€";
                imagen.src = data.imagen;
            } else {
                titulo.textContent = "Libro no encontrado";
            }
        })
        .catch((error) => {
            console.error("Error al cargar libro:", error);
        });
}

cargarLibro();
