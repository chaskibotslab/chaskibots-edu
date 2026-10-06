-- ============================================================
-- FASE 11: 3 practicas por kit (antes 2) + cada cable con color
-- propio para que no se "fusionen" visualmente aunque compartan
-- el mismo pin fisico del board (GND/5V/3V3).
-- ============================================================

-- 1. Esquemas existentes (principales + adicionales con diagrama propio)
UPDATE kit_esquemas SET contenido = v.contenido FROM (VALUES
  ('kit-lv-octavo-egb', 'semaforo-inteligente', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 1195" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="1195" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Semáforo inteligente con paso peatonal</text><rect x="30" y="70" width="170" height="1055" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO</text>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="url(#gradDome)"/>
      <rect x="881" y="153" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="142" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 159 L 892 180 L 892 192" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 159 L 908 184" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="128" font-size="9" fill="#a8a29e">+</text><text x="892" y="217" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="197" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED AMARILLO</text>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="url(#gradDome)"/>
      <rect x="881" y="368" width="38" height="6" rx="2" fill="#ca8a04"/>
      <ellipse cx="894" cy="357" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 374 L 892 395 L 892 407" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 374 L 908 399" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="343" font-size="9" fill="#a8a29e">+</text><text x="892" y="432" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="412" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED VERDE</text>
      <path d="M 883 586 L 883 566 A 17 20 0 0 1 917 566 L 917 586 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
      <path d="M 883 586 L 883 566 A 17 20 0 0 1 917 566 L 917 586 Z" fill="url(#gradDome)"/>
      <rect x="881" y="583" width="38" height="6" rx="2" fill="#15803d"/>
      <ellipse cx="894" cy="572" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 589 L 892 610 L 892 622" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 589 L 908 614" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="558" font-size="9" fill="#a8a29e">+</text><text x="892" y="647" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="627" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><text x="900" y="739" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR PEATON</text>
      <rect x="879" y="778" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="778" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="797" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="797" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="821" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="832" r="2.6" fill="#1f2937"/><rect x="910.6" y="821" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="832" r="2.6" fill="#1f2937"/><text x="888" y="845" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="857" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><text x="900" y="954" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER PASIVO</text>
      <rect x="881" y="1000" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="1000" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="1000" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="1028" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="1039" r="2.6" fill="#1f2937"/><rect x="909.6" y="1028" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="1039" r="2.6" fill="#1f2937"/><text x="889" y="1052" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="1064" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><circle cx="200" cy="220.71428571428572" r="4" fill="#2563eb"/><rect x="204" y="205.71428571428572" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="216.71428571428572" font-size="12" font-weight="bold" fill="#2563eb">D8</text><circle cx="200" cy="371.42857142857144" r="4" fill="#2563eb"/><rect x="204" y="356.42857142857144" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="367.42857142857144" font-size="12" font-weight="bold" fill="#2563eb">D9</text><circle cx="200" cy="522.1428571428571" r="4" fill="#111827"/><rect x="204" y="507.1428571428571" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="518.1428571428571" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="672.8571428571429" r="4" fill="#ca8a04"/><rect x="204" y="657.8571428571429" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="668.8571428571429" font-size="12" font-weight="bold" fill="#ca8a04">D10</text><circle cx="200" cy="823.5714285714287" r="4" fill="#ca8a04"/><rect x="204" y="808.5714285714287" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="819.5714285714287" font-size="12" font-weight="bold" fill="#ca8a04">D2</text><circle cx="200" cy="974.2857142857143" r="4" fill="#ca8a04"/><rect x="204" y="959.2857142857143" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="970.2857142857143" font-size="12" font-weight="bold" fill="#ca8a04">D7</text><path d="M 200 220.71428571428572 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 220.71428571428572 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 892 192" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 371.42857142857144 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 371.42857142857144 V 348" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 348 L 233 348 A 5 5 0 0 1 243 348 L 742 348" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 892 407" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 522.1428571428571 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 522.1428571428571 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 908 184" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 522.1428571428571 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 522.1428571428571 V 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 332 L 742 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 908 399" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 522.1428571428571 H 250" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 522.1428571428571 V 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 547 L 257 547 A 5 5 0 0 1 267 547 L 269 547 A 5 5 0 0 1 279 547 L 742 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 908 614" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 522.1428571428571 H 262" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 522.1428571428571 V 778" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 778 L 269 778 A 5 5 0 0 1 279 778 L 742 778" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 778 L 912 832" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 522.1428571428571 H 274" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 522.1428571428571 V 993" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 993 L 742 993" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 993 L 911 1039" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 672.8571428571429 H 226" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 672.8571428571429 V 563" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 563 L 257 563 A 5 5 0 0 1 267 563 L 269 563 A 5 5 0 0 1 279 563 L 742 563" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 892 622" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 823.5714285714287 H 226" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 823.5714285714287 V 762" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 762 L 257 762 A 5 5 0 0 1 267 762 L 269 762 A 5 5 0 0 1 279 762 L 742 762" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 762 L 888 832" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="756" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><path d="M 200 974.2857142857143 H 226" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 974.2857142857143 V 977" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 977 L 269 977 A 5 5 0 0 1 279 977 L 742 977" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 977 L 889 1039" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="1159" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="1166" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="1176" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="1159" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="1166" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="1176" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="1159" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="1166" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="1176" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-noveno-egb', 'basurero-inteligente', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 765" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="765" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Basurero inteligente con apertura automática</text><rect x="30" y="70" width="170" height="625" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04</text>
      <rect x="856" y="138" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="153" r="6" fill="#1e293b"/>
      <circle cx="920" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="153" r="6" fill="#1e293b"/>
      <rect x="865.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="182" r="2.6" fill="#1f2937"/><rect x="887.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="182" r="2.6" fill="#1f2937"/><rect x="909.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="182" r="2.6" fill="#1f2937"/><rect x="931.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="182" r="2.6" fill="#1f2937"/><text x="867" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="889" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="911" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SERVOMOTOR SG90</text>
      <rect x="879" y="361" width="42" height="34" rx="3.5" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="361" width="42" height="34" rx="3.5" fill="url(#gradPlastic)"/>
      <rect x="873" y="371" width="54" height="9" rx="2" fill="#1e3a8a"/>
      <circle cx="878" cy="375.5" r="2.2" fill="#0f172a"/>
      <circle cx="922" cy="375.5" r="2.2" fill="#0f172a"/>
      <rect x="887" y="348" width="26" height="14" rx="2" fill="#f8fafc" stroke="#475569" stroke-width="1.3"/>
      <circle cx="900" cy="355" r="3.2" fill="#334155"/>
      <path d="M 884 354 L 916 354 M 900 339 L 900 369.5" stroke="#1e293b" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="884" cy="354" r="2" fill="#1e293b"/>
      <circle cx="916" cy="354" r="2" fill="#1e293b"/>
      <circle cx="900" cy="339" r="2" fill="#1e293b"/><path d="M 879 381 Q 870 385 866 408" fill="none" stroke="#334155" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="408" r="2.6" fill="#334155"/><path d="M 879 384 Q 870 388 866 419" fill="none" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="419" r="2.6" fill="#dc2626"/><path d="M 879 387 Q 870 391 866 430" fill="none" stroke="#1c1917" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="430" r="2.6" fill="#1c1917"/><text x="866" y="421" text-anchor="middle" font-size="9.5" fill="#57534e">Senal</text><text x="866" y="444" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="866" y="443" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED (tapa abierta)</text>
      <path d="M 883 586 L 883 566 A 17 20 0 0 1 917 566 L 917 586 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 586 L 883 566 A 17 20 0 0 1 917 566 L 917 586 Z" fill="url(#gradDome)"/>
      <rect x="881" y="583" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="572" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 589 L 892 610 L 892 622" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 589 L 908 614" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="558" font-size="9" fill="#a8a29e">+</text><text x="892" y="647" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="627" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><circle cx="200" cy="159.28571428571428" r="4" fill="#2563eb"/><rect x="204" y="144.28571428571428" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="155.28571428571428" font-size="12" font-weight="bold" fill="#2563eb">D9</text><circle cx="200" cy="248.57142857142858" r="4" fill="#2563eb"/><rect x="204" y="233.57142857142858" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="244.57142857142858" font-size="12" font-weight="bold" fill="#2563eb">D10</text><circle cx="200" cy="337.8571428571429" r="4" fill="#dc2626"/><rect x="204" y="322.8571428571429" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="333.8571428571429" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="427.14285714285717" r="4" fill="#ea580c"/><rect x="204" y="412.14285714285717" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="423.14285714285717" font-size="12" font-weight="bold" fill="#ea580c">D6</text><circle cx="200" cy="516.4285714285714" r="4" fill="#111827"/><rect x="204" y="501.42857142857144" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="512.4285714285714" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="605.7142857142858" r="4" fill="#ca8a04"/><rect x="204" y="590.7142857142858" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="601.7142857142858" font-size="12" font-weight="bold" fill="#ca8a04">D8</text><path d="M 200 159.28571428571428 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 159.28571428571428 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 911 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 248.57142857142858 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 248.57142857142858 V 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 933 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 337.8571428571429 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 337.8571428571429 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 867 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 337.8571428571429 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 337.8571428571429 V 348" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 348 L 742 348" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 866 419" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 427.14285714285717 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 427.14285714285717 V 332" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 866 408" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="326" font-size="9.5" fill="#57534e">PWM</text><path d="M 200 516.4285714285714 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 516.4285714285714 V 133" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 889 182" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 516.4285714285714 H 238" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 516.4285714285714 V 364" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 364 L 742 364" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 364 L 866 430" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 516.4285714285714 H 250" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 516.4285714285714 V 547" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 547 L 742 547" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 908 614" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 605.7142857142858 H 226" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 605.7142857142858 V 563" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 563 L 742 563" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 892 622" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="729" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="736" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="746" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="729" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="736" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="746" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="729" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="736" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="746" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-decimo-egb', 'sistema-riego-automatico', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 2072" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="2072" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Sistema de riego automático para plantas</text><rect x="30" y="70" width="170" height="1932" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HUMEDAD SUELO</text>
      <rect x="876" y="139" width="48" height="30" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="888" y="146" width="18" height="15" rx="1.5" fill="#0f172a"/>
      <circle cx="914" cy="148" r="2.6" fill="#4ade80"/>
      <rect x="880.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="180" r="2.6" fill="#1f2937"/><rect x="898.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="180" r="2.6" fill="#1f2937"/><rect x="916.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="180" r="2.6" fill="#1f2937"/><text x="882" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="205" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">MODULO RELE 1 CANAL</text>
      <rect x="873" y="352" width="54" height="35" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="896" y="356" width="27" height="26" rx="2.5" fill="#18181b"/>
      <rect x="896" y="356" width="27" height="26" rx="2.5" fill="url(#gradPlastic)"/>
      <rect x="878" y="359" width="14" height="20" rx="1.5" fill="#0891b2"/>
      <circle cx="881" cy="381" r="2.3" fill="#4ade80"/>
      <rect x="878.6" y="387" width="2.8" height="11" fill="#a1a1aa"/><circle cx="880" cy="398" r="2.6" fill="#1f2937"/><rect x="898.6" y="387" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="398" r="2.6" fill="#1f2937"/><rect x="918.6" y="387" width="2.8" height="11" fill="#a1a1aa"/><circle cx="920" cy="398" r="2.6" fill="#1f2937"/><text x="880" y="411" text-anchor="middle" font-size="9.5" fill="#57534e">IN</text><text x="900" y="423" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="920" y="411" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BOMBA DE AGUA 5V</text>
      <circle cx="900" cy="584" r="19" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.8"/>
      <circle cx="900" cy="584" r="7" fill="#334155"/>
      <rect x="916" y="580.5" width="13" height="7" rx="2" fill="#eab308" stroke="#92400e" stroke-width="1.2"/>
      <rect x="890" y="600" width="4" height="16" fill="#dc2626"/>
      <rect x="906" y="600" width="4" height="16" fill="#1c1917"/><text x="908" y="629" text-anchor="middle" font-size="9.5" fill="#57534e">- (GND comun con el Nano)</text><text x="900" y="739" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER ACTIVO</text>
      <rect x="881" y="785" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="785" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="785" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="813" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="824" r="2.6" fill="#1f2937"/><rect x="909.6" y="813" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="824" r="2.6" fill="#1f2937"/><text x="889" y="837" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="849" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><text x="900" y="954" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO (riego</text><text x="900" y="971" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">activo)</text>
      <path d="M 883 1033 L 883 1013 A 17 20 0 0 1 917 1013 L 917 1033 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 1033 L 883 1013 A 17 20 0 0 1 917 1013 L 917 1033 Z" fill="url(#gradDome)"/>
      <rect x="881" y="1030" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="1019" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 1036 L 892 1057 L 892 1069" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 1036 L 908 1061" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="1005" font-size="9" fill="#a8a29e">+</text><text x="892" y="1094" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="1074" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><text x="900" y="1186" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED AMARILLO (alerta)</text>
      <path d="M 883 1248 L 883 1228 A 17 20 0 0 1 917 1228 L 917 1248 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
      <path d="M 883 1248 L 883 1228 A 17 20 0 0 1 917 1228 L 917 1248 Z" fill="url(#gradDome)"/>
      <rect x="881" y="1245" width="38" height="6" rx="2" fill="#ca8a04"/>
      <ellipse cx="894" cy="1234" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 1251 L 892 1272 L 892 1284" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 1251 L 908 1276" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="1220" font-size="9" fill="#a8a29e">+</text><text x="892" y="1309" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="1289" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><text x="900" y="1401" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED VERDE (humedad ok)</text>
      <path d="M 883 1463 L 883 1443 A 17 20 0 0 1 917 1443 L 917 1463 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
      <path d="M 883 1463 L 883 1443 A 17 20 0 0 1 917 1443 L 917 1463 Z" fill="url(#gradDome)"/>
      <rect x="881" y="1460" width="38" height="6" rx="2" fill="#15803d"/>
      <ellipse cx="894" cy="1449" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 1466 L 892 1487 L 892 1499" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 1466 L 908 1491" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="1435" font-size="9" fill="#a8a29e">+</text><text x="892" y="1524" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="1504" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><text x="900" y="1616" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR MANUAL</text>
      <rect x="879" y="1655" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="1655" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="1674" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="1674" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="1698" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="1709" r="2.6" fill="#1f2937"/><rect x="910.6" y="1698" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="1709" r="2.6" fill="#1f2937"/><text x="888" y="1722" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="1734" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><text x="900" y="1831" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">POTENCIOMETRO (umbral)</text>
      <rect x="879" y="1874" width="42" height="34" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="1874" width="42" height="34" rx="3" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="1889" r="12" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
      <line x1="892.5" y1="1885.5" x2="907.5" y2="1892.5" stroke="#92400e" stroke-width="2.2"/>
      <rect x="886.6" y="1908" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="1919" r="2.6" fill="#1f2937"/><rect x="898.6" y="1908" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="1919" r="2.6" fill="#1f2937"/><rect x="910.6" y="1908" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="1919" r="2.6" fill="#1f2937"/><text x="888" y="1932" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal A</text><text x="900" y="1944" text-anchor="middle" font-size="9.5" fill="#57534e">Wiper</text><text x="912" y="1932" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal B</text><circle cx="200" cy="245.63636363636363" r="4" fill="#2563eb"/><rect x="204" y="230.63636363636363" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241.63636363636363" font-size="12" font-weight="bold" fill="#2563eb">A0</text><circle cx="200" cy="421.27272727272725" r="4" fill="#2563eb"/><rect x="204" y="406.27272727272725" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="417.27272727272725" font-size="12" font-weight="bold" fill="#2563eb">D7</text><circle cx="200" cy="596.9090909090909" r="4" fill="#2563eb"/><rect x="204" y="581.9090909090909" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="592.9090909090909" font-size="12" font-weight="bold" fill="#2563eb">D8</text><circle cx="200" cy="772.5454545454545" r="4" fill="#dc2626"/><rect x="204" y="757.5454545454545" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="768.5454545454545" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="948.1818181818181" r="4" fill="#111827"/><rect x="204" y="933.1818181818181" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="944.1818181818181" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="1123.8181818181818" r="4" fill="#0891b2"/><rect x="204" y="1108.8181818181818" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1119.8181818181818" font-size="12" font-weight="bold" fill="#0891b2">D9</text><circle cx="200" cy="1299.4545454545455" r="4" fill="#0891b2"/><rect x="204" y="1284.4545454545455" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1295.4545454545455" font-size="12" font-weight="bold" fill="#0891b2">D10</text><circle cx="200" cy="1475.090909090909" r="4" fill="#0891b2"/><rect x="204" y="1460.090909090909" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1471.090909090909" font-size="12" font-weight="bold" fill="#0891b2">D11</text><circle cx="200" cy="1650.7272727272725" r="4" fill="#0891b2"/><rect x="204" y="1635.7272727272725" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1646.7272727272725" font-size="12" font-weight="bold" fill="#0891b2">D2</text><circle cx="200" cy="1826.3636363636363" r="4" fill="#0891b2"/><rect x="204" y="1811.3636363636363" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1822.3636363636363" font-size="12" font-weight="bold" fill="#0891b2">A1</text><path d="M 200 245.63636363636363 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245.63636363636363 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 918 180" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 421.27272727272725 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 421.27272727272725 V 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 880 398" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 596.9090909090909 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 596.9090909090909 V 762" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 762 L 233 762 A 5 5 0 0 1 243 762 L 245 762 A 5 5 0 0 1 255 762 L 742 762" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 762 L 889 824" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 772.5454545454545 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 772.5454545454545 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 882 180" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 772.5454545454545 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 772.5454545454545 V 348" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 348 L 742 348" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 900 398" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 772.5454545454545 H 250" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 772.5454545454545 V 1854" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 1854 L 742 1854" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1854 L 888 1919" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 948.1818181818181 V 133" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 180" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 238" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 948.1818181818181 V 364" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 364 L 742 364" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 364 L 920 398" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 250" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 948.1818181818181 V 547" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 547 L 742 547" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 908 616" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 262" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 948.1818181818181 V 778" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 778 L 742 778" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 778 L 911 824" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 274" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 948.1818181818181 V 994" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 994 L 281 994 A 5 5 0 0 1 291 994 L 293 994 A 5 5 0 0 1 303 994 L 305 994 A 5 5 0 0 1 315 994 L 742 994" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 994 L 908 1061" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 286" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 286 948.1818181818181 V 1209" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 286 1209 L 293 1209 A 5 5 0 0 1 303 1209 L 305 1209 A 5 5 0 0 1 315 1209 L 742 1209" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1209 L 908 1276" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 298" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 298 948.1818181818181 V 1424" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 298 1424 L 305 1424 A 5 5 0 0 1 315 1424 L 742 1424" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1424 L 908 1491" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 310" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 310 948.1818181818181 V 1655" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 310 1655 L 742 1655" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1655 L 912 1709" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 948.1818181818181 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 948.1818181818181 V 1886" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1886 L 742 1886" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1886 L 912 1919" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1123.8181818181818 H 226" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1123.8181818181818 V 1010" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1010 L 245 1010 A 5 5 0 0 1 255 1010 L 281 1010 A 5 5 0 0 1 291 1010 L 293 1010 A 5 5 0 0 1 303 1010 L 305 1010 A 5 5 0 0 1 315 1010 L 742 1010" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1010 L 892 1069" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1299.4545454545455 H 226" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1299.4545454545455 V 1225" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1225 L 245 1225 A 5 5 0 0 1 255 1225 L 293 1225 A 5 5 0 0 1 303 1225 L 305 1225 A 5 5 0 0 1 315 1225 L 742 1225" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1225 L 892 1284" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1475.090909090909 H 226" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1475.090909090909 V 1440" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1440 L 245 1440 A 5 5 0 0 1 255 1440 L 305 1440 A 5 5 0 0 1 315 1440 L 742 1440" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1440 L 892 1499" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1650.7272727272725 H 226" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1650.7272727272725 V 1639" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1639 L 245 1639 A 5 5 0 0 1 255 1639 L 305 1639 A 5 5 0 0 1 315 1639 L 742 1639" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1639 L 888 1709" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="1633" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><path d="M 200 1826.3636363636363 H 226" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1826.3636363636363 V 1870" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1870 L 742 1870" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1870 L 900 1919" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="2036" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="2043" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="2053" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="2036" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="2043" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="2053" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="2036" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="2043" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="2053" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-primero-bach', 'estacion-meteorologica-iot', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 1410" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="1410" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Estación meteorológica con monitoreo ambiental</text><rect x="30" y="70" width="170" height="1270" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LDR + R1K (divisor)</text>
      <line x1="900" y1="120" x2="900" y2="134" stroke="#a8a29e" stroke-width="2.2"/>
      <circle cx="900" cy="141" r="13" fill="#fef9c3" stroke="#a16207" stroke-width="1.8"/>
      <circle cx="900" cy="141" r="13" fill="url(#gradDome)"/>
      <path d="M 892 137 L 897 137 L 894 141 L 899 141 L 897 145 L 901 145 L 899 141 L 903 141 L 901 137 L 906 137" fill="none" stroke="#a16207" stroke-width="1.2" stroke-linejoin="round"/>
      <line x1="900" y1="153" x2="900" y2="155" stroke="#a8a29e" stroke-width="2.2"/>
      <circle cx="900" cy="155" r="3.4" fill="#2563eb"/>
      <line x1="904" y1="155" x2="920" y2="155" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="923" y="159" font-size="9" fill="#2563eb">ADC</text>
      <line x1="900" y1="158" x2="900" y2="165" stroke="#a8a29e" stroke-width="2.2"/>
      <rect x="892" y="165" width="16" height="18" rx="2" fill="#e7cfa0" stroke="#92612a" stroke-width="1.3"/>
      <rect x="892" y="167.5" width="16" height="2.4" fill="#78350f"/>
      <rect x="892" y="171.5" width="16" height="2.4" fill="#ef4444"/>
      <rect x="892" y="175.5" width="16" height="2.4" fill="#854d0e"/>
      <line x1="900" y1="183" x2="900" y2="190" stroke="#a8a29e" stroke-width="2.2"/><text x="900" y="133" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal superior</text><text x="900" y="180" text-anchor="middle" font-size="9.5" fill="#57534e">Punto medio</text><text x="900" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal inferior</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">POTENCIOMETRO</text>
      <rect x="879" y="352" width="42" height="34" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="352" width="42" height="34" rx="3" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="367" r="12" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
      <line x1="892.5" y1="363.5" x2="907.5" y2="370.5" stroke="#92400e" stroke-width="2.2"/>
      <rect x="886.6" y="386" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="397" r="2.6" fill="#1f2937"/><rect x="898.6" y="386" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="397" r="2.6" fill="#1f2937"/><rect x="910.6" y="386" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="397" r="2.6" fill="#1f2937"/><text x="888" y="410" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal A</text><text x="900" y="422" text-anchor="middle" font-size="9.5" fill="#57534e">Wiper</text><text x="912" y="410" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal B</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR DHT11</text>
      <rect x="881" y="561" width="38" height="38" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="881" y="561" width="38" height="38" rx="4" fill="url(#gradPlastic)"/>
      <rect x="887" y="567" width="26" height="26" rx="2" fill="#1d4ed8"/>
      <line x1="891" y1="571" x2="891" y2="591" stroke="#93c5fd" stroke-width="1.6"/><line x1="897" y1="571" x2="897" y2="591" stroke="#93c5fd" stroke-width="1.6"/><line x1="903" y1="571" x2="903" y2="591" stroke="#93c5fd" stroke-width="1.6"/><line x1="909" y1="571" x2="909" y2="591" stroke="#93c5fd" stroke-width="1.6"/>
      <rect x="883" y="599" width="34" height="9" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="885.6" y="609" width="2.8" height="11" fill="#a1a1aa"/><circle cx="887" cy="620" r="2.6" fill="#1f2937"/><rect x="898.6" y="609" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="620" r="2.6" fill="#1f2937"/><rect x="911.6" y="609" width="2.8" height="11" fill="#a1a1aa"/><circle cx="913" cy="620" r="2.6" fill="#1f2937"/><text x="887" y="633" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="645" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="913" y="633" text-anchor="middle" font-size="9.5" fill="#57534e">DATA</text><text x="900" y="739" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER ACTIVO</text>
      <rect x="881" y="785" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="785" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="785" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="813" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="824" r="2.6" fill="#1f2937"/><rect x="909.6" y="813" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="824" r="2.6" fill="#1f2937"/><text x="889" y="837" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="849" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><text x="900" y="954" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED DE ALERTA</text>
      <path d="M 883 1016 L 883 996 A 17 20 0 0 1 917 996 L 917 1016 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 1016 L 883 996 A 17 20 0 0 1 917 996 L 917 1016 Z" fill="url(#gradDome)"/>
      <rect x="881" y="1013" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="1002" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 1019 L 892 1040 L 892 1052" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 1019 L 908 1044" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="988" font-size="9" fill="#a8a29e">+</text><text x="892" y="1077" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="1057" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><text x="900" y="1169" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR (modo)</text>
      <rect x="879" y="1208" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="1208" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="1227" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="1227" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="1251" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="1262" r="2.6" fill="#1f2937"/><rect x="910.6" y="1251" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="1262" r="2.6" fill="#1f2937"/><text x="888" y="1275" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="1287" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><circle cx="200" cy="211.11111111111111" r="4" fill="#2563eb"/><rect x="204" y="196.11111111111111" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="207.11111111111111" font-size="12" font-weight="bold" fill="#2563eb">GPIO0</text><circle cx="200" cy="352.22222222222223" r="4" fill="#dc2626"/><rect x="204" y="337.22222222222223" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="348.22222222222223" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="493.33333333333337" r="4" fill="#9333ea"/><rect x="204" y="478.33333333333337" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="489.33333333333337" font-size="12" font-weight="bold" fill="#9333ea">GPIO1</text><circle cx="200" cy="634.4444444444445" r="4" fill="#9333ea"/><rect x="204" y="619.4444444444445" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="630.4444444444445" font-size="12" font-weight="bold" fill="#9333ea">GPIO3</text><circle cx="200" cy="775.5555555555555" r="4" fill="#111827"/><rect x="204" y="760.5555555555555" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="771.5555555555555" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="916.6666666666667" r="4" fill="#16a34a"/><rect x="204" y="901.6666666666667" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="912.6666666666667" font-size="12" font-weight="bold" fill="#16a34a">GPIO4</text><circle cx="200" cy="1057.7777777777778" r="4" fill="#16a34a"/><rect x="204" y="1042.7777777777778" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1053.7777777777778" font-size="12" font-weight="bold" fill="#16a34a">GPIO5</text><circle cx="200" cy="1198.888888888889" r="4" fill="#16a34a"/><rect x="204" y="1183.888888888889" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1194.888888888889" font-size="12" font-weight="bold" fill="#16a34a">GPIO10</text><path d="M 200 211.11111111111111 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 211.11111111111111 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 155" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">ADC</text><path d="M 200 352.22222222222223 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 352.22222222222223 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 900 120" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 352.22222222222223 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 352.22222222222223 V 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 332 L 742 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 888 397" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 352.22222222222223 H 250" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 352.22222222222223 V 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 547 L 742 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 887 620" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 493.33333333333337 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 493.33333333333337 V 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 348 L 742 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 900 397" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="342" font-size="9.5" fill="#57534e">ADC</text><path d="M 200 634.4444444444445 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 634.4444444444445 V 579" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 579 L 233 579 A 5 5 0 0 1 243 579 L 245 579 A 5 5 0 0 1 255 579 L 742 579" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 579 L 913 620" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 775.5555555555555 H 226" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 775.5555555555555 V 149" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 900 190" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 775.5555555555555 H 238" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 775.5555555555555 V 364" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 364 L 245 364 A 5 5 0 0 1 255 364 L 742 364" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 364 L 912 397" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 775.5555555555555 H 250" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 775.5555555555555 V 563" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 563 L 742 563" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 900 620" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 775.5555555555555 H 262" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 775.5555555555555 V 778" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 778 L 742 778" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 778 L 911 824" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 775.5555555555555 H 274" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 775.5555555555555 V 977" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 977 L 281 977 A 5 5 0 0 1 291 977 L 742 977" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 977 L 908 1044" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 775.5555555555555 H 286" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 286 775.5555555555555 V 1208" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 286 1208 L 742 1208" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1208 L 912 1262" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 916.6666666666667 H 226" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 916.6666666666667 V 762" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 762 L 233 762 A 5 5 0 0 1 243 762 L 245 762 A 5 5 0 0 1 255 762 L 742 762" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 762 L 889 824" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1057.7777777777778 H 226" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1057.7777777777778 V 993" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 993 L 281 993 A 5 5 0 0 1 291 993 L 742 993" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 993 L 892 1052" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1198.888888888889 H 226" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1198.888888888889 V 1192" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1192 L 281 1192 A 5 5 0 0 1 291 1192 L 742 1192" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1192 L 888 1262" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="1186" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><rect x="30" y="1374" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="1381" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="1391" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="1374" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="1381" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="1391" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="1374" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="1381" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="1391" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-segundo-bach', 'domotica-inteligente', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 1407" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="1407" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Control inteligente de dispositivos del hogar</text><rect x="30" y="70" width="170" height="1267" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR PIR HC-SR501</text>
      <path d="M 878 162 A 22 22 0 0 1 922 162 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.6"/>
      <path d="M 878 162 A 22 22 0 0 1 922 162 Z" fill="url(#gradDome)"/>
      <path d="M 887 162 A 13 13 0 0 1 913 162" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
      <path d="M 894 162 A 6 6 0 0 1 906 162" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="875" y="160" width="50" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <rect x="881.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="883" cy="187" r="2.6" fill="#1f2937"/><rect x="898.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="187" r="2.6" fill="#1f2937"/><rect x="915.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="917" cy="187" r="2.6" fill="#1f2937"/><text x="883" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="917" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">OUT</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR LDR (modulo)</text>
      <rect x="876" y="351" width="48" height="38" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <circle cx="900" cy="365" r="12" fill="#fef9c3" stroke="#a16207" stroke-width="1.6"/>
      <circle cx="900" cy="365" r="12" fill="url(#gradDome)"/>
      <path d="M 893 360 L 898 360 L 895 365 L 900 365 L 898 370 L 902 370 L 900 365 L 905 365 L 902 360 L 907 360" fill="none" stroke="#a16207" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="880.6" y="389" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="400" r="2.6" fill="#1f2937"/><rect x="898.6" y="389" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="400" r="2.6" fill="#1f2937"/><rect x="916.6" y="389" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="400" r="2.6" fill="#1f2937"/><text x="882" y="413" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="425" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="413" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">RELE C/OPTOACOPLADOR</text>
      <rect x="873" y="567" width="54" height="35" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="896" y="571" width="27" height="26" rx="2.5" fill="#18181b"/>
      <rect x="896" y="571" width="27" height="26" rx="2.5" fill="url(#gradPlastic)"/>
      <rect x="878" y="574" width="14" height="20" rx="1.5" fill="#0891b2"/>
      <circle cx="881" cy="596" r="2.3" fill="#4ade80"/>
      <rect x="878.6" y="602" width="2.8" height="11" fill="#a1a1aa"/><circle cx="880" cy="613" r="2.6" fill="#1f2937"/><rect x="898.6" y="602" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="613" r="2.6" fill="#1f2937"/><rect x="918.6" y="602" width="2.8" height="11" fill="#a1a1aa"/><circle cx="920" cy="613" r="2.6" fill="#1f2937"/><text x="880" y="626" text-anchor="middle" font-size="9.5" fill="#57534e">IN</text><text x="900" y="638" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="920" y="626" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="900" y="739" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED DE CONFIRMACION</text>
      <path d="M 883 801 L 883 781 A 17 20 0 0 1 917 781 L 917 801 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 801 L 883 781 A 17 20 0 0 1 917 781 L 917 801 Z" fill="url(#gradDome)"/>
      <rect x="881" y="798" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="787" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 804 L 892 825 L 892 837" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 804 L 908 829" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="773" font-size="9" fill="#a8a29e">+</text><text x="892" y="862" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="842" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><text x="900" y="954" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR MANUAL</text>
      <rect x="879" y="993" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="993" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="1012" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="1012" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="1036" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="1047" r="2.6" fill="#1f2937"/><rect x="910.6" y="1036" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="1047" r="2.6" fill="#1f2937"/><text x="888" y="1060" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="1072" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><circle cx="200" cy="210.77777777777777" r="4" fill="#2563eb"/><rect x="204" y="195.77777777777777" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206.77777777777777" font-size="12" font-weight="bold" fill="#2563eb">GPIO27</text><circle cx="200" cy="351.55555555555554" r="4" fill="#dc2626"/><rect x="204" y="336.55555555555554" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="347.55555555555554" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="492.3333333333333" r="4" fill="#dc2626"/><rect x="204" y="477.3333333333333" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="488.3333333333333" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="633.1111111111111" r="4" fill="#ea580c"/><rect x="204" y="618.1111111111111" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="629.1111111111111" font-size="12" font-weight="bold" fill="#ea580c">GPIO34</text><circle cx="200" cy="773.8888888888889" r="4" fill="#ea580c"/><rect x="204" y="758.8888888888889" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="769.8888888888889" font-size="12" font-weight="bold" fill="#ea580c">GPIO26</text><circle cx="200" cy="914.6666666666666" r="4" fill="#111827"/><rect x="204" y="899.6666666666666" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="910.6666666666666" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="1055.4444444444443" r="4" fill="#4f46e5"/><rect x="204" y="1040.4444444444443" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1051.4444444444443" font-size="12" font-weight="bold" fill="#4f46e5">GPIO25</text><circle cx="200" cy="1196.2222222222222" r="4" fill="#4f46e5"/><rect x="204" y="1181.2222222222222" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1192.2222222222222" font-size="12" font-weight="bold" fill="#4f46e5">GPIO14</text><path d="M 200 210.77777777777777 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210.77777777777777 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 917 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 351.55555555555554 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 351.55555555555554 V 332" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 882 400" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 492.3333333333333 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 492.3333333333333 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 883 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 492.3333333333333 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 492.3333333333333 V 563" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 563 L 742 563" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 900 613" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 633.1111111111111 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 633.1111111111111 V 364" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 364 L 233 364 A 5 5 0 0 1 243 364 L 742 364" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 364 L 918 400" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="358" font-size="9.5" fill="#57534e">ADC1, solo entrada</text><path d="M 200 773.8888888888889 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 773.8888888888889 V 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 547 L 233 547 A 5 5 0 0 1 243 547 L 742 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 880 613" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 914.6666666666666 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 914.6666666666666 V 133" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 187" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 914.6666666666666 H 238" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 914.6666666666666 V 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 348 L 742 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 900 400" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 914.6666666666666 H 250" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 914.6666666666666 V 579" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 579 L 742 579" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 579 L 920 613" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 914.6666666666666 H 262" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 914.6666666666666 V 762" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 762 L 742 762" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 762 L 908 829" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 914.6666666666666 H 274" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 914.6666666666666 V 993" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 993 L 742 993" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 993 L 912 1047" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1055.4444444444443 H 226" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1055.4444444444443 V 778" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 778 L 233 778 A 5 5 0 0 1 243 778 L 245 778 A 5 5 0 0 1 255 778 L 257 778 A 5 5 0 0 1 267 778 L 742 778" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 778 L 892 837" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1196.2222222222222 H 226" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1196.2222222222222 V 977" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 977 L 269 977 A 5 5 0 0 1 279 977 L 742 977" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 977 L 888 1047" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="971" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><rect x="300" y="1155" width="540" height="202" rx="10" fill="#fee2e2" stroke="#b91c1c" stroke-width="2.5" stroke-dasharray="7,5"/><text x="316" y="1183" font-size="15" font-weight="bold" fill="#991b1b">ZONA 110V/220V - SOLO CON SUPERVISION DEL DOCENTE</text><text x="316" y="1209" font-size="13" fill="#7f1d1d">Enchufe -&gt; Interruptor -&gt; Contacto NO/COM del rele</text><text x="316" y="1232" font-size="13" fill="#7f1d1d">Contacto del rele -&gt; Boquilla E27 -&gt; LED (simula el foco)</text><text x="316" y="1255" font-size="13" fill="#7f1d1d">Alternativa: el mismo rele puede controlar un tomacorriente en vez de</text><text x="316" y="1278" font-size="13" fill="#7f1d1d">la boquilla</text><text x="316" y="1305" font-size="11.5" font-style="italic" fill="#991b1b">En el diagrama se usa un LED en vez del foco real. Esta parte del circuito</text><text x="316" y="1321" font-size="11.5" font-style="italic" fill="#991b1b">(110V) se arma y se prueba solo con el docente presente.</text><rect x="30" y="1371" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="1378" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="1388" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="1371" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="1378" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="1388" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="1371" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="1378" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="1388" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-tercero-bach', 'monitoreo-automatizacion-iot', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 1410" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="1410" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Sistema inteligente de monitoreo y automatización</text><rect x="30" y="70" width="170" height="1270" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LCD 16x2 + I2C</text>
      <rect x="864" y="136" width="72" height="36" rx="3" fill="#15803d" stroke="#14532d" stroke-width="1.8"/>
      <rect x="870" y="142" width="60" height="24" rx="1.5" fill="#166534"/>
      <rect x="873" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="880.4" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="887.8" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="895.2" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="902.6" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="910" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="917.4" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="924.8" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="873" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="880.4" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="887.8" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="895.2" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="902.6" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="910" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="917.4" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="924.8" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/>
      <rect x="880" y="172" width="20" height="11" rx="2" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1.2"/>
      <circle cx="890" cy="177.5" r="3.6" fill="#fbbf24" stroke="#92400e" stroke-width="1"/>
      <rect x="873.6" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="875" cy="197" r="2.6" fill="#1f2937"/><rect x="890.2666666666667" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="891.6666666666666" cy="197" r="2.6" fill="#1f2937"/><rect x="906.9333333333334" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="908.3333333333334" cy="197" r="2.6" fill="#1f2937"/><rect x="923.6" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="925" cy="197" r="2.6" fill="#1f2937"/><text x="875" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">SDA</text><text x="891.6666666666666" y="222" text-anchor="middle" font-size="9.5" fill="#57534e">SCL</text><text x="908.3333333333334" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="925" y="222" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR DHT11</text>
      <rect x="881" y="346" width="38" height="38" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="881" y="346" width="38" height="38" rx="4" fill="url(#gradPlastic)"/>
      <rect x="887" y="352" width="26" height="26" rx="2" fill="#1d4ed8"/>
      <line x1="891" y1="356" x2="891" y2="376" stroke="#93c5fd" stroke-width="1.6"/><line x1="897" y1="356" x2="897" y2="376" stroke="#93c5fd" stroke-width="1.6"/><line x1="903" y1="356" x2="903" y2="376" stroke="#93c5fd" stroke-width="1.6"/><line x1="909" y1="356" x2="909" y2="376" stroke="#93c5fd" stroke-width="1.6"/>
      <rect x="883" y="384" width="34" height="9" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="885.6" y="394" width="2.8" height="11" fill="#a1a1aa"/><circle cx="887" cy="405" r="2.6" fill="#1f2937"/><rect x="898.6" y="394" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="405" r="2.6" fill="#1f2937"/><rect x="911.6" y="394" width="2.8" height="11" fill="#a1a1aa"/><circle cx="913" cy="405" r="2.6" fill="#1f2937"/><text x="887" y="418" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="430" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="913" y="418" text-anchor="middle" font-size="9.5" fill="#57534e">DATA</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04P</text>
      <rect x="856" y="568" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="583" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="583" r="6" fill="#1e293b"/>
      <circle cx="920" cy="583" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="583" r="6" fill="#1e293b"/>
      <rect x="865.6" y="601" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="612" r="2.6" fill="#1f2937"/><rect x="887.6" y="601" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="612" r="2.6" fill="#1f2937"/><rect x="909.6" y="601" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="612" r="2.6" fill="#1f2937"/><rect x="931.6" y="601" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="612" r="2.6" fill="#1f2937"/><text x="867" y="625" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="889" y="637" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="911" y="625" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="637" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><text x="900" y="739" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR LDR (modulo)</text>
      <rect x="876" y="781" width="48" height="38" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <circle cx="900" cy="795" r="12" fill="#fef9c3" stroke="#a16207" stroke-width="1.6"/>
      <circle cx="900" cy="795" r="12" fill="url(#gradDome)"/>
      <path d="M 893 790 L 898 790 L 895 795 L 900 795 L 898 800 L 902 800 L 900 795 L 905 795 L 902 790 L 907 790" fill="none" stroke="#a16207" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="880.6" y="819" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="830" r="2.6" fill="#1f2937"/><rect x="898.6" y="819" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="830" r="2.6" fill="#1f2937"/><rect x="916.6" y="819" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="830" r="2.6" fill="#1f2937"/><text x="882" y="843" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="855" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="843" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><text x="900" y="954" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER ACTIVO</text>
      <rect x="881" y="1000" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="1000" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="1000" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="1028" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="1039" r="2.6" fill="#1f2937"/><rect x="909.6" y="1028" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="1039" r="2.6" fill="#1f2937"/><text x="889" y="1052" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="1064" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><text x="900" y="1169" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED DE ALERTA</text>
      <path d="M 883 1231 L 883 1211 A 17 20 0 0 1 917 1211 L 917 1231 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 1231 L 883 1211 A 17 20 0 0 1 917 1211 L 917 1231 Z" fill="url(#gradDome)"/>
      <rect x="881" y="1228" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="1217" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 1234 L 892 1255 L 892 1267" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 1234 L 908 1259" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="1203" font-size="9" fill="#a8a29e">+</text><text x="892" y="1292" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="1272" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><circle cx="200" cy="167.69230769230768" r="4" fill="#2563eb"/><rect x="204" y="152.69230769230768" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="163.69230769230768" font-size="12" font-weight="bold" fill="#2563eb">GPIO21</text><circle cx="200" cy="265.38461538461536" r="4" fill="#2563eb"/><rect x="204" y="250.38461538461536" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="261.38461538461536" font-size="12" font-weight="bold" fill="#2563eb">GPIO22</text><circle cx="200" cy="363.0769230769231" r="4" fill="#dc2626"/><rect x="204" y="348.0769230769231" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="359.0769230769231" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="460.7692307692308" r="4" fill="#2563eb"/><rect x="204" y="445.7692307692308" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="456.7692307692308" font-size="12" font-weight="bold" fill="#2563eb">GPIO4</text><circle cx="200" cy="558.4615384615385" r="4" fill="#dc2626"/><rect x="204" y="543.4615384615385" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="554.4615384615385" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="656.1538461538462" r="4" fill="#dc2626"/><rect x="204" y="641.1538461538462" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="652.1538461538462" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="753.8461538461538" r="4" fill="#ea580c"/><rect x="204" y="738.8461538461538" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="749.8461538461538" font-size="12" font-weight="bold" fill="#ea580c">GPIO17</text><circle cx="200" cy="851.5384615384615" r="4" fill="#ea580c"/><rect x="204" y="836.5384615384615" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="847.5384615384615" font-size="12" font-weight="bold" fill="#ea580c">GPIO16</text><circle cx="200" cy="949.2307692307693" r="4" fill="#111827"/><rect x="204" y="934.2307692307693" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="945.2307692307693" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="1046.923076923077" r="4" fill="#2563eb"/><rect x="204" y="1031.923076923077" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1042.923076923077" font-size="12" font-weight="bold" fill="#2563eb">GPIO32</text><circle cx="200" cy="1144.6153846153845" r="4" fill="#2563eb"/><rect x="204" y="1129.6153846153845" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1140.6153846153845" font-size="12" font-weight="bold" fill="#2563eb">GPIO19</text><circle cx="200" cy="1242.3076923076924" r="4" fill="#2563eb"/><rect x="204" y="1227.3076923076924" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="1238.3076923076924" font-size="12" font-weight="bold" fill="#2563eb">GPIO18</text><path d="M 200 167.69230769230768 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 167.69230769230768 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 875 197" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 265.38461538461536 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 265.38461538461536 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 891.6666666666666 197" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 363.0769230769231 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 363.0769230769231 V 149" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 908.3333333333334 197" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">sin conversor de nivel, directo</text><path d="M 200 460.7692307692308 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 460.7692307692308 V 364" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 364 L 233 364 A 5 5 0 0 1 243 364 L 742 364" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 364 L 913 405" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 558.4615384615385 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 558.4615384615385 V 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 887 405" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 558.4615384615385 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 558.4615384615385 V 762" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 762 L 245 762 A 5 5 0 0 1 255 762 L 742 762" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 762 L 882 830" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 656.1538461538462 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 656.1538461538462 V 547" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 547 L 233 547 A 5 5 0 0 1 243 547 L 742 547" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 867 612" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 753.8461538461538 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 753.8461538461538 V 579" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 579 L 233 579 A 5 5 0 0 1 243 579 L 245 579 A 5 5 0 0 1 255 579 L 742 579" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 579 L 911 612" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 851.5384615384615 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 851.5384615384615 V 595" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 595 L 233 595 A 5 5 0 0 1 243 595 L 245 595 A 5 5 0 0 1 255 595 L 742 595" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 595 L 933 612" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 949.2307692307693 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 949.2307692307693 V 165" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 925 197" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 949.2307692307693 H 238" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 949.2307692307693 V 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 348 L 742 348" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 900 405" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 949.2307692307693 H 250" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 949.2307692307693 V 563" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 250 563 L 742 563" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 889 612" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 949.2307692307693 H 262" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 949.2307692307693 V 778" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 262 778 L 742 778" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 778 L 900 830" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 949.2307692307693 H 274" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 949.2307692307693 V 993" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 274 993 L 281 993 A 5 5 0 0 1 291 993 L 742 993" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 993 L 911 1039" fill="none" stroke="#db2777" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 949.2307692307693 H 286" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 286 949.2307692307693 V 1192" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 286 1192 L 742 1192" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1192 L 908 1259" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1046.923076923077 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1046.923076923077 V 794" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 794 L 233 794 A 5 5 0 0 1 243 794 L 245 794 A 5 5 0 0 1 255 794 L 257 794 A 5 5 0 0 1 267 794 L 742 794" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 794 L 918 830" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="788" font-size="9.5" fill="#57534e">ADC1</text><path d="M 200 1144.6153846153845 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1144.6153846153845 V 977" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 977 L 269 977 A 5 5 0 0 1 279 977 L 281 977 A 5 5 0 0 1 291 977 L 742 977" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 977 L 889 1039" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 1242.3076923076924 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1242.3076923076924 V 1208" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 1208 L 742 1208" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 1208 L 892 1267" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="1374" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="1381" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="1391" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="1374" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="1381" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="1391" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="1374" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="1381" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="1391" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-octavo-egb', 'detector-obstaculos', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 765" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="765" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Detector de obstáculos</text><rect x="30" y="70" width="170" height="625" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR IR FC-51</text>
      <rect x="876" y="139" width="48" height="30" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="888" y="146" width="18" height="15" rx="1.5" fill="#0f172a"/>
      <circle cx="914" cy="148" r="2.6" fill="#4ade80"/>
      <rect x="898.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="180" r="2.6" fill="#1f2937"/><text x="900" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">OUT</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED AZUL (alerta)</text>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2"/>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="url(#gradDome)"/>
      <rect x="881" y="368" width="38" height="6" rx="2" fill="#1d4ed8"/>
      <ellipse cx="894" cy="357" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 374 L 892 395 L 892 407" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 374 L 908 399" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="343" font-size="9" fill="#a8a29e">+</text><text x="892" y="432" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="412" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER PASIVO</text>
      <rect x="881" y="570" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="570" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="570" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="598" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="609" r="2.6" fill="#1f2937"/><rect x="909.6" y="598" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="609" r="2.6" fill="#1f2937"/><text x="889" y="622" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="634" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><circle cx="200" cy="195" r="4" fill="#2563eb"/><rect x="204" y="180" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="191" font-size="12" font-weight="bold" fill="#2563eb">D4</text><circle cx="200" cy="320" r="4" fill="#2563eb"/><rect x="204" y="305" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="316" font-size="12" font-weight="bold" fill="#2563eb">D5</text><circle cx="200" cy="445" r="4" fill="#111827"/><rect x="204" y="430" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="441" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="570" r="4" fill="#ea580c"/><rect x="204" y="555" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="566" font-size="12" font-weight="bold" fill="#ea580c">D7</text><path d="M 200 195 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 195 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 900 180" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">LOW = detecta</text><path d="M 200 320 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 320 V 348" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 348 L 742 348" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 892 407" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 445 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 445 V 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 908 399" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 445 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 445 V 563" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 563 L 742 563" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 563 L 911 609" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 570 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 570 V 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 547 L 233 547 A 5 5 0 0 1 243 547 L 742 547" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 547 L 889 609" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="729" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="736" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="746" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="729" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="736" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="746" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="729" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="736" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="746" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-octavo-egb', 'control-servomotor', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 550" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="550" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Control de servomotor con potenciómetro</text><rect x="30" y="70" width="170" height="410" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">POTENCIOMETRO</text>
      <rect x="879" y="137" width="42" height="34" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="137" width="42" height="34" rx="3" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="12" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
      <line x1="892.5" y1="148.5" x2="907.5" y2="155.5" stroke="#92400e" stroke-width="2.2"/>
      <rect x="886.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="182" r="2.6" fill="#1f2937"/><rect x="898.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="182" r="2.6" fill="#1f2937"/><rect x="910.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="182" r="2.6" fill="#1f2937"/><text x="888" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal A</text><text x="900" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Wiper</text><text x="912" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal B</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SERVOMOTOR SG90</text>
      <rect x="879" y="361" width="42" height="34" rx="3.5" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="361" width="42" height="34" rx="3.5" fill="url(#gradPlastic)"/>
      <rect x="873" y="371" width="54" height="9" rx="2" fill="#1e3a8a"/>
      <circle cx="878" cy="375.5" r="2.2" fill="#0f172a"/>
      <circle cx="922" cy="375.5" r="2.2" fill="#0f172a"/>
      <rect x="887" y="348" width="26" height="14" rx="2" fill="#f8fafc" stroke="#475569" stroke-width="1.3"/>
      <circle cx="900" cy="355" r="3.2" fill="#334155"/>
      <path d="M 884 354 L 916 354 M 900 339 L 900 369.5" stroke="#1e293b" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="884" cy="354" r="2" fill="#1e293b"/>
      <circle cx="916" cy="354" r="2" fill="#1e293b"/>
      <circle cx="900" cy="339" r="2" fill="#1e293b"/><path d="M 879 381 Q 870 385 866 408" fill="none" stroke="#334155" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="408" r="2.6" fill="#334155"/><path d="M 879 384 Q 870 388 866 419" fill="none" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="419" r="2.6" fill="#dc2626"/><path d="M 879 387 Q 870 391 866 430" fill="none" stroke="#1c1917" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="430" r="2.6" fill="#1c1917"/><text x="866" y="421" text-anchor="middle" font-size="9.5" fill="#57534e">Senal</text><text x="866" y="444" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="866" y="443" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="152" r="4" fill="#2563eb"/><rect x="204" y="137" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="148" font-size="12" font-weight="bold" fill="#2563eb">A0</text><circle cx="200" cy="234" r="4" fill="#dc2626"/><rect x="204" y="219" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="230" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="316" r="4" fill="#111827"/><rect x="204" y="301" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="312" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="398" r="4" fill="#0891b2"/><rect x="204" y="383" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="394" font-size="12" font-weight="bold" fill="#0891b2">D6</text><path d="M 200 152 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 152 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 234 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 234 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 234 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 234 V 348" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 348 L 742 348" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 866 419" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 316 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 316 V 149" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 912 182" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 316 H 238" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 316 V 364" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 364 L 742 364" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 364 L 866 430" fill="none" stroke="#9333ea" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 398 H 226" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 398 V 332" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 233 332 A 5 5 0 0 1 243 332 L 742 332" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 866 408" fill="none" stroke="#0891b2" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="326" font-size="9.5" fill="#57534e">PWM</text><rect x="30" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="521" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="531" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="521" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="531" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="514" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="521" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="531" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-octavo-egb', 'piano-pulsadores', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 997" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="997" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Piano con pulsadores</text><rect x="30" y="70" width="170" height="857" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR DO</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="898.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="187" r="2.6" fill="#1f2937"/><text x="900" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1 (pin 2 a GND)</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR RE</text>
      <rect x="879" y="348" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="348" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="367" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="367" r="13.5" fill="url(#gradDome)"/>
      <rect x="898.6" y="391" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="402" r="2.6" fill="#1f2937"/><text x="900" y="415" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1 (pin 2 a GND)</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR MI</text><text x="900" y="541" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">(pull-down)</text>
      <rect x="879" y="580" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="580" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="599" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="599" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="623" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="634" r="2.6" fill="#1f2937"/><rect x="910.6" y="623" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="634" r="2.6" fill="#1f2937"/><text x="888" y="647" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1 + R10k a GND</text><text x="912" y="659" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><text x="900" y="756" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER PASIVO</text>
      <rect x="881" y="802" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="802" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="802" r="4.4" fill="#1e293b"/>
      <rect x="898.6" y="830" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="841" r="2.6" fill="#1f2937"/><text x="900" y="854" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><circle cx="200" cy="212.83333333333334" r="4" fill="#2563eb"/><rect x="204" y="197.83333333333334" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="208.83333333333334" font-size="12" font-weight="bold" fill="#2563eb">D2</text><circle cx="200" cy="355.6666666666667" r="4" fill="#2563eb"/><rect x="204" y="340.6666666666667" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="351.6666666666667" font-size="12" font-weight="bold" fill="#2563eb">D3</text><circle cx="200" cy="498.5" r="4" fill="#2563eb"/><rect x="204" y="483.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="494.5" font-size="12" font-weight="bold" fill="#2563eb">D4</text><circle cx="200" cy="641.3333333333334" r="4" fill="#dc2626"/><rect x="204" y="626.3333333333334" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="637.3333333333334" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="784.1666666666667" r="4" fill="#2563eb"/><rect x="204" y="769.1666666666667" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="780.1666666666667" font-size="12" font-weight="bold" fill="#2563eb">D8</text><path d="M 200 212.83333333333334 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 212.83333333333334 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 900 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><path d="M 200 355.6666666666667 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 355.6666666666667 V 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 900 402" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="326" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><path d="M 200 498.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 498.5 V 564" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 564 L 742 564" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 564 L 888 634" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="558" font-size="9.5" fill="#57534e">INPUT, presionado = HIGH</text><path d="M 200 641.3333333333334 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 641.3333333333334 V 580" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 580 L 742 580" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 580 L 912 634" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 784.1666666666667 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 784.1666666666667 V 779" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 779 L 742 779" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 779 L 900 841" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="961" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="968" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="978" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="961" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="968" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="978" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="961" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="968" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="978" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-noveno-egb', 'alarma-proximidad', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 997" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="997" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Alarma de proximidad (visual con LEDs)</text><rect x="30" y="70" width="170" height="857" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04</text>
      <rect x="856" y="138" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="153" r="6" fill="#1e293b"/>
      <circle cx="920" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="153" r="6" fill="#1e293b"/>
      <rect x="865.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="182" r="2.6" fill="#1f2937"/><rect x="931.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="182" r="2.6" fill="#1f2937"/><text x="867" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED (alarma)</text>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="url(#gradDome)"/>
      <rect x="881" y="368" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="357" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 374 L 892 395 L 892 407" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 374 L 908 399" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="343" font-size="9" fill="#a8a29e">+</text><text x="892" y="420" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="900" y="524" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">POTENCIOMETRO</text><text x="900" y="541" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">(sensibilidad)</text>
      <rect x="879" y="584" width="42" height="34" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="584" width="42" height="34" rx="3" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="599" r="12" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
      <line x1="892.5" y1="595.5" x2="907.5" y2="602.5" stroke="#92400e" stroke-width="2.2"/>
      <rect x="886.6" y="618" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="629" r="2.6" fill="#1f2937"/><rect x="898.6" y="618" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="629" r="2.6" fill="#1f2937"/><rect x="910.6" y="618" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="629" r="2.6" fill="#1f2937"/><text x="888" y="642" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal A</text><text x="900" y="654" text-anchor="middle" font-size="9.5" fill="#57534e">Wiper</text><text x="912" y="642" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal B</text><text x="900" y="756" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR (on/off)</text>
      <rect x="879" y="795" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="795" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="814" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="814" r="13.5" fill="url(#gradDome)"/>
      <rect x="898.6" y="838" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="849" r="2.6" fill="#1f2937"/><text x="900" y="862" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><circle cx="200" cy="177.125" r="4" fill="#2563eb"/><rect x="204" y="162.125" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="173.125" font-size="12" font-weight="bold" fill="#2563eb">D9</text><circle cx="200" cy="284.25" r="4" fill="#2563eb"/><rect x="204" y="269.25" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="280.25" font-size="12" font-weight="bold" fill="#2563eb">D10</text><circle cx="200" cy="391.375" r="4" fill="#2563eb"/><rect x="204" y="376.375" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="387.375" font-size="12" font-weight="bold" fill="#2563eb">D8</text><circle cx="200" cy="498.5" r="4" fill="#dc2626"/><rect x="204" y="483.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="494.5" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="605.625" r="4" fill="#2563eb"/><rect x="204" y="590.625" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="601.625" font-size="12" font-weight="bold" fill="#2563eb">A0</text><circle cx="200" cy="712.75" r="4" fill="#111827"/><rect x="204" y="697.75" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="708.75" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="819.875" r="4" fill="#2563eb"/><rect x="204" y="804.875" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="815.875" font-size="12" font-weight="bold" fill="#2563eb">D2</text><path d="M 200 177.125 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 177.125 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 867 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 284.25 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 284.25 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 933 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 391.375 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 391.375 V 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 892 407" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 498.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 498.5 V 564" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 564 L 742 564" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 564 L 888 629" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 605.625 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 605.625 V 580" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 580 L 742 580" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 580 L 900 629" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 712.75 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 712.75 V 596" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 596 L 742 596" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 596 L 912 629" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 819.875 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 819.875 V 779" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 779 L 742 779" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 779 L 900 849" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="773" font-size="9.5" fill="#57534e">INPUT_PULLUP</text><rect x="30" y="961" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="968" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="978" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="961" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="968" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="978" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="961" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="968" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="978" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ('kit-lv-primero-bach', 'contador-visitas', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 550" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="550" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Contador de visitas</text><rect x="30" y="70" width="170" height="410" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR IR FC-51</text>
      <rect x="876" y="139" width="48" height="30" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="888" y="146" width="18" height="15" rx="1.5" fill="#0f172a"/>
      <circle cx="914" cy="148" r="2.6" fill="#4ade80"/>
      <rect x="898.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="180" r="2.6" fill="#1f2937"/><text x="900" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">OUT</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER ACTIVO</text>
      <rect x="881" y="355" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="355" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="355" r="4.4" fill="#1e293b"/>
      <rect x="898.6" y="383" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="394" r="2.6" fill="#1f2937"/><text x="900" y="407" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><circle cx="200" cy="206.66666666666666" r="4" fill="#2563eb"/><rect x="204" y="191.66666666666666" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="202.66666666666666" font-size="12" font-weight="bold" fill="#2563eb">GPIO3</text><circle cx="200" cy="343.3333333333333" r="4" fill="#2563eb"/><rect x="204" y="328.3333333333333" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="339.3333333333333" font-size="12" font-weight="bold" fill="#2563eb">GPIO4</text><path d="M 200 206.66666666666666 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 206.66666666666666 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 900 180" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">LOW = detecta</text><path d="M 200 343.3333333333333 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 343.3333333333333 V 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332 L 742 332" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 900 394" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="326" font-size="9.5" fill="#57534e">mismo que el principal</text><rect x="30" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="521" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="531" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="521" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="531" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="514" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="521" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="531" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>')
) AS v(kit_id, slug, contenido)
WHERE kit_esquemas.proyecto_id = (SELECT id FROM kit_proyectos WHERE kit_proyectos.kit_id = v.kit_id AND kit_proyectos.slug = v.slug)
  AND kit_esquemas.tipo = 'svg';

-- 2. kit_proyectos: upsert de las 18 practicas (12 existentes + 6 nuevas)
INSERT INTO kit_proyectos (kit_id, titulo, slug, tipo, descripcion, objetivos, orden) VALUES
  ('kit-lv-octavo-egb', 'Enciende tu primer LED', 'practica-primer-led', 'practica', 'Antes de armar el semáforo completo, practica con una sola pieza: hacer que un LED parpadee.', ARRAY['Usar pinMode() y digitalWrite() para controlar una salida digital.', 'Entender por qué un LED necesita una resistencia en serie.'], -3),
  ('kit-lv-octavo-egb', 'Lee un pulsador', 'practica-pulsador', 'practica', 'Practica con el pulsador solo: enciende el LED mientras lo mantienes presionado.', ARRAY['Leer una entrada digital con digitalRead().', 'Usar INPUT_PULLUP para no necesitar una resistencia externa en el pulsador.'], -2),
  ('kit-lv-octavo-egb', 'Haz sonar el buzzer', 'practica-buzzer', 'practica', 'Practica con el buzzer solo: hazlo sonar antes de usarlo como aviso sonoro del semáforo.', ARRAY['Generar un sonido con tone() en un buzzer pasivo.', 'Detener un sonido con noTone().'], -1),
  ('kit-lv-noveno-egb', 'Enciende el LED indicador', 'practica-led-tapa', 'practica', 'Antes del basurero completo, practica con el LED solo: es el que avisa que la tapa está abierta.', ARRAY['Usar pinMode() y digitalWrite() para controlar una salida digital.', 'Entender por qué un LED necesita una resistencia en serie.'], -3),
  ('kit-lv-noveno-egb', 'Mide distancia con el sensor ultrasónico', 'practica-sensor-distancia', 'practica', 'Antes del basurero inteligente, practica con el sensor solo: mide la distancia y míralo en el Monitor Serial.', ARRAY['Entender como un sensor ultrasonico mide distancia con un pulso de sonido.', 'Usar el Monitor Serial para ver datos en tiempo real.'], -2),
  ('kit-lv-noveno-egb', 'Mueve el servomotor', 'practica-servomotor', 'practica', 'Practica con el servomotor solo: hazlo girar de un lado a otro antes de usarlo como tapa del basurero.', ARRAY['Controlar la posicion de un servomotor con la libreria Servo.', 'Entender el rango de movimiento de 0 a 180 grados.'], -1),
  ('kit-lv-decimo-egb', 'Lee la humedad del suelo', 'practica-humedad-suelo', 'practica', 'Antes del sistema de riego, practica con el sensor de humedad solo: mira sus valores en el Monitor Serial.', ARRAY['Leer un sensor analogico con analogRead().', 'Relacionar el valor numerico con tierra humeda o seca.'], -3),
  ('kit-lv-decimo-egb', 'Ajusta el umbral con el potenciómetro', 'practica-potenciometro', 'practica', 'Practica con el potenciómetro solo: gíralo y mira cómo cambia el valor en el Monitor Serial.', ARRAY['Leer un potenciómetro con analogRead().', 'Entender cómo un potenciómetro deja ajustar un umbral sin reprogramar el Arduino.'], -2),
  ('kit-lv-decimo-egb', 'Enciende la bomba con el relé', 'practica-rele', 'practica', 'Practica con el relé solo: enciéndelo y apágalo cada segundo antes de conectarlo al sensor.', ARRAY['Entender que un rele es un interruptor controlado por una señal digital.', 'Controlar un actuador de mayor corriente de forma segura.'], -1),
  ('kit-lv-primero-bach', 'Lee temperatura y humedad', 'practica-dht11', 'practica', 'Antes de la estación meteorológica completa, practica con el sensor DHT11 solo.', ARRAY['Usar una libreria externa (DHT sensor library) por primera vez.', 'Leer dos datos distintos (temperatura y humedad) del mismo sensor.'], -2),
  ('kit-lv-primero-bach', 'Lee el sensor de luz', 'practica-ldr', 'practica', 'Practica con el LDR solo: mira cómo cambia el valor al tapar el sensor con la mano.', ARRAY['Leer un sensor analogico en un microcontrolador de 3.3V (rango 0-4095).', 'Relacionar el valor con mas luz o menos luz.'], -3),
  ('kit-lv-primero-bach', 'Lee el pulsador de modo', 'practica-pulsador-modo', 'practica', 'Practica con el pulsador solo: cada vez que lo presionas, cambia de modo en el Monitor Serial.', ARRAY['Leer una entrada digital con INPUT_PULLUP en un ESP32.', 'Detectar un cambio de estado (flanco) para contar presiones, no solo leer el nivel actual.'], -1),
  ('kit-lv-segundo-bach', 'Detecta movimiento', 'practica-pir', 'practica', 'Antes de automatizar la luz, practica con el sensor PIR solo: mira cuándo detecta movimiento.', ARRAY['Leer una señal digital de un sensor de movimiento (PIR).', 'Entender que el PIR necesita unos segundos para calibrarse al encender.'], -3),
  ('kit-lv-segundo-bach', 'Lee el sensor de luz', 'practica-ldr-domotica', 'practica', 'Practica con el sensor de luz solo: mira cómo cambia el valor al tapar el sensor con la mano.', ARRAY['Leer un sensor analogico de luz en un ESP32 (rango 0-4095).', 'Relacionar el valor con mas luz o menos luz ambiental.'], -2),
  ('kit-lv-segundo-bach', 'Prueba el relé', 'practica-rele-domotica', 'practica', 'Practica con el relé solo: enciéndelo y apágalo antes de conectarlo al sensor de movimiento.', ARRAY['Controlar un rele con optoacoplador desde un ESP32.', 'Entender que el ESP32 solo activa la bobina del rele, nunca toca 110V directamente.'], -1),
  ('kit-lv-tercero-bach', 'Lee temperatura y humedad', 'practica-dht11-monitoreo', 'practica', 'Antes del sistema completo, practica con el sensor DHT11 solo.', ARRAY['Usar la libreria DHT sensor library por primera vez.', 'Leer dos datos distintos (temperatura y humedad) del mismo sensor.'], -3),
  ('kit-lv-tercero-bach', 'Muestra texto en la pantalla LCD', 'practica-lcd', 'practica', 'Antes del sistema completo, practica con la pantalla LCD sola: escribe un mensaje fijo.', ARRAY['Inicializar una pantalla LCD por el protocolo I2C.', 'Escribir texto en una posicion especifica de la pantalla.'], -1),
  ('kit-lv-tercero-bach', 'Mide la distancia', 'practica-distancia', 'practica', 'Practica con el sensor ultrasónico solo antes de combinarlo con el resto del sistema.', ARRAY['Medir distancia con un sensor ultrasonico tolerante a 3.3-5V.', 'Mostrar el resultado por el Monitor Serial.'], -2)
ON CONFLICT (kit_id, slug) DO UPDATE SET
  titulo = EXCLUDED.titulo, descripcion = EXCLUDED.descripcion, objetivos = EXCLUDED.objetivos, orden = EXCLUDED.orden;

-- 3. Conexiones completas de las 18 practicas
DELETE FROM kit_conexiones WHERE proyecto_id IN (
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia')
);

INSERT INTO kit_conexiones (proyecto_id, componente, pin_componente, pin_placa, nota, orden) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'LED ROJO', 'Catodo (-) via R330', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'PULSADOR PEATON', 'Pin 1', 'D2', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'PULSADOR PEATON', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'LED ROJO', 'Anodo (+)', 'D8', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'LED ROJO', 'Catodo (-) via R330', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'BUZZER PASIVO', '+', 'D7', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'BUZZER PASIVO', '-', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'LED (tapa abierta)', 'Anodo (+) via R330', 'D8', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'LED (tapa abierta)', 'Catodo (-)', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'VCC', '5V', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'Trig', 'D9', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'SENSOR HC-SR04', 'Echo', 'D10', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'SERVOMOTOR SG90', 'Senal', 'D6', 'PWM, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'SERVOMOTOR SG90', 'VCC', '5V', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'SERVOMOTOR SG90', 'GND', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'SENSOR HUMEDAD SUELO', 'VCC', '5V', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'SENSOR HUMEDAD SUELO', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'SENSOR HUMEDAD SUELO', 'AOUT', 'A0', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'POTENCIOMETRO (umbral)', 'Terminal A', '5V', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'POTENCIOMETRO (umbral)', 'Wiper', 'A1', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'POTENCIOMETRO (umbral)', 'Terminal B', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'MODULO RELE 1 CANAL', 'IN', 'D7', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'MODULO RELE 1 CANAL', 'VCC', '5V', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'MODULO RELE 1 CANAL', 'GND', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'SENSOR DHT11', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'SENSOR DHT11', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'SENSOR DHT11', 'DATA', 'GPIO3', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'LDR + R1K (divisor)', 'Terminal superior', '3V3', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'LDR + R1K (divisor)', 'Punto medio', 'GPIO0', 'ADC', 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'LDR + R1K (divisor)', 'Terminal inferior', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'PULSADOR (modo)', 'Pin 1', 'GPIO10', 'INPUT_PULLUP, mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'PULSADOR (modo)', 'Pin 2', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'SENSOR PIR HC-SR501', 'VCC', 'VIN (5V)', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'SENSOR PIR HC-SR501', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'SENSOR PIR HC-SR501', 'OUT', 'GPIO27', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'SENSOR LDR (modulo)', 'VCC', '3V3', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'SENSOR LDR (modulo)', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'SENSOR LDR (modulo)', 'AOUT', 'GPIO34', 'ADC1, solo entrada', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'RELE C/OPTOACOPLADOR', 'IN', 'GPIO26', 'mismo pin que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'RELE C/OPTOACOPLADOR', 'VCC', 'VIN (5V)', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'RELE C/OPTOACOPLADOR', 'GND', 'GND', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'SENSOR DHT11', 'VCC', '3V3', NULL, 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'SENSOR DHT11', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'SENSOR DHT11', 'DATA', 'GPIO4', 'mismo pin que el principal', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'SDA', 'GPIO21', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'SCL', 'GPIO22', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'VCC', 'VIN (5V)', 'sin conversor de nivel, directo', 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'LCD 16x2 + I2C', 'GND', 'GND', NULL, 4),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'VCC', '5V', 'mismo que el principal', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'GND', 'GND', NULL, 2),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'Trig', 'GPIO17', NULL, 3),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'SENSOR HC-SR04P', 'Echo', 'GPIO16', NULL, 4)
ON CONFLICT (proyecto_id, componente, pin_componente) DO UPDATE SET pin_placa = EXCLUDED.pin_placa, nota = EXCLUDED.nota, orden = EXCLUDED.orden;

-- 4. Diagrama propio de cada practica
DELETE FROM kit_esquemas WHERE proyecto_id IN (
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia')
);

INSERT INTO kit_esquemas (proyecto_id, tipo, contenido) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende tu primer LED</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO</text>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="url(#gradDome)"/>
      <rect x="881" y="153" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="142" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 159 L 892 180 L 892 192" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 159 L 908 184" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="128" font-size="9" fill="#a8a29e">+</text><text x="892" y="217" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="197" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><circle cx="200" cy="186.66666666666669" r="4" fill="#111827"/><rect x="204" y="171.66666666666669" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="303.33333333333337" r="4" fill="#2563eb"/><rect x="204" y="288.33333333333337" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#2563eb">D8</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 908 184" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 892 192" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 550" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="550" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee un pulsador</text><rect x="30" y="70" width="170" height="410" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR PEATON</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="187" r="2.6" fill="#1f2937"/><rect x="910.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="187" r="2.6" fill="#1f2937"/><text x="888" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><text x="900" y="309" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED ROJO</text>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="#f87171" stroke="#b91c1c" stroke-width="2"/>
      <path d="M 883 371 L 883 351 A 17 20 0 0 1 917 351 L 917 371 Z" fill="url(#gradDome)"/>
      <rect x="881" y="368" width="38" height="6" rx="2" fill="#b91c1c"/>
      <ellipse cx="894" cy="357" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 374 L 892 395 L 892 407" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 374 L 908 399" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="343" font-size="9" fill="#a8a29e">+</text><text x="892" y="432" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+)</text><text x="908" y="412" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-) via R330</text><circle cx="200" cy="172.5" r="4" fill="#2563eb"/><rect x="204" y="157.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="168.5" font-size="12" font-weight="bold" fill="#2563eb">D2</text><circle cx="200" cy="275" r="4" fill="#111827"/><rect x="204" y="260" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="271" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="377.5" r="4" fill="#ea580c"/><rect x="204" y="362.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="373.5" font-size="12" font-weight="bold" fill="#ea580c">D8</text><path d="M 200 172.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 172.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP, mismo pin que el principal</text><path d="M 200 275 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 275 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 912 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 275 H 238" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 275 V 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 238 332 L 742 332" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 332 L 908 399" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 377.5 H 226" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 377.5 V 348" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 348 L 742 348" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 348 L 892 407" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="342" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="521" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="531" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="514" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="521" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="531" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="514" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="521" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="531" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Haz sonar el buzzer</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino UNO R3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">BUZZER PASIVO</text>
      <rect x="881" y="140" width="38" height="28" rx="4" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.6"/>
      <ellipse cx="900" cy="140" rx="19" ry="5.5" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
      <circle cx="900" cy="140" r="4.4" fill="#1e293b"/>
      <rect x="887.6" y="168" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="179" r="2.6" fill="#1f2937"/><rect x="909.6" y="168" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="179" r="2.6" fill="#1f2937"/><text x="889" y="192" text-anchor="middle" font-size="9.5" fill="#57534e">+</text><text x="911" y="204" text-anchor="middle" font-size="9.5" fill="#57534e">-</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">D7</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 889 179" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 911 179" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende el LED indicador</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LED (tapa abierta)</text>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <path d="M 883 156 L 883 136 A 17 20 0 0 1 917 136 L 917 156 Z" fill="url(#gradDome)"/>
      <rect x="881" y="153" width="38" height="6" rx="2" fill="#9ca3af"/>
      <ellipse cx="894" cy="142" rx="4" ry="7" fill="white" fill-opacity="0.75"/><path d="M 892 159 L 892 180 L 892 192" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><path d="M 908 159 L 908 184" fill="none" stroke="#a8a29e" stroke-width="2.6" stroke-linecap="round"/><text x="876" y="128" font-size="9" fill="#a8a29e">+</text><text x="892" y="217" text-anchor="middle" font-size="9.5" fill="#57534e">Anodo (+) via R330</text><text x="908" y="197" text-anchor="middle" font-size="9.5" fill="#57534e">Catodo (-)</text><circle cx="200" cy="186.66666666666669" r="4" fill="#111827"/><rect x="204" y="171.66666666666669" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="303.33333333333337" r="4" fill="#2563eb"/><rect x="204" y="288.33333333333337" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#2563eb">D8</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 908 184" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 892 192" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Mide distancia con el sensor ultrasónico</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04</text>
      <rect x="856" y="138" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="153" r="6" fill="#1e293b"/>
      <circle cx="920" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="153" r="6" fill="#1e293b"/>
      <rect x="865.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="182" r="2.6" fill="#1f2937"/><rect x="887.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="182" r="2.6" fill="#1f2937"/><rect x="909.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="182" r="2.6" fill="#1f2937"/><rect x="931.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="182" r="2.6" fill="#1f2937"/><text x="867" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="889" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="911" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><circle cx="200" cy="140" r="4" fill="#dc2626"/><rect x="204" y="125" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="136" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="210" r="4" fill="#111827"/><rect x="204" y="195" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="280" r="4" fill="#2563eb"/><rect x="204" y="265" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="276" font-size="12" font-weight="bold" fill="#2563eb">D9</text><circle cx="200" cy="350" r="4" fill="#2563eb"/><rect x="204" y="335" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="346" font-size="12" font-weight="bold" fill="#2563eb">D10</text><path d="M 200 140 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 140 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 867 182" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo que el principal</text><path d="M 200 210 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 889 182" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 280 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 280 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 911 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 350 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 350 V 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 933 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Mueve el servomotor</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">(CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SERVOMOTOR SG90</text>
      <rect x="879" y="146" width="42" height="34" rx="3.5" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="146" width="42" height="34" rx="3.5" fill="url(#gradPlastic)"/>
      <rect x="873" y="156" width="54" height="9" rx="2" fill="#1e3a8a"/>
      <circle cx="878" cy="160.5" r="2.2" fill="#0f172a"/>
      <circle cx="922" cy="160.5" r="2.2" fill="#0f172a"/>
      <rect x="887" y="133" width="26" height="14" rx="2" fill="#f8fafc" stroke="#475569" stroke-width="1.3"/>
      <circle cx="900" cy="140" r="3.2" fill="#334155"/>
      <path d="M 884 139 L 916 139 M 900 124 L 900 154.5" stroke="#1e293b" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="884" cy="139" r="2" fill="#1e293b"/>
      <circle cx="916" cy="139" r="2" fill="#1e293b"/>
      <circle cx="900" cy="124" r="2" fill="#1e293b"/><path d="M 879 166 Q 870 170 866 193" fill="none" stroke="#334155" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="193" r="2.6" fill="#334155"/><path d="M 879 169 Q 870 173 866 204" fill="none" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="204" r="2.6" fill="#dc2626"/><path d="M 879 172 Q 870 176 866 215" fill="none" stroke="#1c1917" stroke-width="2.6" stroke-linecap="round"/><circle cx="866" cy="215" r="2.6" fill="#1c1917"/><text x="866" y="206" text-anchor="middle" font-size="9.5" fill="#57534e">Senal</text><text x="866" y="229" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="866" y="228" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="157.5" r="4" fill="#2563eb"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#2563eb">D6</text><circle cx="200" cy="245" r="4" fill="#dc2626"/><rect x="204" y="230" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 866 193" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">PWM, mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 866 204" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 866 215" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee la humedad del suelo</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HUMEDAD SUELO</text>
      <rect x="876" y="139" width="48" height="30" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="888" y="146" width="18" height="15" rx="1.5" fill="#0f172a"/>
      <circle cx="914" cy="148" r="2.6" fill="#4ade80"/>
      <rect x="880.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="180" r="2.6" fill="#1f2937"/><rect x="898.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="180" r="2.6" fill="#1f2937"/><rect x="916.6" y="169" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="180" r="2.6" fill="#1f2937"/><text x="882" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="205" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="193" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">A0</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 882 180" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 180" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 918 180" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Ajusta el umbral con el potenciómetro</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">POTENCIOMETRO (umbral)</text>
      <rect x="879" y="137" width="42" height="34" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="879" y="137" width="42" height="34" rx="3" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="12" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
      <line x1="892.5" y1="148.5" x2="907.5" y2="155.5" stroke="#92400e" stroke-width="2.2"/>
      <rect x="886.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="182" r="2.6" fill="#1f2937"/><rect x="898.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="182" r="2.6" fill="#1f2937"/><rect x="910.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="182" r="2.6" fill="#1f2937"/><text x="888" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal A</text><text x="900" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Wiper</text><text x="912" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal B</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="245" r="4" fill="#2563eb"/><rect x="204" y="230" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#2563eb">A1</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 182" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 912 182" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Enciende la bomba con el relé</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">Arduino Nano V3</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">Micro-USB (CH340)</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">MODULO RELE 1 CANAL</text>
      <rect x="873" y="137" width="54" height="35" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="#18181b"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="url(#gradPlastic)"/>
      <rect x="878" y="144" width="14" height="20" rx="1.5" fill="#0891b2"/>
      <circle cx="881" cy="166" r="2.3" fill="#4ade80"/>
      <rect x="878.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="880" cy="183" r="2.6" fill="#1f2937"/><rect x="898.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="183" r="2.6" fill="#1f2937"/><rect x="918.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="920" cy="183" r="2.6" fill="#1f2937"/><text x="880" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">IN</text><text x="900" y="208" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="920" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="157.5" r="4" fill="#2563eb"/><rect x="204" y="142.5" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#2563eb">D7</text><circle cx="200" cy="245" r="4" fill="#dc2626"/><rect x="204" y="230" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 880 183" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 183" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 920 183" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee temperatura y humedad</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR DHT11</text>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="url(#gradPlastic)"/>
      <rect x="887" y="137" width="26" height="26" rx="2" fill="#1d4ed8"/>
      <line x1="891" y1="141" x2="891" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="897" y1="141" x2="897" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="903" y1="141" x2="903" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="909" y1="141" x2="909" y2="161" stroke="#93c5fd" stroke-width="1.6"/>
      <rect x="883" y="169" width="34" height="9" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="885.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="887" cy="190" r="2.6" fill="#1f2937"/><rect x="898.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="190" r="2.6" fill="#1f2937"/><rect x="911.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="913" cy="190" r="2.6" fill="#1f2937"/><text x="887" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="215" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="913" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">DATA</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO3</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 887 190" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 190" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 913 190" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el sensor de luz</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LDR + R1K (divisor)</text>
      <line x1="900" y1="120" x2="900" y2="134" stroke="#a8a29e" stroke-width="2.2"/>
      <circle cx="900" cy="141" r="13" fill="#fef9c3" stroke="#a16207" stroke-width="1.8"/>
      <circle cx="900" cy="141" r="13" fill="url(#gradDome)"/>
      <path d="M 892 137 L 897 137 L 894 141 L 899 141 L 897 145 L 901 145 L 899 141 L 903 141 L 901 137 L 906 137" fill="none" stroke="#a16207" stroke-width="1.2" stroke-linejoin="round"/>
      <line x1="900" y1="153" x2="900" y2="155" stroke="#a8a29e" stroke-width="2.2"/>
      <circle cx="900" cy="155" r="3.4" fill="#2563eb"/>
      <line x1="904" y1="155" x2="920" y2="155" stroke="#2563eb" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="923" y="159" font-size="9" fill="#2563eb">ADC</text>
      <line x1="900" y1="158" x2="900" y2="165" stroke="#a8a29e" stroke-width="2.2"/>
      <rect x="892" y="165" width="16" height="18" rx="2" fill="#e7cfa0" stroke="#92612a" stroke-width="1.3"/>
      <rect x="892" y="167.5" width="16" height="2.4" fill="#78350f"/>
      <rect x="892" y="171.5" width="16" height="2.4" fill="#ef4444"/>
      <rect x="892" y="175.5" width="16" height="2.4" fill="#854d0e"/>
      <line x1="900" y1="183" x2="900" y2="190" stroke="#a8a29e" stroke-width="2.2"/><text x="900" y="133" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal superior</text><text x="900" y="180" text-anchor="middle" font-size="9.5" fill="#57534e">Punto medio</text><text x="900" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">Terminal inferior</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#2563eb"/><rect x="204" y="230" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#2563eb">GPIO0</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 900 120" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 155" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="127" font-size="9.5" fill="#57534e">ADC</text><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 900 190" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el pulsador de modo</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32-C3 Super Mini</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">3.3V logic</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">PULSADOR (modo)</text>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
      <rect x="879" y="133" width="42" height="42" rx="4" fill="url(#gradPlastic)"/>
      <circle cx="900" cy="152" r="13.5" fill="#0f172a"/>
      <circle cx="900" cy="152" r="13.5" fill="url(#gradDome)"/>
      <rect x="886.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="888" cy="187" r="2.6" fill="#1f2937"/><rect x="910.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="912" cy="187" r="2.6" fill="#1f2937"/><text x="888" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 1</text><text x="912" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">Pin 2</text><circle cx="200" cy="186.66666666666669" r="4" fill="#2563eb"/><rect x="204" y="171.66666666666669" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="182.66666666666669" font-size="12" font-weight="bold" fill="#2563eb">GPIO10</text><circle cx="200" cy="303.33333333333337" r="4" fill="#111827"/><rect x="204" y="288.33333333333337" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="299.33333333333337" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 186.66666666666669 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 186.66666666666669 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 888 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">INPUT_PULLUP, mismo pin que el principal</text><path d="M 200 303.33333333333337 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 303.33333333333337 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 912 187" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Detecta movimiento</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR PIR HC-SR501</text>
      <path d="M 878 162 A 22 22 0 0 1 922 162 Z" fill="#f8fafc" stroke="#64748b" stroke-width="1.6"/>
      <path d="M 878 162 A 22 22 0 0 1 922 162 Z" fill="url(#gradDome)"/>
      <path d="M 887 162 A 13 13 0 0 1 913 162" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
      <path d="M 894 162 A 6 6 0 0 1 906 162" fill="none" stroke="#94a3b8" stroke-width="1.3"/>
      <rect x="875" y="160" width="50" height="10" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="1.4"/>
      <rect x="881.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="883" cy="187" r="2.6" fill="#1f2937"/><rect x="898.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="187" r="2.6" fill="#1f2937"/><rect x="915.6" y="176" width="2.8" height="11" fill="#a1a1aa"/><circle cx="917" cy="187" r="2.6" fill="#1f2937"/><text x="883" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="212" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="917" y="200" text-anchor="middle" font-size="9.5" fill="#57534e">OUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO27</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 883 187" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 187" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 917 187" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee el sensor de luz</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR LDR (modulo)</text>
      <rect x="876" y="136" width="48" height="38" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <circle cx="900" cy="150" r="12" fill="#fef9c3" stroke="#a16207" stroke-width="1.6"/>
      <circle cx="900" cy="150" r="12" fill="url(#gradDome)"/>
      <path d="M 893 145 L 898 145 L 895 150 L 900 150 L 898 155 L 902 155 L 900 150 L 905 150 L 902 145 L 907 145" fill="none" stroke="#a16207" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="880.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="882" cy="185" r="2.6" fill="#1f2937"/><rect x="898.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="185" r="2.6" fill="#1f2937"/><rect x="916.6" y="174" width="2.8" height="11" fill="#a1a1aa"/><circle cx="918" cy="185" r="2.6" fill="#1f2937"/><text x="882" y="198" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="918" y="198" text-anchor="middle" font-size="9.5" fill="#57534e">AOUT</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO34</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 882 185" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 185" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 918 185" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">ADC1, solo entrada</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Prueba el relé</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">RELE C/OPTOACOPLADOR</text>
      <rect x="873" y="137" width="54" height="35" rx="3" fill="url(#gradPcbBlue)" stroke="#1e3a8a" stroke-width="1.5"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="#18181b"/>
      <rect x="896" y="141" width="27" height="26" rx="2.5" fill="url(#gradPlastic)"/>
      <rect x="878" y="144" width="14" height="20" rx="1.5" fill="#0891b2"/>
      <circle cx="881" cy="166" r="2.3" fill="#4ade80"/>
      <rect x="878.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="880" cy="183" r="2.6" fill="#1f2937"/><rect x="898.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="183" r="2.6" fill="#1f2937"/><rect x="918.6" y="172" width="2.8" height="11" fill="#a1a1aa"/><circle cx="920" cy="183" r="2.6" fill="#1f2937"/><text x="880" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">IN</text><text x="900" y="208" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="920" y="196" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="157.5" r="4" fill="#2563eb"/><rect x="204" y="142.5" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO26</text><circle cx="200" cy="245" r="4" fill="#dc2626"/><rect x="204" y="230" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="332.5" r="4" fill="#111827"/><rect x="204" y="317.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 157.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 880 183" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo pin que el principal</text><path d="M 200 245 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 183" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 920 183" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Lee temperatura y humedad</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR DHT11</text>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.6"/>
      <rect x="881" y="131" width="38" height="38" rx="4" fill="url(#gradPlastic)"/>
      <rect x="887" y="137" width="26" height="26" rx="2" fill="#1d4ed8"/>
      <line x1="891" y1="141" x2="891" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="897" y1="141" x2="897" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="903" y1="141" x2="903" y2="161" stroke="#93c5fd" stroke-width="1.6"/><line x1="909" y1="141" x2="909" y2="161" stroke="#93c5fd" stroke-width="1.6"/>
      <rect x="883" y="169" width="34" height="9" rx="1.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="885.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="887" cy="190" r="2.6" fill="#1f2937"/><rect x="898.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="900" cy="190" r="2.6" fill="#1f2937"/><rect x="911.6" y="179" width="2.8" height="11" fill="#a1a1aa"/><circle cx="913" cy="190" r="2.6" fill="#1f2937"/><text x="887" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="900" y="215" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="913" y="203" text-anchor="middle" font-size="9.5" fill="#57534e">DATA</text><circle cx="200" cy="157.5" r="4" fill="#dc2626"/><rect x="204" y="142.5" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="153.5" font-size="12" font-weight="bold" fill="#dc2626">3V3</text><circle cx="200" cy="245" r="4" fill="#111827"/><rect x="204" y="230" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="241" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="332.5" r="4" fill="#2563eb"/><rect x="204" y="317.5" width="43" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="328.5" font-size="12" font-weight="bold" fill="#2563eb">GPIO4</text><path d="M 200 157.5 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 157.5 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 887 190" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 245 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 245 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 900 190" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 332.5 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 332.5 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 913 190" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">mismo pin que el principal</text><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Muestra texto en la pantalla LCD</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">LCD 16x2 + I2C</text>
      <rect x="864" y="136" width="72" height="36" rx="3" fill="#15803d" stroke="#14532d" stroke-width="1.8"/>
      <rect x="870" y="142" width="60" height="24" rx="1.5" fill="#166534"/>
      <rect x="873" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="880.4" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="887.8" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="895.2" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="902.6" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="910" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="917.4" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="924.8" y="146" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="873" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="880.4" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="887.8" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="895.2" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="902.6" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="910" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="917.4" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/><rect x="924.8" y="156.5" width="4.4" height="6.5" fill="#86efac" fill-opacity="0.85"/>
      <rect x="880" y="172" width="20" height="11" rx="2" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1.2"/>
      <circle cx="890" cy="177.5" r="3.6" fill="#fbbf24" stroke="#92400e" stroke-width="1"/>
      <rect x="873.6" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="875" cy="197" r="2.6" fill="#1f2937"/><rect x="890.2666666666667" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="891.6666666666666" cy="197" r="2.6" fill="#1f2937"/><rect x="906.9333333333334" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="908.3333333333334" cy="197" r="2.6" fill="#1f2937"/><rect x="923.6" y="186" width="2.8" height="11" fill="#a1a1aa"/><circle cx="925" cy="197" r="2.6" fill="#1f2937"/><text x="875" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">SDA</text><text x="891.6666666666666" y="222" text-anchor="middle" font-size="9.5" fill="#57534e">SCL</text><text x="908.3333333333334" y="210" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="925" y="222" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><circle cx="200" cy="140" r="4" fill="#2563eb"/><rect x="204" y="125" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="136" font-size="12" font-weight="bold" fill="#2563eb">GPIO21</text><circle cx="200" cy="210" r="4" fill="#2563eb"/><rect x="204" y="195" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206" font-size="12" font-weight="bold" fill="#2563eb">GPIO22</text><circle cx="200" cy="280" r="4" fill="#dc2626"/><rect x="204" y="265" width="64" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="276" font-size="12" font-weight="bold" fill="#dc2626">VIN (5V)</text><circle cx="200" cy="350" r="4" fill="#111827"/><rect x="204" y="335" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="346" font-size="12" font-weight="bold" fill="#111827">GND</text><path d="M 200 140 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 140 V 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 875 197" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo que el principal</text><path d="M 200 210 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210 V 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 891.6666666666666 197" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 280 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 280 V 149" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 908.3333333333334 197" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="143" font-size="9.5" fill="#57534e">sin conversor de nivel, directo</text><path d="M 200 350 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 350 V 165" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 925 197" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>'),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 490" font-family="Verdana, Arial, sans-serif"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#78350f"/></marker>
  <linearGradient id="gradPlastic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient>
  <linearGradient id="gradMetal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f1f5f9"/>
    <stop offset="55%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </linearGradient>
  <radialGradient id="gradDome" cx="35%" cy="30%" r="75%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="35%" stop-color="#ffffff" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </radialGradient>
  <linearGradient id="gradPcbGreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#16a34a"/>
    <stop offset="100%" stop-color="#14532d"/>
  </linearGradient>
  <linearGradient id="gradPcbBlue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2563eb"/>
    <stop offset="100%" stop-color="#1e3a8a"/>
  </linearGradient></defs><rect x="0" y="0" width="1060" height="490" fill="#ffffff"/><text x="530" y="34" text-anchor="middle" font-size="23" font-weight="bold" fill="#0f172a">Mide la distancia</text><rect x="30" y="70" width="170" height="350" rx="12" fill="#0ea5e9" fill-opacity="0.14" stroke="#0369a1" stroke-width="2.5"/><text x="115" y="98" text-anchor="middle" font-size="15" font-weight="bold" fill="#0c4a6e">ESP32 DevKit V1</text><text x="115" y="116" text-anchor="middle" font-size="11.5" fill="#0c4a6e">30 pines</text><text x="900" y="94" text-anchor="middle" font-size="14.5" font-weight="bold" fill="#1e293b">SENSOR HC-SR04P</text>
      <rect x="856" y="138" width="88" height="32" rx="3" fill="url(#gradPcbGreen)" stroke="#14532d" stroke-width="1.5"/>
      <circle cx="880" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="880" cy="153" r="6" fill="#1e293b"/>
      <circle cx="920" cy="153" r="14.5" fill="url(#gradMetal)" stroke="#334155" stroke-width="1.3"/>
      <circle cx="920" cy="153" r="6" fill="#1e293b"/>
      <rect x="865.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="867" cy="182" r="2.6" fill="#1f2937"/><rect x="887.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="889" cy="182" r="2.6" fill="#1f2937"/><rect x="909.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="911" cy="182" r="2.6" fill="#1f2937"/><rect x="931.6" y="171" width="2.8" height="11" fill="#a1a1aa"/><circle cx="933" cy="182" r="2.6" fill="#1f2937"/><text x="867" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">VCC</text><text x="889" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">GND</text><text x="911" y="195" text-anchor="middle" font-size="9.5" fill="#57534e">Trig</text><text x="933" y="207" text-anchor="middle" font-size="9.5" fill="#57534e">Echo</text><circle cx="200" cy="140" r="4" fill="#dc2626"/><rect x="204" y="125" width="22" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="136" font-size="12" font-weight="bold" fill="#dc2626">5V</text><circle cx="200" cy="210" r="4" fill="#111827"/><rect x="204" y="195" width="29" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="206" font-size="12" font-weight="bold" fill="#111827">GND</text><circle cx="200" cy="280" r="4" fill="#2563eb"/><rect x="204" y="265" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="276" font-size="12" font-weight="bold" fill="#2563eb">GPIO17</text><circle cx="200" cy="350" r="4" fill="#2563eb"/><rect x="204" y="335" width="50" height="15" rx="3" fill="white" fill-opacity="0.85"/><text x="208" y="346" font-size="12" font-weight="bold" fill="#2563eb">GPIO16</text><path d="M 200 140 H 226" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 140 V 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 117 L 742 117" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 117 L 867 182" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><text x="234" y="111" font-size="9.5" fill="#57534e">mismo que el principal</text><path d="M 200 210 H 226" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 210 V 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 133 L 742 133" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 133 L 889 182" fill="none" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 280 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 280 V 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 149 L 742 149" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 149 L 911 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 200 350 H 226" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 350 V 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 226 165 L 742 165" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><path d="M 742 165 L 933 182" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/><rect x="30" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="38" y="461" width="12" height="12" rx="2" fill="#dc2626"/><text x="56" y="471" font-size="11.5" fill="#1c1917">Punto = VCC</text><rect x="190" y="454" width="128" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="198" y="461" width="12" height="12" rx="2" fill="#111827"/><text x="216" y="471" font-size="11.5" fill="#1c1917">Punto = GND</text><rect x="350" y="454" width="420" height="24" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><rect x="358" y="461" width="12" height="12" rx="2" fill="#2563eb"/><text x="376" y="471" font-size="11.5" fill="#1c1917">Cada cable tiene su propio color para seguirlo del pin a su pieza</text></svg>');

-- 5. Codigo Arduino de cada practica
DELETE FROM kit_codigos WHERE proyecto_id IN (
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd') UNION
  (SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia')
);

INSERT INTO kit_codigos (proyecto_id, lenguaje, contenido, version) VALUES
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-primer-led'), 'arduino', '/*
  Practica: enciende tu primer LED
  Kit 8vo EGB - Arduino UNO R3
  Mismo pin que usara el semaforo (D8). Antes de armar el proyecto
  completo, practica lo basico: encender y apagar un LED.
*/
const int LED = 8;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-pulsador'), 'arduino', '/*
  Practica: lee un pulsador
  Kit 8vo EGB - Arduino UNO R3
  Mismos pines que usara el semaforo (D2 y D8). El LED se enciende
  solo mientras mantienes presionado el pulsador.
*/
const int PULSADOR = 2;
const int LED = 8;

void setup() {
  pinMode(PULSADOR, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool presionado = (digitalRead(PULSADOR) == LOW);
  digitalWrite(LED, presionado ? HIGH : LOW);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-octavo-egb' AND slug = 'practica-buzzer'), 'arduino', '/*
  Practica: haz sonar el buzzer
  Kit 8vo EGB - Arduino UNO R3
  Mismo pin que usara el semaforo (D7). El buzzer suena medio
  segundo y se apaga un segundo, una y otra vez.
*/
const int BUZZER = 7;

void setup() {
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  tone(BUZZER, 1000);
  delay(500);
  noTone(BUZZER);
  delay(1000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-led-tapa'), 'arduino', '/*
  Practica: enciende el LED indicador
  Kit 9no EGB - Arduino Nano V3
  Mismo pin que usara el basurero inteligente (D8).
*/
const int LED = 8;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(500);
  digitalWrite(LED, LOW);
  delay(500);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-sensor-distancia'), 'arduino', '/*
  Practica: mide distancia con el sensor ultrasonico
  Kit 9no EGB - Arduino Nano V3
  Mismos pines que usara el basurero inteligente (D9 y D10). Abre el
  Monitor Serial (9600 baudios) para ver la distancia en centimetros.
*/
const int TRIG = 9;
const int ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duracion = pulseIn(ECHO, HIGH, 25000);
  long distanciaCm = duracion / 58;

  Serial.print("Distancia: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-noveno-egb' AND slug = 'practica-servomotor'), 'arduino', '/*
  Practica: mueve el servomotor
  Kit 9no EGB - Arduino Nano V3
  Mismo pin que usara el basurero inteligente (D6). El servo gira de
  0 a 90 grados y vuelve, una y otra vez.
*/
#include <Servo.h>

const int SERVO_PIN = 6;
Servo motor;

void setup() {
  motor.attach(SERVO_PIN);
}

void loop() {
  motor.write(0);
  delay(800);
  motor.write(90);
  delay(800);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-humedad-suelo'), 'arduino', '/*
  Practica: lee la humedad del suelo
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (A0). Abre el Monitor
  Serial para ver el valor crudo del sensor (0-1023).
*/
const int SENSOR = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(SENSOR);
  Serial.print("Humedad (crudo): ");
  Serial.println(valor);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-potenciometro'), 'arduino', '/*
  Practica: ajusta el umbral con el potenciometro
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (A1).
*/
const int POT = A1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valor = analogRead(POT);
  Serial.print("Umbral (0-1023): ");
  Serial.println(valor);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-decimo-egb' AND slug = 'practica-rele'), 'arduino', '/*
  Practica: enciende la bomba con el rele
  Kit 10mo EGB - Arduino Nano V3 Micro-USB
  Mismo pin que usara el sistema de riego (D7). El rele se activa y
  desactiva cada segundo.
*/
const int RELE = 7;

void setup() {
  pinMode(RELE, OUTPUT);
}

void loop() {
  digitalWrite(RELE, HIGH);
  delay(1000);
  digitalWrite(RELE, LOW);
  delay(1000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-dht11'), 'arduino', '/*
  Practica: lee temperatura y humedad
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO3). Requiere
  instalar: "DHT sensor library" (Adafruit) + "Adafruit Unified
  Sensor".
*/
#include <DHT.h>

const int PIN_DHT = 3;
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temperatura);
  Serial.print(" C  Humedad: "); Serial.print(humedad);
  Serial.println(" %");
  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-ldr'), 'arduino', '/*
  Practica: lee el sensor de luz
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO0). El ESP32
  tiene un ADC de 12 bits: los valores van de 0 a 4095.
*/
const int PIN_LDR = 0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  Serial.print("Luz (0-4095): ");
  Serial.println(luz);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-primero-bach' AND slug = 'practica-pulsador-modo'), 'arduino', '/*
  Practica: lee el pulsador de modo
  Kit 1ro BGU - ESP32-C3 Super Mini
  Mismo pin que usara la estacion meteorologica (GPIO10).
*/
const int PULSADOR = 10;
int modo = 0;
bool anterior = HIGH;

void setup() {
  Serial.begin(115200);
  pinMode(PULSADOR, INPUT_PULLUP);
}

void loop() {
  bool actual = digitalRead(PULSADOR);
  if (actual == LOW && anterior == HIGH) {
    modo = (modo + 1) % 3;
    Serial.print("Modo: ");
    Serial.println(modo);
  }
  anterior = actual;
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-pir'), 'arduino', '/*
  Practica: detecta movimiento
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO27). El sensor PIR
  tarda unos segundos en calibrarse al encender: espera un momento
  antes de moverte frente a el.
*/
const int PIN_PIR = 27;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
}

void loop() {
  bool movimiento = digitalRead(PIN_PIR) == HIGH;
  Serial.println(movimiento ? "Movimiento detectado" : "Sin movimiento");
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-ldr-domotica'), 'arduino', '/*
  Practica: lee el sensor de luz
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO34).
*/
const int PIN_LDR = 34;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int luz = analogRead(PIN_LDR);
  Serial.print("Luz (0-4095): ");
  Serial.println(luz);
  delay(300);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-segundo-bach' AND slug = 'practica-rele-domotica'), 'arduino', '/*
  Practica: prueba el rele
  Kit 2do BGU - ESP32 DevKit V1
  Mismo pin que usara la domotica inteligente (GPIO26). El rele se
  activa y desactiva cada segundo (sin nada de 110V conectado todavia).
*/
const int PIN_RELE = 26;

void setup() {
  pinMode(PIN_RELE, OUTPUT);
}

void loop() {
  digitalWrite(PIN_RELE, HIGH);
  delay(1000);
  digitalWrite(PIN_RELE, LOW);
  delay(1000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-dht11-monitoreo'), 'arduino', '/*
  Practica: lee temperatura y humedad
  Kit 3ro BGU - ESP32 DevKit V1
  Mismo pin que usara el sistema de monitoreo (GPIO4). Requiere
  instalar: "DHT sensor library" (Adafruit) + "Adafruit Unified
  Sensor".
*/
#include <DHT.h>

const int PIN_DHT = 4;
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temperatura);
  Serial.print(" C  Humedad: "); Serial.print(humedad);
  Serial.println(" %");
  delay(2000);
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-lcd'), 'arduino', '/*
  Practica: muestra texto en la pantalla LCD
  Kit 3ro BGU - ESP32 DevKit V1
  Mismos pines que usara el sistema de monitoreo (GPIO21 y GPIO22).
  Requiere instalar: "LiquidCrystal I2C".
*/
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); // si no aparece nada, prueba con 0x3F

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hola, Academia!");
  lcd.setCursor(0, 1);
  lcd.print("LCD funcionando");
}

void loop() {
}
', 1),
  ((SELECT id FROM kit_proyectos WHERE kit_id = 'kit-lv-tercero-bach' AND slug = 'practica-distancia'), 'arduino', '/*
  Practica: mide la distancia
  Kit 3ro BGU - ESP32 DevKit V1
  Mismos pines que usara el sistema de monitoreo (GPIO17 y GPIO16).
*/
const int PIN_TRIG = 17;
const int PIN_ECHO = 16;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
}

void loop() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duracion = pulseIn(PIN_ECHO, HIGH, 25000);
  long distanciaCm = duracion / 58;

  Serial.print("Distancia: ");
  Serial.print(distanciaCm);
  Serial.println(" cm");
  delay(300);
}
', 1);
