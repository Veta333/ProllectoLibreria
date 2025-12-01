import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

let fechaActual = new Date();
let ano = fechaActual.getFullYear();
let mes = fechaActual.getMonth();
let eventosCache = [];

// Nombres de meses
const mesesNombres = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// =============================
// 🔥 Cargar eventos desde Firebase
// =============================
async function cargarEventos() {
    const snap = await getDocs(collection(db, "eventos"));

    eventosCache = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    pintarCalendario();
}

// =============================
// 🎨 Pintar el calendario
// =============================
function pintarCalendario() {

    document.getElementById("anoTexto").textContent = ano;
    document.getElementById("mesTexto").textContent = mesesNombres[mes];

    const diasContainer = document.getElementById("calDias");
    diasContainer.innerHTML = "";

    const primerDia = new Date(ano, mes, 1);
    let empieza = primerDia.getDay();
    if (empieza === 0) empieza = 7;

    const diasMes = new Date(ano, mes + 1, 0).getDate();

    // Espacios antes del primer día
    for (let i = 1; i < empieza; i++) {
        diasContainer.appendChild(document.createElement("div"));
    }

    // Días del mes
    for (let dia = 1; dia <= diasMes; dia++) {

        const fecha = new Date(ano, mes, dia);
        const iso = fecha.toISOString().split("T")[0];

        const celda = document.createElement("div");
        celda.classList.add("cal-dia");

        // Día actual marcado
        const esHoy =
            dia === fechaActual.getDate() &&
            mes === fechaActual.getMonth() &&
            ano === fechaActual.getFullYear();

        if (esHoy) celda.classList.add("cal-actual");

        // Número del día
        const numero = document.createElement("div");
        numero.classList.add("cal-dia-num");
        numero.textContent = dia;
        celda.appendChild(numero);

        // Buscar eventos de este día
        const eventosDia = eventosCache.filter(e => {
            if (!e.fecha) return false;
            const fechaEvento = e.fecha.toDate().toISOString().split("T")[0];
            return fechaEvento === iso;
        });

        // Si hay eventos, los mostramos y añadimos clic
        if (eventosDia.length > 0) {

            celda.style.cursor = "pointer";

            eventosDia.forEach(e => {
                const ev = document.createElement("div");
                ev.classList.add("evento");
                ev.textContent = e.titulo || e.descripcion || "Evento";
                celda.appendChild(ev);
            });

            celda.addEventListener("click", () => {
                abrirEvento(eventosDia[0]);
            });
        }

        diasContainer.appendChild(celda);
    }
}

// =============================
// 📌 Abrir el desplegable
// =============================
function abrirEvento(evento) {

    document.getElementById("eventoOverlay").classList.remove("oculto");

    // Formatear la fecha
    const fecha = evento.fecha.toDate();
    const opciones = { day: "numeric", month: "long", year: "numeric" };
    const fechaFormateada = fecha.toLocaleDateString("es-ES", opciones);

    // Rellenar datos
    document.getElementById("evFecha").textContent = fechaFormateada;

    document.getElementById("evTitulo").textContent =
        evento.descripcion ||
        evento.titulo ||
        "Sin título";

    document.getElementById("evUbicacion").textContent =
        evento.ubicacion || "No indicada";

    document.getElementById("evHora").textContent =
        evento.hora || "No indicada";

    document.getElementById("evEdades").textContent =
        evento.edades || "Todas las edades";

    document.getElementById("evImagen").src =
        evento.imagenURL || "";
}

// =============================
// ❌ Cerrar el desplegable
// =============================
document.getElementById("cerrarOverlay").addEventListener("click", () => {
    document.getElementById("eventoOverlay").classList.add("oculto");
});

// =============================
// ⏪ Navegación
// =============================
document.getElementById("prevMonth").onclick = () => {
    mes--;
    if (mes < 0) { mes = 11; ano--; }
    pintarCalendario();
};

document.getElementById("nextMonth").onclick = () => {
    mes++;
    if (mes > 11) { mes = 0; ano++; }
    pintarCalendario();
};

document.getElementById("prevYear").onclick = () => { ano--; pintarCalendario(); };
document.getElementById("nextYear").onclick = () => { ano++; pintarCalendario(); };

// =============================
// 🚀 Iniciar
// =============================
cargarEventos();
