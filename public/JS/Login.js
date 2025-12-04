import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

//Firebase
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

// 📌 COMPRADOR
document.querySelector(".card:nth-child(1) button").addEventListener("click", async () => {
    const email = document.getElementById("compradorEmail").value;
    const pass = document.getElementById("compradorPass").value;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("✔ Sesión iniciada como comprador");
        redirigirHome();
    } catch (e) {
        alert("❌ Error: " + e.message);
    }
});

// 📌 MENOR
document.querySelector(".card:nth-child(2) button").addEventListener("click", async () => {
    const email = document.getElementById("menorEmail").value;
    const pass = document.getElementById("menorPass").value;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("✔ Sesión iniciada como menor afiliado");
        redirigirHome();
    } catch (e) {
        alert("❌ Error: " + e.message);
    }
});

// 📌 PADRE
document.querySelector(".card:nth-child(3) button").addEventListener("click", async () => {
    const email = document.getElementById("padreEmail").value;
    const pass = document.getElementById("padrePass").value;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        alert("✔ Sesión iniciada como padre afiliado");
        redirigirHome();
    } catch (e) {
        alert("❌ Error: " + e.message);
    }
});
