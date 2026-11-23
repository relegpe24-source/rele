/* Fondo 3D de WAR: una nube de puntos naranja, amarillo y verde que gira.
   - Se inclina con el giroscopio del celular (o con el mouse / el dedo).
   - Al girar el celular, sacudirlo o tocar el fondo, las piezas se reacomodan en otra figura. */
(function () {
  var lienzo = document.createElement('canvas');
  lienzo.id = 'esfera';
  lienzo.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(lienzo, document.body.firstChild);
  var ctx = lienzo.getContext('2d');
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, R = 0;

  var N = 520;
  var COLORES = ['#F7931E', '#FFC20E', '#8CC63F'];
  var puntos = [];
  for (var i = 0; i < N; i++) puntos.push({ x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, c: COLORES[i % 3] });

  /* ---------- Figuras (todas en radio 1) ---------- */
  function esfera(i) {                     // esfera de Fibonacci
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = i * 2.39996323;
    return [Math.cos(t) * r, y, Math.sin(t) * r];
  }
  function dona(i) {                       // toroide
    var a = (i / N) * Math.PI * 2 * 13, b = (i / N) * Math.PI * 2;
    var R1 = 0.68, r1 = 0.3;
    return [(R1 + r1 * Math.cos(a)) * Math.cos(b), r1 * Math.sin(a), (R1 + r1 * Math.cos(a)) * Math.sin(b)];
  }
  function cubo(i) {                       // puntos sobre las caras de un cubo
    var cara = i % 6, u = ((i * 0.618034) % 1) * 2 - 1, v = ((i * 0.754877) % 1) * 2 - 1, s = 0.72;
    var p = [[1, u, v], [-1, u, v], [u, 1, v], [u, -1, v], [u, v, 1], [u, v, -1]][cara];
    return [p[0] * s, p[1] * s, p[2] * s];
  }
  function helice(i) {                     // tres espirales, una por color
    var k = i % 3, t = (i / N) * Math.PI * 8, y = (i / N) * 2 - 1;
    var a = t + k * (Math.PI * 2 / 3);
    return [Math.cos(a) * 0.55, y, Math.sin(a) * 0.55];
  }
  function letras(i) {                     // las letras W A R en el aire
    var k = i % 3, t = Math.floor(i / 3) / (N / 3);
    var trazos = [
      [[-1, 1], [-0.5, -1], [0, 0.3], [0.5, -1], [1, 1]],          // W
      [[-1, -1], [0, 1], [1, -1], [0.5, 0], [-0.5, 0]],            // A
      [[-1, -1], [-1, 1], [0.6, 1], [0.9, 0.5], [0.6, 0], [-1, 0], [1, -1]] // R
    ][k];
    var seg = trazos.length - 1, f = t * seg, j = Math.min(Math.floor(f), seg - 1), q = f - j;
    var a = trazos[j], b = trazos[j + 1];
    var x = a[0] + (b[0] - a[0]) * q, y = a[1] + (b[1] - a[1]) * q;
    return [x * 0.26 + (k - 1) * 0.68, y * 0.42, ((i * 0.37) % 1 - 0.5) * 0.12];
  }
  var FIGURAS = [esfera, dona, cubo, helice, letras];
  var figura = -1;
  function siguiente() {
    figura = (figura + 1) % FIGURAS.length;
    var f = FIGURAS[figura];
    puntos.forEach(function (p, i) { var v = f(i); p.tx = v[0]; p.ty = v[1]; p.tz = v[2]; });
  }
  siguiente();
  puntos.forEach(function (p) { p.x = p.tx * 1.6; p.y = p.ty * 1.6; p.z = p.tz * 1.6; });

  /* ---------- Movimiento ---------- */
  var giroY = 0, giroX = 0.35;             // giro automático
  var inclX = 0, inclY = 0, metaX = 0, metaY = 0;   // inclinación por giroscopio o dedo

  function medir() {
    W = window.innerWidth; H = window.innerHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.46;
  }

  function dibujar() {
    ctx.fillStyle = '#0B140E';
    ctx.fillRect(0, 0, W, H);
    inclX += (metaX - inclX) * 0.08; inclY += (metaY - inclY) * 0.08;
    var ay = giroY + inclY, ax = giroX + inclX;
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    var cxp = W / 2, cyp = H * 0.5;
    var lista = [];
    for (var i = 0; i < N; i++) {
      var p = puntos[i];
      p.x += (p.tx - p.x) * 0.06; p.y += (p.ty - p.y) * 0.06; p.z += (p.tz - p.z) * 0.06;
      var x1 = p.x * cy - p.z * sy, z1 = p.x * sy + p.z * cy;
      var y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
      var esc = 2.6 / (2.6 + z2);
      lista.push([cxp + x1 * R * esc, cyp - y2 * R * esc, z2, esc, p.c]);
    }
    lista.sort(function (a, b) { return b[2] - a[2]; });
    for (var j = 0; j < lista.length; j++) {
      var q = lista[j];
      ctx.globalAlpha = Math.max(0.18, Math.min(1, 0.75 - q[2] * 0.45));
      ctx.fillStyle = q[4];
      ctx.beginPath(); ctx.arc(q[0], q[1], 2.6 * q[3], 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  var corriendo = true;
  function bucle() {
    if (!corriendo) return;
    giroY += 0.004;
    dibujar();
    requestAnimationFrame(bucle);
  }

  /* ---------- Sensores ---------- */
  function orientacion(e) {
    if (e.beta == null) return;
    metaX = Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * 0.9;   // adelante / atrás
    metaY = Math.max(-1, Math.min(1, e.gamma / 45)) * 0.9;         // izquierda / derecha
  }
  var ultimoCambio = 0;
  function cambiar() { var t = Date.now(); if (t - ultimoCambio > 900) { ultimoCambio = t; siguiente(); } }
  function movimiento(e) {
    var a = e.accelerationIncludingGravity || e.acceleration;
    if (!a) return;
    var fuerza = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    if (fuerza > 32) cambiar();                                    // sacudida
  }
  var sensoresListos = false;
  function activarSensores() {
    if (sensoresListos) return;
    sensoresListos = true;
    window.addEventListener('deviceorientation', orientacion);
    window.addEventListener('devicemotion', movimiento);
  }
  function pedirPermiso() {                                        // iPhone pide permiso con un toque
    var DO = window.DeviceOrientationEvent, DM = window.DeviceMotionEvent;
    if (DO && typeof DO.requestPermission === 'function') {
      DO.requestPermission().then(function (r) { if (r === 'granted') activarSensores(); }).catch(function () {});
      if (DM && typeof DM.requestPermission === 'function') DM.requestPermission().catch(function () {});
    } else { activarSensores(); }
  }
  if (!(window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function')) activarSensores();
  window.addEventListener('touchend', pedirPermiso, { once: true });
  window.addEventListener('click', pedirPermiso, { once: true });

  // Girar el celular (vertical ↔ horizontal) cambia la figura
  window.addEventListener('orientationchange', cambiar);
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', cambiar);

  // Mouse y dedo sobre el fondo
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'mouse') { metaY = (e.clientX / W - 0.5) * 1.4; metaX = (e.clientY / H - 0.5) * 1.0; }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('a,button')) cambiar();                  // tocar el fondo cambia la figura
  });

  medir();
  var espera;
  window.addEventListener('resize', function () { clearTimeout(espera); espera = setTimeout(function () { medir(); if (quieto) dibujar(); }, 120); });
  if (quieto) { for (var k = 0; k < 80; k++) { puntos.forEach(function (p) { p.x = p.tx; p.y = p.ty; p.z = p.tz; }); } dibujar(); return; }
  document.addEventListener('visibilitychange', function () { corriendo = !document.hidden; if (corriendo) requestAnimationFrame(bucle); });
  requestAnimationFrame(bucle);
})();
