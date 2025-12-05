// public/JS/Admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

/* --- CONFIG (usa tu config) --- */
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
const auth = getAuth(app);

/* --- DOM --- */
const adminEmailEl = document.getElementById("adminUserEmail");
const listaLibros = document.getElementById("listaLibros");
const listaFuturos = document.getElementById("listaFuturos");
const listaUsuarios = document.getElementById("listaUsuarios");

const btnCrearLibro = document.getElementById("btnCrearLibro");
const btnCrearFuturo = document.getElementById("btnCrearFuturo");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

/* util: abrir modal con html */
function openModal(html){
  modalBody.innerHTML = html;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.add("hidden");
  modalBody.innerHTML = "";
  modal.setAttribute("aria-hidden","true");
}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{
  if(e.target === modal) closeModal();
});

/* tabs */
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

/* comprobar que el usuario es admin*/
onAuthStateChanged(auth, async (user)=>{
  if(!user){
    window.location.href = "/index.html";
    return;
  }

  // leer documento usuario
  try{
    const uref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(uref);
    if(!snap.exists()){
      alert("Usuario no encontrado en la base de datos.");
      await signOut(auth);
      window.location.href = "/index.html";
      return;
    }
    const data = snap.data();
    // comprobar rol exacto
    if(String(data.rol || "").toLowerCase() !== "admin"){
      alert("Acceso restringido: necesitas permisos de administrador.");
      await signOut(auth);
      window.location.href = "/index.html";
      return;
    }

    adminEmailEl.textContent = user.email || "";
    // cargar datos iniciales
    cargarTodos();
  }catch(err){
    console.error(err);
    alert("Error comprobando permisos.");
    await signOut(auth);
    window.location.href = "/index.html";
  }
});

/* cerrar sesion */
btnCerrarSesion.addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href = "/index.html";
});

/* CARGAR TODO */
async function cargarTodos(){
  await Promise.all([cargarLibros(), cargarLibrosFuturos(), cargarUsuarios()]);
}

/* ---------- LIBROS ---------- */
async function cargarLibros(){
  listaLibros.innerHTML = "<p>Cargando libros...</p>";
  try{
    const snap = await getDocs(query(collection(db, "Libros"), orderBy("titulo")));
    listaLibros.innerHTML = "";
    snap.forEach(docSnap=>{
      const d = { id: docSnap.id, ...docSnap.data() };
      listaLibros.appendChild(crearCardLibro(d, false));
    });
    if(!snap.size) listaLibros.innerHTML = "<p>No hay libros.</p>";
  }catch(e){
    console.error(e);
    listaLibros.innerHTML = "<p>Error cargando libros.</p>";
  }
}

/* crear card DOM para libro */
function crearCardLibro(libro, isFuturo){
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("div");
  img.className = "img";
  img.style.backgroundImage = `url('${libro.imagenURL || "/IMG/default.jpg"}')`;

  const h = document.createElement("h3");
  h.textContent = libro.titulo || "Sin título";

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<div>${libro.autor || ""}</div><div>${libro.genero || ""} · ${libro.precio ? libro.precio + "€" : "Sin precio"}</div>`;

  const row = document.createElement("div"); row.className="row";
  const left = document.createElement("div"); left.className="left"; left.appendChild(meta);
  const actions = document.createElement("div"); actions.className="actions";

  const ver = document.createElement("a"); ver.className="small-btn"; ver.textContent="Ver";
  ver.href = isFuturo ? `../HTML/DetalleLibro_Futuro.html?id=${libro.id}` : `../HTML/DetalleLibro.html?id=${libro.id}`;
  ver.target = "_blank";

  const editar = document.createElement("button"); editar.className="small-btn"; editar.textContent="Editar";
  editar.addEventListener("click", ()=> abrirEditarLibro(libro, isFuturo));

  const eliminar = document.createElement("button"); eliminar.className="small-btn danger"; eliminar.textContent="Eliminar";
  eliminar.addEventListener("click", ()=> confirmarEliminar(libro.id, isFuturo));

  actions.appendChild(ver);
  actions.appendChild(editar);
  actions.appendChild(eliminar);

  row.appendChild(left);
  row.appendChild(actions);

  card.appendChild(img);
  card.appendChild(h);
  card.appendChild(row);

  return card;
}

/* abrir formulario de crear/editar libro */
function abrirEditarLibro(libro = {}, isFuturo = false){
  const esNuevo = !libro.id;
  const title = esNuevo ? (isFuturo ? "Crear libro futuro" : "Crear libro") : "Editar libro";
  const html = `
    <h2>${title}</h2>
    <div class="form-row">
      <input id="f_titulo" placeholder="Título" value="${(libro.titulo||"").replaceAll('"','&quot;')}">
      <input id="f_autor" placeholder="Autor" value="${(libro.autor||"").replaceAll('"','&quot;')}">
    </div>
    <div class="form-row">
      <input id="f_genero" placeholder="Género" value="${(libro.genero||"").replaceAll('"','&quot;')}">
      <input id="f_precio" placeholder="Precio (número)" value="${libro.precio || ""}">
    </div>
    <div class="form-row">
      <input id="f_stock" placeholder="Stock (número)" value="${libro.stock || ""}">
      <input id="f_imagen" placeholder="Imagen URL" value="${(libro.imagenURL||"").replaceAll('"','&quot;')}">
    </div>
    <div class="form-row">
      <textarea id="f_descripcion" placeholder="Descripción / notas">${(libro.descripcion||"").replaceAll('<','&lt;')}</textarea>
    </div>
    <div class="form-actions">
      <button id="guardarBtn" class="btn-primary">${esNuevo? "Crear" : "Guardar"}</button>
      <button id="cancelBtn" class="btn-ghost">Cancelar</button>
    </div>
  `;
  openModal(html);

  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("guardarBtn").addEventListener("click", async ()=>{
    const data = {
      titulo: document.getElementById("f_titulo").value.trim(),
      autor: document.getElementById("f_autor").value.trim(),
      genero: document.getElementById("f_genero").value.trim(),
      precio: Number(document.getElementById("f_precio").value) || 0,
      stock: Number(document.getElementById("f_stock").value) || 0,
      imagenURL: document.getElementById("f_imagen").value.trim() || "",
      descripcion: document.getElementById("f_descripcion").value.trim() || ""
    };

    try{
      if(esNuevo){
        const col = isFuturo ? "Libros_Futuros" : "Libros";
        await addDoc(collection(db, col), data);
        alert("Creado con éxito");
      }else{
        const col = isFuturo ? "Libros_Futuros" : "Libros";
        await updateDoc(doc(db, col, libro.id), data);
        alert("Guardado con éxito");
      }
      closeModal();
      cargarTodos();
    }catch(err){
      console.error(err);
      alert("Error guardando.");
    }
  });
}

/* confirmar y borrar */
function confirmarEliminar(id, isFuturo){
  const ok = confirm("¿Eliminar este documento? Esto no se puede deshacer.");
  if(!ok) return;
  borrarDocumento(id, isFuturo);
}
async function borrarDocumento(id, isFuturo){
  try{
    const col = isFuturo ? "Libros_Futuros" : "Libros";
    await deleteDoc(doc(db, col, id));
    alert("Eliminado");
    cargarTodos();
  }catch(err){
    console.error(err);
    alert("Error eliminando");
  }
}

/* botones crear */
btnCrearLibro.addEventListener("click", ()=> abrirEditarLibro({}, false));
btnCrearFuturo.addEventListener("click", ()=> abrirEditarLibro({}, true));

/* ---------- LIBROS FUTUROS ---------- */
async function cargarLibrosFuturos(){
  listaFuturos.innerHTML = "<p>Cargando...</p>";
  try{
    const snap = await getDocs(query(collection(db, "Libros_Futuros"), orderBy("titulo")));
    listaFuturos.innerHTML = "";
    snap.forEach(docSnap=>{
      const d = { id: docSnap.id, ...docSnap.data() };
      listaFuturos.appendChild(crearCardLibro(d, true));
    });
    if(!snap.size) listaFuturos.innerHTML = "<p>No hay libros futuros.</p>";
  }catch(e){
    console.error(e);
    listaFuturos.innerHTML = "<p>Error cargando libros futuros.</p>";
  }
}


async function cargarUsuarios(){
  listaUsuarios.innerHTML = "<p>Cargando usuarios...</p>";
  try{
    const snap = await getDocs(query(collection(db, "usuarios"), orderBy("nombre")));
    listaUsuarios.innerHTML = "";
    snap.forEach(docSnap=>{
      const d = { id: docSnap.id, ...docSnap.data() };
      const row = document.createElement("div"); row.className="user-row";
      const left = document.createElement("div"); left.className="left";
      left.innerHTML = `<b>${d.nombre || d.email || "Sin nombre"}</b><div>${d.email || ""}</div>`;
      const right = document.createElement("div"); right.className="right";
      right.innerHTML = `Tipo: ${d.tipo||"-"} · Rol: ${d.rol||"-"}`;
      row.appendChild(left); row.appendChild(right);
      listaUsuarios.appendChild(row);
    });
    if(!snap.size) listaUsuarios.innerHTML = "<p>No hay usuarios.</p>";
  }catch(e){
    console.error(e);
    listaUsuarios.innerHTML = "<p>Error cargando usuarios.</p>";
  }
}
