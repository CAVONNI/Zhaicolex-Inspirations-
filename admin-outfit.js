/* admin-outfit.js — agrega el modo "Outfit" al panel admin.
   Solo AÑADE: no toca el modo Perfumes ni la tabla `productos`.
   Requiere: supabase.js (window.clienteSupabase) y las tablas outfit_* de Supabase. */
   (function () {
    "use strict";
    const sb = () => window.clienteSupabase;
    const $ = (s, r = document) => r.querySelector(s);
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const toast = (m, t) => (window.showToast ? window.showToast(m, t || "success") : alert(m));
    const money = (n) => "$" + Number(n).toLocaleString("es-CO");
    const CLOUD = typeof CLOUDINARY_CLOUD !== "undefined" ? CLOUDINARY_CLOUD : "ds3crkmlw";
    const PRESET = typeof CLOUDINARY_PRESET !== "undefined" ? CLOUDINARY_PRESET : "zhaicolez_uploads";
    const CATS = ["mujer", "hombre", "deportivo", "casual", "accesorios"];
    const SIZE_SETS = { "Ropa (XS-XXL)": "XS,S,M,L,XL,XXL", "Calzado (35-43)": "35,36,37,38,39,40,41,42,43", "Pantalón (28-38)": "28,30,32,34,36,38", "Única": "Única" };
  
    let items = [], editId = null, imgs = [], vars = [], loaded = false, timer = null;
  
    const CSS = `
    .mode-bar{display:flex;gap:8px;margin-bottom:24px}
    .mode-btn{padding:10px 24px;border:1px solid var(--gray-5);background:#fff;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;letter-spacing:.5px}
    .mode-btn.active{background:var(--black);color:#fff;border-color:var(--black)}
    #outfit-panel{display:none}
    #outfit-panel textarea{width:100%;padding:10px 13px;border:1px solid var(--gray-5);border-radius:6px;font-size:13px;font-family:inherit;min-height:70px;resize:vertical;outline:none}
    #outfit-panel .form-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .o-imgs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
    .o-img{position:relative;width:72px;height:72px;border:1px solid var(--gray-5);border-radius:6px;background:var(--gray-6);overflow:hidden}
    .o-img img{width:100%;height:100%;object-fit:contain}
    .o-img button{position:absolute;top:2px;right:2px;background:rgba(0,0,0,.7);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:11px;cursor:pointer;line-height:1}
    .o-img span{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.65);color:#fff;font-size:9px;text-align:center}
    .o-checks{display:flex;gap:20px;margin-bottom:16px;font-size:13px}
    .o-checks label{display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;font-weight:500;margin:0}
    .o-checks input{width:auto}
    .var-row{display:grid;grid-template-columns:1fr 1fr 80px 28px;gap:8px;margin-bottom:6px}
    .var-row input{margin:0}
    .o-mini{background:none;border:1px dashed var(--gray-4);color:var(--gray-3);padding:7px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-family:inherit}
    .o-mini:hover{border-color:var(--black);color:var(--black)}
    .o-sec{font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--gray-2);margin:18px 0 8px}
    .o-off{color:var(--danger);font-size:12px}
    .st-on{background:#d1fae5;color:#065f46}.st-off{background:#fee2e2;color:#991b1b}`;
  
    function html() {
      return `
      <div class="panel-grid">
        <div class="card">
          <div class="card-header"><div class="card-title" id="o-title">Agregar producto Outfit</div></div>
          <div class="card-body">
            <div class="o-sec" style="margin-top:0">Fotos (la primera es la principal)</div>
            <div class="o-imgs" id="o-imgs"></div>
            <input type="file" id="o-file" accept="image/*" multiple style="display:none" />
            <button class="o-mini" id="o-up">📁 Subir fotos</button> <span id="o-upmsg" style="font-size:12px;color:var(--gray-3)"></span>
            <div class="form-row" style="margin-top:16px">
              <div class="form-group"><label>Nombre</label><input id="o-nombre" maxlength="160" /></div>
              <div class="form-group"><label>Marca</label><input id="o-marca" value="Zhaicolex" maxlength="80" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Categoría</label><select id="o-cat">${CATS.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join("")}</select></div>
              <div class="form-group"><label>Subcategoría</label><input id="o-sub" list="o-sublist" placeholder="Ej: vestido, buzo, jean" maxlength="60" /><datalist id="o-sublist">${["vestido", "blusa", "falda", "jean", "pantalón", "short", "enterizo", "conjunto", "buzo", "saco", "chaqueta", "camisa", "camiseta", "polo", "tenis", "gorra", "bolso"].map((s) => `<option value="${s}">`).join("")}</datalist></div>
            </div>
            <div class="form-group"><label>Descripción</label><textarea id="o-desc" maxlength="1000"></textarea></div>
            <div class="o-sec">Precio</div>
            <div class="form-row3">
              <div class="form-group"><label>Costo proveedor (privado)</label><input type="number" id="o-costo" min="0" /></div>
              <div class="form-group"><label>Envío</label><input type="number" id="o-envio" value="20000" min="0" /></div>
              <div class="form-group"><label>Margen %</label><input type="number" id="o-margen" value="15" min="0" step="0.5" /></div>
            </div>
            <button class="o-mini" id="o-calc" style="margin-bottom:14px">🧮 Calcular precio de venta</button>
            <div class="form-row">
              <div class="form-group"><label>Precio de venta</label><input type="number" id="o-precio" min="1" /></div>
              <div class="form-group"><label>Precio oferta (opcional)</label><input type="number" id="o-oferta" min="1" /></div>
            </div>
            <div class="o-checks">
              <label><input type="checkbox" id="o-activo" checked /> Activo (visible en la tienda)</label>
              <label><input type="checkbox" id="o-dest" /> Destacado</label>
            </div>
            <div class="form-group"><label>ID de Dropi (opcional)</label><input type="number" id="o-dropi" min="1" /></div>
            <div class="o-sec">Variantes: talla, color y stock</div>
            <div class="form-row">
              <div class="form-group"><label>Tallas (separadas por coma)</label><input id="o-tallas" placeholder="S,M,L" /></div>
              <div class="form-group"><label>Colores (separados por coma)</label><input id="o-colores" placeholder="Negro,Blanco" /></div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
              ${Object.entries(SIZE_SETS).map(([k, v]) => `<button class="o-mini" data-set="${esc(v)}">${esc(k)}</button>`).join("")}
            </div>
            <button class="o-mini" id="o-gen" style="margin-bottom:12px">⚡ Generar combinaciones</button>
            <div id="o-vars"></div>
            <button class="o-mini" id="o-addvar">+ Agregar variante</button>
            <input type="hidden" id="o-id" />
            <button class="btn-submit" id="o-save" style="margin-top:22px">Guardar producto</button>
            <button class="btn-cancel" id="o-cancel" style="display:none">Cancelar edición</button>
          </div>
        </div>
        <div class="card">
          <div class="toolbar">
            <input class="search-input" id="o-search" placeholder="Buscar producto Outfit..." />
            <select class="filter-select" id="o-filtercat"><option value="">Todas las categorías</option>${CATS.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join("")}</select>
          </div>
          <div style="overflow-x:auto">
            <table class="products-table"><thead><tr><th>Imagen</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="o-tbody"></tbody></table>
            <div class="empty-state" id="o-empty" style="display:none"><div style="font-size:36px">👗</div><p>No hay productos Outfit con ese filtro.</p></div>
          </div>
        </div>
      </div>`;
    }
  
    // ---------- Imágenes ----------
    function renderImgs() {
      $("#o-imgs").innerHTML = imgs.map((u, i) => `<div class="o-img"><img src="${esc(u)}" alt="" />${i === 0 ? "<span>Principal</span>" : ""}<button data-rm="${i}" title="Quitar">×</button></div>`).join("");
    }
    async function subir(file) {
      const fd = new FormData();
      fd.append("file", file); fd.append("upload_preset", PRESET); fd.append("folder", "zhaicolez");
      const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "Error al subir");
      return d.secure_url;
    }
    async function onFiles(files) {
      const list = [...files].filter((f) => f.type.startsWith("image/") && f.size <= 8 * 1024 * 1024).slice(0, 8 - imgs.length);
      if (!list.length) return toast("Selecciona imágenes de hasta 8 MB (máx. 8 fotos)", "error");
      let n = 0;
      for (const f of list) {
        $("#o-upmsg").textContent = `Subiendo ${++n} de ${list.length}...`;
        try { imgs.push(await subir(f)); renderImgs(); } catch (e) { toast("❌ " + e.message, "error"); }
      }
      $("#o-upmsg").textContent = "";
    }
  
    // ---------- Variantes ----------
    function renderVars() {
      $("#o-vars").innerHTML = vars.map((v, i) => `<div class="var-row">
        <input data-v="talla" data-i="${i}" value="${esc(v.talla)}" placeholder="Talla" maxlength="20" />
        <input data-v="color" data-i="${i}" value="${esc(v.color)}" placeholder="Color" maxlength="30" />
        <input data-v="stock" data-i="${i}" type="number" min="0" value="${Number(v.stock) || 0}" />
        <button class="btn-remove-precio" data-rv="${i}">×</button></div>`).join("") || '<p style="font-size:12px;color:var(--gray-4);margin-bottom:8px">Sin variantes todavía.</p>';
    }
    function generar() {
      const split = (s) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))];
      const tallas = split($("#o-tallas").value), colores = split($("#o-colores").value);
      if (!tallas.length) return toast("Escribe al menos una talla", "error");
      const cols = colores.length ? colores : [""];
      tallas.forEach((t) => cols.forEach((c) => {
        if (!vars.some((v) => v.talla.toLowerCase() === t.toLowerCase() && v.color.toLowerCase() === c.toLowerCase())) vars.push({ talla: t, color: c, stock: 0 });
      }));
      renderVars();
    }
  
    // ---------- Formulario ----------
    function reset() {
      editId = null; imgs = []; vars = [];
      ["nombre", "sub", "desc", "costo", "precio", "oferta", "dropi", "tallas", "colores"].forEach((k) => ($("#o-" + k).value = ""));
      $("#o-marca").value = "Zhaicolex"; $("#o-cat").value = "mujer"; $("#o-envio").value = 20000; $("#o-margen").value = 15;
      $("#o-activo").checked = true; $("#o-dest").checked = false;
      $("#o-title").textContent = "Agregar producto Outfit"; $("#o-save").textContent = "Guardar producto";
      $("#o-save").classList.remove("editing"); $("#o-cancel").style.display = "none";
      renderImgs(); renderVars();
    }
    async function editar(id) {
      const p = items.find((x) => x.id === id); if (!p) return;
      reset(); editId = id;
      $("#o-nombre").value = p.nombre; $("#o-marca").value = p.marca; $("#o-cat").value = p.categoria; $("#o-sub").value = p.subcategoria || "";
      $("#o-desc").value = p.descripcion || ""; $("#o-precio").value = p.precio; $("#o-oferta").value = p.precio_oferta || "";
      $("#o-activo").checked = !!p.activo; $("#o-dest").checked = !!p.destacado; $("#o-dropi").value = p.dropi_id || "";
      imgs = Array.isArray(p.imagenes) ? [...p.imagenes] : [];
      vars = (p.outfit_variantes || []).map((v) => ({ id: v.id, talla: v.talla, color: v.color, stock: v.stock }));
      const { data: c } = await sb().from("outfit_costos").select("*").eq("producto_id", id).maybeSingle();
      if (c) { $("#o-costo").value = c.costo; $("#o-envio").value = c.envio; $("#o-margen").value = c.margen; }
      $("#o-title").textContent = "Editando: " + p.nombre; $("#o-save").textContent = "Guardar cambios";
      $("#o-save").classList.add("editing"); $("#o-cancel").style.display = "block";
      renderImgs(); renderVars(); window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function calcular() {
      const c = parseFloat($("#o-costo").value), e = parseFloat($("#o-envio").value) || 0, m = parseFloat($("#o-margen").value) || 0;
      if (!(c >= 0)) return toast("Escribe el costo del proveedor", "error");
      $("#o-precio").value = Math.ceil(((c + e) * (1 + m / 100)) / 1000) * 1000;
    }
    function leer() {
      const nombre = $("#o-nombre").value.trim(), precio = parseInt($("#o-precio").value, 10);
      const oferta = $("#o-oferta").value ? parseInt($("#o-oferta").value, 10) : null;
      if (nombre.length < 2) throw new Error("El nombre es obligatorio");
      if (!CATS.includes($("#o-cat").value)) throw new Error("Categoría no válida");
      if (!(precio > 0)) throw new Error("Escribe el precio de venta");
      if (oferta !== null && !(oferta > 0 && oferta < precio)) throw new Error("La oferta debe ser menor al precio");
      if (!imgs.length) throw new Error("Sube al menos una foto");
      if (!vars.length) throw new Error("Agrega al menos una variante");
      const seen = new Set();
      for (const v of vars) {
        v.talla = String(v.talla).trim() || "Única"; v.color = String(v.color).trim(); v.stock = Math.max(0, parseInt(v.stock, 10) || 0);
        const k = v.talla.toLowerCase() + "|" + v.color.toLowerCase();
        if (seen.has(k)) throw new Error(`Variante repetida: ${v.talla} ${v.color}`);
        seen.add(k);
      }
      const costo = $("#o-costo").value === "" ? null : parseInt($("#o-costo").value, 10);
      return {
        row: { nombre, marca: $("#o-marca").value.trim() || "Zhaicolex", categoria: $("#o-cat").value, subcategoria: $("#o-sub").value.trim() || null,
          descripcion: $("#o-desc").value.trim(), precio, precio_oferta: oferta, imagenes: imgs, activo: $("#o-activo").checked, destacado: $("#o-dest").checked,
          dropi_id: $("#o-dropi").value ? parseInt($("#o-dropi").value, 10) : null },
        costo: costo === null ? null : { costo, envio: parseInt($("#o-envio").value, 10) || 0, margen: parseFloat($("#o-margen").value) || 0 },
      };
    }
    async function guardar() {
      const btn = $("#o-save");
      try {
        const { row, costo } = leer();
        btn.disabled = true;
        let pid = editId, r;
        if (editId) r = await sb().from("outfit_productos").update(row).eq("id", editId);
        else { r = await sb().from("outfit_productos").insert(row).select("id").single(); pid = r.data?.id; }
        if (r.error) throw r.error;
        if (costo) { r = await sb().from("outfit_costos").upsert({ producto_id: pid, ...costo }, { onConflict: "producto_id" }); if (r.error) throw r.error; }
        const keep = vars.filter((v) => v.id).map((v) => v.id);
        const old = (items.find((p) => p.id === editId)?.outfit_variantes || []).map((v) => v.id).filter((i) => !keep.includes(i));
        if (old.length) { r = await sb().from("outfit_variantes").delete().in("id", old); if (r.error) throw r.error; }
        for (const v of vars.filter((v) => v.id)) {
          r = await sb().from("outfit_variantes").update({ talla: v.talla, color: v.color, stock: v.stock }).eq("id", v.id); if (r.error) throw r.error;
        }
        const nuevas = vars.filter((v) => !v.id).map((v) => ({ producto_id: pid, talla: v.talla, color: v.color, stock: v.stock }));
        if (nuevas.length) { r = await sb().from("outfit_variantes").insert(nuevas); if (r.error) throw r.error; }
        toast(editId ? "✅ Producto actualizado" : "✅ Producto agregado");
        reset(); await cargar();
      } catch (e) {
        toast("❌ " + (e.message || e), "error");
      } finally { btn.disabled = false; }
    }
  
    // ---------- Tabla ----------
    async function cargar() {
      const { data, error } = await sb().from("outfit_productos").select("*, outfit_variantes(*)").order("creado_en", { ascending: false });
      if (error) return toast("Error al cargar Outfit: " + error.message, "error");
      items = data || []; loaded = true; tabla();
    }
    function tabla() {
      const q = $("#o-search").value.toLowerCase().trim(), c = $("#o-filtercat").value;
      const lista = items.filter((p) => (!c || p.categoria === c) && (!q || (p.nombre + " " + p.marca).toLowerCase().includes(q)));
      $("#o-empty").style.display = lista.length ? "none" : "block";
      $("#o-tbody").innerHTML = lista.map((p) => {
        const stock = (p.outfit_variantes || []).reduce((s, v) => s + v.stock, 0);
        const img = p.imagenes?.[0] ? `<img src="${esc(p.imagenes[0])}" class="prod-thumb" />` : "";
        const badge = p.categoria === "mujer" ? "badge-mujer" : p.categoria === "hombre" ? "badge-hombre" : "badge-unisex";
        return `<tr><td>${img}</td>
          <td><div class="prod-name">${esc(p.nombre)}</div><div class="prod-brand">${esc(p.marca)} · ${(p.outfit_variantes || []).length} variantes</div></td>
          <td><span class="badge ${badge}">${esc(p.categoria)}</span></td>
          <td>${p.precio_oferta ? `<s style="color:var(--gray-4)">${money(p.precio)}</s><br><b>${money(p.precio_oferta)}</b>` : money(p.precio)}</td>
          <td>${stock > 0 ? stock : '<span class="o-off">Agotado</span>'}</td>
          <td><button class="btn-edit" data-act="${p.activo ? "off" : "on"}" data-id="${p.id}" style="padding:4px 10px"><span class="badge ${p.activo ? "st-on" : "st-off"}">${p.activo ? "Activo" : "Inactivo"}</span></button></td>
          <td><div class="action-btns"><button class="btn-edit" data-act="edit" data-id="${p.id}">Editar</button><button class="btn-delete" data-act="del" data-id="${p.id}">Eliminar</button></div></td></tr>`;
      }).join("");
    }
    async function accion(act, id) {
      const p = items.find((x) => x.id === id); if (!p) return;
      if (act === "edit") return editar(id);
      if (act === "del") {
        if (!confirm(`¿Eliminar "${p.nombre}"? Se borran también sus variantes y no se puede deshacer.`)) return;
        const { error } = await sb().from("outfit_productos").delete().eq("id", id);
        if (error) return toast("❌ " + error.message, "error");
        toast("Producto eliminado"); return cargar();
      }
      const { error } = await sb().from("outfit_productos").update({ activo: act === "on" }).eq("id", id);
      if (error) return toast("❌ " + error.message, "error");
      cargar();
    }
  
    // ---------- Modo ----------
    function setMode(m) {
      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.m === m));
      const out = m === "outfit";
      document.querySelectorAll(".main > .stats-row, .main > .panel-grid").forEach((e) => (e.style.display = out ? "none" : ""));
      $("#outfit-panel").style.display = out ? "block" : "none";
      try { sessionStorage.setItem("adminModo", m); } catch (e) {}
      if (out && !loaded) cargar();
    }
  
    function init() {
      const main = $(".main"); if (!main) return;
      const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      const bar = document.createElement("div"); bar.className = "mode-bar";
      bar.innerHTML = '<button class="mode-btn active" data-m="perfumes">🧴 Perfumes</button><button class="mode-btn" data-m="outfit">👗 Outfit</button>';
      const panel = document.createElement("div"); panel.id = "outfit-panel"; panel.innerHTML = html();
      main.prepend(bar); bar.after(panel);
      bar.addEventListener("click", (e) => { const b = e.target.closest(".mode-btn"); if (b) setMode(b.dataset.m); });
      $("#o-up").onclick = () => $("#o-file").click();
      $("#o-file").onchange = (e) => { onFiles(e.target.files); e.target.value = ""; };
      $("#o-imgs").onclick = (e) => { const i = e.target.dataset.rm; if (i !== undefined) { imgs.splice(+i, 1); renderImgs(); } };
      $("#o-vars").oninput = (e) => { const t = e.target; if (t.dataset.v) vars[+t.dataset.i][t.dataset.v] = t.value; };
      $("#o-vars").onclick = (e) => { const i = e.target.dataset.rv; if (i !== undefined) { vars.splice(+i, 1); renderVars(); } };
      panel.querySelectorAll("[data-set]").forEach((b) => (b.onclick = () => ($("#o-tallas").value = b.dataset.set)));
      $("#o-gen").onclick = generar;
      $("#o-addvar").onclick = () => { vars.push({ talla: "", color: "", stock: 0 }); renderVars(); };
      $("#o-calc").onclick = calcular;
      $("#o-save").onclick = guardar;
      $("#o-cancel").onclick = reset;
      $("#o-search").oninput = tabla; $("#o-filtercat").onchange = tabla;
      $("#o-tbody").onclick = (e) => { const b = e.target.closest("[data-act]"); if (b) accion(b.dataset.act, b.dataset.id); };
      reset();
      try {
        sb().channel("outfit-admin")
          .on("postgres_changes", { event: "*", schema: "public", table: "outfit_productos" }, () => { clearTimeout(timer); timer = setTimeout(() => loaded && cargar(), 400); })
          .on("postgres_changes", { event: "*", schema: "public", table: "outfit_variantes" }, () => { clearTimeout(timer); timer = setTimeout(() => loaded && cargar(), 400); })
          .subscribe();
      } catch (e) { console.warn("Realtime Outfit no disponible", e); }
      if (sessionStorage.getItem("adminModo") === "outfit") setMode("outfit");
    }
  
    document.addEventListener("DOMContentLoaded", () => { try { init(); } catch (e) { console.error("admin-outfit:", e); } });
  })();