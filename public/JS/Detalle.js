// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";



//  CONFIG FIREBASE

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



//  OBTENER ID DE LIBRO DESDE LA URL

const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");



//  REFERENCIAS AL DOM

const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const descripcion = document.getElementById("genero");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagenURL");
const btnCarrito = document.getElementById("btnCarrito");



//  CARGAR LIBRO DESDE FIRESTORE

async function cargarLibro() {
  if (!libroId) {
    titulo.textContent = "Libro no encontrado";
    return;
  }

  try {
    const libroRef = doc(db, "Libros", libroId);
    const snapshot = await getDoc(libroRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      titulo.textContent = data.titulo;
      autor.textContent = data.autor;
      descripcion.textContent = data.genero;
      precio.textContent = data.precio + "€";


      imagen.src = data.imagenURL && data.imagenURL !== "" 
        ? data.imagenURL
        : "/IMG/default.jpg"; 

      // Guardar stock actual
      btnCarrito.dataset.stock = data.stock || 0;

    } else {
      titulo.textContent = "Libro no encontrado";
    }

  } catch (error) {
    console.error("Error al cargar libro:", error);
  }
}

cargarLibro();



//  AÑADIR AL CARRITO Y BAJAR STOCK

if (btnCarrito) {
  btnCarrito.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Debes iniciar sesión para añadir al carrito.");
      return;
    }

    try {
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


      // AÑADIR AL CARRITO DEL USUARIO EN FIRESTORE
    
      await addDoc(collection(db, "users", user.uid, "cart"), {
        titulo: libroData.titulo,
        autor: libroData.autor,
        genero: libroData.genero,
        precio: libroData.precio,
        imagenURL: libroData.imagenURL || "/IMG/default.jpg", 
        libroId: libroId
      });

      // GUARDAR TAMBIÉN EN LOCALSTORAGE
let carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];

carritoLocal.push({
    titulo: libroData.titulo,
    precio: libroData.precio,
    imagenURL: libroData.imagenURL || "../IMG/default.jpg",
    cantidad: 1
});

localStorage.setItem("carrito", JSON.stringify(carritoLocal));


 
      // 2️ — BAJAR STOCK

      await updateDoc(libroRef, { stock: libroData.stock - 1 });

      alert("Producto añadido al carrito ✅");

    } catch (error) {
      console.error("Error añadiendo al carrito:", error);
      alert("Error al añadir al carrito.");
    }
  });
}
