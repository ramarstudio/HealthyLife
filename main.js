document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración
    const TELEFONO_WHATSAPP = '51999999999'; // <-- Tu número
    
    // Base de datos de productos para el Configurador Interactivo
    const PRODUCTOS_FAVORITOS = [
        { id: 'ind_pasas', nombre: 'Pasas rubias (50g)', precio: 2.50, img: 'assets/img/p-pasas.png' },
        { id: 'ind_mani', nombre: 'Maní (50g)', precio: 1.00, img: 'assets/img/p-mani.png' },
        { id: 'ind_arandanos', nombre: 'Arándanos deshid. (50g)', precio: 2.50, img: 'assets/img/p-arandanos.png' },
        { id: 'ind_nueces', nombre: 'Nueces (50g)', precio: 4.00, img: 'assets/img/walnut.svg' },
        { id: 'ind_pecanas', nombre: 'Pecanas (50g)', precio: 4.00, img: 'assets/img/p-pecanas.png' },
        { id: 'ind_almendras', nombre: 'Almendras (50g)', precio: 3.50, img: 'assets/img/p-almendras.png' }
    ];

    const DUOS_Y_FAMILIA = [
        { id: 'comp_eco', nombre: 'Mix Económico (2 frutos a elegir)', precio: 5.00, img: 'assets/img/mix-chill.svg' },
        { id: 'comp_power', nombre: 'Mix Power (1 premium + 1 a elegir)', precio: 7.00, img: 'assets/img/mix-cerebrito.svg' },
        { id: 'comp_granola', nombre: 'Granola Artesanal (250g)', precio: 6.00, img: 'assets/img/granola.svg' },
        { id: 'comp_pbutter', nombre: 'Mantequilla de Maní (250g)', precio: 12.00, img: 'assets/img/pbutter.svg' }
    ];

    // Map para el "Bolsa Maestra" (Solo para el configurador de abajo)
    let carritoBolsa = new Map();
    const favGrid = document.getElementById('favGrid');
    const duoGrid = document.getElementById('duoGrid');

    // Función para actualizar los totales en la barra flotante de abajo
    function actualizarBolsa() {
        let total = 0;
        let conteo = 0;
        carritoBolsa.forEach((item) => {
            total += item.precio * item.cantidad;
            conteo += item.cantidad;
        });
        document.getElementById('cartCount').textContent = `${conteo} productos en tu bolsa`;
        document.getElementById('cartTotal').textContent = `Total estimado: S/ ${total.toFixed(2)}`;
    }

    // Map para las cantidades independientes del catálogo (Los flyers de arriba)
    let cantidadesCatalogo = new Map();

    // 2. Dar vida a los botones + / - (Catálogo y Configurador)
    function activarBotonesCantidad(contenedor, onCantidadChange) {
        const btnMinus = contenedor.querySelector('.btn-minus');
        const btnPlus = contenedor.querySelector('.btn-plus');
        const qtyVal = contenedor.querySelector('.qty-val');
        
        let cantidadActual = 0;

        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita clics no deseados
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

    // Activar los botones del Catálogo de arriba
    document.querySelectorAll('.catalog-grid .purchase-controls').forEach(control => {
        const prodId = control.id; // ej: compra_cerebrito
        activarBotonesCantidad(control, (nuevaCantidad) => {
            // Guardamos la cantidad independientemente
            cantidadesCatalogo.set(prodId, nuevaCantidad);
        });
    });

    // Crear los items del Configurador dinámicamente y activar sus botones
    function crearItemConfigurador(producto) {
        const div = document.createElement('div');
        div.className = 'item-chip';
        div.innerHTML = `
            <div class="item-info" style="display: flex; align-items: center; gap: 15px;">
                <img src="${producto.img}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 50%; background: var(--bg-alt); padding: 5px; border: 1px solid var(--border-color);">
                <div>
                    <strong style="font-size: 1.05rem; display: block; color: var(--text-main);">${producto.nombre}</strong>
                    <small style="color: var(--accent-orange); font-weight: 600; font-size: 0.9rem;">S/ ${producto.precio.toFixed(2)}</small>
                </div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn btn-minus">−</button>
                <span class="qty-val">0</span>
                <button class="qty-btn btn-plus">+</button>
            </div>
        `;
        activarBotonesCantidad(div, (nuevaCantidad) => {
            if (nuevaCantidad === 0) {
                div.classList.remove('selected');
                carritoBolsa.delete(producto.id);
            } else {
                div.classList.add('selected');
                carritoBolsa.set(producto.id, { ...producto, cantidad: nuevaCantidad });
            }
            actualizarBolsa();
        });
        return div;
    }

    PRODUCTOS_FAVORITOS.forEach(prod => favGrid.appendChild(crearItemConfigurador(prod)));
    DUOS_Y_FAMILIA.forEach(prod => duoGrid.appendChild(crearItemConfigurador(prod)));

    // ── MODAL UNIVERSAL DE PEDIDO ───────────────────────────────────────

    const INGREDIENTES_MEDIDA = [
        { id: 'pasas',     nombre: 'Pasas rubias', img: 'assets/img/p-pasas.png' },
        { id: 'mani',      nombre: 'Maní',          img: 'assets/img/p-mani.png' },
        { id: 'arandanos', nombre: 'Arándanos',      img: 'assets/img/p-arandanos.png' },
        { id: 'nueces',    nombre: 'Nueces',         img: 'assets/img/walnut.svg' },
        { id: 'pecanas',   nombre: 'Pecanas',        img: 'assets/img/p-pecanas.png' },
        { id: 'almendras', nombre: 'Almendras',      img: 'assets/img/p-almendras.png' },
    ];

    const MIXES_CATALOGO = [
        { id: 'cerebrito', nombre: 'El Cerebrito' },
        { id: 'medida',    nombre: 'A Tu Medida' },
        { id: 'toditito',  nombre: 'El Toditito' },
        { id: 'chill',     nombre: 'El Chill' },
    ];

    const modal = {
        tipo: null, nombre: '', precio: 0, cantidad: 0, unidades: 0,
        ingredientes: new Set(), mixes: new Set(), pago: null,
    };

    function abrirModalUI() {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
        modal.pago = null;
        document.getElementById('modalPedido').classList.add('open');
    }

    function poblarIngredientes() {
        const grid = document.getElementById('ingredientChips');
        grid.innerHTML = '';
        modal.ingredientes.clear();
        INGREDIENTES_MEDIDA.forEach(ing => {
            const chip = document.createElement('div');
            chip.className = 'ing-chip';
            chip.innerHTML = `<img src="${ing.img}" alt="${ing.nombre}"><div class="ing-chip-info"><strong>${ing.nombre}</strong></div><div class="modal-check"></div>`;
            chip.addEventListener('click', () => {
                if (modal.ingredientes.has(ing.id)) {
                    modal.ingredientes.delete(ing.id);
                    chip.classList.remove('selected');
                    chip.querySelector('.modal-check').textContent = '';
                } else if (modal.ingredientes.size < 3) {
                    modal.ingredientes.add(ing.id);
                    chip.classList.add('selected');
                    chip.querySelector('.modal-check').textContent = '✓';
                }
                actualizarContador();
                document.querySelectorAll('#ingredientChips .ing-chip:not(.selected)').forEach(c => {
                    c.style.opacity = modal.ingredientes.size >= 3 ? '0.35' : '1';
                    c.style.pointerEvents = modal.ingredientes.size >= 3 ? 'none' : '';
                });
            });
            grid.appendChild(chip);
        });
        actualizarContador();
    }

    function actualizarContador() {
        document.getElementById('contadorIng').textContent = `${modal.ingredientes.size} / 3 seleccionados`;
    }

    function poblarMixes() {
        const grid = document.getElementById('mixChips');
        grid.innerHTML = '';
        modal.mixes.clear();
        MIXES_CATALOGO.forEach(mix => {
            const chip = document.createElement('div');
            chip.className = 'ing-chip mix-chip';
            chip.innerHTML = `<div class="ing-chip-info"><strong>${mix.nombre}</strong></div><div class="modal-check"></div>`;
            chip.addEventListener('click', () => {
                if (modal.mixes.has(mix.id)) {
                    modal.mixes.delete(mix.id);
                    chip.classList.remove('selected');
                    chip.querySelector('.modal-check').textContent = '';
                } else {
                    modal.mixes.add(mix.id);
                    chip.classList.add('selected');
                    chip.querySelector('.modal-check').textContent = '✓';
                }
            });
            grid.appendChild(chip);
        });
    }

    window.abrirModalCatalogo = function(containerId, nombre, precio) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;
        if (cantidad === 0) { alert('¡Usa los botones + para añadir al menos una unidad!'); return; }
        Object.assign(modal, { tipo: 'catalogo', nombre, precio, cantidad });
        document.getElementById('modalNombre').textContent = nombre;
        document.getElementById('modalResumen').textContent = `${cantidad} unidad${cantidad > 1 ? 'es' : ''} · Total S/ ${(precio * cantidad).toFixed(2)}`;
        document.getElementById('seccionIngredientes').style.display = 'none';
        document.getElementById('seccionMixes').style.display = 'none';
        abrirModalUI();
    };

    window.abrirModalMedida = function(containerId) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;
        if (cantidad === 0) { alert('¡Usa los botones + para añadir al menos una unidad!'); return; }
        Object.assign(modal, { tipo: 'medida', nombre: 'A Tu Medida', precio: 3.50, cantidad });
        document.getElementById('modalNombre').textContent = 'A Tu Medida';
        document.getElementById('modalResumen').textContent = `${cantidad} unidad${cantidad > 1 ? 'es' : ''} · Total S/ ${(3.50 * cantidad).toFixed(2)}`;
        document.getElementById('seccionIngredientes').style.display = 'block';
        document.getElementById('seccionMixes').style.display = 'none';
        poblarIngredientes();
        abrirModalUI();
    };

    window.abrirModalPack = function(nombre, unidades, precio) {
        Object.assign(modal, { tipo: 'pack', nombre, precio, cantidad: 1, unidades });
        document.getElementById('modalNombre').textContent = nombre;
        document.getElementById('modalResumen').textContent = `${unidades} mixes surtidos · Total S/ ${precio.toFixed(2)}`;
        document.getElementById('seccionIngredientes').style.display = 'none';
        document.getElementById('seccionMixes').style.display = 'block';
        poblarMixes();
        abrirModalUI();
    };

    window.cerrarModal = function(e) {
        if (!e || e.target === document.getElementById('modalPedido')) {
            document.getElementById('modalPedido').classList.remove('open');
        }
    };

    window.seleccionarPago = function(btn) {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.pago = btn.dataset.pago;
    };

    window.confirmarPedido = function() {
        if (modal.tipo === 'medida' && modal.ingredientes.size === 0) {
            alert('¡Elige al menos un fruto para tu mix!'); return;
        }
        if (!modal.pago) {
            alert('¡Elige cómo vas a pagar!'); return;
        }

        let mensaje = `¡Hola Healthy Life! 🌰\nQuiero hacer un pedido:\n\n`;

        if (modal.tipo === 'catalogo') {
            const subtotal = modal.precio * modal.cantidad;
            mensaje += `👉 *${modal.cantidad}x* ${modal.nombre} (50g) — S/ ${subtotal.toFixed(2)}\n`;
            mensaje += `💰 *TOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'medida') {
            const subtotal = 3.50 * modal.cantidad;
            const ings = [...modal.ingredientes].map(id => INGREDIENTES_MEDIDA.find(i => i.id === id).nombre).join(' · ');
            mensaje += `👉 *${modal.cantidad}x* Mix A Tu Medida (50g) — S/ ${subtotal.toFixed(2)}\n`;
            mensaje += `🫐 *Frutos elegidos:* ${ings}\n`;
            mensaje += `💰 *TOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'pack') {
            mensaje += `👉 *${modal.nombre}* — ${modal.unidades} mixes · S/ ${modal.precio.toFixed(2)}\n`;
            if (modal.mixes.size > 0) {
                const mixNames = [...modal.mixes].map(id => MIXES_CATALOGO.find(m => m.id === id).nombre).join(' · ');
                mensaje += `🎯 *Mixes preferidos:* ${mixNames}\n`;
            } else {
                mensaje += `🎯 *Mixes:* a vuestra elección\n`;
            }
            mensaje += `💰 *TOTAL: S/ ${modal.precio.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'configurador') {
            let total = 0;
            carritoBolsa.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                mensaje += `👉 *${item.cantidad}x* ${item.nombre} — S/ ${subtotal.toFixed(2)}\n`;
            });
            mensaje += `💰 *TOTAL: S/ ${total.toFixed(2)}*\n\n`;
        }

        mensaje += `💳 *Pago:* ${modal.pago}\n`;
        mensaje += `📍 *Dirección:* (escribe tu dirección aquí)`;

        document.getElementById('modalPedido').classList.remove('open');
        window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    // 4. Configurador → también pasa por el modal de pago
    document.getElementById('btnPedirWa').addEventListener('click', () => {
        if (carritoBolsa.size === 0) {
            alert('¡Usa los botones + del configurador para añadir ingredientes a tu bolsa!');
            return;
        }
        const totalProductos = [...carritoBolsa.values()].reduce((a, i) => a + i.cantidad, 0);
        const totalPrecio = [...carritoBolsa.values()].reduce((a, i) => a + i.precio * i.cantidad, 0);
        modal.tipo = 'configurador';
        document.getElementById('modalNombre').textContent = 'Tu Mix Personalizado';
        document.getElementById('modalResumen').textContent = `${totalProductos} producto${totalProductos > 1 ? 's' : ''} · Total S/ ${totalPrecio.toFixed(2)}`;
        document.getElementById('seccionIngredientes').style.display = 'none';
        document.getElementById('seccionMixes').style.display = 'none';
        abrirModalUI();
    });

    // 5. Animaciones visuales
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // Lazy Loading Videos
    const videos = document.querySelectorAll('video[data-src]');
    if (videos.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.src = video.dataset.src;
                    video.removeAttribute('data-src');
                    video.load();
                    videoObserver.unobserve(video);
                }
            });
        }, { rootMargin: '300px' });
        videos.forEach(v => videoObserver.observe(v));
    }
});