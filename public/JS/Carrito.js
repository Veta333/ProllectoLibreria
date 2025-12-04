// public/JS/Carrito.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  increment
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";


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
const auth = getAuth(app);


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

/*Aumentar stock en Firestore */
async function aumentarStockFirebase(libroId, cantidad = 1) {
  if (!libroId) {
    console.warn("aumentarStockFirebase: libroId vacío");
    return false;
  }
  try {
    const ref = doc(db, "Libros", libroId);
    // Usa increment para evitar condiciones de carrera
    await updateDoc(ref, { stock: increment(cantidad) });
    console.log(`Stock aumentado +${cantidad} para ${libroId}`);
    return true;
  } catch (err) {
    console.error("Error aumentando stock en Firestore:", err);
    return false;
  }
}

async function buscarLibroPorTitulo(titulo) {
  try {
    const q = query(collection(db, "Libros"), where("titulo", "==", titulo));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const first = snap.docs[0];
      return { id: first.id, data: first.data() };
    }
    return null;
  } catch (err) {
    console.error("Error buscando libro por título:", err);
    return null;
  }
}

/*Pintar carrito */
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

  const cantidad = Number(item.cantidad) || 1;
  const libroId = item.libroId;


  let aumentado = false;
  if (libroId) {
    aumentado = await aumentarStockFirebase(libroId, cantidad);
  } else {
    // fallback: buscar libro por título
    const encontrado = await buscarLibroPorTitulo(item.titulo);
    if (encontrado) {
      aumentado = await aumentarStockFirebase(encontrado.id, cantidad);
    } else {
      console.warn("Elemento sin libroId y no encontrado por título: no se actualiza stock");
    }
  }

  try {
    const user = auth.currentUser;
    if (user && item.cartDocId) {
      const cartDocRef = doc(db, "users", user.uid, "cart", item.cartDocId);
      await deleteDoc(cartDocRef);
      console.log("Documento de carrito borrado en Firestore:", item.cartDocId);
    }
  } catch (err) {
    console.error("Error borrando documento de cart del usuario:", err);
  }


  carrito.splice(index, 1);
  guardarCarrito(carrito);


  pintarCarrito();

  // Aviso al usuario
  if (aumentado) {
    console.log("Stock incrementado correctamente.");
  } else {
    // No stare preocupando al usuario, solo log
    console.warn("No se pudo incrementar stock en Firestore (ver consola).");
  }
}

/*Popup pago */
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


function setupStripe() {
  const btnPagar = document.getElementById("btnPagarStripe");
  if (!btnPagar) return;

  btnPagar.addEventListener("click", async () => {
    const carrito = cargarCarrito();
    if (carrito.length === 0) { alert("Tu carrito está vacío"); return; }

    const items = carrito.map(p => ({
      name: p.titulo,
      price: Number(p.precio) || 0,
      quantity: Number(p.cantidad) || 1
    }));

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      if (!res.ok) {
        // intentar extraer texto para mostrar error más claro (evita parsear HTML como JSON)
        const text = await res.text();
        console.error("Stripe API returned non-OK:", res.status, text);
        alert("Hubo un problema iniciando el pago: " + (text.slice(0, 200) || res.statusText));
        return;
      }

      // intentar parsear JSON
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        console.error("Stripe: respuesta no JSON:", text);
        alert("Respuesta inesperada del servidor de pagos. Ver consola.");
        return;
      }

      if (!data.url) {
        console.error("Stripe: no vino URL:", data);
        alert("No se pudo iniciar el pago (sin URL).");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Error iniciando Stripe:", err);
      alert("Hubo un error con Stripe: " + (err.message || err));
    }
  });
}


function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


document.addEventListener("DOMContentLoaded", () => {
  pintarCarrito();
  setupPopup();
  setupStripe();
});
