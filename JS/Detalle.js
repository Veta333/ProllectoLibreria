import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc,
  collection,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


// CONFIGURACIÓN FIREBASE
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


// OBTENER ID DEL LIBRO DESDE LA URL
const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");


// ELEMENTOS DEL DOM
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const descripcion = document.getElementById("genero");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagenURL");
const btnCarrito = document.getElementById("btnCarrito");

let datosLibro = null;  // Guardamos aquí la info del libro para después


// ===============================
//  CARGAR DATOS DEL LIBRO
// ===============================
async function cargarLibro() {
  if (!libroId) {
    titulo.textContent = "Libro no encontrado";
    return;
  }

  try {
    const libroRef = doc(db, "Libros", libroId);
    const snapshot = await getDoc(libroRef);

    if (snapshot.exists()) {
      datosLibro = snapshot.data();

      titulo.textContent = datosLibro.titulo;
      autor.textContent = datosLibro.autor;
      descripcion.textContent = datosLibro.genero;
      precio.textContent = datosLibro.precio + "€";

      imagen.src = datosLibro.imagenURL || "img/default.jpg";

    } else {
      titulo.textContent = "Libro no encontrado";
    }

  } catch (error) {
    console.error("Error al cargar libro:", error);
  }
}

cargarLibro();


// ==========================================
// AÑADIR AL CARRITO
// ==========================================
btnCarrito.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Debes iniciar sesión para añadir al carrito.");
    return;
  }

  if (!datosLibro) {
    alert("Error: libro no cargado.");
    return;
  }

  try {
    const ref = doc(collection(db, "users", user.uid, "cart"));

    await setDoc(ref, {
      titulo: datosLibro.titulo,
      genero: datosLibro.genero,
      precio: datosLibro.precio,
      imagenURL: datosLibro.imagenURL || "",
    });

    alert("¡Libro añadido al carrito!");

  } catch (err) {
    console.error("Error al añadir al carrito:", err);
  }
});


// Mantener sesión
onAuthStateChanged(auth, () => {});
