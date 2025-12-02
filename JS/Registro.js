import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, setDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIG FIREBASE ------------------------
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
const db = getFirestore(app);

// -----------------------------------------

const CODIGO_OCULTO = "PRUEBA";   // código secreto

// ------------ REGISTRO COMPRADOR ----------------
async function registrarComprador() {
    const email = document.getElementById("c_email").value;
    const pass = document.getElementById("c_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "comprador",
            nombre: document.getElementById("c_nombre").value,
            postal: document.getElementById("c_postal").value,
            email: email
        });

        alert("Comprador registrado con éxito");
    } catch (e) {
        alert("Error: " + e.message);
    }
}

// ------------ REGISTRO MENOR ----------------
async function registrarMenor() {
    if (document.getElementById("m_codigo").value !== CODIGO_OCULTO) {
        alert("Código incorrecto");
        return;
    }

    const email = document.getElementById("m_email").value;
    const pass = document.getElementById("m_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "menor",
            nombre: document.getElementById("m_nombre").value,
            edad: document.getElementById("m_edad").value,
            email: email
        });

        alert("Menor afiliado registrado");
    } catch (e) {
        alert("Error: " + e.message);
    }
}

// ------------ REGISTRO PADRE ----------------
async function registrarPadre() {
    if (document.getElementById("p_codigo").value !== CODIGO_OCULTO) {
        alert("Código incorrecto");
        return;
    }

    const email = document.getElementById("p_email").value;
    const pass = document.getElementById("p_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "padre",
            nombre: document.getElementById("p_nombre").value,
            direccion: document.getElementById("p_direccion").value,
            email: email
        });

        alert("Padre afiliado registrado");
    } catch (e) {
        alert("Error: " + e.message);
    }
}
