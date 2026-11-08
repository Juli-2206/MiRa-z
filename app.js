/* MiRaíz — prototipo navegable (maquetación HTML/CSS + interacción simulada).
   No hay backend: los datos viven en memoria para validar estructura y navegación. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n) => "$ " + Number(n).toLocaleString("es-CO");
  // Mejora v3 #1: acepta el celular con espacios, guiones o +57
  const soloCel = (v) => { let d = String(v).replace(/\D/g, ""); if (d.length === 12 && d.startsWith("57")) d = d.slice(2); return d; };
  // Mejora v3 #2: acepta el precio con o sin puntos de miles
  const soloNum = (v) => String(v).replace(/\D/g, "");
  const miles = (v) => (soloNum(v) ? Number(soloNum(v)).toLocaleString("es-CO") : "");

  /* ---------------- Iconos (trazos 24×24) ---------------- */
  const ICONOS = {
    inicio: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    campana: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    lugar: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    telefono: '<path d="M5 4h3.5l2 5-2.4 1.6a11 11 0 0 0 5.3 5.3L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mensaje: '<path d="M21 12a8 8 0 0 1-11.7 7.1L4 21l1.9-5.3A8 8 0 1 1 21 12z"/>',
    editar: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-4-4L4 16z"/><path d="m14 6 4 4"/>',
    borrar: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    ojoNo: '<path d="M3 3l18 18M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    atras: '<path d="m15 5-7 7 7 7"/>',
    reporte: '<path d="M5 20V11M12 20V5M19 20v-8"/>',
    salir: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    corazon: '<path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z"/>',
    hoja: '<path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z"/><path d="m5 19 8-8"/>',
    copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    lista: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    canasta: '<path d="M3 10h18l-2 10H5z"/><path d="m8 10 4-6 4 6"/>',
  };
  const ic = (n, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n]}</svg>`;

  /* ---------------- Ilustraciones de producto (sustituyen fotos) ---------------- */
  let semilla = 7;
  const rnd = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
  const DIBUJO = {
    tomate: ["#FBE3DC", (x, y) => `<circle cx="${x - 30}" cy="${y + 14}" r="34" fill="#C62F24"/><circle cx="${x + 22}" cy="${y + 4}" r="42" fill="#DA3A2C"/>
      <ellipse cx="${x + 6}" cy="${y - 14}" rx="12" ry="7" fill="#F28B7B" opacity=".75"/><ellipse cx="${x - 42}" cy="${y + 2}" rx="8" ry="5" fill="#F28B7B" opacity=".7"/>
      <path d="M${x + 22} ${y - 40} l-16 -6 l11 12 l-17 5 l19 2 l-3 13 l10 -12 l11 9 l-5 -14 l15 -4 l-16 -3 z" fill="#2F7A3A"/>`],
    mora: ["#ECE3F1", (x, y) => {
      let s = `<path d="M${x + 6} ${y - 52} q40 -10 50 22 q-36 8 -50 -22z" fill="#3F8A4A"/>`;
      [[x - 22, y + 6], [x + 26, y + 14]].forEach(([cx, cy]) => {
        for (let r = -3; r <= 3; r++) for (let c = -2; c <= 2; c++) {
          const px = cx + c * 11 + (r % 2 ? 5 : 0), py = cy + r * 10;
          if (((px - cx) / 28) ** 2 + ((py - cy) / 34) ** 2 <= 1) s += `<circle cx="${px}" cy="${py}" r="7" fill="#3B1D45"/><circle cx="${px - 2}" cy="${py - 2}" r="2" fill="#8E5FA0"/>`;
        }
      });
      return s;
    }],
    aguacate: ["#E5F0DC", (x, y) => `<g transform="rotate(-18 ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="48" ry="62" fill="#2E4A1E"/><ellipse cx="${x}" cy="${y}" rx="41" ry="55" fill="#CFE08C"/>
      <ellipse cx="${x}" cy="${y + 4}" rx="30" ry="40" fill="#E7EFB3"/><circle cx="${x}" cy="${y + 12}" r="21" fill="#7A4A26"/><circle cx="${x - 6}" cy="${y + 6}" r="6" fill="#A06A3E"/></g>`],
    platano: ["#FFF4CC", (x, y) => [0, 1, 2].map((i) => `<path d="M${x - 58 + i * 8} ${y - 30 + i * 18} Q${x - 10} ${y + 44 + i * 10} ${x + 56} ${y - 26 + i * 16}" stroke="#E8B620" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M${x - 58 + i * 8} ${y - 30 + i * 18} Q${x - 10} ${y + 44 + i * 10} ${x + 56} ${y - 26 + i * 16}" stroke="#F7D35A" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("") + `<rect x="${x + 50}" y="${y - 44}" width="14" height="22" rx="4" fill="#5C6B2E"/>`],
    papa: ["#F1E6D6", (x, y) => {
      let s = ""; semilla = 11;
      [[-40, 20], [0, 26], [40, 20], [-20, -8], [22, -6], [0, -32], [-52, -10], [52, -12]].forEach(([dx, dy]) => {
        s += `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${19 + rnd() * 5}" ry="${16 + rnd() * 4}" fill="#E3B348" stroke="#B9862A" stroke-width="2"/><circle cx="${x + dx - 5}" cy="${y + dy - 3}" r="1.8" fill="#9C6D1C"/><circle cx="${x + dx + 6}" cy="${y + dy + 4}" r="1.6" fill="#9C6D1C"/>`;
      });
      return s;
    }],
    lechuga: ["#E3F0E6", (x, y) => `<circle cx="${x}" cy="${y}" r="62" fill="#5E9E3A"/><circle cx="${x - 8}" cy="${y - 4}" r="48" fill="#86BE4E"/><circle cx="${x + 4}" cy="${y + 2}" r="34" fill="#AED572"/>
      <circle cx="${x}" cy="${y}" r="18" fill="#D4EBA0"/><path d="M${x} ${y} L${x - 40} ${y - 30} M${x} ${y} L${x + 44} ${y - 18} M${x} ${y} L${x - 20} ${y + 46} M${x} ${y} L${x + 30} ${y + 40}" stroke="#E8F5C8" stroke-width="3" fill="none"/>`],
    girasol: ["#E8F1F8", (x, y) => [[x - 40, y - 10, 30], [x + 30, y - 30, 34], [x + 20, y + 34, 26]].map(([cx, cy, r]) => {
      let p = `<path d="M${cx} ${cy + r} L${cx - 6} ${y + 120}" stroke="#4E8A3A" stroke-width="5"/>`;
      for (let a = 0; a < 360; a += 30) p += `<ellipse cx="${cx}" cy="${cy - r * 0.8}" rx="${r * 0.28}" ry="${r * 0.55}" fill="#F5BE1B" transform="rotate(${a} ${cx} ${cy})"/>`;
      return p + `<circle cx="${cx}" cy="${cy}" r="${r * 0.48}" fill="#6B3E14"/><circle cx="${cx - 3}" cy="${cy - 3}" r="${r * 0.2}" fill="#8A5524"/>`;
    }).join("")],
    rosas: ["#FDEFF3", (x, y) => [[x - 36, y - 6], [x + 30, y - 20], [x + 4, y + 30]].map(([cx, cy]) => `<path d="M${cx} ${cy + 22} L${x} ${y + 120}" stroke="#3F7A3A" stroke-width="5"/>
      <circle cx="${cx}" cy="${cy}" r="26" fill="#B81E3A"/><path d="M${cx - 14} ${cy + 4} a14 14 0 0 1 26 -6 a9 9 0 0 1 -16 6 a5 5 0 0 1 9 -3" stroke="#7E0F24" stroke-width="3" fill="none"/>`).join("")],
    abono: ["#EFE6DA", (x, y) => `<ellipse cx="${x}" cy="${y + 66}" rx="78" ry="12" fill="#5B3A1E" opacity=".35"/><path d="M${x - 50} ${y - 46} Q${x} ${y - 62} ${x + 50} ${y - 46} L${x + 58} ${y + 58} Q${x} ${y + 70} ${x - 58} ${y + 58} Z" fill="#A47B4F"/>
      <path d="M${x - 50} ${y - 46} Q${x} ${y - 30} ${x + 50} ${y - 46}" stroke="#7D5A35" stroke-width="4" fill="none"/><rect x="${x - 34}" y="${y - 14}" width="68" height="46" rx="6" fill="#F3E8DA"/>
      <path d="M${x - 12} ${y + 20}c0-16 10-24 24-24 0 16-10 24-24 24z" fill="#3F8A4A"/>`],
    frijol: ["#F5EEE6", (x, y) => {
      let s = ""; semilla = 5;
      for (let i = 0; i < 16; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * 52, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * 0.8, rot = rnd() * 180;
        s += `<g transform="rotate(${rot} ${bx} ${by})"><ellipse cx="${bx}" cy="${by}" rx="16" ry="10" fill="#EAD9C6" stroke="#B79C80" stroke-width="1.5"/><ellipse cx="${bx - 5}" cy="${by - 2}" rx="5" ry="3" fill="#A3263A"/><ellipse cx="${bx + 6}" cy="${by + 3}" rx="4" ry="2.5" fill="#A3263A"/></g>`;
      }
      return s;
    }],
    cebolla: ["#F4E6EE", (x, y) => [[x - 30, y + 10, 40], [x + 32, y + 16, 34]].map(([cx, cy, r]) => `<path d="M${cx} ${cy - r - 26} q-4 14 0 22" stroke="#6A9A3A" stroke-width="5" fill="none"/>
      <path d="M${cx} ${cy - r - 4} C${cx + r * 1.2} ${cy - r * 0.6} ${cx + r * 1.1} ${cy + r} ${cx} ${cy + r} C${cx - r * 1.1} ${cy + r} ${cx - r * 1.2} ${cy - r * 0.6} ${cx} ${cy - r - 4}z" fill="#8B2F6B"/>
      <path d="M${cx} ${cy - r} C${cx + r * 0.5} ${cy - r * 0.4} ${cx + r * 0.5} ${cy + r * 0.8} ${cx} ${cy + r}" stroke="#C26AA0" stroke-width="2.5" fill="none"/>`).join("")],
    mango: ["#FFF0D9", (x, y) => `<g transform="rotate(25 ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="50" ry="64" fill="#F2A230"/><ellipse cx="${x + 14}" cy="${y - 16}" rx="30" ry="38" fill="#E4572E" opacity=".75"/>
      <ellipse cx="${x - 18}" cy="${y - 22}" rx="9" ry="14" fill="#FFD27A" opacity=".8"/><path d="M${x} ${y - 64} q20 -22 46 -14 q-20 20 -46 14z" fill="#3F8A4A"/></g>`],
  };
  function arte(tipo, ratio = 1, etiqueta = "") {
    const [bg, f] = DIBUJO[tipo] || DIBUJO.tomate;
    const h = Math.round(200 * ratio);
    return `<svg class="arte" viewBox="0 0 200 ${h}" role="img" aria-label="${esc(etiqueta)}" preserveAspectRatio="xMidYMid slice"><rect width="200" height="${h}" fill="${bg}"/>${f(100, h / 2)}</svg>`;
  }
  function foto(p, ratio) { return p.foto ? `<img class="arte" src="${p.foto}" alt="Foto de ${esc(p.nombre)}" loading="lazy" decoding="async" style="width:100%;aspect-ratio:200/${Math.round(200 * ratio)};object-fit:cover;display:block">` : arte(p.arte, ratio, "Foto de " + p.nombre); }

  /* ---------------- Datos de ejemplo ---------------- */
  const CATEGORIAS = ["Frutas", "Hortalizas", "Verduras", "Flores", "Cárnicos", "Abonos y fertilizantes"];
  const MUNICIPIOS = ["Fusagasugá", "Silvania", "Arbeláez", "Pasca", "Tibacuy"];
  const ARTE_POR_CAT = { Frutas: "mango", Hortalizas: "tomate", Verduras: "papa", Flores: "girasol", "Cárnicos": "frijol", "Abonos y fertilizantes": "abono" };
  const AGRI = {
    alirio: { nombre: "Alirio Rojas", corto: "Don Alirio", ini: "AR", mun: "Fusagasugá", vereda: "Vereda La Aguadita", tel: "310 456 7821", bio: "Cultivo tomate, fríjol y mora sin químicos desde hace 25 años." },
    marleny: { nombre: "Marleny Cárdenas", corto: "Doña Marleny", ini: "MC", mun: "Silvania", vereda: "Vereda Victoria", tel: "312 778 0943", bio: "Huerta familiar de hortalizas y flores de corte." },
    rosa: { nombre: "Rosa Pinzón", corto: "Doña Rosa", ini: "RP", mun: "Arbeláez", vereda: "Vereda San Patricio", tel: "313 220 5617", bio: "Frutales y plátano en clima templado." },
    hernan: { nombre: "Hernán Ruiz", corto: "Don Hernán", ini: "HR", mun: "Pasca", vereda: "Vereda Juan XXIII", tel: "311 908 3345", bio: "Papa criolla y abonos orgánicos de lombricultura." },
  };
  const P = [
    { id: 1, nombre: "Tomate chonto orgánico", cat: "Hortalizas", precio: 3500, unidad: "kg", mun: "Fusagasugá", agri: "alirio", estado: "venta", arte: "tomate", r: 1.15, dias: 2, int: 6, vis: 74, desc: "Tomate maduro, cosechado esta semana. Cultivado sin agroquímicos. Disponibles 40 kg." },
    { id: 2, nombre: "Mora de castilla", cat: "Frutas", precio: 6000, unidad: "kg", mun: "Fusagasugá", agri: "alirio", estado: "venta", arte: "mora", r: 1.3, dias: 1, int: 4, vis: 52, desc: "Mora dulce y firme, ideal para jugos y mermeladas. Se entrega en canastilla." },
    { id: 3, nombre: "Aguacate Hass", cat: "Frutas", precio: 2500, unidad: "unidad", mun: "Silvania", agri: "marleny", estado: "venta", arte: "aguacate", r: 1.0, dias: 3, int: 9, vis: 120, desc: "Aguacate de buen tamaño, listo para consumir en 2 o 3 días." },
    { id: 4, nombre: "Plátano hartón", cat: "Verduras", precio: 2000, unidad: "kg", mun: "Arbeláez", agri: "rosa", estado: "venta", arte: "platano", r: 0.95, dias: 4, int: 3, vis: 41, desc: "Plátano verde y pintón. Se vende por kilo o por racimo completo." },
    { id: 5, nombre: "Papa criolla", cat: "Verduras", precio: 4200, unidad: "kg", mun: "Pasca", agri: "hernan", estado: "venta", arte: "papa", r: 1.2, dias: 2, int: 5, vis: 66, desc: "Papa criolla lavada y seleccionada, tamaño parejo." },
    { id: 6, nombre: "Lechuga crespa", cat: "Hortalizas", precio: 1500, unidad: "unidad", mun: "Silvania", agri: "marleny", estado: "venta", arte: "lechuga", r: 1.05, dias: 0, int: 2, vis: 23, desc: "Lechuga de invernadero, cosechada el mismo día de la entrega." },
    { id: 7, nombre: "Ramo de girasoles (10 tallos)", cat: "Flores", precio: 15000, unidad: "unidad", mun: "Arbeláez", agri: "rosa", estado: "venta", arte: "girasol", r: 1.35, dias: 5, int: 2, vis: 35, desc: "Girasoles de tallo largo para decoración o eventos." },
    { id: 8, nombre: "Lombricompost (bulto 25 kg)", cat: "Abonos y fertilizantes", precio: 18000, unidad: "unidad", mun: "Tibacuy", agri: "hernan", estado: "venta", arte: "abono", r: 1.1, dias: 6, int: 1, vis: 19, desc: "Abono orgánico de lombriz roja californiana, cernido y seco." },
    { id: 9, nombre: "Fríjol cargamanto", cat: "Hortalizas", precio: 7000, unidad: "kg", mun: "Fusagasugá", agri: "alirio", estado: "venta", arte: "frijol", r: 1.0, dias: 6, int: 2, vis: 38, desc: "Fríjol rojo moteado, seco y limpio. Cosecha del mes pasado." },
    { id: 10, nombre: "Mango tommy", cat: "Frutas", precio: 3000, unidad: "kg", mun: "Tibacuy", agri: "rosa", estado: "venta", arte: "mango", r: 1.25, dias: 1, int: 4, vis: 57, desc: "Mango maduro de árbol, dulce y sin fibra." },
    { id: 11, nombre: "Cebolla cabezona roja", cat: "Hortalizas", precio: 2800, unidad: "kg", mun: "Fusagasugá", agri: "alirio", estado: "exhibicion", arte: "cebolla", r: 1.1, dias: 8, int: 0, vis: 22, desc: "Próxima cosecha a mediados de diciembre. Puedes preguntar por cantidades." },
    { id: 12, nombre: "Rosas rojas (docena)", cat: "Flores", precio: 20000, unidad: "unidad", mun: "Silvania", agri: "marleny", estado: "venta", arte: "rosas", r: 1.15, dias: 3, int: 3, vis: 44, desc: "Rosas de corte, botón grande, duración de 8 a 10 días." },
  ];
  const COMENT = {
    1: [
      { q: "Laura Gómez", ini: "LG", t: "¿Tiene disponibilidad de 5 kilos para el sábado?", c: "Ayer" },
      { q: "Don Alirio", ini: "AR", t: "Sí señora, para el sábado le tengo los 5 kilos. Llámeme y cuadramos la entrega.", c: "Ayer", resp: true },
      { q: "Camilo Prieto", ini: "CP", t: "Se ven muy buenos. ¿Hace envíos a Bogotá?", c: "Hace 3 h" },
    ],
    2: [{ q: "Camilo Prieto", ini: "CP", t: "¿La mora es más para jugo o para mermelada?", c: "Hace 1 h" }],
    3: [{ q: "Andrea Molina", ini: "AM", t: "¿Cuántos tiene disponibles?", c: "Hace 2 días" }],
  };
  const AVISOS = [
    { tipo: "interes", q: "Laura Gómez", p: 1, c: "Hace 10 min", nuevo: true },
    { tipo: "coment", q: "Camilo Prieto", p: 2, t: "¿La mora es más para jugo o para mermelada?", c: "Hace 1 h", nuevo: true },
    { tipo: "interes", q: "Andrea Molina", p: 9, c: "Hace 3 h" },
    { tipo: "coment", q: "Camilo Prieto", p: 1, t: "Se ven muy buenos. ¿Hace envíos a Bogotá?", c: "Hace 3 h" },
    { tipo: "interes", q: "Jorge Torres", p: 1, c: "Ayer" },
  ];
  const USUARIOS = {
    comprador: { nombre: "Laura Gómez", corto: "Laura", ini: "LG", correo: "laura.gomez@correo.com" },
    agricultor: { nombre: "Alirio Rojas", corto: "Don Alirio", ini: "AR", correo: "310 456 7821", agri: "alirio" },
  };

  /* ---------------- Estado ---------------- */
  const E = {
    sesion: null, rolProto: "comprador", filtroCat: "Todas", filtroMun: "", busqueda: "",
    intereses: new Set([3]), editando: null, borrador: null, confirmarBorrado: null, avisoLogin: false, simulado: false, menu: false,
  };
  const PROTEGIDAS = { inicio: 1, producto: 1, intereses: "comprador", publicar: "agricultor", "mis-productos": "agricultor", panel: "agricultor" };
  const yo = () => (E.sesion ? USUARIOS[E.sesion.rol] : null);
  const noLeidos = () => AVISOS.filter((a) => a.nuevo).length;
  const prod = (id) => P.find((p) => p.id === Number(id));

  /* ---------------- Utilidades de interfaz ---------------- */
  let tToast;
  function toast(msg, icono = "check") {
    const r = $("#avisos-vivos");
    r.innerHTML = `<div class="toast" role="status">${ic(icono)}<span>${msg}</span></div>`;
    clearTimeout(tToast);
    tToast = setTimeout(() => (r.innerHTML = ""), 3800);
  }
  const ir = (r) => { if (location.hash.slice(1) === r) render(); else location.hash = r; };
  const unidadTxt = (p, largo) => (p.unidad === "kg" ? (largo ? "por kilogramo" : "/ kg") : (largo ? "por unidad" : "/ unidad"));
  const hace = (d) => (d === 0 ? "Hoy" : d === 1 ? "Ayer" : `Hace ${d} días`);

  function logo(href = "#inicio") {
    return `<a class="logo" href="${href}" aria-label="MiRaíz, ir al inicio"><span class="logo-marca">${ic("hoja")}</span><span>Mi<b>Raíz</b></span></a>`;
  }
  function enlacesNav(ruta) {
    const rol = E.sesion.rol;
    const items = rol === "agricultor"
      ? [["inicio", "Inicio", "inicio"], ["mis-productos", "Mis productos", "lista"], ["publicar", "Publicar", "mas"], ["panel", "Avisos", "campana"]]
      : [["inicio", "Inicio", "inicio"], ["intereses", "Mis intereses", "corazon"]];
    const act = (k) => (ruta === k || (ruta === "producto" && k === "inicio") ? ' aria-current="page"' : "");
    const sup = items.map(([k, t]) => `<a href="#${k}"${act(k)}>${t}</a>`).join("");
    const inf = items.map(([k, t, i]) => k === "publicar"
      ? `<a href="#${k}" class="nav-publicar"${act(k)}><span class="burbuja">${ic(i)}</span>${t}</a>`
      : `<a href="#${k}"${act(k)}><span style="position:relative;display:inline-flex">${ic(i)}${k === "panel" && noLeidos() ? `<span class="punto punto-nav" aria-hidden="true">${noLeidos()}</span>` : ""}</span>${t}${k === "panel" && noLeidos() ? `<span class="sr-only">: ${noLeidos()} sin leer</span>` : ""}</a>`).join("");
    return { sup, inf };
  }
  function marco(ruta, contenido) {
    const u = yo(), n = enlacesNav(ruta), agri = E.sesion.rol === "agricultor";
    return `<header class="cabecera"><div class="cabecera-in">${logo()}<nav class="nav-sup" aria-label="Principal">${n.sup}</nav>
      <div class="cab-acciones">
        ${agri ? `<a class="btn-avisos" href="#panel" aria-label="Avisos: ${noLeidos()} sin leer"><span style="position:relative;display:inline-flex">${ic("campana")}${noLeidos() ? `<span class="punto punto-nav" aria-hidden="true">${noLeidos()}</span>` : ""}</span><span>Avisos</span></a>` : ""}
        <button class="btn-icono" id="btn-cuenta" aria-haspopup="true" aria-expanded="${E.menu}" aria-label="Mi cuenta"><span class="avatar">${u.ini}</span></button>
      </div></div>
      ${E.menu ? `<div class="menu-cuenta" role="menu"><p><strong>${u.nombre}</strong><br>${agri ? "Agricultor" : "Compradora"}</p>
        <button role="menuitem" data-accion="salir">${ic("salir")}Cerrar sesión</button></div>` : ""}
    </header>
    <main id="contenido" tabindex="-1">${contenido}</main>
    <nav class="nav-inf" aria-label="Navegación inferior">${n.inf}</nav>`;
  }
  function campo({ id, label, tipo = "text", valor = "", ayuda = "", error = "", attrs = "", ojo = false }) {
    const desc = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ");
    const input = `<input class="entrada" id="${id}" name="${id}" type="${tipo}" value="${esc(valor)}" ${desc ? `aria-describedby="${desc}"` : ""} ${attrs}>`;
    return `<div class="campo" data-campo="${id}"><label for="${id}">${label}</label>
      ${ojo ? `<div class="con-icono">${input}<button type="button" class="btn-icono" data-ver="${id}" aria-label="Mostrar contraseña">${ic("ojo")}</button></div>` : input}
      ${ayuda ? `<span class="ayuda" id="${id}-ayuda">${ayuda}</span>` : ""}
      ${error ? `<span class="msj-error" id="${id}-error">${ic("alerta", "ico peq")}${error}</span>` : ""}</div>`;
  }
  function validar(form, reglas) {
    let primero = null;
    Object.entries(reglas).forEach(([id, ok]) => {
      const c = form.querySelector(`[data-campo="${id}"]`);
      const valido = ok(form.elements[id] ? form.elements[id].value.trim() : "");
      c.classList.toggle("con-error", !valido);
      const raw = form.elements[id];
      const el = raw && !(raw instanceof RadioNodeList) ? raw : null;
      if (el) el.setAttribute("aria-invalid", String(!valido));
      if (!valido && !primero) primero = el || c.querySelector("input, select, textarea");
    });
    if (primero) primero.focus();
    return !primero;
  }

  /* ---------------- Pantallas ---------------- */
  function pLogin() {
    const u = USUARIOS[E.rolProto];
    return `<div class="auth"><form class="auth-caja" id="f-login" novalidate>
      <div class="auth-intro">${logo("#login")}<h1>Ingresa a tu cuenta</h1><p class="sub">Compra y vende productos del campo, sin intermediarios.</p></div>
      ${E.avisoLogin ? `<div class="aviso-inline" role="alert">${ic("info")}<span>Inicia sesión para ver los productos y contactar a los agricultores.</span></div>` : ""}
      ${campo({ id: "usuario", label: "Correo o número de celular", valor: u.correo, error: "Escribe tu correo o tu celular de 10 dígitos.", attrs: 'autocomplete="username" required' })}
      ${campo({ id: "clave", label: "Contraseña", tipo: "password", valor: "cosecha2026", error: "Escribe tu contraseña.", attrs: 'autocomplete="current-password" required', ojo: true })}
      <div class="fila" style="justify-content:flex-end"><a href="#login" data-accion="olvido">¿Olvidaste tu contraseña?</a></div>
      <button class="btn btn-primario btn-ancho" type="submit">Ingresar</button>
      <div class="separador">¿Aún no tienes cuenta?</div>
      <a class="btn btn-secundario btn-ancho" href="#registro">Crear una cuenta</a>
    </form></div>`;
  }
  function pRegistro() {
    return `<div class="auth"><form class="auth-caja" id="f-registro" novalidate>
      <div class="auth-intro">${logo("#login")}<h1>Crea tu cuenta</h1><p class="sub">Toma menos de un minuto. Primero cuéntanos qué quieres hacer.</p></div>
      <fieldset class="campo" data-campo="rol" style="border:0;padding:0;margin:0"><legend class="etiqueta" style="margin-bottom:6px">Quiero…</legend>
        <div class="rol">
          <input type="radio" name="rol" id="rol-agri" value="agricultor"><label for="rol-agri">${ic("hoja")}<strong>Vender</strong><span>Soy agricultor y quiero mostrar mi cosecha</span></label>
          <input type="radio" name="rol" id="rol-comp" value="comprador" checked><label for="rol-comp">${ic("canasta")}<strong>Comprar</strong><span>Busco productos frescos directo del campo</span></label>
        </div></fieldset>
      ${campo({ id: "nombre", label: "Nombre completo", error: "Escribe tu nombre.", attrs: 'autocomplete="name" required' })}
      ${campo({ id: "celular", label: "Número de celular", tipo: "tel", ayuda: "Puedes escribirlo con espacios o con +57. Si vendes, los compradores interesados verán este número.", error: "Revisa el número: debe tener 10 dígitos y empezar por 3. Ej.: 310 456 7821", attrs: 'inputmode="tel" autocomplete="tel" placeholder="Ej.: 310 456 7821" required' })}
      <div class="campo" data-campo="municipio"><label for="municipio">Municipio</label>
        <select class="entrada" id="municipio" name="municipio" required aria-describedby="municipio-error"><option value="">Selecciona tu municipio</option>${MUNICIPIOS.concat("Bogotá").map((m) => `<option>${m}</option>`).join("")}</select>
        <span class="msj-error" id="municipio-error">${ic("alerta", "ico peq")}Selecciona un municipio.</span></div>
      ${campo({ id: "clave2", label: "Crea una contraseña", tipo: "password", ayuda: "Mínimo 8 caracteres.", error: "La contraseña debe tener al menos 8 caracteres.", attrs: 'autocomplete="new-password" required', ojo: true })}
      <div class="campo" data-campo="terminos"><label class="fila" style="font-weight:400;gap:10px;align-items:flex-start;flex-wrap:nowrap"><input type="checkbox" id="terminos" name="terminos" style="width:22px;height:22px;margin-top:2px">
        <span>Acepto los términos de uso y el tratamiento de mis datos personales.</span></label>
        <span class="msj-error">${ic("alerta", "ico peq")}Debes aceptar los términos para continuar.</span></div>
      <button class="btn btn-primario btn-ancho" type="submit">Crear cuenta</button>
      <p class="sub" style="text-align:center">¿Ya tienes cuenta? <a href="#login">Ingresa aquí</a></p>
    </form></div>`;
  }
  function tarjeta(p) {
    return `<a class="tarjeta" href="#producto-${p.id}">${foto(p, p.r)}<div class="tarjeta-cuerpo">
      ${p.estado === "exhibicion" ? `<span><span class="insignia ins-exhibicion">Solo exhibición</span></span>` : p.dias === 0 ? `<span><span class="insignia ins-nuevo">Nuevo hoy</span></span>` : ""}
      <h3>${esc(p.nombre)}</h3>
      ${p.estado === "venta" ? (p.precio ? `<p class="precio">${fmt(p.precio)} <small>${unidadTxt(p)}</small></p>` : `<p class="sub">Precio por definir</p>`) : ""}
      <p class="lugar">${ic("lugar", "ico peq")}${p.mun} · ${AGRI[p.agri].corto}</p></div></a>`;
  }
  function filtrados() {
    const b = E.busqueda.toLowerCase();
    return P.filter((p) => (E.filtroCat === "Todas" || p.cat === E.filtroCat) && (!E.filtroMun || p.mun === E.filtroMun) && (!b || p.nombre.toLowerCase().includes(b) || p.cat.toLowerCase().includes(b)));
  }
  function galeriaHTML() {
    const l = filtrados();
    const res = `<p class="resultado" id="resultado">${l.length} ${l.length === 1 ? "producto" : "productos"}${E.filtroMun ? " en " + E.filtroMun : ""}</p>`;
    if (!l.length) return res + `<div class="vacio">${ic("canasta")}<h2>Aún no hay ${E.filtroCat === "Todas" ? "productos" : E.filtroCat.toLowerCase()} ${E.filtroMun ? "en " + E.filtroMun : E.busqueda ? "con esa búsqueda" : "publicados"}</h2>
      <p class="sub">Prueba con otro municipio u otra categoría.</p><button class="btn btn-secundario" data-accion="limpiar">Quitar filtros</button></div>`;
    return res + `<div class="galeria">${l.map(tarjeta).join("")}</div>`;
  }
  function avisoDestacado() {
    const n = noLeidos(); if (!n) return "";
    const a = AVISOS.find((x) => x.nuevo), p = prod(a.p);
    return `<a class="aviso-destacado" href="#panel">${ic("campana")}<span><strong>Tienes ${n} ${n === 1 ? "aviso nuevo" : "avisos nuevos"}.</strong> ${a.q} ${a.tipo === "interes" ? "mostró interés en" : "comentó en"} ${esc(p.nombre)}.</span><span class="ver">Ver avisos</span></a>`;
  }
  function pInicio() {
    const agri = E.sesion.rol === "agricultor";
    return `<div class="pila">
      <div class="fila" style="justify-content:space-between;align-items:flex-end">
        <div class="pila" style="gap:4px"><h1>${agri ? "Galería de productos" : `Hola, ${yo().corto}`}</h1>
        <p class="sub">${agri ? "Así ven los compradores tus publicaciones y las de otros agricultores." : "Productos frescos publicados por agricultores de la región del Sumapaz."}</p></div>
        ${agri ? `<a class="btn btn-primario" href="#publicar">${ic("mas")}Publicar producto</a>` : ""}
      </div>
      ${agri ? avisoDestacado() : ""}
      <div class="barra-busqueda" role="search">
        <div class="con-icono"><label for="busca" class="sr-only">Buscar productos</label><span class="lupa">${ic("buscar")}</span>
          <input class="entrada" id="busca" type="search" placeholder="Buscar: tomate, mora, abono…" value="${esc(E.busqueda)}"></div>
        <label for="f-mun" class="sr-only">Filtrar por municipio</label>
        <select class="entrada" id="f-mun"><option value="">Todos los municipios</option>${MUNICIPIOS.map((m) => `<option ${E.filtroMun === m ? "selected" : ""}>${m}</option>`).join("")}</select>
      </div>
      <div class="chips" role="group" aria-label="Filtrar por categoría">${["Todas"].concat(CATEGORIAS).map((c) => `<button class="chip" data-cat="${c}" aria-pressed="${E.filtroCat === c}">${c}</button>`).join("")}</div>
      <div id="zona-galeria">${galeriaHTML()}</div></div>`;
  }
  function comentarios(p) {
    const l = COMENT[p.id] || [];
    return `<section class="pila" aria-labelledby="t-coment" style="margin-top:var(--e-6)">
      <h2 id="t-coment">Preguntas y comentarios (${l.length})</h2>
      ${l.length ? l.map((c) => `<div class="comentario${c.resp ? " respuesta" : ""}"><span class="avatar" aria-hidden="true">${c.ini}</span>
        <div class="burbuja-c"><p><span class="quien">${esc(c.q)}</span>${c.resp ? ` <span class="insignia ins-venta">Agricultor</span>` : ""} <span class="cuando">· ${c.c}</span></p><p>${esc(c.t)}</p></div></div>`).join("")
      : `<p class="sub">Nadie ha preguntado todavía. Sé la primera persona en comentar.</p>`}
      <form id="f-coment" class="pila" style="gap:var(--e-2)" novalidate>
        <div class="campo" data-campo="coment"><label for="coment">Escribe una pregunta o comentario</label>
          <textarea class="entrada" id="coment" name="coment" maxlength="300" aria-describedby="coment-error" placeholder="Ej.: ¿Tiene disponibilidad para el sábado?"></textarea>
          <span class="msj-error" id="coment-error">${ic("alerta", "ico peq")}Escribe algo antes de publicar.</span></div>
        <div><button class="btn btn-secundario" type="submit">${ic("mensaje")}Publicar comentario</button></div>
      </form></section>`;
  }
  function pProducto(id) {
    const p = prod(id);
    if (!p) return `<div class="vacio"><h1>No encontramos este producto</h1><a class="btn btn-primario" href="#inicio">Volver a la galería</a></div>`;
    const a = AGRI[p.agri], comp = E.sesion.rol === "comprador", propio = !comp && p.agri === "alirio", ya = E.intereses.has(p.id);
    let accion = "";
    if (propio) accion = `<div class="fila"><button class="btn btn-secundario" data-editar="${p.id}">${ic("editar")}Editar publicación</button><span class="sub">${p.int} personas interesadas</span></div>`;
    else if (p.estado === "exhibicion") accion = `<div class="aviso-inline">${ic("info")}<span>${a.corto} todavía no vende este producto. Puedes dejarle una pregunta en los comentarios.</span></div>`;
    else if (!comp) accion = `<div class="aviso-inline">${ic("info")}<span>Estás viendo la publicación de otro agricultor.</span></div>`;
    else if (!ya) accion = `<div class="pila" style="gap:var(--e-2)"><button class="btn btn-acento btn-ancho" data-interes="${p.id}">${ic("corazon")}Me interesa</button>
        <p class="sub">Te mostraremos el número de ${a.corto} y le avisaremos que estás interesada.</p></div>`;
    else accion = contacto(p);
    return `<a class="volver" href="#inicio">${ic("atras")}Volver a la galería</a>
      <div class="detalle" style="margin-top:var(--e-3)">
        <div class="detalle-foto">${foto(p, 0.85)}</div>
        <div class="pila">
          <div class="fila" style="gap:var(--e-2)">${p.estado === "venta" ? `<span class="insignia ins-venta">${ic("check", "ico peq")}En venta</span>` : `<span class="insignia ins-exhibicion">Solo exhibición</span>`}<span class="insignia ins-info">${p.cat}</span></div>
          <h1>${esc(p.nombre)}</h1>
          ${p.estado === "venta" ? `<p class="precio-grande">${fmt(p.precio)} <small>${unidadTxt(p, true)}</small></p>` : ""}
          <p>${esc(p.desc)}</p>
          <p class="lugar">${ic("lugar", "ico peq")}${p.mun} · ${a.vereda} · Publicado: ${hace(p.dias).toLowerCase()}</p>
          <div class="productor"><span class="avatar" aria-hidden="true">${a.ini}</span><div><p><strong>${a.nombre}</strong></p><p class="sub">${a.bio}</p></div></div>
          <div id="zona-accion">${accion}</div>
        </div></div>${comentarios(p)}`;
  }
  function waLink(p) {
    const a = AGRI[p.agri];
    return `https://wa.me/57${soloCel(a.tel)}?text=${encodeURIComponent(`Hola ${a.corto}, vi su ${p.nombre} en MiRaíz y me interesa.`)}`;
  }
  function contacto(p) {
    const a = AGRI[p.agri];
    return `<div class="contacto" tabindex="-1" id="caja-contacto"><p class="fila" style="gap:6px;font-weight:700;color:var(--verde-900)">${ic("check")}Le avisamos a ${a.corto} que estás interesada</p>
      <p>Llámalo o escríbele por WhatsApp para acordar cantidad, precio final y entrega:</p>
      <p class="telefono">${ic("telefono")} ${a.tel}</p>
      <div class="fila"><a class="btn btn-primario btn-peq" href="${waLink(p)}" target="_blank" rel="noopener">${ic("mensaje")}Escribir por WhatsApp</a><button class="btn btn-secundario btn-peq" data-copiar="${a.tel}">${ic("copiar")}Copiar número</button></div>
      <p class="sub">El pago y la entrega se acuerdan directamente con el agricultor.</p></div>`;
  }
  function pIntereses() {
    const l = P.filter((p) => E.intereses.has(p.id));
    return `<div class="pila"><h1>Mis intereses</h1><p class="sub">Productos en los que pulsaste “Me interesa”. Aquí tienes siempre el contacto del agricultor.</p>
      ${l.length ? `<div class="lista-gestion">${l.map((p) => { const a = AGRI[p.agri]; return `<article class="item-gestion"><div class="mini">${foto(p, 1)}</div>
        <div class="info"><h3>${esc(p.nombre)}</h3><p class="precio">${fmt(p.precio)} <small>${unidadTxt(p)}</small></p><p class="lugar">${ic("lugar", "ico peq")}${p.mun} · ${a.nombre}</p></div>
        <div class="acciones"><span class="telefono" style="font-size:1.125rem">${ic("telefono", "ico peq")} ${a.tel}</span><button class="btn btn-texto btn-peq" data-copiar="${a.tel}">${ic("copiar")}Copiar</button><a class="btn btn-primario btn-peq" href="${waLink(p)}" target="_blank" rel="noopener" style="margin-left:auto">${ic("mensaje")}WhatsApp</a></div></article>`; }).join("")}</div>`
      : `<div class="vacio">${ic("corazon")}<h2>Todavía no has marcado productos</h2><p class="sub">Cuando pulses “Me interesa” en un producto, lo verás aquí con el número del agricultor.</p><a class="btn btn-primario" href="#inicio">Explorar productos</a></div>`}</div>`;
  }
  function pPublicar() {
    const ed = E.editando ? prod(E.editando) : null;
    const b = E.borrador || (ed ? { ...ed } : { nombre: "", cat: "", precio: "", unidad: "kg", estado: "venta", mun: "Fusagasugá", desc: "", arte: null, foto: null });
    E.borrador = b;
    const fotoHTML = b.foto || b.arte ? `${b.foto ? `<img src="${b.foto}" alt="Foto seleccionada" style="width:100%;display:block">` : arte(b.arte, 0.7, "Foto seleccionada")}` : `${ic("camara")}<span>Toca para tomar o subir una foto</span><span class="sub" style="font-weight:400">JPG o PNG. Usa buena luz y muestra el producto de cerca.</span>`;
    return `<a class="volver" href="#mis-productos">${ic("atras")}Mis productos</a>
      <h1 style="margin-block:var(--e-2) var(--e-5)">${ed ? "Editar producto" : "Publicar un producto"}</h1>
      <div class="form-publicar"><form id="f-publicar" class="pila" novalidate>
        <div class="campo" data-campo="foto"><span class="etiqueta" id="foto-lbl">Foto del producto</span>
          <label class="subir${b.foto || b.arte ? " con-foto" : ""}" for="foto" aria-describedby="foto-error">${fotoHTML}</label>
          <input type="file" id="foto" name="foto" accept="image/*" class="sr-only" aria-labelledby="foto-lbl">
          <div class="fila"><button type="button" class="btn btn-texto btn-peq" data-accion="foto-ejemplo">Usar foto de ejemplo</button>${b.foto || b.arte ? `<button type="button" class="btn btn-texto btn-peq" data-accion="quitar-foto">Cambiar foto</button>` : ""}</div>
          <span class="msj-error" id="foto-error">${ic("alerta", "ico peq")}Agrega una foto: los compradores eligen por lo que ven.</span></div>
        ${campo({ id: "p-nombre", label: "¿Qué vas a publicar?", valor: b.nombre, error: "Escribe el nombre del producto.", attrs: 'placeholder="Ej.: Tomate chonto orgánico" required' })}
        <div class="campo" data-campo="p-cat"><label for="p-cat">Categoría</label>
          <select class="entrada" id="p-cat" name="p-cat" required aria-describedby="p-cat-error"><option value="">Elige una categoría</option>${CATEGORIAS.map((c) => `<option ${b.cat === c ? "selected" : ""}>${c}</option>`).join("")}</select>
          <span class="msj-error" id="p-cat-error">${ic("alerta", "ico peq")}Elige una categoría para que te encuentren en los filtros.</span></div>
        <fieldset class="campo" style="border:0;padding:0;margin:0"><legend class="etiqueta" style="margin-bottom:6px">¿Lo vas a vender ahora?</legend>
          <div class="segmentado"><input type="radio" name="p-estado" id="e-venta" value="venta" ${b.estado === "venta" ? "checked" : ""}><label for="e-venta">Sí, está en venta</label>
          <input type="radio" name="p-estado" id="e-exh" value="exhibicion" ${b.estado === "exhibicion" ? "checked" : ""}><label for="e-exh">Solo mostrarlo</label></div>
          <span class="ayuda">“Solo mostrarlo” sirve para anunciar una próxima cosecha. No se muestra precio ni el botón “Me interesa”.</span></fieldset>
        <div class="dos-col" ${b.estado === "exhibicion" ? "hidden" : ""} id="bloque-precio">
          ${campo({ id: "p-precio", label: "Precio en pesos", tipo: "text", valor: miles(b.precio), ayuda: "Escríbelo como quieras: 3500 o 3.500.", error: "Escribe el precio en números. Ej.: 3.500", attrs: 'inputmode="numeric" placeholder="Ej.: 3.500"' })}
          <fieldset class="campo" style="border:0;padding:0;margin:0"><legend class="etiqueta" style="margin-bottom:6px">El precio es…</legend>
            <div class="segmentado"><input type="radio" name="p-unidad" id="u-kg" value="kg" ${b.unidad === "kg" ? "checked" : ""}><label for="u-kg">Por kilo</label>
            <input type="radio" name="p-unidad" id="u-un" value="unidad" ${b.unidad === "unidad" ? "checked" : ""}><label for="u-un">Por unidad</label></div></fieldset>
        </div>
        <div class="campo"><label for="p-mun">Municipio donde entregas</label><select class="entrada" id="p-mun" name="p-mun">${MUNICIPIOS.map((m) => `<option ${b.mun === m ? "selected" : ""}>${m}</option>`).join("")}</select></div>
        <div class="campo"><label for="p-desc">Descripción <span class="sub">(opcional)</span></label>
          <textarea class="entrada" id="p-desc" name="p-desc" maxlength="300" aria-describedby="p-desc-ayuda" placeholder="Cuéntales cómo lo cultivas, cuánto tienes disponible y cómo entregas.">${esc(b.desc)}</textarea>
          <span class="ayuda" id="p-desc-ayuda"><span id="contador">${b.desc.length}</span>/300 caracteres</span></div>
        <div class="barra-accion"><a class="btn btn-texto" href="#mis-productos" data-accion="cancelar">Cancelar</a><button class="btn btn-primario" type="submit">${ic("check")}${ed ? "Guardar cambios" : "Publicar"}</button></div>
      </form>
      <aside class="pila" aria-label="Vista previa"><p class="etiqueta">Así la verán los compradores</p><div id="vista-previa" style="max-width:280px">${previa()}</div></aside></div>`;
  }
  function previa() {
    const b = E.borrador;
    const p = { id: 0, nombre: b.nombre || "Nombre del producto", precio: Number(b.precio) || 0, unidad: b.unidad, estado: b.estado, mun: b.mun, agri: "alirio", arte: b.arte || "tomate", foto: b.foto, r: 1, dias: 0 };
    return tarjeta(p).replace('href="#producto-0"', 'href="#publicar" tabindex="-1" aria-hidden="true"').replace(p.foto || b.arte ? "" : "<svg", p.foto || b.arte ? "" : '<svg style="opacity:.35"');
  }
  function pMisProductos() {
    const l = P.filter((p) => p.agri === "alirio");
    const venta = l.filter((p) => p.estado === "venta").length;
    return `<div class="pila"><div class="fila" style="justify-content:space-between"><div><h1>Mis productos</h1><p class="sub">${l.length} publicaciones · ${venta} en venta</p></div>
      <a class="btn btn-primario" href="#publicar" data-accion="nuevo">${ic("mas")}Publicar producto</a></div>
      ${avisoDestacado()}
      ${l.length ? `<div class="lista-gestion">${l.map((p) => `<article class="item-gestion" aria-labelledby="g-${p.id}"><div class="mini">${foto(p, 1)}</div>
        <div class="info"><h3 id="g-${p.id}"><a href="#producto-${p.id}" style="color:inherit">${esc(p.nombre)}</a></h3>
          <p>${p.estado === "venta" ? `<span class="precio">${fmt(p.precio)} <small>${unidadTxt(p)}</small></span>` : `<span class="insignia ins-exhibicion">Solo exhibición</span>`}</p>
          <p class="sub">${p.int} interesados · ${(COMENT[p.id] || []).length} comentarios · ${p.vis} visitas</p></div>
        <div class="acciones"><label class="interruptor"><input type="checkbox" data-estado="${p.id}" ${p.estado === "venta" ? "checked" : ""}>En venta</label>
          <button class="btn btn-secundario btn-peq" style="margin-left:auto" data-editar="${p.id}">${ic("editar")}Editar</button>
          <button class="btn btn-texto btn-peq" style="color:var(--error)" data-borrar="${p.id}" aria-label="Eliminar ${esc(p.nombre)}">${ic("borrar")}</button></div>
        ${E.confirmarBorrado === p.id ? `<div class="confirmar" role="alertdialog" aria-label="Confirmar eliminación"><p>¿Eliminar “${esc(p.nombre)}”? Los compradores ya no lo verán.</p>
          <button class="btn btn-peligro btn-peq" data-si-borrar="${p.id}">Sí, eliminar</button><button class="btn btn-texto btn-peq" data-accion="no-borrar">Cancelar</button></div>` : ""}
        </article>`).join("")}</div>`
      : `<div class="vacio">${ic("hoja")}<h2>Aún no has publicado productos</h2><p class="sub">Publica tu primera cosecha: solo necesitas una foto y el precio.</p><a class="btn btn-primario" href="#publicar">Publicar producto</a></div>`}</div>`;
  }
  function pPanel() {
    const l = P.filter((p) => p.agri === "alirio");
    const tot = l.reduce((s, p) => s + p.int, 0), vis = l.reduce((s, p) => s + p.vis, 0), max = Math.max(...l.map((p) => p.int), 1);
    const nCom = AVISOS.filter((a) => a.tipo === "coment").length;
    return `<div class="pila"><div class="fila" style="justify-content:space-between;align-items:flex-end"><div><h1>Avisos y resumen</h1><p class="sub">Hola, Don Alirio. Esto pasó en los últimos 7 días.</p></div>
      <a class="btn btn-primario" href="#publicar" data-accion="nuevo">${ic("mas")}Publicar producto</a></div>
      <div class="kpis">
        <div class="kpi"><span class="num" id="kpi-int">${tot}</span><span class="lbl">Personas interesadas</span><span class="delta">+3 desde ayer</span></div>
        <div class="kpi"><span class="num">${nCom}</span><span class="lbl">Comentarios nuevos</span><span class="delta">1 sin responder</span></div>
        <div class="kpi"><span class="num">${l.filter((p) => p.estado === "venta").length}</span><span class="lbl">Productos en venta</span><span class="delta" style="color:var(--texto-2)">de ${l.length} publicados</span></div>
        <div class="kpi"><span class="num">${vis}</span><span class="lbl">Visitas a tus productos</span><span class="delta">+18 % que la semana pasada</span></div>
      </div>
      <div class="panel-rejilla pila">
        <section class="panel pila" aria-labelledby="t-avisos"><div class="fila" style="justify-content:space-between"><h2 id="t-avisos">Avisos recientes</h2>${noLeidos() ? `<button class="btn btn-texto btn-peq" data-accion="leidos">Marcar como leídos</button>` : ""}</div>
          <div class="feed" id="feed">${AVISOS.map(itemAviso).join("")}</div></section>
        <section class="panel pila" aria-labelledby="t-barras"><h2 id="t-barras">Interés por producto</h2>
          <div class="barras">${l.slice().sort((a, b) => b.int - a.int).map((p) => `<div class="barra"><span>${esc(p.nombre)}</span><div class="pista" role="img" aria-label="${p.int} interesados"><div class="relleno" style="width:${(p.int / max) * 100}%"></div></div><span class="val">${p.int}</span></div>`).join("")}</div>
          <p class="sub">Consejo: los productos con foto clara y precio por kilo reciben más interés.</p></section>
      </div></div>`;
  }
  function itemAviso(a) {
    const p = prod(a.p);
    return `<div class="feed-item${a.nuevo ? " nuevo" : ""}"><span class="tipo ${a.tipo === "interes" ? "interes" : "coment"}">${ic(a.tipo === "interes" ? "corazon" : "mensaje", "ico peq")}</span>
      <div class="txt"><p>${a.tipo === "interes" ? `<strong>${a.q}</strong> mostró interés en <a href="#producto-${p.id}">${esc(p.nombre)}</a>` : `<strong>${a.q}</strong> comentó en <a href="#producto-${p.id}">${esc(p.nombre)}</a>: “${esc(a.t)}”`}</p>
      <p class="sub">${a.c}${a.nuevo ? ' · <strong style="color:var(--verde-700)">Nuevo</strong>' : ""}</p></div>
      ${a.tipo === "coment" ? `<a class="btn btn-texto btn-peq" href="#producto-${p.id}">Responder</a>` : ""}</div>`;
  }

  /* ---------------- Guía de estilos (UI Kit) ---------------- */
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  function pUIKit() {
    const colores = [
      ["Verde cafetal", "--verde-900", "#173F2A", "#FFFFFF", "Títulos, encabezado, texto sobre maíz"],
      ["Verde hoja", "--verde-700", "#1F6B43", "#FFFFFF", "Acción primaria, enlaces, estados activos"],
      ["Verde brote", "--verde-100", "#E3F0E6", "#173F2A", "Fondos de selección, insignia “En venta”"],
      ["Maíz", "--maiz-500", "#F2B705", "#173F2A", "Acento: “Me interesa” y avisos de interés"],
      ["Maíz claro", "--maiz-100", "#FFF4CC", "#173F2A", "Caja de contacto, avisos nuevos"],
      ["Tierra", "--tierra-700", "#7A4E22", "#FFFFFF", "Insignia “Solo exhibición”"],
      ["Fondo", "--fondo", "#F7F8F2", "#1E2A22", "Fondo de la aplicación"],
      ["Texto", "--texto", "#1E2A22", "#FFFFFF", "Texto principal"],
      ["Texto secundario", "--texto-2", "#4F5D53", "#FFFFFF", "Ayudas, fechas, metadatos"],
      ["Borde", "--borde", "#CFD8CB", "#1E2A22", "Bordes de campos y tarjetas"],
      ["Error", "--error", "#B3261E", "#FFFFFF", "Mensajes de error, eliminar"],
      ["Información", "--info", "#255C8C", "#FFFFFF", "Foco del teclado, avisos informativos"],
    ];
    const pares = [["Texto sobre fondo", "#1E2A22", "#F7F8F2"], ["Texto secundario sobre blanco", "#4F5D53", "#FFFFFF"], ["Blanco sobre verde hoja (botón)", "#FFFFFF", "#1F6B43"], ["Verde cafetal sobre maíz (Me interesa)", "#173F2A", "#F2B705"], ["Tierra sobre tierra claro (insignia)", "#7A4E22", "#F3E8DA"], ["Error sobre blanco", "#B3261E", "#FFFFFF"]];
    const ejemplo = P[0];
    return `<div class="kit"><div class="pila" style="gap:var(--e-2);padding-bottom:var(--e-5)"><p class="rotulo">MiRaíz · UI Kit v2</p><h1>Guía de estilos visual</h1>
      <p class="sub" style="max-width:62ch">Fundamentos y componentes del prototipo. Todas las pantallas usan estos mismos tokens; el archivo <code>styles.css</code> los declara en <code>:root</code>.</p></div>
      <section><p class="rotulo">01 · Marca</p><h2>Logotipo y tono</h2><div class="vitrina">${logo("#uikit")}<span class="logo-marca" aria-hidden="true">${ic("hoja")}</span></div>
        <p style="max-width:62ch">La hoja con la raíz expresa el origen campesino del producto. El tono es cercano y claro: frases cortas, sin tecnicismos, y botones que dicen exactamente lo que pasa (“Publicar”, “Me interesa”).</p></section>
      <section><p class="rotulo">02 · Color</p><h2>Paleta</h2><div class="muestras">${colores.map(([n, t, h, tx, u]) => `<div class="muestra"><div class="color" style="background:${h};color:${tx}">Aa</div><div class="d"><strong>${n}</strong><code>${h} · ${t}</code><span>${u}</span></div></div>`).join("")}</div>
        <div class="tabla-env"><table><thead><tr><th>Combinación</th><th>Contraste</th><th>WCAG 2.1</th></tr></thead><tbody>${pares.map(([n, a, b]) => { const c = contraste(a, b); return `<tr><td><span style="background:${b};color:${a};padding:2px 8px;border-radius:4px;border:1px solid var(--borde)">Aa</span> ${n}</td><td>${c.toFixed(1)} : 1</td><td>${c >= 7 ? "AAA" : c >= 4.5 ? "AA" : "AA texto grande"}</td></tr>`; }).join("")}</tbody></table></div></section>
      <section><p class="rotulo">03 · Tipografía</p><h2>Bitter + Atkinson Hyperlegible</h2>
        <p style="max-width:62ch">Bitter (serif de trazo grueso) da carácter a títulos y precios. Atkinson Hyperlegible, creada por el Braille Institute para personas con baja visión, distingue bien letras parecidas (I, l, 1) y es la fuente del texto, pensando en agricultores mayores con celulares de pantalla pequeña.</p>
        <div class="escala">
          <div><code>Display · Bitter 700 · 32/38</code><span style="font-family:var(--f-display);font-size:2rem;font-weight:700;color:var(--verde-900)">$ 3.500 por kilo</span></div>
          <div><code>H1 · Bitter 700 · 26/31</code><span style="font-family:var(--f-display);font-size:1.625rem;font-weight:700;color:var(--verde-900)">Publicar un producto</span></div>
          <div><code>H2 · Bitter 600 · 21/25</code><span style="font-family:var(--f-display);font-size:1.3125rem;font-weight:600;color:var(--verde-900)">Preguntas y comentarios</span></div>
          <div><code>Cuerpo · Atkinson 400 · 17/25</code><span>Tomate maduro, cosechado esta semana.</span></div>
          <div><code>Etiqueta · Atkinson 700 · 15/22</code><strong style="font-size:.9375rem">Número de celular</strong></div>
          <div><code>Nota · Atkinson 400 · 13/19</code><span style="font-size:.8125rem;color:var(--texto-2)">Fusagasugá · Publicado hace 2 días</span></div>
        </div></section>
      <section><p class="rotulo">04 · Botones</p><h2>Jerarquía de acciones</h2>
        <div class="vitrina"><button class="btn btn-primario">${ic("check")}Primario</button><button class="btn btn-acento">${ic("corazon")}Me interesa</button><button class="btn btn-secundario">Secundario</button><button class="btn btn-texto">Texto</button><button class="btn btn-peligro">Eliminar</button><button class="btn btn-primario" disabled>Deshabilitado</button></div>
        <div class="vitrina"><button class="btn btn-primario btn-peq">Pequeño (40 px)</button><button class="btn-icono" aria-label="Botón de icono">${ic("campana")}<span class="punto">2</span></button><button class="btn btn-primario" style="box-shadow:var(--foco)">Con foco de teclado</button></div>
        <p class="sub">Altura mínima de 48 px en botones principales y 40 px en secundarios. Una sola acción primaria por pantalla; el amarillo maíz se reserva para “Me interesa”.</p></section>
      <section><p class="rotulo">05 · Formularios</p><h2>Campos de entrada</h2><div class="rejilla-kit">
        ${campo({ id: "k1", label: "Campo normal", valor: "", attrs: 'placeholder="Ej.: Tomate chonto"', ayuda: "Texto de ayuda debajo del campo." })}
        <div class="campo"><label for="k2">Con foco</label><input class="entrada" id="k2" value="Mora de castilla" style="border-color:var(--info);box-shadow:0 0 0 3px var(--info-100)"></div>
        <div class="campo con-error"><label for="k3">Con error</label><input class="entrada" id="k3" value="3.5OO" aria-invalid="true" aria-describedby="k3-e"><span class="msj-error" id="k3-e">${ic("alerta", "ico peq")}Escribe el precio en números. Ej.: 3500</span></div>
        <div class="campo"><label for="k4">Lista desplegable</label><select class="entrada" id="k4"><option>Hortalizas</option></select></div>
        <fieldset class="campo" style="border:0;padding:0;margin:0"><legend class="etiqueta" style="margin-bottom:6px">Control segmentado</legend><div class="segmentado"><input type="radio" name="k5" id="k5a" checked><label for="k5a">Por kilo</label><input type="radio" name="k5" id="k5b"><label for="k5b">Por unidad</label></div></fieldset>
        <div class="campo"><span class="etiqueta">Interruptor</span><label class="interruptor"><input type="checkbox" checked>En venta</label></div>
      </div></section>
      <section><p class="rotulo">06 · Componentes</p><h2>Piezas reutilizables</h2>
        <div class="vitrina"><button class="chip" aria-pressed="true">Todas</button><button class="chip" aria-pressed="false">Frutas</button><span class="insignia ins-venta">${ic("check", "ico peq")}En venta</span><span class="insignia ins-exhibicion">Solo exhibición</span><span class="insignia ins-nuevo">Nuevo hoy</span><span class="insignia ins-info">Hortalizas</span></div>
        <div class="rejilla-kit"><div style="max-width:260px">${tarjeta(ejemplo)}</div>
          <div class="pila">${contacto(ejemplo)}<div class="aviso-inline">${ic("info")}<span>Aviso informativo en línea.</span></div>
          <div class="toast" style="position:static;transform:none">${ic("check")}<span>Producto publicado. Ya aparece en la galería.</span></div></div>
          <div class="pila"><div class="kpi"><span class="num">12</span><span class="lbl">Personas interesadas</span><span class="delta">+3 desde ayer</span></div>
          <div class="panel feed">${itemAviso(AVISOS[0])}${itemAviso(AVISOS[1])}</div></div></div></section>
      <section><p class="rotulo">07 · Iconografía</p><h2>Iconos de trazo</h2><p class="sub">Trazo de 2 px, esquinas redondeadas, retícula de 24 px. Siempre acompañados de texto o de una etiqueta accesible.</p>
        <div class="iconos">${Object.keys(ICONOS).map((k) => `<figure>${ic(k)}<figcaption>${k}</figcaption></figure>`).join("")}</div></section>
      <section><p class="rotulo">08 · Espaciado y forma</p><h2>Retícula de 4 px</h2>
        <div class="espacios">${[4, 8, 12, 16, 24, 32, 48].map((s) => `<figure><div style="width:${s}px;height:${s}px"></div><figcaption>${s}</figcaption></figure>`).join("")}</div>
        <div class="vitrina">${[["6 px", "--r-s"], ["12 px", "--r-m"], ["20 px", "--r-l"], ["999 px", "--r-pill"]].map(([v, t]) => `<div style="width:96px;height:56px;border:2px solid var(--verde-700);border-radius:var(${t});display:grid;place-items:center;font-size:12px">${v}</div>`).join("")}</div>
        <p class="sub">Puntos de quiebre: móvil desde 360 px (una columna de formulario, galería de 2 columnas y barra inferior) y escritorio desde 900 px (navegación superior y galería de 4 columnas).</p></section></div>`;
  }

  /* ---------------- Render y eventos ---------------- */
  function render() {
    const hash = location.hash.slice(1) || "login";
    let [ruta, id] = hash.startsWith("producto-") ? ["producto", hash.split("-")[1]] : [hash, null];
    const req = PROTEGIDAS[ruta];
    if (req && !E.sesion) { E.avisoLogin = true; ruta = "login"; history.replaceState(null, "", "#login"); }
    if (req && E.sesion && req !== 1 && E.sesion.rol !== req) { ruta = "inicio"; history.replaceState(null, "", "#inicio"); }
    if (ruta !== "publicar") { E.borrador = null; if (ruta !== "mis-productos") E.editando = null; }
    E.menu = false;
    const raiz = $("#raiz");
    const pantallas = { login: pLogin, registro: pRegistro, inicio: pInicio, producto: () => pProducto(id), intereses: pIntereses, publicar: pPublicar, "mis-productos": pMisProductos, panel: pPanel };
    if (ruta === "uikit") raiz.innerHTML = `<header class="cabecera"><div class="cabecera-in">${logo(E.sesion ? "#inicio" : "#login")}</div></header><main id="contenido" tabindex="-1">${pUIKit()}</main>`;
    else if (!pantallas[ruta]) { ruta = "login"; raiz.innerHTML = pLogin(); }
    else raiz.innerHTML = ["login", "registro"].includes(ruta) ? pantallas[ruta]() : marco(ruta, pantallas[ruta]());
    if (ruta !== "login") E.avisoLogin = false;
    const titulos = { login: "Ingresar", registro: "Crear cuenta", inicio: "Galería", producto: "Producto", intereses: "Mis intereses", publicar: "Publicar producto", "mis-productos": "Mis productos", panel: "Avisos", uikit: "Guía de estilos" };
    document.title = `${titulos[ruta] || "MiRaíz"} · Prototipo MiRaíz`;
    const sel = $("#proto-pantalla"); if (sel) sel.value = ruta === "producto" ? "producto-1" : ruta;
    window.scrollTo(0, 0);
    if (ruta === "panel" && !E.simulado) simularAviso();
  }
  function simularAviso() {
    E.simulado = true;
    setTimeout(() => {
      AVISOS.unshift({ tipo: "interes", q: "Andrés Silva", p: 2, c: "Justo ahora", nuevo: true });
      P[1].int += 1;
      toast("<strong>Andrés Silva</strong> mostró interés en tu Mora de castilla", "campana");
      if ((location.hash.slice(1) || "") === "panel") render(); else { const b = $(".cabecera .punto"); if (b) b.textContent = noLeidos(); }
    }, 5000);
  }
  function entrar(rol) { E.sesion = { rol }; E.rolProto = rol; $("#proto-rol").value = rol; }

  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("button, a"); if (!t) return;
    const d = t.dataset;
    if (t.id === "btn-cuenta") { E.menu = !E.menu; const m = $(".menu-cuenta"); if (m) m.remove(); else { const h = $(".cabecera"); h.insertAdjacentHTML("beforeend", `<div class="menu-cuenta" role="menu"><p><strong>${yo().nombre}</strong><br>${E.sesion.rol === "agricultor" ? "Agricultor" : "Compradora"}</p><button role="menuitem" data-accion="salir">${ic("salir")}Cerrar sesión</button></div>`); } t.setAttribute("aria-expanded", String(!!$(".menu-cuenta"))); return; }
    if (d.ver) { const i = $("#" + d.ver); const v = i.type === "password"; i.type = v ? "text" : "password"; t.innerHTML = ic(v ? "ojoNo" : "ojo"); t.setAttribute("aria-label", v ? "Ocultar contraseña" : "Mostrar contraseña"); return; }
    if (d.cat) { E.filtroCat = d.cat; $$(".chip[data-cat]").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === d.cat))); $("#zona-galeria").innerHTML = galeriaHTML(); return; }
    if (d.interes) {
      const p = prod(d.interes); E.intereses.add(p.id); p.int += 1;
      $("#zona-accion").innerHTML = contacto(p); $("#caja-contacto").focus();
      toast(`Listo. ${AGRI[p.agri].corto} ya sabe que te interesa.`); return;
    }
    if (d.copiar) { ev.preventDefault(); const ok = () => toast(`Número copiado: ${d.copiar}`, "copiar"); try { navigator.clipboard.writeText(d.copiar.replace(/\s/g, "")).then(ok, ok); } catch (e) { ok(); } return; }
    if (d.editar) { E.editando = Number(d.editar); E.borrador = null; ir("publicar"); return; }
    if (d.borrar) { E.confirmarBorrado = Number(d.borrar); render(); return; }
    if (d.siBorrar) { const i = P.findIndex((p) => p.id === Number(d.siBorrar)); const n = P[i].nombre; P.splice(i, 1); E.confirmarBorrado = null; render(); toast(`“${n}” se eliminó de tus publicaciones.`, "borrar"); return; }
    switch (d.accion) {
      case "salir": E.sesion = null; ir("login"); toast("Cerraste sesión.", "salir"); break;
      case "olvido": ev.preventDefault(); toast("Recuperar contraseña está fuera del alcance del MVP.", "info"); break;
      case "limpiar": E.filtroCat = "Todas"; E.filtroMun = ""; E.busqueda = ""; render(); break;
      case "no-borrar": E.confirmarBorrado = null; render(); break;
      case "leidos": AVISOS.forEach((a) => (a.nuevo = false)); render(); toast("Avisos marcados como leídos."); break;
      case "nuevo": E.editando = null; E.borrador = null; break;
      case "cancelar": E.editando = null; E.borrador = null; break;
      case "foto-ejemplo": E.borrador.arte = artePorNombre($("#p-nombre").value) || ARTE_POR_CAT[$("#p-cat").value] || "tomate"; E.borrador.foto = null; guardarBorrador(); render(); break;
      case "quitar-foto": E.borrador.arte = null; E.borrador.foto = null; guardarBorrador(); render(); break;
    }
  });
  function artePorNombre(n) {
    const t = n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const claves = { tomate: "tomate", mora: "mora", aguacate: "aguacate", platano: "platano", papa: "papa", lechuga: "lechuga", girasol: "girasol", rosa: "rosas", abono: "abono", compost: "abono", frijol: "frijol", cebolla: "cebolla", mango: "mango" };
    const k = Object.keys(claves).find((c) => t.includes(c));
    return k ? claves[k] : null;
  }
  function guardarBorrador() {
    const f = $("#f-publicar"); if (!f) return;
    const b = E.borrador;
    b.nombre = f.elements["p-nombre"].value; b.cat = f.elements["p-cat"].value; b.precio = f.elements["p-precio"].value.replace(/\D/g, "");
    b.unidad = f.elements["p-unidad"].value; b.estado = f.elements["p-estado"].value; b.mun = f.elements["p-mun"].value; b.desc = f.elements["p-desc"].value;
  }
  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.id === "busca") { E.busqueda = t.value; $("#zona-galeria").innerHTML = galeriaHTML(); return; }
    if (t.closest("#f-publicar")) {
      guardarBorrador();
      $("#vista-previa").innerHTML = previa();
      if (t.id === "p-desc") $("#contador").textContent = t.value.length;
      if (t.name === "p-estado") $("#bloque-precio").hidden = t.value === "exhibicion";
      const c = t.closest(".campo.con-error"); if (c && t.value.trim()) c.classList.remove("con-error");
    }
  });
  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.id === "f-mun") { E.filtroMun = t.value; $("#zona-galeria").innerHTML = galeriaHTML(); return; }
    if (t.dataset.estado) { const p = prod(t.dataset.estado); p.estado = t.checked ? "venta" : "exhibicion"; render(); toast(`${p.nombre}: ${t.checked ? "ahora está en venta" : "ahora es solo exhibición"}.`); return; }
    if (t.id === "foto" && t.files && t.files[0]) { const r = new FileReader(); r.onload = () => { guardarBorrador(); E.borrador.foto = r.result; render(); }; r.readAsDataURL(t.files[0]); return; }
    if (t.id === "proto-wf") { document.body.classList.toggle("wf", t.checked); return; }
    if (t.id === "proto-rol") { E.rolProto = t.value; if (E.sesion) { E.sesion.rol = t.value; } render(); return; }
    if (t.id === "proto-pantalla") {
      const v = t.value, req = PROTEGIDAS[v.startsWith("producto") ? "producto" : v];
      if (req) { const rol = req === 1 ? (E.sesion ? E.sesion.rol : E.rolProto) : req; entrar(rol); }
      if (v === "publicar") { E.editando = null; E.borrador = null; }
      ir(v);
    }
  });
  document.addEventListener("focusout", (ev) => { if (ev.target.id === "p-precio") ev.target.value = miles(ev.target.value); });
  document.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.id === "f-login") {
      if (!validar(f, { usuario: (v) => /@/.test(v) || /^3\d{9}$/.test(soloCel(v)), clave: (v) => v.length > 0 })) return;
      entrar(/@/.test(f.elements.usuario.value) ? "comprador" : "agricultor");
      ir("inicio"); toast(`Hola, ${yo().corto}. ${E.sesion.rol === "agricultor" ? "Bienvenido" : "Bienvenida"} a MiRaíz.`);
    }
    if (f.id === "f-registro") {
      const ok = validar(f, { nombre: (v) => v.length > 2, celular: (v) => /^3\d{9}$/.test(soloCel(v)), municipio: (v) => !!v, clave2: (v) => v.length >= 8, terminos: () => f.elements.terminos.checked });
      if (!ok) return;
      const rol = f.elements.rol.value; entrar(rol);
      if (rol === "agricultor") { ir("publicar"); toast("Cuenta creada. Ahora publica tu primer producto."); } else { ir("inicio"); toast("Cuenta creada. Ya puedes explorar productos."); }
    }
    if (f.id === "f-coment") {
      if (!validar(f, { coment: (v) => v.length > 0 })) return;
      const id = Number(location.hash.split("-")[1]); const u = yo();
      (COMENT[id] = COMENT[id] || []).push({ q: u.nombre, ini: u.ini, t: f.elements.coment.value.trim(), c: "Justo ahora", resp: E.sesion.rol === "agricultor" && prod(id).agri === "alirio" });
      render(); location.hash = "producto-" + id; toast("Comentario publicado. El agricultor recibió un aviso.", "mensaje");
    }
    if (f.id === "f-publicar") {
      guardarBorrador(); const b = E.borrador;
      const ok = validar(f, { foto: () => !!(b.foto || b.arte), "p-nombre": (v) => v.length > 1, "p-cat": (v) => !!v, "p-precio": (v) => b.estado === "exhibicion" || /^\d{2,7}$/.test(soloNum(v)) });
      if (!ok) return;
      if (E.editando) { Object.assign(prod(E.editando), { nombre: b.nombre, cat: b.cat, precio: Number(b.precio) || 0, unidad: b.unidad, estado: b.estado, mun: b.mun, desc: b.desc, arte: b.arte || prod(E.editando).arte, foto: b.foto }); toast("Cambios guardados."); }
      else { P.unshift({ id: Math.max(...P.map((p) => p.id)) + 1, nombre: b.nombre, cat: b.cat, precio: Number(b.precio) || 0, unidad: b.unidad, mun: b.mun, agri: "alirio", estado: b.estado, arte: b.arte || "tomate", foto: b.foto, r: 1.1, dias: 0, int: 0, vis: 0, desc: b.desc || "Producto recién publicado." }); toast("Producto publicado. Ya aparece en la galería."); }
      E.editando = null; E.borrador = null; ir("mis-productos");
    }
  });

  if (!location.hash) history.replaceState(null, "", "#login");
  window.addEventListener("hashchange", render);
  window.MiRaiz = { E, entrar, render }; // acceso para pruebas y capturas
  render();
})();
