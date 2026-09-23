/* Reduno · Captura de leads — popup logic */
const CRM_URL = "https://victorrierayarza-cpu.github.io/crm-captacion-inmobiliaria/";

let sel = { type: "vendedor", agency: "desconocido" };

/* ---- segmented controls ---- */
function wireSeg(id, key){
  document.getElementById(id).addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    sel[key] = b.dataset.v;
    b.parentElement.querySelectorAll("button").forEach(x=>x.classList.toggle("on", x===b));
  });
}
wireSeg("segType","type");
wireSeg("segAgency","agency");

const $ = id => document.getElementById(id);
$("btnCancel").onclick = ()=> window.close();

/* ---- This function runs INSIDE the listing page (injected) ---- */
function extractFromPage(){
  const out = { name:"", price:"", zone:"", phone:"", prop:"", source:"", agency:"", url:location.href, notes:"" };
  const host = location.hostname.replace(/^www\./,"");
  const SRC = {"idealista.com":"Idealista","fotocasa.es":"Fotocasa","wallapop.com":"Wallapop","vinted.es":"Vinted","milanuncios.com":"Milanuncios","habitaclia.com":"Habitaclia","pisos.com":"Otro"};
  out.source = SRC[Object.keys(SRC).find(k=>host.endsWith(k))] || "Otro";
  const txt = el => (el && (el.textContent||"").trim()) || "";
  const metaC = p => { const m=document.querySelector(`meta[property="${p}"],meta[name="${p}"]`); return m?m.content.trim():""; };

  // Title
  out.name = txt(document.querySelector("h1")) || metaC("og:title") || (document.title||"").split("|")[0].trim();

  // JSON-LD (many portals include structured data)
  try{
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{
      let data; try{ data = JSON.parse(s.textContent); }catch(e){ return; }
      const items = Array.isArray(data)?data:[data];
      items.forEach(it=>{
        if(!it||typeof it!=="object") return;
        const offers = it.offers||it.Offer;
        if(offers && (offers.price||offers.lowPrice) && !out.price) out.price = String(offers.price||offers.lowPrice);
        if(it.price && !out.price) out.price = String(it.price);
        const addr = it.address||(it.location&&it.location.address);
        if(addr && !out.zone){
          if(typeof addr==="string") out.zone = addr;
          else out.zone = [addr.addressLocality, addr.addressRegion, addr.streetAddress].filter(Boolean).join(", ");
        }
        if((it.telephone||(it.author&&it.author.telephone)) && !out.phone) out.phone = it.telephone||it.author.telephone;
      });
    });
  }catch(e){}

  const bodyText = document.body ? document.body.innerText : "";

  // Price fallback: first "123.456 €" pattern
  if(!out.price){
    const m = bodyText.match(/(\d{1,3}(?:[.\s]\d{3})+)\s*€/);
    if(m) out.price = m[1];
  }
  out.price = (out.price||"").replace(/[^\d]/g,"");

  // Phone fallback: tel: link or Spanish phone pattern (6/7/9 xx xx xx xx)
  if(!out.phone){
    const tel = document.querySelector('a[href^="tel:"]');
    if(tel) out.phone = tel.getAttribute("href").replace("tel:","").trim();
  }
  if(!out.phone){
    const m = bodyText.match(/(?:\+34[\s.-]?)?[679]\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/);
    if(m) out.phone = m[0].trim();
  }

  // Property type guess from title
  const t = (out.name||"").toLowerCase() + " " + bodyText.slice(0,400).toLowerCase();
  if(/\bchalet|casa\b/.test(t)) out.prop="Casa / Chalet";
  else if(/\bático|atico\b/.test(t)) out.prop="Ático";
  else if(/\bestudio\b/.test(t)) out.prop="Estudio";
  else if(/\blocal\b/.test(t)) out.prop="Local";
  else if(/\bterreno|parcela\b/.test(t)) out.prop="Terreno";
  else if(/\bgaraje|plaza de garaje\b/.test(t)) out.prop="Garaje";
  else if(/\bpiso|apartamento|vivienda\b/.test(t)) out.prop="Piso";

  // Zone fallback from title (after "en ")
  if(!out.zone){
    const m = (out.name||"").match(/\ben\s+(.+)$/i);
    if(m) out.zone = m[1].trim();
  }

  // Agency (particular vs profesional) — best effort
  const low = bodyText.toLowerCase();
  if(/\bparticular\b/.test(low) && !/\bprofesional|inmobiliaria|agencia\b/.test(low)) out.agency="no";
  else if(/\bprofesional|inmobiliaria|agencia\b/.test(low)) out.agency="si";
  else out.agency="desconocido";

  return out;
}

/* ---- Fill the form from extracted data ---- */
function setSeg(id,key,val){
  const wrap=document.getElementById(id);
  const btn=wrap.querySelector(`button[data-v="${val}"]`);
  if(btn){ sel[key]=val; wrap.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===btn)); }
}

async function init(){
  try{
    const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
    if(!tab || !tab.id || /^chrome:|^edge:|^about:/.test(tab.url||"")){
      $("statusText").textContent = "Abre un anuncio para capturarlo.";
      return;
    }
    let data = {};
    try{
      const res = await chrome.scripting.executeScript({ target:{tabId:tab.id}, func: extractFromPage });
      data = (res && res[0] && res[0].result) || {};
    }catch(e){
      // Page not accessible (e.g. store page); allow manual entry with URL
      data = { url: tab.url, source:"Otro", name:(tab.title||"").split("|")[0].trim() };
    }
    $("fName").value  = data.name  || "";
    $("fPhone").value = data.phone || "";
    $("fPrice").value = data.price || "";
    $("fZone").value  = data.zone  || "";
    $("fUrl").value   = data.url   || tab.url || "";
    $("fNotes").value = "";
    if(data.prop)   $("fProp").value = data.prop;
    if(data.source) $("fSource").value = data.source;
    setSeg("segAgency","agency", data.agency || "desconocido");

    const filled = [data.name,data.price,data.zone].filter(Boolean).length;
    $("statusText").textContent = filled ? "Anuncio leído — revisa y guarda." : "Rellena los datos y guarda.";
    $("warnNote").textContent = data.phone
      ? "Contacta tú a la persona y pide su consentimiento antes de enviar publicidad (RGPD/LSSI)."
      : "Este anuncio no muestra teléfono público. Puedes contactar por el chat del portal.";
  }catch(err){
    $("statusText").textContent = "No se pudo leer la página. Rellénalo a mano.";
  }
}

/* ---- Save: send lead to the CRM via URL hash ---- */
function b64(str){ return btoa(unescape(encodeURIComponent(str))); }

$("btnSave").onclick = async ()=>{
  const lead = {
    type: sel.type, agency: sel.agency,
    name: $("fName").value.trim(),
    phone: $("fPhone").value.trim(),
    price: $("fPrice").value.replace(/[^\d]/g,""),
    zone: $("fZone").value.trim(),
    prop: $("fProp").value,
    source: $("fSource").value,
    url: $("fUrl").value.trim(),
    notes: $("fNotes").value.trim()
  };
  if(!lead.name && !lead.phone){ $("statusText").textContent = "Pon al menos un nombre o teléfono."; return; }
  lead.n = Date.now(); // nonce so the hash always changes
  const target = CRM_URL + "#addlead=" + encodeURIComponent(b64(JSON.stringify(lead)));

  // Reuse an open CRM tab if there is one, else open a new tab
  try{
    const tabs = await chrome.tabs.query({ url: "https://victorrierayarza-cpu.github.io/crm-captacion-inmobiliaria/*" });
    if(tabs && tabs.length){
      await chrome.tabs.update(tabs[0].id, { url: target, active: true });
      try{ await chrome.windows.update(tabs[0].windowId, { focused:true }); }catch(e){}
    }else{
      await chrome.tabs.create({ url: target });
    }
    $("btnSave").textContent = "✓ Guardado";
    $("btnSave").disabled = true;
    setTimeout(()=>window.close(), 550);
  }catch(e){
    // Fallback: open in new tab
    window.open(target, "_blank");
    setTimeout(()=>window.close(), 550);
  }
};

init();
