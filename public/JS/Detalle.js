// public/JS/Detalle.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
      // Guardar stock actual (atributo dataset para posible uso)
      if (btnCarrito) btnCarrito.dataset.stock = data.stock ?? 0;
    } else {
      if (titulo) titulo.textContent = "Libro no encontrado";
    }
  } catch (err) {
    console.error("Error al cargar libro:", err);
  }
}
cargarLibro();

/* AÑADIR AL CARRITO Y BAJAR STOCK */
if (btnCarrito) {
  btnCarrito.addEventListener("click", async () => {
    try {
      const user = auth.currentUser;
      // Si quieres forzar login en cliente: 
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
