// ----------------------------------------
// IMPORTS DE FIREBASE
// ----------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
    getFirestore, 
    setDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ----------------------------------------
// CONFIG FIREBASE (REEMPLAZAR POR LA TUYA)
// ----------------------------------------
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

// Código secreto para afiliados
const CODIGO_OCULTO = "PRUEBA";


// ----------------------------------------
// REDIRIGIR A HOME TRAS EL REGISTRO
// ----------------------------------------
function redirigirHome() {
    window.location.href = "home.html";
}


// ----------------------------------------
//    REGISTRAR COMPRADOR
// ----------------------------------------
async function registrarComprador() {
    const nombre = document.getElementById("c_nombre").value;
    const email  = document.getElementById("c_email").value;
    const postal = document.getElementById("c_postal").value;
    const pass   = document.getElementById("c_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "comprador",
            nombre,
            email,
            postal
        });

        alert("✔ Registrado correctamente");
        redirigirHome();

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
}


// ----------------------------------------
//    REGISTRAR MENOR
// ----------------------------------------
async function registrarMenor() {
    const codigo = document.getElementById("m_codigo").value;

    if (codigo !== CODIGO_OCULTO) {
        alert("❌ Código incorrecto");
        return;
    }

    const nombre = document.getElementById("m_nombre").value;
    const email  = document.getElementById("m_email").value;
    const edad   = document.getElementById("m_edad").value;
    const pass   = document.getElementById("m_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "menor_afiliado",
            nombre,
            email,
            edad
        });

        alert("✔ Registrado correctamente");
        redirigirHome();

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
}


// ----------------------------------------
//    REGISTRAR PADRE
// ----------------------------------------
async function registrarPadre() {
    const codigo = document.getElementById("p_codigo").value;

    if (codigo !== CODIGO_OCULTO) {
        alert("❌ Código incorrecto");
        return;
    }

    const nombre = document.getElementById("p_nombre").value;
    const email  = document.getElementById("p_email").value;
    const direccion = document.getElementById("p_direccion").value;
    const pass   = document.getElementById("p_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "padre_afiliado",
            nombre,
            email,
            direccion
        });

        alert("✔ Registrado correctamente");
        redirigirHome();

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
}


// ----------------------------------------
// HACER FUNCIONES USABLES DESDE HTML
// ----------------------------------------
window.registrarComprador = registrarComprador;
window.registrarMenor = registrarMenor;
window.registrarPadre = registrarPadre;
