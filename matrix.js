/* Fondo tipo Matrix para la tarjeta de R.E.L.E. — lluvia de caracteres verdes detrás del contenido. */
(function () {
  var lienzo = document.createElement('canvas');
  lienzo.id = 'matrix';
  lienzo.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(lienzo, document.body.firstChild);
  var ctx = lienzo.getContext('2d');

  var CARACTERES = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワ0123456789RELEWAR<>/{}=+*';
  var TAM = 16, columnas = 0, gotas = [], ancho = 0, alto = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function medir() {
    ancho = window.innerWidth; alto = window.innerHeight;
    lienzo.width = ancho * dpr; lienzo.height = alto * dpr;
    lienzo.style.width = ancho + 'px'; lienzo.style.height = alto + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columnas = Math.ceil(ancho / TAM);
    gotas = [];
    for (var i = 0; i < columnas; i++) gotas[i] = Math.floor(Math.random() * -alto / TAM);
    ctx.fillStyle = '#0B140E'; ctx.fillRect(0, 0, ancho, alto);
  }

  function letra() { return CARACTERES.charAt(Math.floor(Math.random() * CARACTERES.length)); }

  function cuadro() {
    ctx.fillStyle = 'rgba(11,20,14,0.09)';          // estela que se desvanece
    ctx.fillRect(0, 0, ancho, alto);
    ctx.font = '600 ' + TAM + 'px monospace';
    for (var i = 0; i < columnas; i++) {
      var y = gotas[i] * TAM;
      if (y > 0) {
        ctx.fillStyle = '#C9F29B';                  // la punta brilla más
        ctx.fillText(letra(), i * TAM, y);
        ctx.fillStyle = 'rgba(140,198,63,0.75)';
        ctx.fillText(letra(), i * TAM, y - TAM);
      }
      if (y > alto && Math.random() > 0.975) gotas[i] = 0;
      gotas[i]++;
    }
  }

  function estatico() {                              // sin animación: una sola imagen fija
    for (var k = 0; k < 40; k++) cuadro();
  }

  var ultimo = 0, corriendo = true;
  function bucle(t) {
    if (!corriendo) return;
    if (t - ultimo > 55) { cuadro(); ultimo = t; }   // ~18 cuadros por segundo: suave y no gasta batería
    requestAnimationFrame(bucle);
  }

  medir();
  var espera;
  window.addEventListener('resize', function () { clearTimeout(espera); espera = setTimeout(function () { medir(); if (quieto) estatico(); }, 150); });
  if (quieto) { estatico(); return; }
  document.addEventListener('visibilitychange', function () {
    corriendo = !document.hidden;
    if (corriendo) requestAnimationFrame(bucle);
  });
  requestAnimationFrame(bucle);
})();
