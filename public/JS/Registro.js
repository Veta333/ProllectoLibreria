// Registro.js COMPLETO

// Imports Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
    getFirestore, 
    setDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// CONFIG FIREBASE
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

// Código oculto
const CODIGO_OCULTO = "PRUEBA";


//  REDIRIGIR A LOGIN DESPUÉS DEL REGISTRO
function redirigirLogin() {
    window.location.href = "Login.html";
}



//  REGISTRAR COMPRADOR (con verificación email)

async function registrarComprador() {
    const nombre = document.getElementById("c_nombre").value;
    const email  = document.getElementById("c_email").value;
    const postal = document.getElementById("c_postal").value;
    const pass   = document.getElementById("c_pass").value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);

        // Guardar en Firestore
        await setDoc(doc(db, "usuarios", cred.user.uid), {
            tipo: "comprador",
            nombre,
            email,
            postal
        });

        // Enviar correo de verificación
        await sendEmailVerification(cred.user);

        alert(
            "✔ Registro exitoso.\n\n📩 Te enviamos un correo de verificación.\nDebes confirmarlo antes de poder iniciar sesión."
        );

        redirigirLogin();

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
}


// REGISTRAR MENOR (con verificación )

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

        await sendEmailVerification(cred.user);

        alert("✔ Registrado correctamente.\n📩 Verifica tu correo antes de iniciar sesión.");

        redirigirLogin();

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
}


// REGISTRAR PADRE (con verificación )

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

        await sendEmailVerification(cred.user);

        alert("✔ Registrado correctamente.\n📩 Verifica tu correo antes de iniciar sesión.");

        redirigirLogin();

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
}



// Hacer funciones accesibles desde HTML

window.registrarComprador = registrarComprador;
window.registrarMenor = registrarMenor;
window.registrarPadre = registrarPadre;
