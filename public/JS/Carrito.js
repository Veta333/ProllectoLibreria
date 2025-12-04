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


// RESTAURAR STOCK EN FIRESTORE

async function sumarStock(libroId) {
    const ref = doc(db, "Libros", libroId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const nuevoStock = (data.stock || 0) + 1;

    await updateDoc(ref, { stock: nuevoStock });
}


// PINTAR CARRITO

function pintarCarrito() {
    const cont = document.getElementById("carritoContainer");
    const totalSpan = document.getElementById("totalPrecio");

    const carrito = cargarCarrito();
    cont.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio;

        const div = document.createElement("div");
        div.className = "item-carrito";

        div.innerHTML = `
            <img src="${item.imagenURL}" class="img-carrito">
            <div>
                <h3>${item.titulo}</h3>
                <p>${item.precio}€</p>
            </div>
            <button class="btn-eliminar" data-index="${index}" data-id="${item.libroId}">
                ❌
            </button>
        `;

        cont.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);

    // activar botones eliminar
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.onclick = async e => {
            const index = e.target.dataset.index;
            const libroId = e.target.dataset.id;

            await sumarStock(libroId);

            let carrito = cargarCarrito();
            carrito.splice(index, 1);
            guardarCarrito(carrito);

            pintarCarrito();
        };
    });
}

// POPUP

const popup = document.getElementById("popupPago");
document.getElementById("btnAbrirPopup").onclick = () => {
    document.getElementById("totalPago").textContent =
        document.getElementById("totalPrecio").textContent;

    popup.style.display = "flex";
};

document.getElementById("cerrarPopup").onclick = () =>
    popup.style.display = "none";

// STRIPE

document.getElementById("btnPagarStripe").onclick = async () => {
    const carrito = cargarCarrito();

    if (carrito.length === 0) {
        alert("Carrito vacío");
        return;
    }

    const items = carrito.map(p => ({
        name: p.titulo,
        price: p.precio,
        quantity: 1
    }));

    try {
        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items })
        });

        const data = await res.json();

        if (!data.url) {
            console.error("Error:", data);
            alert("Error con Stripe");
            return;
        }

        window.location.href = data.url;

    } catch (err) {
        console.error("Stripe Error:", err);
        alert("Error con Stripe");
    }
};


// INICIALIZAR

pintarCarrito();
