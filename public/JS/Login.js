// login.js (reparado)
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
  window.location.href = "/index.html";
}

function log(...args) {
  console.log("[login.js]", ...args);
}

window.addEventListener("DOMContentLoaded", () => {
  log("DOM cargado — inicializando listeners de login");

  const btnComprador = document.getElementById("btnLoginComprador");
  const btnMenor = document.getElementById("btnLoginMenor");
  const btnPadre = document.getElementById("btnLoginPadre");

  // comprador
  btnComprador.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("compradorEmail").value.trim();
      const pass = document.getElementById("compradorPass").value;
      await signInWithEmailAndPassword(auth, email, pass);
      alert("✔ Sesión iniciada como comprador");
      redirigirHome();
    } catch (err) {
      alert("❌ " + err.message);
    }
  });

  // menor
  btnMenor.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("menorEmail").value.trim();
      const pass = document.getElementById("menorPass").value;
      await signInWithEmailAndPassword(auth, email, pass);
      alert("✔ Sesión iniciada como menor afiliado");
      redirigirHome();
    } catch (err) {
      alert("❌ " + err.message);
    }
  });

  // padre
  btnPadre.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("padreEmail").value.trim();
      const pass = document.getElementById("padrePass").value;
      await signInWithEmailAndPassword(auth, email, pass);
      alert("✔ Sesión iniciada como padre afiliado");
      redirigirHome();
    } catch (err) {
      alert("❌ " + err.message);
    }
  });
});
