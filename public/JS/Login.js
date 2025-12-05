// Login.js COMPLETO

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
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


// Redirigir al home
function redirigirHome() {
  window.location.href = "/index.html";
}

// -------------------------------
// FUNCIÓN GENERAL PARA LOGIN
// -------------------------------
async function login(emailId, passId, tipoTexto) {
  const email = document.getElementById(emailId).value.trim();
  const pass = document.getElementById(passId).value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);

    // ❌ BLOQUEAR SI NO ESTÁ VERIFICADO
    if (!cred.user.emailVerified) {
      alert(
        "❌ Tu correo aún no está verificado.\nRevisa tu bandeja de entrada antes de iniciar sesión."
      );
      return;
    }

    alert("✔ Sesión iniciada como " + tipoTexto);
    redirigirHome();

  } catch (err) {
    alert("❌ " + err.message);
  }
}


// -------------------------------
// LISTENERS LOGIN
// -------------------------------
window.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btnLoginComprador").addEventListener("click", () =>
    login("compradorEmail", "compradorPass", "comprador")
  );

  document.getElementById("btnLoginMenor").addEventListener("click", () =>
    login("menorEmail", "menorPass", "menor afiliado")
  );

  document.getElementById("btnLoginPadre").addEventListener("click", () =>
    login("padreEmail", "padrePass", "padre afiliado")
  );

});
