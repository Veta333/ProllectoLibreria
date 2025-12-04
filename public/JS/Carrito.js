function cargarCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// Pintar carrito
function pintarCarrito() {
    const contenedor = document.getElementById("carritoContainer");
    const totalSpan = document.getElementById("totalPrecio");

    const carrito = cargarCarrito();

    contenedor.innerHTML = "";
    let total = 0;

    carrito.forEach((item, i) => {
        const div = document.createElement("div");
        div.classList.add("item-carrito");

        total += item.precio * (item.cantidad || 1);

        div.innerHTML = `
            <img src="${item.imagenURL}" class="img-carrito">
            <div>
                <h3>${item.titulo}</h3>
                <p>${item.precio}€</p>
            </div>
        `;

        contenedor.appendChild(div);
    });

    totalSpan.textContent = total.toFixed(2);
}

// POPUP
const popup = document.getElementById("popupPago");
const btnAbrir = document.getElementById("btnAbrirPopup");
const btnCerrar = document.getElementById("cerrarPopup");

btnAbrir.onclick = () => {
    document.getElementById("totalPago").textContent =
        document.getElementById("totalPrecio").textContent;
    popup.style.display = "flex";
};

btnCerrar.onclick = () => popup.style.display = "none";

// STRIPE
document.getElementById("btnPagarStripe").addEventListener("click", async () => {
    const carrito = cargarCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const items = carrito.map(p => ({
        name: p.titulo,
        price: p.precio,
        quantity: p.cantidad || 1
    }));

    try {
        const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });

        const data = await res.json();

        if (!data.url) {
            console.error("Respuesta inválida:", data);
            alert("No se pudo iniciar el pago");
            return;
        }

        window.location.href = data.url;

    } catch (err) {
        console.error("Error Stripe:", err);
        alert("Hubo un error con Stripe");
    }
});

// Inicializar
pintarCarrito();
