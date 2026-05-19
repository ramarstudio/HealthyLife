document.addEventListener('DOMContentLoaded', () => {
    const TELEFONO_WHATSAPP = '51900634225'; // <-- Tu número
    const GRAMOS_POR_UNIDAD = 50;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // ── FUENTE ÚNICA DE FRUTOS ────────────────────────────────────────────
    const FRUTOS_BASE = [
        { id: 'pasas',     nombre: 'Pasas rubias', img: 'assets/img/p-pasas.png',     precio: 2.50, tipo: 'basico'  },
        { id: 'mani',      nombre: 'Maní',          img: 'assets/img/p-mani.png',      precio: 2.50, tipo: 'basico'  },
        { id: 'arandanos', nombre: 'Arándanos',      img: 'assets/img/p-arandanos.png', precio: 2.50, tipo: 'basico'  },
        { id: 'nueces',    nombre: 'Nueces',         img: 'assets/img/walnut.svg',      precio: 4.00, tipo: 'premium' },
        { id: 'pecanas',   nombre: 'Pecanas',        img: 'assets/img/p-pecanas.png',   precio: 4.00, tipo: 'premium' },
        { id: 'almendras', nombre: 'Almendras',      img: 'assets/img/p-almendras.png', precio: 4.00, tipo: 'premium' },
    ];

    const INGREDIENTES_MEDIDA = FRUTOS_BASE;
    const ACOMPAÑANTES_DUO    = FRUTOS_BASE.filter(f => f.tipo === 'basico');
    const PREMIUMS_DUO        = FRUTOS_BASE.filter(f => f.tipo === 'premium');

    const PRODUCTOS_FAVORITOS = [
        ...FRUTOS_BASE.map(f => ({ id: `ind_${f.id}`, nombre: f.nombre, precio: f.precio, img: f.img, esGramos: true })),
        { id: 'ind_granola',     nombre: 'Granola Artesanal',          precio:  6.00, img: 'assets/img/granola.svg',  esGramos: false, unidad: '250g' },
        { id: 'ind_mantequilla', nombre: 'Mantequilla de Maní Casera', precio: 12.00, img: 'assets/img/pbutter.svg',  esGramos: false, unidad: '250g' },
        { id: 'ind_chocomani',   nombre: 'Choco Maní',                 precio: 14.00, img: 'assets/img/choco.svg',    esGramos: false, unidad: '250g' },
    ];

    const DUOS_Y_FAMILIA = [
        { id: 'comp_eco',     nombre: 'Mix Económico', descripcion: '2 acompañantes a elegir',   precio: 5.00, img: 'assets/img/mix-chill.svg',     tipoDuo: 'eco'     },
        { id: 'comp_power',   nombre: 'Mix Power',     descripcion: '1 premium + 1 acompañante', precio: 7.00, img: 'assets/img/mix-cerebrito.svg', tipoDuo: 'power'   },
        { id: 'comp_premium', nombre: 'Mix Premium',   descripcion: '2 frutos poderosos',        precio: 7.00, img: 'assets/img/mix-cerebrito.svg', tipoDuo: 'premium' },
    ];

    // ── ESTADO ────────────────────────────────────────────────────────────
    let carritoBolsa     = new Map();
    let cantidadesCatalogo = new Map();

    const favGrid = document.getElementById('favGrid');
    const duoGrid = document.getElementById('duoGrid');

    // ── BOTONES + / - CATÁLOGO ────────────────────────────────────────────
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
        activarBotonesCantidad(control, (nuevaCantidad) => {
            cantidadesCatalogo.set(control.id, nuevaCantidad);
            actualizarBarraUnificada();
        });
    });

    // ── CONFIGURADOR ITEMS ────────────────────────────────────────────────
    function crearItemConfigurador(producto) {
        const { esGramos = false, unidad } = producto;
        const div = document.createElement('div');
        div.className = 'item-chip';
        const precioLabel = esGramos
            ? `S/ ${producto.precio.toFixed(2)} / ${GRAMOS_POR_UNIDAD}g`
            : unidad
                ? `S/ ${producto.precio.toFixed(2)} / ${unidad}`
                : `S/ ${producto.precio.toFixed(2)}`;

        div.innerHTML = `
            <div class="item-info">
                <img src="${producto.img}" alt="${producto.nombre}" class="item-thumb">
                <div>
                    <strong class="item-nombre">${producto.nombre}</strong>
                    <small class="item-precio">${precioLabel}</small>
                </div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn btn-minus">−</button>
                <span class="qty-val">0</span>
                <button class="qty-btn btn-plus">+</button>
            </div>`;

        const btnMinus = div.querySelector('.btn-minus');
        const btnPlus  = div.querySelector('.btn-plus');
        const qtyVal   = div.querySelector('.qty-val');
        let cantidadActual = 0;

        const actualizarDisplay = (qty) => {
            qtyVal.textContent = esGramos && qty > 0 ? `${qty * GRAMOS_POR_UNIDAD}g` : qty;
        };

        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            cantidadActual++;
            actualizarDisplay(cantidadActual);
            div.classList.add('selected');
            carritoBolsa.set(producto.id, { ...producto, cantidad: cantidadActual });
            actualizarBarraUnificada();
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
                actualizarBarraUnificada();
            }
        });

        return div;
    }

    function crearItemDuo(producto) {
        const div = document.createElement('div');
        div.className = 'item-chip';
        div.innerHTML = `
            <div class="item-info">
                <img src="${producto.img}" alt="${producto.nombre}" class="item-thumb">
                <div>
                    <strong class="item-nombre">${producto.nombre}</strong>
                    <small class="item-desc">${producto.descripcion}</small>
                    <small class="item-precio">S/ ${producto.precio.toFixed(2)}</small>
                </div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn btn-minus">−</button>
                <span class="qty-val">0</span>
                <button class="qty-btn btn-plus">+</button>
            </div>`;

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
                actualizarBarraUnificada();
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
                actualizarBarraUnificada();
            }
        });

        return div;
    }

    PRODUCTOS_FAVORITOS.forEach(prod => favGrid.appendChild(crearItemConfigurador(prod)));
    DUOS_Y_FAMILIA.forEach(prod => duoGrid.appendChild(crearItemDuo(prod)));

    // ── CATÁLOGO: descuentos y carrito ────────────────────────────────────
    const CATALOGO_MIXES = [
        { id: 'compra_cerebrito', nombre: 'El Cerebrito',        precio: 4.00 },
        { id: 'compra_medida',    nombre: `A Tu Medida (${GRAMOS_POR_UNIDAD}g)`, precio: 3.50 },
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

    function actualizarBarraUnificada() {
        let catalogUnidades = 0, catalogSubtotal = 0, tieneMedida = false;
        cantidadesCatalogo.forEach((cant, id) => {
            const prod = CATALOGO_MIXES.find(p => p.id === id);
            if (prod && cant > 0) {
                catalogUnidades += cant;
                catalogSubtotal += prod.precio * cant;
                if (id === 'compra_medida') tieneMedida = true;
            }
        });

        let bolsaUnidades = 0, bolsaSubtotal = 0;
        carritoBolsa.forEach(item => {
            bolsaUnidades += item.cantidad;
            bolsaSubtotal += item.precio * item.cantidad;
        });

        const totalUnidades = catalogUnidades + bolsaUnidades;
        const hint = document.getElementById('unifiedHint');
        const bar  = document.getElementById('unifiedCartBar');

        if (totalUnidades === 0) {
            bar.style.display  = 'none';
            hint.style.display = 'block';
            return;
        }
        bar.style.display  = 'flex';
        hint.style.display = 'none';

        const countEl = document.getElementById('unifiedCartCount');
        const totalEl = document.getElementById('unifiedCartTotal');
        const promoEl = document.getElementById('unifiedPromoMsg');
        const btn     = document.getElementById('btnPedirTodo');

        countEl.textContent = `${totalUnidades} ${totalUnidades === 1 ? 'producto' : 'productos'}`;

        const descuento = catalogUnidades > 0 ? obtenerDescuento(catalogUnidades) : null;

        if (tieneMedida) {
            totalEl.textContent = '—';
            const descLabel = descuento ? ` · ${descuento.porcentaje}% off incluido` : '';
            promoEl.innerHTML = `Toca <strong>Personalizar y pedir</strong> para configurar tu A Tu Medida${descLabel} →`;
            btn.textContent = 'Personalizar y pedir →';
            btn.classList.add('btn-pulse');
        } else if (descuento) {
            const ahorro     = catalogSubtotal * (descuento.porcentaje / 100);
            const sinDesc    = catalogSubtotal + bolsaSubtotal;
            const totalFinal = sinDesc - ahorro;
            totalEl.innerHTML = `<s>S/ ${sinDesc.toFixed(2)}</s> → <strong>S/ ${totalFinal.toFixed(2)}</strong>`;
            promoEl.textContent = `🎉 ${descuento.label} en mixes · Ahorras S/ ${ahorro.toFixed(2)}`;
            btn.textContent = 'Pedir todo →';
            btn.classList.remove('btn-pulse');
        } else {
            totalEl.textContent = `S/ ${(catalogSubtotal + bolsaSubtotal).toFixed(2)}`;
            promoEl.textContent = '';
            btn.textContent = 'Pedir todo →';
            btn.classList.remove('btn-pulse');
        }
    }

    // ── MODAL UNIVERSAL DE PEDIDO ─────────────────────────────────────────
    const TAMANOS_MEDIDA = [
        { id: '50g',  nombre: null,               gramos: 50,  precio: 3.50 },
        { id: '80g',  nombre: 'Snack Rápido',      gramos: 80,  precio: 4.00 },
        { id: '120g', nombre: 'Energía Constante', gramos: 120, precio: 6.00 },
        { id: '150g', nombre: 'Para Compartir',    gramos: 150, precio: 7.00 },
    ];

    // ── FUENTE ÚNICA: poblar precios en HTML desde JS ─────────────────────
    CATALOGO_MIXES.forEach(prod => {
        const key = prod.id.replace('compra_', '');
        const el = document.getElementById(`precio_${key}`);
        if (el) el.textContent = `S/ ${prod.precio.toFixed(2)} · ${GRAMOS_POR_UNIDAD}g`;
    });
    const medidaSizesEl = document.getElementById('medidaSizes');
    if (medidaSizesEl) {
        medidaSizesEl.innerHTML = TAMANOS_MEDIDA.map(t =>
            `<span class="medida-size-chip">${t.nombre ? t.nombre + ' ' : ''}${t.gramos}g · S/ ${t.precio.toFixed(2)}</span>`
        ).join('');
    }

    const modal = {
        tipo: null, nombre: '', precio: 0, cantidad: 0,
        mixesConfig: [], pago: null,
    };

    function mostrarErrorModal(msg) {
        const el = document.getElementById('modalError');
        if (el) { el.textContent = msg; el.style.display = 'block'; }
    }

    function limpiarErrorModal() {
        const el = document.getElementById('modalError');
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    }

    function abrirModalUI() {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('selected'));
        modal.pago = null;
        limpiarErrorModal();
        document.getElementById('modalPedido').classList.add('open');
    }

    function actualizarResumenMedida() {
        const total   = modal.mixesConfig.reduce((s, m) => s + (m.tamano ? m.tamano.precio : 0), 0);
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

            const tamLabel = document.createElement('p');
            tamLabel.className = 'modal-label';
            tamLabel.textContent = 'Tamaño:';
            contenedor.appendChild(tamLabel);

            const tamGrid   = document.createElement('div');
            tamGrid.className = 'ingredient-chips';

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

            TAMANOS_MEDIDA.forEach(tam => {
                const chip = document.createElement('div');
                chip.className = 'ing-chip tamano-chip';
                chip.innerHTML = `
                    <div class="ing-chip-info">
                        <strong>${tam.nombre ?? 'A Tu Medida'}</strong>
                        <span class="ing-chip-meta">${tam.gramos}g · S/ ${tam.precio.toFixed(2)}</span>
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
        if (cantidad === 0) { mostrarErrorModal('¡Usa los botones + para añadir al menos una unidad!'); return; }
        Object.assign(modal, { tipo: 'catalogo', nombre, precio, cantidad });
        document.getElementById('modalNombre').textContent = nombre;
        document.getElementById('modalResumen').textContent = `${cantidad} unidad${cantidad > 1 ? 'es' : ''} · Total S/ ${(precio * cantidad).toFixed(2)}`;
        document.getElementById('seccionMedida').style.display = 'none';
        abrirModalUI();
    };

    window.abrirModalMedida = function(containerId) {
        const cantidad = cantidadesCatalogo.get(containerId) || 0;
        if (cantidad === 0) { mostrarErrorModal('¡Usa los botones + para añadir al menos una unidad!'); return; }
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

        const body       = document.getElementById('duoModalBody');
        body.innerHTML   = '';
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
            const grid    = document.createElement('div');
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
            const grid    = document.createElement('div');
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
        limpiarErrorModal();
    };

    window.confirmarPedido = function() {
        limpiarErrorModal();

        const tieneMedida = modal.tipo === 'medida' ||
            (modal.tipo === 'catalogo_grupal' && (cantidadesCatalogo.get('compra_medida') || 0) > 0) ||
            (modal.tipo === 'unificado'        && (cantidadesCatalogo.get('compra_medida') || 0) > 0);

        if (tieneMedida && modal.mixesConfig.length > 0) {
            if (modal.mixesConfig.some(m => !m.tamano)) {
                mostrarErrorModal(modal.cantidad === 1 ? '¡Elige un tamaño para tu mix!' : '¡Elige un tamaño para cada mix!');
                return;
            }
            if (modal.mixesConfig.some(m => m.ingredientes.size === 0)) {
                mostrarErrorModal(modal.cantidad === 1 ? '¡Elige al menos un fruto para tu mix!' : '¡Elige al menos un fruto para cada mix!');
                return;
            }
        }
        if (!modal.pago) {
            mostrarErrorModal('¡Elige cómo vas a pagar!');
            return;
        }

        let mensaje = `¡Hola Healthy Life! 🌰\nQuiero hacer un pedido:\n\n`;

        if (modal.tipo === 'catalogo_grupal') {
            let subtotal = 0, totalUnidades = 0;
            cantidadesCatalogo.forEach((cant, prodId) => {
                if (!cant) return;
                totalUnidades += cant;
                if (prodId === 'compra_medida' && modal.mixesConfig.length > 0) {
                    modal.mixesConfig.forEach((m, idx) => {
                        const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                        const ings = [...m.ingredientes].map(iid => INGREDIENTES_MEDIDA.find(i => i.id === iid).nombre).join(' · ');
                        subtotal += m.tamano.precio;
                        const label = cant > 1 ? `A Tu Medida #${idx + 1}` : 'A Tu Medida';
                        mensaje += `🔸 *${label}* ${m.tamano.gramos}g${tamLabel} · ${ings} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                    });
                } else {
                    const prod = CATALOGO_MIXES.find(p => p.id === prodId);
                    if (!prod) return;
                    subtotal += prod.precio * cant;
                    mensaje += `🔸 *${cant}x* ${prod.nombre} — S/ ${(prod.precio * cant).toFixed(2)}\n`;
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
            mensaje += `🔸 *${modal.cantidad}x* ${modal.nombre} (${GRAMOS_POR_UNIDAD}g) — S/ ${subtotal.toFixed(2)}\n`;
            mensaje += `💰 *TOTAL: S/ ${subtotal.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'medida') {
            const total = modal.mixesConfig.reduce((s, m) => s + m.tamano.precio, 0);
            if (modal.cantidad === 1) {
                const m = modal.mixesConfig[0];
                const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                const ings = [...m.ingredientes].map(id => INGREDIENTES_MEDIDA.find(i => i.id === id).nombre).join(' · ');
                mensaje += `🔸 *A Tu Medida* ${m.tamano.gramos}g${tamLabel} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                mensaje += `🍇 *Frutos:* ${ings}\n`;
            } else {
                modal.mixesConfig.forEach((m, idx) => {
                    const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                    const ings = [...m.ingredientes].map(id => INGREDIENTES_MEDIDA.find(i => i.id === id).nombre).join(' · ');
                    mensaje += `🔸 *Mix ${idx + 1}:* ${m.tamano.gramos}g${tamLabel} · ${ings} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                });
            }
            mensaje += `💰 *TOTAL: S/ ${total.toFixed(2)}*\n\n`;
        } else if (modal.tipo === 'configurador' || modal.tipo === 'unificado') {
            let subtotalMixes = 0, totalUnidadesMixes = 0;

            cantidadesCatalogo.forEach((cant, prodId) => {
                if (!cant) return;
                totalUnidadesMixes += cant;
                if (prodId === 'compra_medida' && modal.mixesConfig.length > 0) {
                    modal.mixesConfig.forEach((m, idx) => {
                        const tamLabel = m.tamano.nombre ? ` — ${m.tamano.nombre}` : '';
                        const ings = [...m.ingredientes].map(iid => INGREDIENTES_MEDIDA.find(i => i.id === iid).nombre).join(' · ');
                        subtotalMixes += m.tamano.precio;
                        const label = cant > 1 ? `A Tu Medida #${idx + 1}` : 'A Tu Medida';
                        mensaje += `🔸 *${label}* ${m.tamano.gramos}g${tamLabel} · ${ings} — S/ ${m.tamano.precio.toFixed(2)}\n`;
                    });
                } else {
                    const prod = CATALOGO_MIXES.find(p => p.id === prodId);
                    if (!prod) return;
                    subtotalMixes += prod.precio * cant;
                    mensaje += `🔸 *${cant}x* ${prod.nombre} — S/ ${(prod.precio * cant).toFixed(2)}\n`;
                }
            });

            const descuento = obtenerDescuento(totalUnidadesMixes);
            if (descuento && subtotalMixes > 0) {
                const ahorro = subtotalMixes * (descuento.porcentaje / 100);
                mensaje += `🎉 *Descuento ${descuento.porcentaje}% en mixes:* -S/ ${ahorro.toFixed(2)}\n`;
                subtotalMixes -= ahorro;
            }

            let subtotalBolsa = 0;
            if (carritoBolsa.size > 0) {
                if (totalUnidadesMixes > 0) mensaje += `\n`;
                carritoBolsa.forEach(item => {
                    const sub = item.precio * item.cantidad;
                    subtotalBolsa += sub;
                    if (item.selecciones && item.selecciones.length > 0) {
                        item.selecciones.forEach((sel, idx) => {
                            const label = item.cantidad > 1 ? `${item.nombre} #${idx + 1}` : item.nombre;
                            mensaje += `🔸 *${label}:* ${sel.join(' + ')} — S/ ${item.precio.toFixed(2)}\n`;
                        });
                    } else if (item.esGramos) {
                        mensaje += `🔸 *${item.cantidad * GRAMOS_POR_UNIDAD}g* de ${item.nombre} — S/ ${sub.toFixed(2)}\n`;
                    } else if (item.unidad) {
                        mensaje += `🔸 *${item.cantidad}x* ${item.nombre} (${item.unidad}) — S/ ${sub.toFixed(2)}\n`;
                    } else {
                        mensaje += `🔸 *${item.cantidad}x* ${item.nombre} — S/ ${sub.toFixed(2)}\n`;
                    }
                });
            }

            mensaje += `💰 *TOTAL: S/ ${(subtotalMixes + subtotalBolsa).toFixed(2)}*\n\n`;
        }

        mensaje += `💳 *Pago:* ${modal.pago}`;

        if (!isMobile) {
            mensaje = mensaje
                .replace(/🌰/g, '')
                .replace(/🔸/g, '•')
                .replace(/🎉/g, '¡')
                .replace(/💰/g, '$')
                .replace(/🍇/g, '-')
                .replace(/💳/g, '');
        }

        document.getElementById('modalPedido').classList.remove('open');
        window.open(`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
    };

    // ── BOTÓN PEDIR TODO ──────────────────────────────────────────────────
    document.getElementById('btnPedirTodo').addEventListener('click', () => {
        let catalogTotal = 0;
        cantidadesCatalogo.forEach(c => { catalogTotal += c; });
        const bolsaTotal = [...carritoBolsa.values()].reduce((a, i) => a + i.cantidad, 0);
        if (catalogTotal === 0 && bolsaTotal === 0) return;

        const medidaCantidad = cantidadesCatalogo.get('compra_medida') || 0;
        modal.tipo     = 'unificado';
        modal.cantidad = medidaCantidad;

        const totalItems = catalogTotal + bolsaTotal;
        document.getElementById('modalNombre').textContent = 'Tu pedido completo';

        if (medidaCantidad > 0) {
            document.getElementById('modalResumen').textContent =
                `Personaliza tu${medidaCantidad > 1 ? 's' : ''} A Tu Medida antes de pedir`;
            document.getElementById('seccionMedida').style.display = 'block';
            poblarMedidaConfig();
        } else {
            document.getElementById('modalResumen').textContent =
                `${totalItems} producto${totalItems > 1 ? 's' : ''} · Elige tu pago`;
            document.getElementById('seccionMedida').style.display = 'none';
        }
        abrirModalUI();
    });

    // ── HAMBURGER MENU ────────────────────────────────────────────────────
    const navToggle = document.getElementById('navToggle');
    const nav = document.querySelector('.nav');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && nav.classList.contains('nav-open')) {
                nav.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── ANIMACIONES ───────────────────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── LAZY LOADING VIDEOS ───────────────────────────────────────────────
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
