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

// =====================================================
// 🔥 Leer TODOS los libros de la colección Libros_Futuros
// =====================================================
async function cargarLibros() {
    try {
        console.log("Cargando colección 'Libros_Futuros'...");

        const snap = await getDocs(collection(db, "Libros_Futuros"));

        console.log("Documentos encontrados:", snap.size);

        librosCache = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Datos:", librosCache);

        pintarLibros(librosCache);

    } catch (error) {
        console.error("ERROR Firestore:", error);
    }
}

// =====================================================
// 🎨 Pintar tarjetas
// =====================================================
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

        // 🔗 Enlace a detalle
        tarjeta.href = `../HTML/DetalleLibro_Futuro.html?id=${libro.id}`;

        const imagen = libro.imagenURL && libro.imagenURL.trim() !== ""
            ? libro.imagenURL
            : "img/no-image.png";

        tarjeta.innerHTML = `
            <div class="imagen" style="background-image:url('${imagen}')"></div>
            <h3 class="titulo">${libro.titulo || "Sin título"}</h3>
            <p class="precio">${libro.precio ? libro.precio + "€" : "Sin precio"}</p>
        `;

        grid.appendChild(tarjeta);
    });
}

// =====================================================
// 🔍 Buscador en tiempo real
// =====================================================
document.getElementById("buscadorInput").addEventListener("input", () => {
    const texto = document.getElementById("buscadorInput").value.toLowerCase();

    const filtrados = librosCache.filter(libro =>
        libro.titulo?.toLowerCase().includes(texto)
    );

    pintarLibros(filtrados);
});

// =====================================================
// 🚀 Iniciar carga
// =====================================================
cargarLibros();
