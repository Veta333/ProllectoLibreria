// /public/JS/Carrito.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/*CONFIG FIREBASE */
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

/* UTIL: localStorage */
function cargarCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}
function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

/*FIRESTORE: aumentar stock*/
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

/* PINTAR CARRITO EN LA UI */
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
    total += (Number(item.precio) || 0) * (Number(item.cantidad) || 1);


    const imagen = item.imagenURL && item.imagenURL.trim() !== "" ? item.imagenURL : "/IMG/default.jpg";

    const card = document.createElement("div");
    card.className = "item-carrito";

    // Estructura: imagen | info | boton eliminar
    card.innerHTML = `
      <div class="item-imagen"><img src="${imagen}" alt="${escapeHtml(item.titulo)}"></div>

      <div class="item-info">
        <h3>${escapeHtml(item.titulo)}</h3>
        <p>Precio: ${Number(item.precio).toFixed(2)} €</p>
        <p>Cantidad: ${Number(item.cantidad || 1)}</p>
      </div>

      <div class="acciones">
        <button class="boton-eliminar" data-index="${index}" title="Eliminar">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  totalSpan.textContent = total.toFixed(2);

  // activar listeners eliminar
  activarEliminar();
}

/*  ELIMINAR ITEM (subir stock + borrar)*/
function activarEliminar() {
  document.querySelectorAll(".boton-eliminar").forEach(btn => {
    btn.removeEventListener("click", onEliminarClick); // evitar multi-attach
    btn.addEventListener("click", onEliminarClick);
  });
}

async function onEliminarClick(e) {
  const index = Number(e.currentTarget.getAttribute("data-index"));
  if (Number.isNaN(index)) return;

  let carrito = cargarCarrito();
  const item = carrito[index];
  if (!item) return;

  // Confirmación (opcional)
  const ok = confirm(`¿Eliminar "${item.titulo}" del carrito?`);
  if (!ok) return;

  // intentar aumentar stock en BBDD (si tenemos libroId)
  if (item.libroId) {
    await aumentarStockFirebase(item.libroId);
  } else {
    console.warn("onEliminarClick: item sin libroId, no se puede actualizar stock");
  }

  //  quitar del carrito y guardar
  carrito.splice(index, 1);
  guardarCarrito(carrito);

  //  repintar UI
  pintarCarrito();
}

/* POPUP PAGO (abrir / cerrar) */
(function setupPopup() {
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

  if (btnCerrar && popup) {
    btnCerrar.addEventListener("click", () => (popup.style.display = "none"));
  }
})();

/* STRIPE: iniciar checkout */
(function setupStripe() {
  const btnPagar = document.getElementById("btnPagarStripe");
  if (!btnPagar) return;

  btnPagar.addEventListener("click", async () => {
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

      // Si la respuesta no es JSON válido -> error
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

      // redirigir
      window.location.href = data.url;
    } catch (err) {
      console.error("Error iniciando Stripe:", err);
      alert("Hubo un error con Stripe");
    }
  });
})();

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/*INICIALIZACIÓN*/
document.addEventListener("DOMContentLoaded", () => {

  pintarCarrito();
});
