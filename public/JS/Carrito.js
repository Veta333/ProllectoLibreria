document.getElementById("btnPagar").addEventListener("click", iniciarPago);

async function iniciarPago() {
    // CARGAR CARRITO DESDE LOCALSTORAGE
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    // Transformar el carrito para Stripe
    const items = carrito.map(producto => ({
        name: producto.titulo,
        price: producto.precio,
        quantity: producto.cantidad || 1
    }));

    try {
        // Llamar a Firebase Function
        const response = await fetch(
            "https://us-central1-TU_PROYECTO.cloudfunctions.net/createCheckoutSession",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ items })
            }
        );

        const data = await response.json();

        if (!data.url) {
            alert("No se pudo iniciar el pago");
            return;
        }

        // Redirigir a Stripe Checkout
        window.location.href = data.url;

    } catch (error) {
        console.error("Error iniciando el pago:", error);
        alert("Hubo un error iniciando el pago");
    }
}
