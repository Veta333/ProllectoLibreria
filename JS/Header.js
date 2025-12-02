import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDZbfcKkvUstrB_b87ujOWKNY_SJ2YoSk",
  authDomain: "prollectolibreria.firebaseapp.com",
  projectId: "prollectolibreria",
  storageBucket: "prollectolibreria.firebasestorage.app",
  messagingSenderId: "329126591666",
  appId: "1:329126591666:web:c48091699a028cacfcddab"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const userBtn = document.getElementById("userBtn");
const userIcon = document.getElementById("userIcon");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");

const defaultUserImage = "../IMG/Perfil.png";


userBtn.onclick = () => {
    window.location.href = "../HTML/Login.html";
};

// Estado Firebase
onAuthStateChanged(auth, (user) => {

    if (user) {
        // Cambiar icono
        userIcon.src = user.photoURL ?? defaultUserImage;

        // Al hacer click: mostrar menú
        userBtn.onclick = () => {
            userMenu.classList.toggle("show");
        };

        // Evento para cerrar sesión
        logoutBtn.onclick = () => {
            signOut(auth).then(() => {
                window.location.href = "../HTML/Login.html";
            });
        };

    } else {
        // Usuario no logueado
        userIcon.src = defaultUserImage;
        userMenu.classList.remove("show");

        userBtn.onclick = () => {
            window.location.href = "../HTML/Login.html";
        };
    }
});

document.addEventListener("click", (e) => {

    // Si btn o menu no existen, no ejecutes el resto
    if (!btn || !menu) return;

    if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("show");
        btn.classList.remove("active");
    }
});
