import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

let librosCache = [];


// CARGAR LIBROS

async function cargarLibros() {
    try {
        const snap = await getDocs(collection(db, "Libros"));
        librosCache = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        aplicarFiltros();
    } catch (error) {
        console.error("ERROR Firestore:", error);
    }
}


// FILTRADO GENERAL

function aplicarFiltros() {
    const texto = document.getElementById("buscadorInput").value.toLowerCase();
    const generoSeleccionado = document.getElementById("selectGenero").value;

    let lista = librosCache;

    // Filtro por texto
    if (texto.trim() !== "") {
        lista = lista.filter(libro =>
            libro.titulo?.toLowerCase().includes(texto)
        );
    }

    // Filtro por género
    if (generoSeleccionado !== "Todos") {
        lista = lista.filter(libro =>
            libro.genero?.toLowerCase() === generoSeleccionado.toLowerCase()
        );
    }

    pintarLibros(lista);
}


// PINTAR TARJETAS

function pintarLibros(lista) {
    const grid = document.getElementById("gridLibros");
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = "<p>No hay libros que coincidan con el filtro.</p>";
        return;
    }

    lista.forEach(libro => {
        const tarjeta = document.createElement("a");
        tarjeta.classList.add("tarjeta");
        tarjeta.href = "../HTML/DetalleLibro.html?id=${libro.id}";

        const imagen = libro.imagenURL?.trim()
            ? libro.imagenURL
            : "../IMG/default.jpg";

        tarjeta.innerHTML = `
            <div class="imagen" style="background-image:url('${imagen}')"></div>
            <h3 class="titulo">${libro.titulo || "Sin título"}</h3>
            <p class="precio">${libro.precio ? libro.precio + "€" : "Sin precio"}</p>
        `;

        grid.appendChild(tarjeta);
    });
}


// EVENTOS

document.getElementById("buscadorInput").addEventListener("input", aplicarFiltros);
document.getElementById("selectGenero").addEventListener("change", aplicarFiltros);


cargarLibros();
