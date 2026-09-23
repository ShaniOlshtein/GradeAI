import { DocumentSample } from '../types';

// Helper to construct an SVG data URI
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

// 1. Historical Declaration Fragment (Aged Parchment with Iron Gall Ink)
const sample1Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680">
  <defs>
    <filter id="parchment" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
      <feDiffuseLighting in="noise" lighting-color="#fdf6e2" surfaceScale="2" result="light">
        <feDistantLight azimuth="60" elevation="50" />
      </feDiffuseLighting>
      <feBlend mode="multiply" in="SourceGraphic" in2="light" />
    </filter>
    <linearGradient id="vignette" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faecc5"/>
      <stop offset="50%" stop-color="#f5e0aa"/>
      <stop offset="100%" stop-color="#ebcf96"/>
    </linearGradient>
  </defs>

  <!-- Parchment Base -->
  <rect width="1000" height="680" fill="url(#vignette)"/>
  <rect width="1000" height="680" fill="#eed9a4" opacity="0.4" filter="url(#parchment)"/>

  <!-- Border lines & stains -->
  <rect x="25" y="25" width="950" height="630" fill="none" stroke="#b8935c" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.4"/>
  <ellipse cx="880" cy="120" rx="90" ry="70" fill="#dfbe86" opacity="0.35"/>
  <ellipse cx="140" cy="540" rx="110" ry="80" fill="#d8b275" opacity="0.25"/>

  <!-- Handwritten Text -->
  <g font-family="'Caveat', 'Brush Script MT', 'Great Vibes', cursive" font-size="54" fill="#2d1c0b" font-weight="700" letter-spacing="1">
    <!-- Line 1: When in the Course of human events (y ~ 140) -->
    <text x="75" y="145">When</text>
    <text x="210" y="145">in</text>
    <text x="280" y="145">the</text>
    <text x="375" y="145">Course</text>
    <text x="545" y="145">of</text>
    <text x="620" y="145">human</text>
    <text x="785" y="145">events</text>

    <!-- Line 2: it becomes necessary for one people (y ~ 265) -->
    <text x="80" y="270">it</text>
    <text x="145" y="270">becomes</text>
    <text x="330" y="270">necessary</text>
    <text x="540" y="270">for</text>
    <text x="635" y="270">one</text>
    <text x="745" y="270">people</text>

    <!-- Line 3: to dissolve the political bands which (y ~ 395) -->
    <text x="75" y="400">to</text>
    <text x="150" y="400">dissolve</text>
    <text x="330" y="400">the</text>
    <text x="425" y="400">political</text>
    <text x="615" y="400">bands</text>
    <text x="770" y="400">which</text>

    <!-- Line 4: have connected them with another (y ~ 525) -->
    <text x="80" y="530">have</text>
    <text x="210" y="530">connected</text>
    <text x="440" y="530">them</text>
    <text x="585" y="530">with</text>
    <text x="715" y="530">another</text>
  </g>

  <!-- Flourish footer -->
  <path d="M 380 610 Q 500 580 620 610 Q 500 630 380 610 Z" fill="#2d1c0b" opacity="0.6"/>
</svg>
`;

// 2. Grandma's Recipe Card (Index Card with blue lines & red margin)
const sample2Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680">
  <!-- Index card base -->
  <rect width="1000" height="680" fill="#fffef9"/>
  
  <!-- Red margin line -->
  <line x1="120" y1="0" x2="120" y2="680" stroke="#fca5a5" stroke-width="2"/>
  <line x1="124" y1="0" x2="124" y2="680" stroke="#fca5a5" stroke-width="1" opacity="0.6"/>

  <!-- Blue ruled lines -->
  <g stroke="#93c5fd" stroke-width="1.2" opacity="0.65">
    <line x1="0" y1="120" x2="1000" y2="120"/>
    <line x1="0" y1="210" x2="1000" y2="210"/>
    <line x1="0" y1="300" x2="1000" y2="300"/>
    <line x1="0" y1="390" x2="1000" y2="390"/>
    <line x1="0" y1="480" x2="1000" y2="480"/>
    <line x1="0" y1="570" x2="1000" y2="570"/>
  </g>

  <!-- Handwritten ink -->
  <g font-family="'Caveat', cursive" font-size="46" fill="#1e3a8a" font-weight="700">
    <!-- Header -->
    <text x="145" y="105" fill="#991b1b" font-size="52">Grandma's Apple Cinnamon Crisp</text>

    <!-- Ingredients -->
    <text x="145" y="195">2</text>
    <text x="195" y="195">cups</text>
    <text x="295" y="195">sifted</text>
    <text x="420" y="195">flour,</text>
    <text x="540" y="195">1</text>
    <text x="585" y="195">tsp</text>
    <text x="665" y="195">cinnamon</text>

    <!-- Line 2 -->
    <text x="145" y="285">1/2</text>
    <text x="220" y="285">cup</text>
    <text x="305" y="285">brown</text>
    <text x="430" y="285">sugar</text>
    <text x="550" y="285">and</text>
    <text x="635" y="285">pure</text>
    <text x="730" y="285">honey</text>

    <!-- Line 3 -->
    <text x="145" y="375">Mix</text>
    <text x="235" y="375">with</text>
    <text x="335" y="375">melted</text>
    <text x="475" y="375">sweet</text>
    <text x="595" y="375">butter</text>
    <text x="725" y="375">gently</text>

    <!-- Line 4 -->
    <text x="145" y="465">Bake</text>
    <text x="250" y="465">at</text>
    <text x="310" y="465">350°</text>
    <text x="405" y="465">for</text>
    <text x="480" y="465">45</text>
    <text x="545" y="465">minutes</text>
    <text x="705" y="465">crispy</text>

    <!-- Line 5 -->
    <text x="145" y="555">Serve</text>
    <text x="255" y="555">warm</text>
    <text x="365" y="555">with</text>
    <text x="465" y="555">vanilla</text>
    <text x="605" y="555">bean</text>
    <text x="705" y="555">cream!</text>
  </g>
</svg>
`;

// 3. Clinical Doctor's Prescription (Medical Rx Pad)
const sample3Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680">
  <rect width="1000" height="680" fill="#f8fafc"/>
  
  <!-- Header Clinic Print -->
  <rect x="0" y="0" width="1000" height="85" fill="#0284c7" opacity="0.12"/>
  <text x="60" y="45" font-family="'Inter', sans-serif" font-weight="700" font-size="20" fill="#0369a1">ST. JUDE MEDICAL CENTER • CLINICAL CONSULTATION NOTE</text>
  <text x="60" y="70" font-family="'Inter', sans-serif" font-size="13" fill="#64748b">DR. A. REYNOLDS, MD • GENERAL PRACTICE &amp; INTERNAL MEDICINE</text>
  <line x1="60" y1="85" x2="940" y2="85" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Rx Symbol -->
  <text x="60" y="160" font-family="serif" font-size="64" font-weight="bold" fill="#0284c7">℞</text>

  <!-- Doctor's characteristic quick cursive script -->
  <g font-family="'Caveat', cursive" font-size="44" fill="#0f172a" font-weight="700">
    <!-- Line 1: Patient presented with acute seasonal allergies -->
    <text x="160" y="165">Patient</text>
    <text x="310" y="165">presented</text>
    <text x="495" y="165">with</text>
    <text x="590" y="165">acute</text>
    <text x="700" y="165">seasonal</text>
    <text x="860" y="165">rhinitis</text>

    <!-- Line 2: Prescribed Cetirizine 10mg once daily -->
    <text x="90" y="265">Prescribed</text>
    <text x="295" y="265">Cetirizine</text>
    <text x="490" y="265">10mg</text>
    <text x="605" y="265">once</text>
    <text x="700" y="265">daily</text>
    <text x="800" y="265">at</text>
    <text x="850" y="265">night</text>

    <!-- Line 3: Keep well hydrated and avoid dust exposure -->
    <text x="90" y="365">Keep</text>
    <text x="190" y="365">well</text>
    <text x="280" y="365">hydrated</text>
    <text x="445" y="365">and</text>
    <text x="525" y="365">avoid</text>
    <text x="635" y="365">dust</text>
    <text x="725" y="365">triggers</text>

    <!-- Line 4: Follow up in clinic in two weeks -->
    <text x="90" y="465">Follow</text>
    <text x="215" y="465">up</text>
    <text x="280" y="465">in</text>
    <text x="335" y="465">clinic</text>
    <text x="445" y="465">in</text>
    <text x="500" y="465">two</text>
    <text x="585" y="465">weeks</text>
    <text x="715" y="465">time</text>
  </g>

  <!-- Doctor's signature line -->
  <line x1="600" y1="580" x2="920" y2="580" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="620" y="565" font-family="'Caveat', cursive" font-size="52" fill="#0369a1" font-weight="700">Dr. Arthur Reynolds</text>
  <text x="600" y="605" font-family="'Inter', sans-serif" font-size="12" fill="#94a3b8">AUTHORIZED PHYSICIAN SIGNATURE</text>
</svg>
`;

// 4. Student Physics / Engineering Scratchpad (Graph Paper with Equations)
const sample4Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680">
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
    </pattern>
  </defs>

  <rect width="1000" height="680" fill="#ffffff"/>
  <rect width="1000" height="680" fill="url(#grid)"/>

  <!-- Handwritten notes & calculations in pencil/pen -->
  <g font-family="'Caveat', cursive" font-size="48" fill="#0f172a" font-weight="700">
    <!-- Header -->
    <text x="80" y="100" fill="#4338ca">Quantum Oscillator Energy State</text>

    <!-- Line 1: Consider a particle in harmonic potential -->
    <text x="80" y="190">Consider</text>
    <text x="245" y="190">a</text>
    <text x="295" y="190">particle</text>
    <text x="445" y="190">in</text>
    <text x="500" y="190">harmonic</text>
    <text x="690" y="190">potential</text>
    <text x="870" y="190">well</text>

    <!-- Line 2: Hamiltonian operator H = p^2/2m + 1/2 k x^2 -->
    <text x="80" y="295">Hamiltonian</text>
    <text x="310" y="295">operator</text>
    <text x="475" y="295">H</text>
    <text x="525" y="295">=</text>
    <text x="570" y="295">T</text>
    <text x="615" y="295">+</text>
    <text x="660" y="295">V(x)</text>

    <!-- Line 3: Wavefunction solution satisfies boundary conditions -->
    <text x="80" y="405">Wavefunction</text>
    <text x="325" y="405">solution</text>
    <text x="475" y="405">satisfies</text>
    <text x="635" y="405">boundary</text>
    <text x="805" y="405">conditions</text>

    <!-- Line 4: Energy eigenvalues E = (n + 1/2) hbar omega -->
    <text x="80" y="515">Energy</text>
    <text x="205" y="515">eigenvalues</text>
    <text x="430" y="515">E</text>
    <text x="475" y="515">=</text>
    <text x="520" y="515">(n</text>
    <text x="585" y="515">+</text>
    <text x="630" y="515">1/2)</text>
    <text x="730" y="515">hbar</text>
    <text x="830" y="515">omega</text>
  </g>
</svg>
`;

export const DOCUMENT_SAMPLES: DocumentSample[] = [
  {
    id: 'historical-declaration',
    title: 'Historical Manuscript Fragment',
    category: 'Historical Calligraphy',
    description: '18th-century cursive iron-gall ink script on weathered antique parchment.',
    imageUrl: createSvgDataUri(sample1Svg),
    words: [
      // Line 1: When in the Course of human events
      { text: "When", box_2d: [147, 72, 225, 195] },
      { text: "in", box_2d: [155, 205, 222, 260] },
      { text: "the", box_2d: [148, 275, 225, 355] },
      { text: "Course", box_2d: [142, 370, 228, 520] },
      { text: "of", box_2d: [150, 540, 225, 600] },
      { text: "human", box_2d: [145, 615, 224, 765] },
      { text: "events", box_2d: [145, 780, 224, 915] },

      // Line 2: it becomes necessary for one people
      { text: "it", box_2d: [330, 75, 408, 128] },
      { text: "becomes", box_2d: [325, 140, 408, 310] },
      { text: "necessary", box_2d: [320, 325, 412, 515] },
      { text: "for", box_2d: [328, 535, 410, 615] },
      { text: "one", box_2d: [330, 630, 408, 725] },
      { text: "people", box_2d: [325, 740, 412, 875] },

      // Line 3: to dissolve the political bands which
      { text: "to", box_2d: [515, 72, 600, 132] },
      { text: "dissolve", box_2d: [510, 145, 605, 310] },
      { text: "the", box_2d: [515, 325, 598, 405] },
      { text: "political", box_2d: [510, 420, 605, 595] },
      { text: "bands", box_2d: [512, 610, 602, 745] },
      { text: "which", box_2d: [512, 765, 602, 895] },

      // Line 4: have connected them with another
      { text: "have", box_2d: [705, 75, 792, 192] },
      { text: "connected", box_2d: [700, 205, 795, 420] },
      { text: "them", box_2d: [705, 435, 790, 560] },
      { text: "with", box_2d: [705, 580, 792, 695] },
      { text: "another", box_2d: [702, 710, 795, 870] }
    ]
  },
  {
    id: 'grandmas-recipe',
    title: "Grandmother's Recipe Card",
    category: 'Culinary & Household',
    description: 'Handwritten culinary recipe on vintage blue-ruled index card.',
    imageUrl: createSvgDataUri(sample2Svg),
    words: [
      // Title
      { text: "Grandma's", box_2d: [90, 142, 168, 360] },
      { text: "Apple", box_2d: [90, 375, 168, 500] },
      { text: "Cinnamon", box_2d: [90, 515, 168, 735] },
      { text: "Crisp", box_2d: [90, 750, 168, 875] },

      // Line 1
      { text: "2", box_2d: [225, 142, 298, 178] },
      { text: "cups", box_2d: [225, 192, 298, 275] },
      { text: "sifted", box_2d: [222, 292, 298, 400] },
      { text: "flour,", box_2d: [222, 418, 298, 520] },
      { text: "1", box_2d: [225, 538, 298, 568] },
      { text: "tsp", box_2d: [225, 582, 298, 648] },
      { text: "cinnamon", box_2d: [222, 660, 298, 845] },

      // Line 2
      { text: "1/2", box_2d: [355, 142, 430, 205] },
      { text: "cup", box_2d: [355, 218, 430, 288] },
      { text: "brown", box_2d: [355, 302, 430, 412] },
      { text: "sugar", box_2d: [355, 428, 430, 532] },
      { text: "and", box_2d: [358, 548, 428, 618] },
      { text: "pure", box_2d: [355, 632, 428, 715] },
      { text: "honey", box_2d: [355, 728, 430, 840] },

      // Line 3
      { text: "Mix", box_2d: [488, 142, 562, 218] },
      { text: "with", box_2d: [490, 232, 562, 318] },
      { text: "melted", box_2d: [488, 332, 562, 458] },
      { text: "sweet", box_2d: [488, 472, 562, 578] },
      { text: "butter", box_2d: [488, 592, 562, 708] },
      { text: "gently", box_2d: [488, 722, 562, 845] },

      // Line 4
      { text: "Bake", box_2d: [622, 142, 695, 235] },
      { text: "at", box_2d: [625, 248, 695, 295] },
      { text: "350°", box_2d: [622, 308, 695, 390] },
      { text: "for", box_2d: [625, 402, 695, 462] },
      { text: "45", box_2d: [625, 478, 695, 528] },
      { text: "minutes", box_2d: [622, 542, 695, 688] },
      { text: "crispy", box_2d: [622, 702, 695, 828] },

      // Line 5
      { text: "Serve", box_2d: [752, 142, 825, 242] },
      { text: "warm", box_2d: [752, 252, 825, 348] },
      { text: "with", box_2d: [755, 362, 825, 448] },
      { text: "vanilla", box_2d: [752, 462, 825, 588] },
      { text: "bean", box_2d: [752, 602, 825, 688] },
      { text: "cream!", box_2d: [752, 702, 825, 835] }
    ]
  },
  {
    id: 'doctor-prescription',
    title: "Clinical Consultation Note",
    category: 'Medical & Healthcare',
    description: "Doctor's clinical notes and medication instructions on hospital prescription stationery.",
    imageUrl: createSvgDataUri(sample3Svg),
    words: [
      { text: "Patient", box_2d: [178, 158, 255, 290] },
      { text: "presented", box_2d: [175, 308, 255, 478] },
      { text: "with", box_2d: [178, 492, 255, 575] },
      { text: "acute", box_2d: [175, 588, 255, 685] },
      { text: "seasonal", box_2d: [175, 698, 255, 842] },
      { text: "rhinitis", box_2d: [175, 858, 255, 975] },

      { text: "Prescribed", box_2d: [325, 88, 402, 278] },
      { text: "Cetirizine", box_2d: [322, 292, 402, 472] },
      { text: "10mg", box_2d: [325, 488, 402, 588] },
      { text: "once", box_2d: [325, 602, 402, 685] },
      { text: "daily", box_2d: [322, 698, 402, 785] },
      { text: "at", box_2d: [328, 798, 402, 835] },
      { text: "night", box_2d: [325, 848, 402, 938] },

      { text: "Keep", box_2d: [470, 88, 548, 175] },
      { text: "well", box_2d: [472, 188, 548, 265] },
      { text: "hydrated", box_2d: [470, 278, 548, 428] },
      { text: "and", box_2d: [475, 442, 548, 510] },
      { text: "avoid", box_2d: [472, 522, 548, 618] },
      { text: "dust", box_2d: [472, 632, 548, 708] },
      { text: "triggers", box_2d: [470, 722, 548, 860] },

      { text: "Follow", box_2d: [618, 88, 695, 200] },
      { text: "up", box_2d: [620, 212, 695, 265] },
      { text: "in", box_2d: [622, 278, 695, 320] },
      { text: "clinic", box_2d: [618, 332, 695, 428] },
      { text: "in", box_2d: [622, 442, 695, 485] },
      { text: "two", box_2d: [618, 498, 695, 568] },
      { text: "weeks", box_2d: [618, 582, 695, 698] },
      { text: "time", box_2d: [618, 712, 695, 800] }
    ]
  },
  {
    id: 'physics-scratchpad',
    title: 'Physics & Equations Scratchpad',
    category: 'STEM & Mathematics',
    description: 'Theoretical physics derivation and quantum harmonic equations on grid notebook paper.',
    imageUrl: createSvgDataUri(sample4Svg),
    words: [
      { text: "Quantum", box_2d: [85, 78, 160, 235] },
      { text: "Oscillator", box_2d: [85, 250, 160, 420] },
      { text: "Energy", box_2d: [85, 435, 160, 565] },
      { text: "State", box_2d: [85, 580, 160, 685] },

      { text: "Consider", box_2d: [215, 78, 292, 230] },
      { text: "a", box_2d: [222, 242, 292, 278] },
      { text: "particle", box_2d: [215, 292, 292, 430] },
      { text: "in", box_2d: [220, 442, 292, 485] },
      { text: "harmonic", box_2d: [215, 498, 292, 672] },
      { text: "potential", box_2d: [215, 688, 292, 855] },
      { text: "well", box_2d: [218, 868, 292, 948] },

      { text: "Hamiltonian", box_2d: [370, 78, 448, 295] },
      { text: "operator", box_2d: [370, 308, 448, 460] },
      { text: "H", box_2d: [370, 472, 448, 508] },
      { text: "=", box_2d: [378, 522, 448, 552] },
      { text: "T", box_2d: [370, 568, 448, 600] },
      { text: "+", box_2d: [378, 612, 448, 642] },
      { text: "V(x)", box_2d: [370, 658, 448, 750] },

      { text: "Wavefunction", box_2d: [530, 78, 608, 308] },
      { text: "solution", box_2d: [532, 322, 608, 460] },
      { text: "satisfies", box_2d: [530, 472, 608, 618] },
      { text: "boundary", box_2d: [530, 632, 608, 788] },
      { text: "conditions", box_2d: [530, 802, 608, 975] },

      { text: "Energy", box_2d: [692, 78, 770, 192] },
      { text: "eigenvalues", box_2d: [690, 202, 770, 412] },
      { text: "E", box_2d: [692, 428, 770, 458] },
      { text: "=", box_2d: [700, 472, 770, 502] },
      { text: "(n", box_2d: [692, 518, 770, 568] },
      { text: "+", box_2d: [700, 582, 770, 612] },
      { text: "1/2)", box_2d: [692, 628, 770, 712] },
      { text: "hbar", box_2d: [692, 728, 770, 815] },
      { text: "omega", box_2d: [692, 828, 770, 945] }
    ]
  }
];
