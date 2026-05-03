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
        { id: 'comp_eco', nombre: 'Mix Económico (2 acomp.)', precio: 5.00, img: 'assets/img/mix-chill.svg' },
        { id: 'comp_power', nombre: 'Mix Power (1 prem + 1 acomp)', precio: 7.00, img: 'assets/img/mix-cerebrito.svg' },
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

    // 3. Función Principal: COMPRAR AHORA Directo (Para Catálogo)
    // Esta función la llamamos desde el HTML con onclick
    window.comprarItemDirecto = function(containerId, productoNombre, productoPrecio) {
        // Obtenemos la cantidad actual que está en el Map de catálogo
        const cantidad = cantidadesCatalogo.get(containerId) || 0;

        if (cantidad === 0) {
            alert('¡Utiliza los botones + para añadir al menos una unidad de este mix!');
            return;
        }

        const subtotal = productoPrecio * cantidad;
        let mensaje = `¡Hola Healthy Life! 🌰\nQuiero hacer un pedido rápido de tu catálogo:\n\n`;
        mensaje += `👉 *${cantidad}x* ${productoNombre} (S/ ${subtotal.toFixed(2)})\n`;
        mensaje += `\n💰 *SUBTOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        mensaje += `Deseo pagar con: (Escribe Yape/Plin/Efectivo)\n`;
        mensaje += `Dirección de entrega: (Tu dirección aquí)`;

        const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    }

    // 4. Enviar a WhatsApp el pedido MAESTRO de abajo (Configurador)
    document.getElementById('btnPedirWa').addEventListener('click', () => {
        if (carritoBolsa.size === 0) {
            alert('¡Utiliza los botones + del configurador para añadir ingredientes a tu bolsa!');
            return;
        }

        let total = 0;
        let mensaje = `¡Hola Healthy Life! 🌰\nYa armé mi carrito interactivo, quiero pedir:\n\n`;
        
        carritoBolsa.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            mensaje += `👉 *${item.cantidad}x* ${item.nombre} (S/ ${subtotal.toFixed(2)})\n`;
        });
        
        mensaje += `\n💰 *TOTAL A PAGAR: S/ ${total.toFixed(2)}*\n\n`;
        mensaje += `💳 Pagaré con: (Escribe Yape/Plin/Efectivo)\n`;
        mensaje += `📍 Dirección: (Escribe tu dirección)`;

        const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
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