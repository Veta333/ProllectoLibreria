// /public/JS/Carrito.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ---------------------------
   CONFIG FIREBASE
   --------------------------- */
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

/* ---------------------------
   HELPERS localStorage
   --------------------------- */
function cargarCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}
function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}


function resolveImagePath(img) {
  if (!img) return "../IMG/default.jpg";
  const s = String(img).trim();
  if (s === "") return "../IMG/default.jpg";
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s;

  if (s.startsWith("IMG/") || s.startsWith("../IMG/")) return s;

  return "../IMG/" + s;
}

/* ---------------------------
   Aumentar stock en Firestore
   --------------------------- */
async function aumentarStockFirebase(libroId) {
  if (!libroId) {
    console.warn("aumentarStockFirebase: libroId vacío");
    return;
  }
  try {
    const ref = doc(db, "Libros", libroId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("aumentarStockFirebase: doc no encontrado:", libroId);
      return;
    }

    const stockActual = snap.data().stock ?? 0;
    await updateDoc(ref, { stock: stockActual + 1 });
    console.log(`Stock aumentado +1 para ${libroId} (antes ${stockActual})`);
  } catch (err) {
    console.error("Error aumentando stock en Firestore:", err);
  }
}

/* ---------------------------
   Pintar carrito
   --------------------------- */
function pintarCarrito() {
  const contenedor = document.getElementById("carritoContainer");
  const totalSpan = document.getElementById("totalPrecio");

  if (!contenedor || !totalSpan) {
    console.warn("pintarCarrito: elementos DOM no encontrados");
    return;
  }

  const carrito = cargarCarrito();
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = `<p style="text-align:center; color:#555;">Tu carrito está vacío.</p>`;
    totalSpan.textContent = "0.00";
    return;
  }

  let total = 0;

  carrito.forEach((item, index) => {
    const price = Number(item.precio) || 0;
    const qty = Number(item.cantidad) || 1;
    total += price * qty;

    const imagen = resolveImagePath(item.imagenURL);

    const card = document.createElement("div");
    card.className = "item-carrito";

    card.innerHTML = `
      <div class="item-imagen"><img src="${imagen}" alt="${escapeHtml(item.titulo)}"></div>
      <div class="item-info">
        <h3>${escapeHtml(item.titulo)}</h3>
        <p>Precio: ${price.toFixed(2)} €</p>
        <p>Cantidad: ${qty}</p>
      </div>
      <div class="acciones">
        <button class="boton-eliminar" data-index="${index}">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  totalSpan.textContent = total.toFixed(2);
  activarEliminar();
}

/* ---------------------------
   Eliminar (sube stock + borra)
   --------------------------- */
function activarEliminar() {
  document.querySelectorAll(".boton-eliminar").forEach(btn => {
    btn.removeEventListener("click", onEliminarClick);
    btn.addEventListener("click", onEliminarClick);
  });
}

async function onEliminarClick(e) {
  const index = Number(e.currentTarget.getAttribute("data-index"));
  if (Number.isNaN(index)) return;

  let carrito = cargarCarrito();
  const item = carrito[index];
  if (!item) return;

  const ok = confirm(`¿Eliminar "${item.titulo}" del carrito?`);
  if (!ok) return;

  // 1) aumentar stock (si hay libroId)
  if (item.libroId) {
    await aumentarStockFirebase(item.libroId);
  } else {
    console.warn("Elemento sin libroId: no se actualiza stock");
  }

  // 2) eliminar del array y guardar
  carrito.splice(index, 1);
  guardarCarrito(carrito);

  // 3) repintar
  pintarCarrito();
}

/* ---------------------------
   Popup pago
   --------------------------- */
function setupPopup() {
  const popup = document.getElementById("popupPago");
  const btnAbrir = document.getElementById("btnAbrirPopup");
  const btnCerrar = document.getElementById("cerrarPopup");

  if (btnAbrir && popup) {
    btnAbrir.addEventListener("click", () => {
      const total = document.getElementById("totalPrecio")?.textContent || "0.00";
      const totalPagoSpan = document.getElementById("totalPago");
      if (totalPagoSpan) totalPagoSpan.textContent = total;
      popup.style.display = "flex";
    });
  }
  if (btnCerrar && popup) btnCerrar.addEventListener("click", () => (popup.style.display = "none"));
}

/* ---------------------------
   Stripe checkout
   --------------------------- */
function setupStripe() {
  const btnPagar = document.getElementById("btnPagarStripe");
  if (!btnPagar) return;

  btnPagar.addEventListener("click", async () => {
    const carrito = cargarCarrito();
    if (carrito.length === 0) { alert("Tu carrito está vacío"); return; }

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

      // puede lanzar HTML si la ruta /api no existe (404 de Vercel devuelve HTML) -> .json() fallará
      const data = await res.json();

      if (!res.ok) {
        console.error("Stripe API error:", data);
        alert("Hubo un problema iniciando el pago");
        return;
      }
      if (!data.url) {
        console.error("Stripe: no vino URL:", data);
        alert("No se pudo iniciar el pago");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Error iniciando Stripe:", err);
      alert("Hubo un error con Stripe");
    }
  });
}

/* ---------------------------
   Aux
   --------------------------- */
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------
   Init
   --------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  pintarCarrito();
  setupPopup();
  setupStripe();
});
