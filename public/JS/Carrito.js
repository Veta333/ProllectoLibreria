// FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    updateDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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


// CARGAR CARRITO

function cargarCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}


// GUARDAR CARRITO

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


// SUMAR STOCK AL ELIMINAR

async function restaurarStock(libroId) {
    const ref = doc(db, "Libros", libroId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const stockActual = data.stock || 0;

    await updateDoc(ref, { stock: stockActual + 1 });
}


// PINTAR CARRITO

function pintarCarrito() {
    const contenedor = document.getElementById("carritoContainer");
    const totalSpan = document.getElementById("totalPrecio");

    const carrito = cargarCarrito();
    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach((item, i) => {
        const div = document.createElement("div");
        div.classList.add("item-carrito");

        total += item.precio * (item.cantidad || 1);

        div.innerHTML = `
            <img src="${item.imagenURL}" class="img-carrito">
            <div>
                <h3>${item.titulo}</h3>
                <p>${item.precio}€</p>
            </div>

            <button class="btn-eliminar" data-index="${i}" data-id="${item.libroId}">
                ❌
            </button>
        `;

        contenedor.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);

    // Activar botones eliminar
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const index = e.target.dataset.index;
            const libroId = e.target.dataset.id;

            await restaurarStock(libroId);

            const carrito = cargarCarrito();
            carrito.splice(index, 1);
            guardarCarrito(carrito);
            pintarCarrito();
        });
    });
}

// POPUP

const popup = document.getElementById("popupPago");
const btnAbrir = document.getElementById("btnAbrirPopup");
const btnCerrar = document.getElementById("cerrarPopup");

btnAbrir.onclick = () => {
    document.getElementById("totalPago").textContent =
        document.getElementById("totalPrecio").textContent;
    popup.style.display = "flex";
};

btnCerrar.onclick = () => popup.style.display = "none";


// STRIPE

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
            alert("Hubo un error con Stripe");
            console.error(data);
            return;
        }

        window.location.href = data.url;

    } catch (err) {
        console.error("Error Stripe:", err);
        alert("Hubo un error con Stripe");
    }
});

// INICIALIZAR

pintarCarrito();
