// public/JS/Wishlist.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

const grid = document.getElementById("wishlistGrid");
const emptyMsg = document.getElementById("emptyMsg");

function renderItem(docSnap) {
  const data = docSnap.data();
  const id = docSnap.id;

  const card = document.createElement("div");
  card.className = "wish-card";

  card.innerHTML = `
    <img src="${data.imagenURL || '/IMG/default.jpg'}" alt="${(data.titulo||'')}">
    <h3>${(data.titulo||'Sin título')}</h3>
    <div style="color:#666; font-size:14px">${(data.autor||'')}</div>
    <div style="font-weight:700; margin-top:6px">${(data.precio? data.precio + '€' : '')}</div>
    <div class="wish-actions">
      <button class="btn-outline view-detail" data-libroid="${data.libroId}">Ver detalle</button>
      <button class="btn-danger remove-wish" data-id="${id}">Eliminar</button>
    </div>
  `;
  grid.appendChild(card);

  card.querySelector(".view-detail").addEventListener("click", () => {
    window.location.href = `/HTML/DetalleLibro.html?id=${data.libroId}`;
  });

  card.querySelector(".remove-wish").addEventListener("click", async (e) => {
    const docId = e.currentTarget.getAttribute("data-id");
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "wishlist", docId));
      card.remove();
      if (grid.children.length === 0) {
        emptyMsg.style.display = "block";
      }
      // actualizar contador en header si existe
      const el = document.getElementById("wishlistCount");
      if (el) el.textContent = String(Math.max(0, Number(el.textContent || 0) - 1));
    } catch (err) {
      console.error("Error eliminando wishlist:", err);
      alert("No se pudo eliminar.");
    }
  });
}

async function cargarWishlist(uid) {
  grid.innerHTML = "";
  emptyMsg.style.display = "none";
  const snap = await getDocs(collection(db, "users", uid, "wishlist"));
  if (snap.empty) {
    emptyMsg.style.display = "block";
    return;
  }
  snap.docs.forEach(renderItem);
  // actualizar contador header
  const el = document.getElementById("wishlistCount");
  if (el) el.textContent = String(snap.size);
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    grid.innerHTML = "";
    emptyMsg.style.display = "block";
    emptyMsg.textContent = "Debes iniciar sesión para ver tu lista de deseos.";
    const el = document.getElementById("wishlistCount");
    if (el) el.textContent = "0";
    return;
  }
  cargarWishlist(user.uid);
});
