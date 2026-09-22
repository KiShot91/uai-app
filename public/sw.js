self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installé');
});

self.addEventListener('fetch', (e) => {
  // Cette fonction vide est obligatoire pour que Chrome valide l'installation PWA
});