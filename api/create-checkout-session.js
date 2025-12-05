import Stripe from "stripe";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: "items[] requerido" });
        }

        // Crear cliente de Stripe con tu secret key
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: items.map(item => ({
                price_data: {
                    currency: "eur",
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            success_url: "https://prollectolibreria.vercel.app/HTML/Exito.html",
            cancel_url: "https://prollectolibreria.vercel.app/HTML/Carrito.html",
        });

        return res.status(200).json({ url: session.url });

    } catch (error) {
        console.error("Stripe error:", error);
        return res.status(500).json({ error: "Error creando sesión" });
    }
}