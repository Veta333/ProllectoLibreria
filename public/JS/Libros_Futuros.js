// public/JS/Libros_Futuros.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDZbfcKkvUstrB_b87ujOWKNY_SJ2YoSk",
    authDomain: "prollectolibreria.firebaseapp.com",
    projectId: "prollectolibreria",
    storageBucket: "prollectolibreria.firebasestorage.app",
    messagingSenderId: "329126591666",
    appId: "1:329126591666:web:c48091699a028cacfcddab"
};

// Inicializar Firebase correctamente
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Cache interna
let librosCache = [];

/* CARGAR LIBROS FUTUROS*/
async function cargarLibros() {
    try {
        const snap = await getDocs(collection(db, "Libros_Futuros"));
        librosCache = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        pintarLibros(librosCache);

    } catch (error) {
        console.error("Error cargando Libros_Futuros:", error);
    }
}

/*PINTAR TARJETAS*/
function pintarLibros(lista) {
    const grid = document.getElementById("gridLibros");
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = "<p>No hay libros disponibles.</p>";
        return;
    }

    lista.forEach(libro => {
        const tarjeta = document.createElement("a");
        tarjeta.classList.add("tarjeta");

        tarjeta.href = `../HTML/DetalleLibro_Futuro.html?id=${libro.id}`;

        const imagen = libro.imagenURL?.trim()
            ? libro.imagenURL
            : "../IMG/default.jpg";

        tarjeta.innerHTML = `
            <div class="imagen" style="background-image:url('${imagen}')"></div>
            <h3 class="titulo">${libro.titulo || "Sin título"}</h3>
            <p class="precio">${libro.precio ? libro.precio + "€" : "Próximamente"}</p>
        `;

        grid.appendChild(tarjeta);
    });
}

/* BUSCADOR*/
document.getElementById("buscadorInput").addEventListener("input", () => {
    const texto = document.getElementById("buscadorInput").value.toLowerCase();
    const filtrados = librosCache.filter(libro =>
        libro.titulo?.toLowerCase().includes(texto)
    );
    pintarLibros(filtrados);
});

/*  EJECUCIÓN*/
cargarLibros();
