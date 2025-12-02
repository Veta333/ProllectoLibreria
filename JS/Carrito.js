import {
    getFirestore,
    collection,
    getDocs,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

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
const auth = getAuth();

const contenedor = document.getElementById("carritoContainer");
const totalPrecio = document.getElementById("totalPrecio");

async function cargarCarrito() {
    const user = auth.currentUser;

    if (!user) {
        contenedor.innerHTML = "<p>Debes iniciar sesión para ver el carrito.</p>";
        return;
    }

    const ref = collection(db, "users", user.uid, "cart");
    const snapshot = await getDocs(ref);

    contenedor.innerHTML = "";
    let total = 0;

    snapshot.forEach(docSnap => {
        const libro = docSnap.data();
        const id = docSnap.id;

        total += Number(libro.precio);

        const item = document.createElement("div");
        item.classList.add("item-carrito");

        item.innerHTML = `
            <div class="item-info">
                <p><strong>${libro.titulo}</strong></p>
                <p>Género: ${libro.genero}</p>
                <p>Precio: ${libro.precio} €</p>
            </div>

            <div class="item-imagen">
                <img src="${libro.imagenURL}" alt="Libro">
            </div>

            <div class="boton-eliminar" onclick="eliminarItem('${id}')">
                <img src="../IMG/papelera.png" alt="Eliminar">
            </div>
        `;

        contenedor.appendChild(item);
    });

    totalPrecio.textContent = total.toFixed(2);
}

window.eliminarItem = async function(id) {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "cart", id));

    cargarCarrito();
};

auth.onAuthStateChanged(() => {
    cargarCarrito();
});


// =====================
// POPUP — ARREGLOS
// =====================
const popup = document.getElementById("popupPago");
const btnTotal = document.getElementById("btnTotal");
const cerrarPopup = document.getElementById("cerrarPopup");
const btnPagar = document.getElementById("btnPagar");

// Abrir popup
if (btnTotal) {
    btnTotal.addEventListener("click", () => {
        popup.style.display = "flex";
    });
}

// Cerrar popup
if (cerrarPopup) {
    cerrarPopup.addEventListener("click", () => {
        popup.style.display = "none";
    });
}

// Simular pago
if (btnPagar) {
    btnPagar.addEventListener("click", () => {
        alert("Pago procesado (modo TEST)");
    });
}
