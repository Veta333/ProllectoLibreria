// ✅ Firebase v9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDZbfcKkvUstrB_b87ujOWKNY_SJ2YoSk",
  authDomain: "prollectolibreria.firebaseapp.com",
  projectId: "prollectolibreria",
  storageBucket: "prollectolibreria.firebasestorage.app",
  messagingSenderId: "329126591666",
  appId: "1:329126591666:web:c48091699a028cacfcddab"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos
const userBtn = document.getElementById("userBtn");
const userIcon = document.getElementById("userIcon");

// ✅ Imagen local por defecto SIEMPRE
const defaultUserImage = "../IMG/Perfil.png";

// ✅ Estado de sesión
onAuthStateChanged(auth, (user) => {

  if (user && user.photoURL) {
    // ✅ Usuario con foto (Google)
    userIcon.src = user.photoURL;

    // NO redirige a ningún sitio
    userBtn.onclick = null;

  } else if (user && !user.photoURL) {
    //  Usuario SIN foto 
    userIcon.src = defaultUserImage;

    userBtn.onclick = null;

  } else {
    //  NO logueado
    userIcon.src = defaultUserImage;

    //Clicka Login
    userBtn.onclick = () => {
      window.location.href = "../HTML/Login.html";
    };
  }

});
