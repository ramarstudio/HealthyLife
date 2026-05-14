document.addEventListener('DOMContentLoaded', () => {
    // ──────────────────────────────────────────
    // 1. CONFIGURACIÓN
    // ──────────────────────────────────────────
    const TELEFONO_WHATSAPP = '51999999999'; // <-- Tu número

    // Estado del modal de dúos
    let modalDatosDuo = { nombre: '', descripcion: '', precio: 0, maxIngredientes: 2 };

    // Map de cantidades del catálogo (para mixes firmados e individuales)
    let cantidadesCatalogo = new Map();

    // ──────────────────────────────────────────
    // 2. BOTONES +/- DEL CATÁLOGO
    // ──────────────────────────────────────────
    function activarBotonesCantidad(contenedor, onCantidadChange) {
        const btnMinus = contenedor.querySelector('.btn-minus');
        const btnPlus  = contenedor.querySelector('.btn-plus');
        const qtyVal   = contenedor.querySelector('.qty-val');
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

    document.querySelectorAll('.catalog-grid .purchase-controls').forEach(control => {
        const prodId = control.id;
        activarBotonesCantidad(control, (nuevaCantidad) => {
            cantidadesCatalogo.set(prodId, nuevaCantidad);
        });
    });

    // ──────────────────────────────────────────
    // 3. COMPRAR DIRECTO → WHATSAPP (mixes + individuales)
    // ──────────────────────────────────────────
    window.comprarItemDirecto = function (containerId, productoNombre, productoPrecio) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;
        if (cantidad === 0) {
            alert('¡Usa los botones + para añadir al menos una unidad!');
            return;
        }
        const subtotal = productoPrecio * cantidad;
        let msg = `¡Hola Healthy Life! 🌰\nQuiero hacer un pedido:\n\n`;
        msg += `👉 *${cantidad}x* ${productoNombre} → S/ ${subtotal.toFixed(2)}\n`;
        msg += `\n💰 *SUBTOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        msg += `Pago con: (Yape / Plin / Efectivo)\n`;
        msg += `Dirección: (Tu dirección aquí)`;
        window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // ──────────────────────────────────────────
    // 4. MODAL DE DÚOS
    // ──────────────────────────────────────────
    const overlay  = document.getElementById('modalDuo');
    const tituloEl = document.getElementById('modalTitulo');
    const descEl   = document.getElementById('modalDesc');
    const infoEl   = document.getElementById('modalSeleccionInfo');
    const chips    = document.querySelectorAll('.ingrediente-chip');
    const pagos    = document.querySelectorAll('.pago-chip');

    // Abrir modal configurado según el dúo seleccionado
    window.abrirModalDuo = function (nombre, descripcion, precio, maxIngredientes) {
        modalDatosDuo = { nombre, descripcion, precio, maxIngredientes };

        // Actualizar textos del modal
        tituloEl.textContent = nombre;
        descEl.textContent   = `${descripcion} — S/ ${precio.toFixed(2)} · Elige ${maxIngredientes} ingredientes`;

        // Resetear ingredientes
        chips.forEach(chip => {
            chip.classList.remove('seleccionado');
            chip.querySelector('input').checked = false;
        });
        infoEl.textContent = '';

        // Resetear pago → Yape por defecto
        pagos.forEach(p => p.classList.remove('seleccionado'));
        const yape = [...pagos].find(p => p.querySelector('input').value === 'Yape');
        if (yape) yape.classList.add('seleccionado');

        overlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
    };

    // Cerrar modal
    window.cerrarModal = function () {
        overlay.classList.remove('activo');
        document.body.style.overflow = '';
    };

    // Cerrar al hacer clic en el fondo oscuro
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });

    // Toggle de ingrediente-chip
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const seleccionados = [...chips].filter(c => c.classList.contains('seleccionado'));
            const yaSeleccionado = chip.classList.contains('seleccionado');

            if (!yaSeleccionado && seleccionados.length >= modalDatosDuo.maxIngredientes) {
                infoEl.textContent = `⚠️ Solo puedes elegir ${modalDatosDuo.maxIngredientes} ingredientes para este mix.`;
                return;
            }
            chip.classList.toggle('seleccionado');
            chip.querySelector('input').checked = chip.classList.contains('seleccionado');

            const total = [...chips].filter(c => c.classList.contains('seleccionado')).length;
            infoEl.textContent = total === 0
                ? ''
                : `${total} de ${modalDatosDuo.maxIngredientes} elegidos`;
        });
    });

    // Toggle de pago-chip (comportamiento radio visual)
    pagos.forEach(chip => {
        chip.addEventListener('click', () => {
            pagos.forEach(p => p.classList.remove('seleccionado'));
            chip.classList.add('seleccionado');
            chip.querySelector('input').checked = true;
        });
    });

    // Enviar pedido de dúo a WhatsApp
    window.enviarPedidoDuo = function () {
        const seleccionados = [...chips].filter(c => c.classList.contains('seleccionado'));

        if (seleccionados.length === 0) {
            infoEl.textContent = '⚠️ Por favor elige al menos un ingrediente.';
            return;
        }
        if (seleccionados.length < modalDatosDuo.maxIngredientes) {
            infoEl.textContent = `⚠️ Faltan ${modalDatosDuo.maxIngredientes - seleccionados.length} ingrediente(s) por elegir.`;
            return;
        }

        const ingredientesTexto = seleccionados.map(c => `• ${c.querySelector('input').value}`).join('\n');
        const pagoSeleccionado  = document.querySelector('input[name="pago"]:checked')?.value || 'Yape';

        let msg = `¡Hola Healthy Life! 🌰\nQuiero pedir un *${modalDatosDuo.nombre}* (${modalDatosDuo.descripcion}):\n\n`;
        msg += `🥜 *Ingredientes elegidos:*\n${ingredientesTexto}\n\n`;
        msg += `💰 *TOTAL: S/ ${modalDatosDuo.precio.toFixed(2)}*\n\n`;
        msg += `💳 Pago con: *${pagoSeleccionado}*\n`;
        msg += `📍 Dirección: (Tu dirección aquí)`;

        cerrarModal();
        window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // ──────────────────────────────────────────
    // 5. ANIMACIONES DE APARICIÓN
    // ──────────────────────────────────────────
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