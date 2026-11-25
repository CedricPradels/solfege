// Service worker : fonctionne hors connexion après la première ouverture.
// Pour publier une nouvelle version, changez le numéro ci-dessous.
const V="solfege-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL))); self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("solfege-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return; const u=new URL(r.url);
  // Page : le réseau d'abord (pour recevoir les mises à jour), la copie locale si hors connexion
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(res=>{const cp=res.clone(); caches.open(V).then(c=>c.put("./index.html",cp)); return res;}).catch(()=>caches.match("./index.html"))); return;}
  // Fichiers du site et polices : copie locale tout de suite, rafraîchie en arrière-plan
  if(u.origin===location.origin||u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp));} return res;}).catch(()=>hit); return hit||net;}));
  }
});
