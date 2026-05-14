document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración
    const TELEFONO_WHATSAPP = '51999999999'; // <-- Tu número

    // Map para las cantidades del catálogo
    let cantidadesCatalogo = new Map();

    // 2. Dar vida a los botones + / -
    function activarBotonesCantidad(contenedor, onCantidadChange) {
        const btnMinus = contenedor.querySelector('.btn-minus');
        const btnPlus = contenedor.querySelector('.btn-plus');
        const qtyVal = contenedor.querySelector('.qty-val');
        let cantidadActual = 0;

        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            cantidadActual++;
            qtyVal.textContent = cantidadActual;
            onCantidadChange(cantidadActual);
        });

        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            if (cantidadActual > 0) {
                cantidadActual--;
                qtyVal.textContent = cantidadActual;
                onCantidadChange(cantidadActual);
            }
        });
    }

    // Activar TODOS los controles del catálogo
    document.querySelectorAll('.catalog-grid .purchase-controls').forEach(control => {
        const prodId = control.id;
        activarBotonesCantidad(control, (nuevaCantidad) => {
            cantidadesCatalogo.set(prodId, nuevaCantidad);
        });
    });

    // 3. Comprar directo → WhatsApp
    window.comprarItemDirecto = function (containerId, productoNombre, productoPrecio) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;

        if (cantidad === 0) {
            alert('¡Usa los botones + para añadir al menos una unidad!');
            return;
        }

        const subtotal = productoPrecio * cantidad;
        let mensaje = `¡Hola Healthy Life! 🌰\nQuiero hacer un pedido:\n\n`;
        mensaje += `👉 *${cantidad}x* ${productoNombre} → S/ ${subtotal.toFixed(2)}\n`;
        mensaje += `\n💰 *SUBTOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        mensaje += `Pago con: (Yape / Plin / Efectivo)\n`;
        mensaje += `Dirección: (Tu dirección aquí)`;

        const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    // 4. Animaciones de aparición
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});