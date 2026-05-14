document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración
    const TELEFONO_WHATSAPP = '51999999999'; // <-- Tu número
    
    // Base de datos de productos para el Configurador Interactivo
    const PRODUCTOS_FAVORITOS = [
        { id: 'ind_pasas',        nombre: 'Pasas rubias',              precio: 2.50,  img: 'assets/img/p-pasas.png',   esGramos: true  },
        { id: 'ind_mani',         nombre: 'Maní',                      precio: 2.50,  img: 'assets/img/p-mani.png',    esGramos: true  },
        { id: 'ind_arandanos',    nombre: 'Arándanos deshid.',         precio: 2.50,  img: 'assets/img/p-arandanos.png', esGramos: true },
        { id: 'ind_nueces',       nombre: 'Nueces',                    precio: 4.00,  img: 'assets/img/walnut.svg',    esGramos: true  },
        { id: 'ind_pecanas',      nombre: 'Pecanas',                   precio: 4.00,  img: 'assets/img/p-pecanas.png', esGramos: true  },
        { id: 'ind_almendras',    nombre: 'Almendras',                 precio: 4.00,  img: 'assets/img/p-almendras.png', esGramos: true },
        { id: 'ind_granola',      nombre: 'Granola Artesanal',         precio: 6.00,  img: 'assets/img/granola.svg',   esGramos: false, unidad: '250g' },
        { id: 'ind_mantequilla',  nombre: 'Mantequilla de Maní Casera', precio: 12.00, img: 'assets/img/pbutter.svg',  esGramos: false, unidad: '250g' },
        { id: 'ind_chocomani',    nombre: 'Choco Maní',                precio: 14.00, img: 'assets/img/choco.svg',     esGramos: false, unidad: '250g' },
    ];

    const DUOS_Y_FAMILIA = [
        { id: 'comp_eco',     nombre: 'Mix Económico', descripcion: '2 acompañantes a elegir',   precio: 5.00, img: 'assets/img/mix-chill.svg',     tipoDuo: 'eco'     },
        { id: 'comp_power',   nombre: 'Mix Power',     descripcion: '1 premium + 1 acompañante', precio: 7.00, img: 'assets/img/mix-cerebrito.svg', tipoDuo: 'power'   },
        { id: 'comp_premium', nombre: 'Mix Premium',   descripcion: '2 frutos poderosos',        precio: 7.00, img: 'assets/img/mix-cerebrito.svg', tipoDuo: 'premium' },
    ];

    const ACOMPAÑANTES_DUO = [
        { id: 'pasas',     nombre: 'Pasas rubias', img: 'assets/img/p-pasas.png'      },
        { id: 'mani',      nombre: 'Maní',          img: 'assets/img/p-mani.png'       },
        { id: 'arandanos', nombre: 'Arándanos',      img: 'assets/img/p-arandanos.png'  },
    ];

    const PREMIUMS_DUO = [
        { id: 'nueces',    nombre: 'Nueces',    img: 'assets/img/walnut.svg'      },
        { id: 'pecanas',   nombre: 'Pecanas',   img: 'assets/img/p-pecanas.png'   },
        { id: 'almendras', nombre: 'Almendras', img: 'assets/img/p-almendras.png' },
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

    // Activar los botones del Catálogo
    document.querySelectorAll('.catalog-grid .purchase-controls').forEach(control => {
        const prodId = control.id;
        activarBotonesCantidad(control, (nuevaCantidad) => {
            cantidadesCatalogo.set(prodId, nuevaCantidad);
            actualizarCarritoCatalogo();
        });
    });

    document.getElementById('btnPedirCatalogo').addEventListener('click', () => {
        let totalUnidades = 0;
        cantidadesCatalogo.forEach(c => { totalUnidades += c; });
        if (totalUnidades === 0) return;

        const medidaCantidad = cantidadesCatalogo.get('compra_medida') || 0;
        modal.tipo     = 'catalogo_grupal';
        modal.cantidad = medidaCantidad;

        document.getElementById('modalNombre').textContent = 'Tu pedido';

        if (medidaCantidad > 0) {
            document.getElementById('modalResumen').textContent =
                `${totalUnidades} mixes · Personaliza tu${medidaCantidad > 1 ? 's' : ''} A Tu Medida`;
            document.getElementById('seccionMedida').style.display = 'block';
            poblarMedidaConfig();
        } else {
            document.getElementById('modalResumen').textContent =
                `${totalUnidades} mix${totalUnidades > 1 ? 'es' : ''} · Elige tu pago`;
            document.getElementById('seccionMedida').style.display = 'none';
        }
        abrirModalUI();
    });

    // Crear los items del Configurador dinámicamente y activar sus botones
    function crearItemConfigurador(producto) {
        const { esGramos = false, unidad } = producto;
        const div = document.createElement('div');
        div.className = 'item-chip';
        const precioLabel = esGramos
            ? `S/ ${producto.precio.toFixed(2)} / 50g`
            : unidad
                ? `S/ ${producto.precio.toFixed(2)} / ${unidad}`
                : `S/ ${producto.precio.toFixed(2)}`;
        div.innerHTML = `
            <div class="item-info" style="display: flex; align-items: center; gap: 15px;">
                <img src="${producto.img}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 50%; background: var(--bg-alt); padding: 5px; border: 1px solid var(--border-color);">
                <div>
                    <strong style="font-size: 1.05rem; display: block; color: var(--text-main);">${producto.nombre}</strong>
                    <small style="color: var(--accent-orange); font-weight: 600; font-size: 0.9rem;">${precioLabel}</small>
                </div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn btn-minus">−</button>
                <span class="qty-val">0</span>
                <button class="qty-btn btn-plus">+</button>
            </div>
        `;

        const btnMinus = div.querySelector('.btn-minus');
        const btnPlus = div.querySelector('.btn-plus');
        const qtyVal = div.querySelector('.qty-val');
        let cantidadActual = 0;

        const actualizarDisplay = (qty) => {
            qtyVal.textContent = esGramos && qty > 0 ? `${qty * 50}g` : qty;
        };

        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            cantidadActual++;
            actualizarDisplay(cantidadActual);
            div.classList.add('selected');
            carritoBolsa.set(producto.id, { ...producto, cantidad: cantidadActual });
            actualizarBolsa();
        });

        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            if (cantidadActual > 0) {
                cantidadActual--;
                actualizarDisplay(cantidadActual);
                if (cantidadActual === 0) {
                    div.classList.remove('selected');
                    carritoBolsa.delete(producto.id);
                } else {
                    carritoBolsa.set(producto.id, { ...producto, cantidad: cantidadActual });
                }
                actualizarBolsa();
            }
        });

        return div;
    }

    function crearItemDuo(producto) {
        const div = document.createElement('div');
        div.className = 'item-chip';
        div.innerHTML = `
            <div class="item-info" style="display: flex; align-items: center; gap: 15px;">
                <img src="${producto.img}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 50%; background: var(--bg-alt); padding: 5px; border: 1px solid var(--border-color);">
                <div>
                    <strong style="font-size: 1.05rem; display: block; color: var(--text-main);">${producto.nombre}</strong>
                    <small style="color: var(--text-muted); font-size: 0.83rem;">${producto.descripcion}</small><br>
                    <small style="color: var(--accent-orange); font-weight: 600; font-size: 0.9rem;">S/ ${producto.precio.toFixed(2)}</small>
                </div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn btn-minus">−</button>
                <span class="qty-val">0</span>
                <button class="qty-btn btn-plus">+</button>
            </div>
        `;

        const btnMinus = div.querySelector('.btn-minus');
        const btnPlus  = div.querySelector('.btn-plus');
        const qtyVal   = div.querySelector('.qty-val');

        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModalDuo(producto, (frutos) => {
                const actual = carritoBolsa.get(producto.id) || { ...producto, cantidad: 0, selecciones: [] };
                actual.cantidad++;
                actual.selecciones.push(frutos);
                carritoBolsa.set(producto.id, actual);
                qtyVal.textContent = actual.cantidad;
                div.classList.add('selected');
                actualizarBolsa();
            });
        });

        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            const actual = carritoBolsa.get(producto.id);
            if (actual && actual.cantidad > 0) {
                actual.cantidad--;
                actual.selecciones.pop();
                qtyVal.textContent = actual.cantidad;
                if (actual.cantidad === 0) {
                    div.classList.remove('selected');
                    carritoBolsa.delete(producto.id);
                } else {
                    carritoBolsa.set(producto.id, actual);
                }
                actualizarBolsa();
            }
        });

        return div;
    }

    PRODUCTOS_FAVORITOS.forEach(prod => favGrid.appendChild(crearItemConfigurador(prod)));
    DUOS_Y_FAMILIA.forEach(prod => duoGrid.appendChild(crearItemDuo(prod)));

    // ── CATÁLOGO: datos, descuentos y carrito ──────────────────────────

    const CATALOGO_MIXES = [
        { id: 'compra_cerebrito', nombre: 'El Cerebrito',        precio: 4.00 },
        { id: 'compra_medida',    nombre: 'A Tu Medida (50g)',   precio: 3.50 },
        { id: 'compra_toditito',  nombre: 'El Toditito Para Ti', precio: 3.00 },
        { id: 'compra_chill',     nombre: 'El Chill',            precio: 2.50 },
    ];

    const DESCUENTOS = [
        { minUnidades: 12, porcentaje: 20, label: '¡Mejor precio! 20% off' },
        { minUnidades: 6,  porcentaje: 15, label: 'Grupo grande · 15% off' },
        { minUnidades: 3,  porcentaje: 10, label: 'Pack amigos · 10% off'  },
    ];

    function obtenerDescuento(totalUnidades) {
        return DESCUENTOS.find(d => totalUnidades >= d.minUnidades) || null;
    }

    function actualizarCarritoCatalogo() {
        let totalUnidades = 0;
        let subtotal = 0;
        let tieneMedida = false;

        cantidadesCatalogo.forEach((cantidad, id) => {
            const prod = CATALOGO_MIXES.find(p => p.id === id);
            if (prod && cantidad > 0) {
                totalUnidades += cantidad;
                subtotal += prod.precio * cantidad;
                if (id === 'compra_medida') tieneMedida = true;
            }
        });

        const bar  = document.getElementById('catalogCartBar');
        const hint = document.getElementById('catalogHint');
        if (totalUnidades === 0) {
            bar.style.display  = 'none';
            hint.style.display = 'block';
            return;
        }
        bar.style.display  = 'flex';
        hint.style.display = 'none';

        document.getElementById('catalogCartCount').textContent =
            `${totalUnidades} mix${totalUnidades > 1 ? 'es' : ''}`;

        const promoMsg  = document.getElementById('catalogPromoMsg');
        const totalEl   = document.getElementById('catalogCartTotal');
        const descuento = obtenerDescuento(totalUnidades);

        const btn = document.getElementById('btnPedirCatalogo');
        if (tieneMedida) {
            totalEl.textContent = '—';
            const descLabel = descuento ? ` · ${descuento.porcentaje}% off incluido` : '';
            promoMsg.innerHTML = `Toca <strong>Personalizar y pedir</strong> para configurar tu A Tu Medida${descLabel} →`;
            btn.textContent = 'Personalizar y pedir →';
            btn.classList.add('btn-pulse');
        } else if (descuento) {
            const ahorro = subtotal * (descuento.porcentaje / 100);
            totalEl.innerHTML = `<s>S/ ${subtotal.toFixed(2)}</s> → <strong>S/ ${(subtotal - ahorro).toFixed(2)}</strong>`;
            promoMsg.textContent = `🎉 ${descuento.label} · Ahorras S/ ${ahorro.toFixed(2)}`;
            btn.textContent = 'Pedir todo →';
            btn.classList.remove('btn-pulse');
        } else {
            totalEl.textContent = `S/ ${subtotal.toFixed(2)}`;
            promoMsg.textContent = '';
            btn.textContent = 'Pedir todo →';
            btn.classList.remove('btn-pulse');
        }
    }

    // ── MODAL UNIVERSAL DE PEDIDO ───────────────────────────────────────

    const TAMANOS_MEDIDA = [
        { id: '50g',  nombre: null,                 gramos: 50,  precio: 3.50 },
        { id: '80g',  nombre: 'Snack Rápido',        gramos: 80,  precio: 4.00 },
        { id: '120g', nombre: 'Energía Constante',   gramos: 120, precio: 6.00 },
        { id: '150g', nombre: 'Para Compartir',      gramos: 150, precio: 7.00 },
    ];

    const INGREDIENTES_MEDIDA = [
        { id: 'pasas',     nombre: 'Pasas rubias', img: 'assets/img/p-pasas.png' },
        { id: 'mani',      nombre: 'Maní',          img: 'assets/img/p-mani.png' },
        { id: 'arandanos', nombre: 'Arándanos',      img: 'assets/img/p-arandanos.png' },
        { id: 'nueces',    nombre: 'Nueces',         img: 'assets/img/walnut.svg' },
        { id: 'pecanas',   nombre: 'Pecanas',        img: 'assets/img/p-pecanas.png' },
        { id: 'almendras', nombre: 'Almendras',      img: 'assets/img/p-almendras.png' },
    ];

    const modal = {
        tipo: null, nombre: '', precio: 0, cantidad: 0,
        mixesConfig: [], pago: null,
    };

    function abrirModalUI() {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
        modal.pago = null;
        document.getElementById('modalPedido').classList.add('open');
    }

    function actualizarResumenMedida() {
        const total = modal.mixesConfig.reduce((s, m) => s + (m.tamano ? m.tamano.precio : 0), 0);
        const elegidos = modal.mixesConfig.filter(m => m.tamano).length;
        document.getElementById('modalResumen').textContent = elegidos === modal.cantidad
            ? `${modal.cantidad} mix${modal.cantidad > 1 ? 'es' : ''} · Total S/ ${total.toFixed(2)}`
            : `${elegidos} de ${modal.cantidad} tamaños elegidos`;
    }

    function poblarMedidaConfig() {
        const contenedor = document.getElementById('medidaConfig');
        contenedor.innerHTML = '';
        modal.mixesConfig = Array.from({ length: modal.cantidad }, () => ({ tamano: null, ingredientes: new Set() }));

        for (let i = 0; i < modal.cantidad; i++) {
            if (modal.cantidad > 1) {
                const titulo = document.createElement('p');
                titulo.className = 'modal-unidad-label';
                titulo.textContent = `Mix ${i + 1}`;
                contenedor.appendChild(titulo);
            }

            // — Selector de tamaño
            const tamLabel = document.createElement('p');
            tamLabel.className = 'modal-label';
            tamLabel.textContent = 'Tamaño:';
            contenedor.appendChild(tamLabel);

            const tamGrid = document.createElement('div');
            tamGrid.className = 'ingredient-chips';

            // — Sección de ingredientes (oculta hasta elegir tamaño)
            const ingSection = document.createElement('div');
            ingSection.style.display = 'none';

            const ingLabel = document.createElement('p');
            ingLabel.className = 'modal-label';
            ingLabel.innerHTML = `Elige hasta <strong>3 frutos</strong>:`;

            const ingGrid = document.createElement('div');
            ingGrid.className = 'ingredient-chips';

            const contador = document.createElement('p');
            contador.className = 'modal-ing-counter';
            contador.textContent = '0 / 3 seleccionados';

            ingSection.appendChild(ingLabel);
            ingSection.appendChild(ingGrid);
            ingSection.appendChild(contador);

            // Chips de tamaño
            TAMANOS_MEDIDA.forEach(tam => {
                const chip = document.createElement('div');
                chip.className = 'ing-chip tamano-chip';
                chip.innerHTML = `
                    <div class="ing-chip-info">
                        <strong>${tam.nombre ?? 'A Tu Medida'}</strong>
                        <span style="font-size:0.85rem;color:var(--text-muted)">${tam.gramos}g · S/ ${tam.precio.toFixed(2)}</span>
                    </div>
                    <div class="modal-check"></div>`;
                chip.addEventListener('click', () => {
                    tamGrid.querySelectorAll('.tamano-chip').forEach(c => {
                        c.classList.remove('selected');
                        c.querySelector('.modal-check').textContent = '';
                    });
                    chip.classList.add('selected');
                    chip.querySelector('.modal-check').textContent = '✓';
                    modal.mixesConfig[i].tamano = tam;
                    // Resetear ingredientes al cambiar tamaño
                    modal.mixesConfig[i].ingredientes.clear();
                    ingGrid.querySelectorAll('.ing-chip').forEach(c => {
                        c.classList.remove('selected');
                        c.querySelector('.modal-check').textContent = '';
                        c.style.opacity = '';
                        c.style.pointerEvents = '';
                    });
                    contador.textContent = '0 / 3 seleccionados';
                    ingSection.style.display = 'block';
                    actualizarResumenMedida();
                });
                tamGrid.appendChild(chip);
            });

            // Chips de ingredientes
            INGREDIENTES_MEDIDA.forEach(ing => {
                const chip = document.createElement('div');
                chip.className = 'ing-chip';
                chip.innerHTML = `<img src="${ing.img}" alt="${ing.nombre}"><div class="ing-chip-info"><strong>${ing.nombre}</strong></div><div class="modal-check"></div>`;
                chip.addEventListener('click', () => {
                    const set = modal.mixesConfig[i].ingredientes;
                    if (set.has(ing.id)) {
                        set.delete(ing.id);
                        chip.classList.remove('selected');
                        chip.querySelector('.modal-check').textContent = '';
                    } else if (set.size < 3) {
                        set.add(ing.id);
                        chip.classList.add('selected');
                        chip.querySelector('.modal-check').textContent = '✓';
                    }
                    contador.textContent = `${set.size} / 3 seleccionados`;
                    ingGrid.querySelectorAll('.ing-chip:not(.selected)').forEach(c => {
                        c.style.opacity = set.size >= 3 ? '0.35' : '1';
                        c.style.pointerEvents = set.size >= 3 ? 'none' : '';
                    });
                });
                ingGrid.appendChild(chip);
            });

            contenedor.appendChild(tamGrid);
            contenedor.appendChild(ingSection);
        }
    }

    window.abrirModalCatalogo = function(containerId, nombre, precio) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;
        if (cantidad === 0) { alert('¡Usa los botones + para añadir al menos una unidad!'); return; }
        Object.assign(modal, { tipo: 'catalogo', nombre, precio, cantidad });
        document.getElementById('modalNombre').textContent = nombre;
        document.getElementById('modalResumen').textContent = `${cantidad} unidad${cantidad > 1 ? 'es' : ''} · Total S/ ${(precio * cantidad).toFixed(2)}`;
        document.getElementById('seccionMedida').style.display = 'none';
        abrirModalUI();
    };

    window.abrirModalMedida = function(containerId) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;
        if (cantidad === 0) { alert('¡Usa los botones + para añadir al menos una unidad!'); return; }
        Object.assign(modal, { tipo: 'medida', nombre: 'A Tu Medida', precio: 0, cantidad, mixesConfig: [] });
        document.getElementById('modalNombre').textContent = 'A Tu Medida';
        document.getElementById('modalResumen').textContent = `${cantidad} mix${cantidad > 1 ? 'es' : ''} · Elige tamaño y frutos`;
        document.getElementById('seccionMedida').style.display = 'block';
        poblarMedidaConfig();
        abrirModalUI();
    };

    window.cerrarModal = function(e) {
        if (!e || e.target === document.getElementById('modalPedido')) {
            document.getElementById('modalPedido').classList.remove('open');
        }
    };

    // ── MODAL DÚOS Y FAMILIA ──────────────────────────────────────────────
    let duoCallback = null;
    const duoEstado = {};

    function abrirModalDuo(producto, onConfirm) {
        duoCallback = onConfirm;
        duoEstado.tipoDuo = producto.tipoDuo;

        document.getElementById('duoModalNombre').textContent = producto.nombre;
        document.getElementById('duoModalDesc').textContent =
            `${producto.descripcion} · S/ ${producto.precio.toFixed(2)}`;

        const body = document.getElementById('duoModalBody');
        body.innerHTML = '';
        const confirmBtn = document.getElementById('duoConfirmBtn');
        confirmBtn.disabled = true;

        function checkComplete() {
            let ok = false;
            if (producto.tipoDuo === 'eco')     ok = (duoEstado.selEco      || []).length === 2;
            if (producto.tipoDuo === 'power')   ok = !!(duoEstado.selPremium && duoEstado.selAcomp);
            if (producto.tipoDuo === 'premium') ok = (duoEstado.selPremiums || []).length === 2;
            confirmBtn.disabled = !ok;
        }

        function buildChips(lista, container, maxSel, key) {
            duoEstado[key] = [];
            const grid = document.createElement('div');
            grid.className = 'ingredient-chips';
            const contador = document.createElement('p');
            contador.className = 'modal-ing-counter';
            contador.textContent = `0 / ${maxSel} seleccionados`;

            lista.forEach(fruto => {
                const chip = document.createElement('div');
                chip.className = 'ing-chip';
                chip.innerHTML = `<img src="${fruto.img}" alt="${fruto.nombre}">
                    <div class="ing-chip-info"><strong>${fruto.nombre}</strong></div>
                    <div class="modal-check"></div>`;
                chip.addEventListener('click', () => {
                    const sel = duoEstado[key];
                    if (sel.includes(fruto.id)) {
                        sel.splice(sel.indexOf(fruto.id), 1);
                        chip.classList.remove('selected');
                        chip.querySelector('.modal-check').textContent = '';
                    } else if (sel.length < maxSel) {
                        sel.push(fruto.id);
                        chip.classList.add('selected');
                        chip.querySelector('.modal-check').textContent = '✓';
                    }
                    contador.textContent = `${sel.length} / ${maxSel} seleccionados`;
                    grid.querySelectorAll('.ing-chip:not(.selected)').forEach(c => {
                        c.style.opacity       = sel.length >= maxSel ? '0.35' : '';
                        c.style.pointerEvents = sel.length >= maxSel ? 'none' : '';
                    });
                    checkComplete();
                });
                grid.appendChild(chip);
            });
            container.appendChild(grid);
            container.appendChild(contador);
        }

        function buildSingle(lista, container, key) {
            duoEstado[key] = null;
            const grid = document.createElement('div');
            grid.className = 'ingredient-chips';
            lista.forEach(fruto => {
                const chip = document.createElement('div');
                chip.className = 'ing-chip';
                chip.innerHTML = `<img src="${fruto.img}" alt="${fruto.nombre}">
                    <div class="ing-chip-info"><strong>${fruto.nombre}</strong></div>
                    <div class="modal-check"></div>`;
                chip.addEventListener('click', () => {
                    grid.querySelectorAll('.ing-chip').forEach(c => {
                        c.classList.remove('selected');
                        c.querySelector('.modal-check').textContent = '';
                    });
                    chip.classList.add('selected');
                    chip.querySelector('.modal-check').textContent = '✓';
                    duoEstado[key] = fruto.id;
                    checkComplete();
                });
                grid.appendChild(chip);
            });
            container.appendChild(grid);
        }

        function addLabel(text, parent, extraStyle) {
            const p = document.createElement('p');
            p.className = 'modal-label';
            p.textContent = text;
            if (extraStyle) Object.assign(p.style, extraStyle);
            parent.appendChild(p);
        }

        if (producto.tipoDuo === 'eco') {
            addLabel('Elige tus 2 acompañantes:', body);
            buildChips(ACOMPAÑANTES_DUO, body, 2, 'selEco');

        } else if (producto.tipoDuo === 'power') {
            addLabel('Elige tu fruto premium:', body);
            buildSingle(PREMIUMS_DUO, body, 'selPremium');
            addLabel('Elige tu acompañante:', body, { marginTop: '14px' });
            buildSingle(ACOMPAÑANTES_DUO, body, 'selAcomp');

        } else if (producto.tipoDuo === 'premium') {
            addLabel('Elige tus 2 frutos poderosos:', body);
            buildChips(PREMIUMS_DUO, body, 2, 'selPremiums');
        }

        document.getElementById('modalDuo').classList.add('open');
    }

    window.confirmarDuo = function() {
        if (document.getElementById('duoConfirmBtn').disabled) return;

        const nombreFruto = (id, lista) => lista.find(f => f.id === id)?.nombre || id;
        let frutos = [];

        if (duoEstado.tipoDuo === 'eco') {
            frutos = duoEstado.selEco.map(id => nombreFruto(id, ACOMPAÑANTES_DUO));
        } else if (duoEstado.tipoDuo === 'power') {
            frutos = [
                nombreFruto(duoEstado.selPremium, PREMIUMS_DUO),
                nombreFruto(duoEstado.selAcomp,   ACOMPAÑANTES_DUO),
            ];
        } else if (duoEstado.tipoDuo === 'premium') {
            frutos = duoEstado.selPremiums.map(id => nombreFruto(id, PREMIUMS_DUO));
        }

        document.getElementById('modalDuo').classList.remove('open');
        if (duoCallback) { duoCallback(frutos); duoCallback = null; }
    };

    window.cerrarModalDuo = function(e) {
        if (!e || e.target === document.getElementById('modalDuo')) {
            document.getElementById('modalDuo').classList.remove('open');
            duoCallback = null;
        }
    };

    window.seleccionarPago = function(btn) {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.pago = btn.dataset.pago;
    };

    window.confirmarPedido = function() {
        const tieneMediada = modal.tipo === 'medida' ||
            (modal.tipo === 'catalogo_grupal' && (cantidadesCatalogo.get('compra_medida') || 0) > 0);
        if (tieneMediada && modal.mixesConfig.length > 0) {
            if (modal.mixesConfig.some(m => !m.tamano)) {
                alert(modal.cantidad === 1 ? '¡Elige un tamaño para tu mix!' : '¡Elige un tamaño para cada mix!');
                return;
            }
            if (modal.mixesConfig.some(m => m.ingredientes.size === 0)) {
                alert(modal.cantidad === 1 ? '¡Elige al menos un fruto para tu mix!' : '¡Elige al menos un fruto para cada mix!');
                return;
            }
        }
        if (!modal.pago) {
            alert('¡Elige cómo vas a pagar!'); return;
        }

        let mensaje = `¡Hola Healthy Life! 🌰\nQuiero hacer un pedido:\n\n`;

        if (modal.tipo === 'catalogo_grupal') {
            let subtotal = 0;
            let totalUnidades = 0;
            cantidadesCatalogo.forEach((cant, prodId) => {
                if (!cant) return;
                totalUnidades += cant;
                if (prodId === 'compra_medida' && modal.mixesConfig.length > 0) {
                    // A Tu Medida configurada
                    modal.mixesConfig.forEach((m, idx) => {
                        const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                        const ings = [...m.ingredientes].map(iid => INGREDIENTES_MEDIDA.find(i => i.id === iid).nombre).join(' · ');
                        subtotal += m.tamano.precio;
                        const label = cant > 1 ? `A Tu Medida #${idx + 1}` : 'A Tu Medida';
                        mensaje += `👉 *${label}* ${m.tamano.gramos}g${tamLabel} · ${ings} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                    });
                } else {
                    const prod = CATALOGO_MIXES.find(p => p.id === prodId);
                    if (!prod) return;
                    subtotal += prod.precio * cant;
                    mensaje += `👉 *${cant}x* ${prod.nombre} — S/ ${(prod.precio * cant).toFixed(2)}\n`;
                }
            });
            const descuento = obtenerDescuento(totalUnidades);
            if (descuento) {
                const ahorro = subtotal * (descuento.porcentaje / 100);
                mensaje += `🎉 *Descuento ${descuento.porcentaje}%:* -S/ ${ahorro.toFixed(2)}\n`;
                mensaje += `💰 *TOTAL: S/ ${(subtotal - ahorro).toFixed(2)}*\n\n`;
            } else {
                mensaje += `💰 *TOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
            }
        } else if (modal.tipo === 'catalogo') {
            const subtotal = modal.precio * modal.cantidad;
            mensaje += `👉 *${modal.cantidad}x* ${modal.nombre} (50g) — S/ ${subtotal.toFixed(2)}\n`;
            mensaje += `💰 *TOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'medida') {
            const total = modal.mixesConfig.reduce((s, m) => s + m.tamano.precio, 0);
            if (modal.cantidad === 1) {
                const m = modal.mixesConfig[0];
                const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                const ings = [...m.ingredientes].map(id => INGREDIENTES_MEDIDA.find(i => i.id === id).nombre).join(' · ');
                mensaje += `👉 *A Tu Medida* ${m.tamano.gramos}g${tamLabel} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                mensaje += `🫐 *Frutos:* ${ings}\n`;
            } else {
                modal.mixesConfig.forEach((m, idx) => {
                    const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                    const ings = [...m.ingredientes].map(id => INGREDIENTES_MEDIDA.find(i => i.id === id).nombre).join(' · ');
                    mensaje += `👉 *Mix ${idx + 1}:* ${m.tamano.gramos}g${tamLabel} · ${ings} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                });
            }
            mensaje += `💰 *TOTAL: S/ ${total.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'configurador') {
            let total = 0;
            carritoBolsa.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                if (item.selecciones && item.selecciones.length > 0) {
                    item.selecciones.forEach((sel, idx) => {
                        const label = item.cantidad > 1 ? `${item.nombre} #${idx + 1}` : item.nombre;
                        mensaje += `👉 *${label}:* ${sel.join(' + ')} — S/ ${item.precio.toFixed(2)}\n`;
                    });
                } else if (item.esGramos) {
                    mensaje += `👉 *${item.cantidad * 50}g* de ${item.nombre} — S/ ${subtotal.toFixed(2)}\n`;
                } else if (item.unidad) {
                    mensaje += `👉 *${item.cantidad}x* ${item.nombre} (${item.unidad}) — S/ ${subtotal.toFixed(2)}\n`;
                } else {
                    mensaje += `👉 *${item.cantidad}x* ${item.nombre} — S/ ${subtotal.toFixed(2)}\n`;
                }
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
        const secIng = document.getElementById('seccionIngredientes');
        const secMix = document.getElementById('seccionMixes');
        if (secIng) secIng.style.display = 'none';
        if (secMix) secMix.style.display = 'none';
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