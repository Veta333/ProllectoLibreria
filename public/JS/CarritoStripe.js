// ------------------------------
// 1. ABRIR POPUP
// ------------------------------
document.getElementById("btnAbrirPopup").addEventListener("click", () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, p) => acc + p.precio * (p.cantidad || 1), 0);

    document.getElementById("totalPago").textContent = total.toFixed(2);
    document.getElementById("popupPago").style.display = "flex";
});

// ------------------------------
// 2. CERRAR POPUP
// ------------------------------
document.getElementById("cerrarPopup").addEventListener("click", () => {
    document.getElementById("popupPago").style.display = "none";
});

// ------------------------------
// 3. PAGO CON STRIPE (BACKEND EN VERCEL)
// ------------------------------
document.getElementById("btnPagarStripe").addEventListener("click", iniciarPago);

async function iniciarPago() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    // Transformar formato para Stripe Checkout
    const items = carrito.map(p => ({
        name: p.titulo,
        price: p.precio,
        quantity: p.cantidad || 1
    }));

    try {
        // 🔥 Backend funcionando en Vercel
        const response = await fetch(
            "https://prollectolibreria.vercel.app/api/create-checkout-session",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items })
            }
        );

        const data = await response.json();

        if (!data.url) {
            alert("Error iniciando el pago.");
            console.error("Respuesta Stripe:", data);
            return;
        }

        // Redirigir a Stripe Checkout
        window.location.href = data.url;

    } catch (err) {
        console.error("Error iniciando pago:", err);
        alert("Hubo un error al procesar el pago.");
    }
}
