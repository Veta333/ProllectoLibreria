// login.js (reemplazar todo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

function redirigirHome() {
  window.location.href = "../Index.html";
}

// helper de logging
function log(...args) {
  console.log("[login.js]", ...args);
}

// Esperar al DOM por seguridad
window.addEventListener("DOMContentLoaded", () => {
  log("DOM cargado — inicializando listeners de login");

  // referenciar elementos
  const btnComprador = document.getElementById("btnLoginComprador");
  const btnMenor = document.getElementById("btnLoginMenor");
  const btnPadre = document.getElementById("btnLoginPadre");

  if (!btnComprador || !btnMenor || !btnPadre) {
    console.error("[login.js] No se encontraron botones de login. IDs esperados: btnLoginComprador, btnLoginMenor, btnLoginPadre");
    return;
  }

  // COMPRAODR
  btnComprador.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("compradorEmail").value.trim();
      const pass = document.getElementById("compradorPass").value;
      log("Intentando login comprador:", email);
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      log("Login comprador OK:", userCred.user.uid);
      alert("✔ Sesión iniciada como comprador");
      redirigirHome();
    } catch (err) {
      console.error("Error login comprador:", err);
      alert("❌ Error: " + (err && err.message ? err.message : err));
    }
  });

  // MENOR
  btnMenor.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("menorEmail").value.trim();
      const pass = document.getElementById("menorPass").value;
      log("Intentando login menor:", email);
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      log("Login menor OK:", userCred.user.uid);
      alert("✔ Sesión iniciada como menor afiliado");
      redirigirHome();
    } catch (err) {
      console.error("Error login menor:", err);
      alert("❌ Error: " + (err && err.message ? err.message : err));
    }
  });

  // PADRE
  btnPadre.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("padreEmail").value.trim();
      const pass = document.getElementById("padrePass").value;
      log("Intentando login padre:", email);
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      log("Login padre OK:", userCred.user.uid);
      alert("✔ Sesión iniciada como padre afiliado");
      redirigirHome();
    } catch (err) {
      console.error("Error login padre:", err);
      alert("❌ Error: " + (err && err.message ? err.message : err));
    }
  });

  // también exponemos funciones en window por compatibilidad (por si hay onclick todavía)
  window._debugLogin = {
    signInComprador: async () => {
      const email = document.getElementById("compradorEmail").value.trim();
      const pass = document.getElementById("compradorPass").value;
      return signInWithEmailAndPassword(auth, email, pass);
    }
  };

  // opcional: escuchar cambios de auth para debug
  onAuthStateChanged(auth, user => {
    if (user) log("onAuthStateChanged -> usuario:", user.uid, user.email);
    else log("onAuthStateChanged -> no hay usuario");
  });
});
