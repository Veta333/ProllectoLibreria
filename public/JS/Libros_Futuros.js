// public/JS/DetalleLibro_Futuro.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
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

const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");

const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const descripcion = document.getElementById("genero");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagenURL");
const btnCarrito = document.getElementById("btnCarrito");

// crea el botón "Añadir a deseos" en lugar del comportamiento reservar
function crearBotonWishlistFuturo() {
  if (!btnCarrito) return;
  btnCarrito.textContent = "Añadir a deseos";
  btnCarrito.style.cursor = "pointer";

  // evitar añadir múltiples listeners
  btnCarrito.removeEventListener("click", onAñadirWishlistFuturo);
  btnCarrito.addEventListener("click", onAñadirWishlistFuturo);
}

async function cargarLibroFuturo() {
  if (!libroId) {
    if (titulo) titulo.textContent = "Libro no encontrado";
    return;
  }

  try {
    const libroRef = doc(db, "Libros_Futuros", libroId);
    const snap = await getDoc(libroRef);
    if (!snap.exists()) {
      if (titulo) titulo.textContent = "Libro no encontrado";
      return;
    }

    const data = snap.data();
    if (titulo) titulo.textContent = data.titulo || "Sin título";
    if (autor) autor.textContent = data.autor || "";
    if (descripcion) descripcion.textContent = data.genero || "";
    if (precio) precio.textContent = (data.precio ?? 0) + "€";
    if (imagen) imagen.src = data.imagenURL && data.imagenURL !== "" ? data.imagenURL : "/IMG/default.jpg";
  } catch (err) {
    console.error("Error cargando libro futuro:", err);
    if (titulo) titulo.textContent = "Error cargando libro";
  } finally {
    crearBotonWishlistFuturo();
  }
}
cargarLibroFuturo();

/* Añadir a wishlist para libro futuro */
async function onAñadirWishlistFuturo(e) {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para añadir a la lista de deseos.");
      return;
    }

    // prevenir duplicados en wishlist
    const q = query(collection(db, "users", user.uid, "wishlist"), where("libroId", "==", libroId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      alert("Este libro ya está en tu lista de deseos.");
      return;
    }

    const libroRef = doc(db, "Libros_Futuros", libroId);
    const libroSnap = await getDoc(libroRef);
    if (!libroSnap.exists()) {
      alert("Libro no encontrado.");
      return;
    }
    const libroData = libroSnap.data();

    await addDoc(collection(db, "users", user.uid, "wishlist"), {
      titulo: libroData.titulo || "",
      autor: libroData.autor || "",
      precio: libroData.precio || 0,
      imagenURL: libroData.imagenURL || "/IMG/default.jpg",
      libroId: libroId,
      tipo: "futuro",
      creadoEn: new Date()
    });

    alert("Añadido a tu lista de deseos ⭐");
    // actualizar contador en header si existe
    const el = document.getElementById("wishlistCount");
    if (el) {
      const current = Number(el.textContent || 0);
      el.textContent = String(current + 1);
    }
  } catch (err) {
    console.error("Error añadiendo wishlist futuro:", err);
    alert("Error al añadir a la lista de deseos.");
  }
}

/* Mantener contador actualizado cuando cambia autenticación */
onAuthStateChanged(auth, (user) => {
  // no hacemos nada especial aquí; Wishlist.js actualiza contador cuando se abra la página de wishlist
});
