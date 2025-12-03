import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDZbfcKkvUstrB_b87ujOWKNY_SJ2YoSk",
    authDomain: "prollectolibreria.firebaseapp.com",
    projectId: "prollectolibreria",
    storageBucket: "prollectolibreria.firebasestorage.app",
    messagingSenderId: "329126591666",
    appId: "1:329126591666:web:c48091699a028cacfcddab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================================
// 📌 Obtener ID desde la URL
// =====================================================
const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");

// Elementos
const img = document.getElementById("imagenURL");
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const genero = document.getElementById("genero");
const precio = document.getElementById("precio");

// =====================================================
// 🔥 Cargar datos del libro desde Libros_Futuros
// =====================================================
async function cargarLibroFuturo() {
    if (!libroId) {
        titulo.textContent = "Error: ID no especificada.";
        return;
    }

    try {
        const ref = doc(db, "Libros_Futuros", libroId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            titulo.textContent = "Este libro no existe.";
            return;
        }

        const libro = snap.data();

        // Rellenar datos en pantalla
        img.src = libro.imagenURL || "img/no-image.png";
        titulo.textContent = libro.titulo || "Sin título";
        autor.textContent = libro.autor || "Autor desconocido";
        genero.textContent = libro.genero || "Sin descripción disponible";
        precio.textContent = libro.precio ? libro.precio + "€" : "Próximamente";

    } catch (error) {
        console.error("Error al leer libro futuro:", error);
        titulo.textContent = "Error al cargar los datos.";
    }
}

// Ejecutar carga
cargarLibroFuturo();
