console.log("JS cargado");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

console.log("Firebase inicializado");

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

document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const ubicacion = document.getElementById("ubicacion").value;
    const fechaInput = document.getElementById("fecha").value; 
    const edades = document.getElementById("edades").value;
    const descripcion = document.getElementById("descripcion").value;
    const imagenURL = document.getElementById("imagenURL").value.trim() || "";

    try {
        await addDoc(collection(db, "eventos"), {
            titulo,
            ubicacion,
            fecha: Timestamp.fromDate(new Date(fechaInput)), 
            edades,
            descripcion,
            imagenURL,
            creado: Timestamp.fromDate(new Date()) 
        });

        document.getElementById("msg").innerText = "Evento guardado correctamente 👍";
        document.getElementById("eventForm").reset();

    } catch (error) {
        document.getElementById("msg").innerText = "Error al guardar: " + error;
        console.error("Error al guardar evento:", error);
    }
});
