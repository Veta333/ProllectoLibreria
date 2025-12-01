import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ✅ Tu configuración de Firebase
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

// ✅ Obtener ID desde la URL
const params = new URLSearchParams(window.location.search);
const libroId = params.get("id");

console.log("ID recibido:", libroId);

// ✅ Referencias al DOM (los que ya corregimos en tu HTML)
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const descripcion = document.getElementById("genero");
const precio = document.getElementById("precio");
const imagen = document.getElementById("imagenURL");

// ✅ Cargar libro desde Firestore
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

      // Si no hay imagen, evita que se rompa
      if (data.imagenURL && data.imagenURL !== "") {
        imagen.src = data.imagenURL;
      } else {
        imagen.src = "img/default.jpg"; // imagen por defecto
      }

    } else {
      titulo.textContent = "Libro no encontrado";
    }

  } catch (error) {
    console.error("Error al cargar libro:", error);
  }
}

cargarLibro();
