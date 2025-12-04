import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// -----------------------------------------
// FIREBASE
// -----------------------------------------
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

// -----------------------------------------
// LOCAL STORAGE
// -----------------------------------------
function cargarCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// -----------------------------------------
// FIREBASE: AUMENTAR STOCK
// -----------------------------------------
async function aumentarStockFirebase(libroId) {
    try {
        const ref = doc(db, "Libros", libroId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.warn("❗ El libro no existe:", libroId);
            return;
        }

        const stockActual = snap.data().stock ?? 0;

        await updateDoc(ref, { stock: stockActual + 1 });

        console.log(`✔ Stock aumentado (+1) para libro ${libroId}`);

    } catch (error) {
        console.error("❌ Error aumentando stock:", error);
    }
}

// -----------------------------------------
// PINTAR CARRITO
// -----------------------------------------
export function pintarCarrito() {
    const contenedor = document.getElementById("carritoContainer");
    const totalSpan = document.getElementById("totalPrecio");

    const carrito = cargarCarrito();
    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio * (item.cantidad || 1);

        const div = document.createElement("div");
        div.classList.add("item-carrito");

        div.innerHTML = `
            <img src="${item.imagenURL}" class="img-carrito">

            <div class="info-carrito">
                <h3>${item.titulo}</h3>
                <p>${item.precio} €</p>
            </div>

            <button class="btn-eliminar" data-index="${index}">
                ❌
            </button>
        `;

        contenedor.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);

    activarBotonesEliminar();
}

// -----------------------------------------
// ELIMINAR UN PRODUCTO
// -----------------------------------------
function activarBotonesEliminar() {
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async () => {
            const index = btn.getAttribute("data-index");

            let carrito = cargarCarrito();
            const item = carrito[index];

            if (!item) return;

            // 1. Aumentar stock en Firebase
            await aumentarStockFirebase(item.libroId);

            // 2. Eliminar del carrito
            carrito.splice(index, 1);
            guardarCarrito(carrito);

            // 3. Repintar
            pintarCarrito();
        });
    });
}

// -----------------------------------------
// POPUP PAGO
// -----------------------------------------
const popup = document.getElementById("popupPago");
const btnAbrir = document.getElementById("btnAbrirPopup");
const btnCerrar = document.getElementById("cerrarPopup");

btnAbrir.onclick = () => {
    document.getElementById("totalPago").textContent =
        document.getElementById("totalPrecio").textContent;
    popup.style.display = "flex";
};

btnCerrar.onclick = () => {
    popup.style.display = "none";
};

// -----------------------------------------
// STRIPE PAGO
// -----------------------------------------
document.getElementById("btnPagarStripe").addEventListener("click", async () => {
    const carrito = cargarCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const items = carrito.map(p => ({
        name: p.titulo,
        price: p.precio,
        quantity: p.cantidad || 1
    }));

    try {
        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });

        const data = await res.json();

        if (!data.url) {
            alert("No se pudo iniciar el pago");
            return;
        }

        window.location.href = data.url;

    } catch (err) {
        console.error("❌ Error Stripe:", err);
        alert("Hubo un error con Stripe");
    }
});

// -----------------------------------------
// INICIO
// -----------------------------------------
pintarCarrito();
