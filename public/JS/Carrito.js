// Carrito.js - usa Firebase modular (misma versión que Detalle.js)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

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

// DOM
const contenedor = document.getElementById("carritoContainer");
const totalPrecioElem = document.getElementById("totalPrecio");
const btnAbrirPopup = document.getElementById("btnAbrirPopup");
const popup = document.getElementById("popupPago");
const totalPagoElem = document.getElementById("totalPago");
const cerrarPopup = document.getElementById("cerrarPopup");
const btnPagarStripe = document.getElementById("btnPagarStripe");

// estado
let unsubscribeSnapshot = null;

// Helper: pinta carrito
function renderCarrito(items) {
  contenedor.innerHTML = "";
  let total = 0;

  if (!items || items.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    totalPrecioElem.textContent = "0.00";
    return;
  }

  items.forEach(docItem => {
    const data = docItem.data;
    const id = docItem.id;

    total += Number(data.precio || 0);

    const item = document.createElement("div");
    item.className = "item-carrito";

    item.innerHTML = `
      <div class="item-info">
        <p><strong>${data.titulo}</strong></p>
        <p>Género: ${data.genero || ""}</p>
        <p>Precio: ${data.precio} €</p>
      </div>

      <div class="item-imagen">
        <img src="${data.imagenURL || '/IMG/default.jpg'}" alt="Libro">
      </div>

      <div class="boton-eliminar">
        <button data-id="${id}" class="eliminar-btn">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(item);
  });

  totalPrecioElem.textContent = total.toFixed(2);

  // añadir listeners eliminar
  const botonesEliminar = contenedor.querySelectorAll(".eliminar-btn");
  botonesEliminar.forEach(b => {
    b.addEventListener("click", async (e) => {
      const docId = e.currentTarget.dataset.id;
      try {
        await eliminarItem(docId);
      } catch (err) {
        console.error("Error eliminando item:", err);
        alert("Error eliminando el item");
      }
    });
  });
}

// Eliminar item y reponer stock
async function eliminarItem(cartDocId) {
  const user = auth.currentUser;
  if (!user) { alert("No autenticado"); return; }

  // 1) leer item para saber libroId
  const cartRef = doc(db, "users", user.uid, "cart", cartDocId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) {
    // recargar snapshot
    return;
  }
  const cartData = cartSnap.data();
  const libroId = cartData.libroId;

  // 2) borrar documento del carrito
  await deleteDoc(cartRef);

  // 3) reponer stock si existe libroId
  if (libroId) {
    const libroRef = doc(db, "Libros", libroId);
    const libroSnap = await getDoc(libroRef);
    if (libroSnap.exists()) {
      const stockActual = libroSnap.data().stock || 0;
      await updateDoc(libroRef, { stock: stockActual + 1 });
    }
  }

  alert("Item eliminado del carrito");
}

// Suscribirse a la colección del usuario
function subscribeCart(userUid) {
  // limpiar subscripción previa
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }

  const cartCol = collection(db, "users", userUid, "cart");
  // usar onSnapshot para actualizaciones en tiempo real
  unsubscribeSnapshot = onSnapshot(cartCol, snapshot => {
    const items = snapshot.docs.map(d => ({ id: d.id, data: d.data() }));
    renderCarrito(items);
  }, err => {
    console.error("Error snapshot cart:", err);
  });
}

// Manejo auth y carga inicial
onAuthStateChanged(auth, user => {
  if (user) {
    subscribeCart(user.uid);
  } else {
    // no autenticado -> vaciar vista
    if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
    renderCarrito([]);
  }
});

// POPUP: abrir con el total actual (usa totalPrecioElem)
if (btnAbrirPopup) {
  btnAbrirPopup.addEventListener("click", () => {
    const total = totalPrecioElem.textContent || "0";
    totalPagoElem.textContent = total;
    popup.style.display = "flex";
  });
}
if (cerrarPopup) cerrarPopup.addEventListener("click", () => popup.style.display = "none");

// Pagar con Stripe (en tu CarritoStripe.js probablemente ya hagas fetch; aquí solo:
if (btnPagarStripe) {
  btnPagarStripe.addEventListener("click", async () => {
    // Construimos items tomando lo que aparece en la UI
    // Alternativa: llamar desde backend a Firestore (mejor). Aquí se tomará directamente de la vista.
    const user = auth.currentUser;
    if (!user) { alert("Debes iniciar sesión para pagar."); return; }

    // Obtenemos snapshot directo por seguridad
    const snap = await getDocs(collection(db, "users", user.uid, "cart"));
    const carrito = snap.docs.map(d => d.data());

    if (carrito.length === 0) { alert("Carrito vacío"); return; }

    // transformar
    const items = carrito.map(p => ({
      name: p.titulo,
      price: p.precio,
      quantity: p.cantidad || 1
    }));

    try {
      // Llamada a tu endpoint (ajusta URL si usas Vercel)
      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const data = await resp.json();
      if (!data.url) { alert("Error iniciando pago"); return; }
      window.location.href = data.url;
    } catch (err) {
      console.error("Error al iniciar Stripe:", err);
      alert("Error al iniciar el pago");
    }
  });
}
