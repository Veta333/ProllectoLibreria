// public/JS/Detalle.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* CONFIG FIREBASE */
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

/* OBTENER ID DE LIBRO DESDE LA URL */
const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");

/* REFERENCIAS AL DOM */
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const descripcion = document.getElementById("genero");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagenURL");
const btnCarrito = document.getElementById("btnCarrito");

/* Creamos el botón de wishlist en la página de detalle */
function crearBotonWishlist() {
  // si ya existe, no duplicar
  if (document.getElementById("btnWishlist")) return;

  const cont = document.createElement("div");
  cont.style.display = "inline-block";
  cont.style.verticalAlign = "middle";
  cont.style.marginLeft = "12px";

  const btn = document.createElement("button");
  btn.id = "btnWishlist";
  btn.textContent = "Añadir a deseos";
  btn.style.padding = "10px 16px";
  btn.style.borderRadius = "6px";
  btn.style.border = "1px solid #ccc";
  btn.style.background = "#fff";
  btn.style.cursor = "pointer";

  cont.appendChild(btn);

  // insertar después del btnCarrito
  const cabeza = document.querySelector(".libro-compra");
  if (cabeza) cabeza.appendChild(cont);

  btn.addEventListener("click", onAñadirWishlist);
}

/* CARGAR LIBRO */
async function cargarLibro() {
  if (!libroId) {
    if (titulo) titulo.textContent = "Libro no encontrado";
    return;
  }
  try {
    const libroRef = doc(db, "Libros", libroId);
    const snapshot = await getDoc(libroRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (titulo) titulo.textContent = data.titulo || "Sin título";
      if (autor) autor.textContent = data.autor || "";
      if (descripcion) descripcion.textContent = data.genero || "";
      if (precio) precio.textContent = (data.precio ?? 0) + "€";
      if (imagen) {
        imagen.src = data.imagenURL && data.imagenURL !== "" ? data.imagenURL : "/IMG/default.jpg";
      }
      if (btnCarrito) btnCarrito.dataset.stock = data.stock ?? 0;
    } else {
      if (titulo) titulo.textContent = "Libro no encontrado";
    }
  } catch (err) {
    console.error("Error al cargar libro:", err);
  } finally {
    crearBotonWishlist();
  }
}
cargarLibro();

/* AÑADIR AL CARRITO Y BAJAR STOCK (sin tocar) */
if (btnCarrito) {
  btnCarrito.addEventListener("click", async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para añadir al carrito.");
        return;
      }

      const libroRef = doc(db, "Libros", libroId);
      const libroSnap = await getDoc(libroRef);
      if (!libroSnap.exists()) {
        alert("Libro no encontrado en la base de datos.");
        return;
      }
      const libroData = libroSnap.data();
      if ((libroData.stock || 0) <= 0) {
        alert("No hay stock disponible.");
        return;
      }

      const cartRef = await addDoc(collection(db, "users", user.uid, "cart"), {
        titulo: libroData.titulo,
        autor: libroData.autor,
        genero: libroData.genero,
        precio: libroData.precio,
        imagenURL: libroData.imagenURL || "/IMG/default.jpg",
        libroId: libroId,
        cantidad: 1,
        creadoEn: new Date()
      });

      let carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
      carritoLocal.push({
        titulo: libroData.titulo,
        precio: libroData.precio,
        imagenURL: libroData.imagenURL || "../IMG/default.jpg",
        cantidad: 1,
        libroId: libroId,
        cartDocId: cartRef.id
      });
      localStorage.setItem("carrito", JSON.stringify(carritoLocal));

      await updateDoc(libroRef, { stock: (libroData.stock || 1) - 1 });

      alert("Producto añadido al carrito ✅");
    } catch (error) {
      console.error("Error añadiendo al carrito:", error);
      alert("Error al añadir al carrito.");
    }
  });
}

/*Wishlist: añadir */
async function onAñadirWishlist(e) {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para añadir a la lista de deseos.");
      return;
    }

    // prevenir duplicados: buscar si ya existe libroId en la colección wishlist
    const q = query(collection(db, "users", user.uid, "wishlist"), where("libroId", "==", libroId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      alert("Este libro ya está en tu lista de deseos.");
      return;
    }

    // obtener datos del libro para guardar
    const libroRef = doc(db, "Libros", libroId);
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
      creadoEn: new Date()
    });

    alert("Añadido a tu lista de deseos ⭐");
    // actualizar contador del header (si existe)
    actualizarContadorWishlist();
  } catch (err) {
    console.error("Error añadiendo a wishlist:", err);
    alert("Error al añadir a la lista de deseos.");
  }
}

/* Contador en header */
async function actualizarContadorWishlist() {
  try {
    const el = document.getElementById("wishlistCount");
    const user = auth.currentUser;
    if (!el) return;
    if (!user) {
      el.textContent = "0";
      return;
    }
    const snap = await getDocs(collection(db, "users", user.uid, "wishlist"));
    el.textContent = String(snap.size || 0);
  } catch (err) {
    console.error("Error contador wishlist:", err);
  }
}

/* cuando el usuario cambie (login/logout) actualizamos contador */
onAuthStateChanged(auth, (user) => {
  actualizarContadorWishlist();
});