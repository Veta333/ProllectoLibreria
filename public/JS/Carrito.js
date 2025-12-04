document.addEventListener("DOMContentLoaded", () => {

    const btnPagar = document.getElementById("btnPagarStripe");

    if (!btnPagar) {
        console.error("❌ No se encontró el botón con id='btnPagarStripe'");
        return;
    }

    btnPagar.addEventListener("click", iniciarPago);
});


async function iniciarPago() {

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    // Preparar items
    const items = carrito.map(producto => ({
        name: producto.titulo,
        price: producto.precio,
        quantity: producto.cantidad || 1
    }));

    try {
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

        window.location.href = data.url;

    } catch (error) {
        console.error("Error iniciando el pago:", error);
        alert("Hubo un error iniciando el pago");
    }
}
