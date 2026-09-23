import { ExamSetSample, GradedQuestion, WordDetection } from '../types';

// Helper to convert SVG string to safe base64 data URL
const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Generate realistic word-level bounding boxes and confidence scores
function generateWordDetectionsFromText(
  text: string,
  parentBox: [number, number, number, number],
  pageNumber: number = 1
): WordDetection[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const [topY, leftX, bottomY, rightX] = parentBox;
  const boxHeight = bottomY - topY;
  const boxWidth = rightX - leftX;

  const wordsPerLine = Math.min(10, Math.max(5, Math.ceil(words.length / Math.max(1, Math.round(boxHeight / 40)))));
  const totalLines = Math.ceil(words.length / wordsPerLine);
  const lineHeight = boxHeight / totalLines;

  return words.map((word, i) => {
    const lineIdx = Math.floor(i / wordsPerLine);
    const colIdx = i % wordsPerLine;
    const wordsInLine = Math.min(wordsPerLine, words.length - lineIdx * wordsPerLine);

    const slotWidth = boxWidth / wordsInLine;
    const wordWidth = Math.max(25, Math.min(slotWidth * 0.85, word.length * 10));

    const ymin = Math.round(topY + lineIdx * lineHeight + 4);
    const ymax = Math.round(ymin + Math.min(lineHeight * 0.75, 32));
    const xmin = Math.round(leftX + colIdx * slotWidth + 4);
    const xmax = Math.round(Math.min(rightX, xmin + wordWidth));

    const pseudoConfidence = 94 + ((word.length * 17 + i * 23) % 6);

    return {
      text: word,
      confidence_score: pseudoConfidence,
      page_number: pageNumber,
      box_2d: [ymin, xmin, ymax, xmax] as [number, number, number, number],
    };
  });
}

// -------------------------------------------------------------
// SAMPLE 1: AP Physics & Classical Mechanics Midterm
// -------------------------------------------------------------
const physicsQuestionPaperSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <style>
      .hdr-title { font-family: 'Times New Roman', serif; font-size: 24px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
      .hdr-sub { font-family: 'Times New Roman', serif; font-size: 14px; fill: #475569; text-anchor: middle; }
      .q-num { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #1e293b; }
      .q-pts { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #4f46e5; }
      .q-txt { font-family: 'Times New Roman', serif; font-size: 15px; fill: #1e293b; line-height: 1.5; }
      .rule { stroke: #cbd5e1; stroke-width: 1.5; }
    </style>
  </defs>

  <!-- Sheet background -->
  <rect width="1000" height="1300" fill="#ffffff" />
  <rect x="25" y="25" width="950" height="1250" fill="none" stroke="#94a3b8" stroke-width="1.5" />

  <!-- Exam Header -->
  <text x="500" y="70" class="hdr-title">OAKRIDGE ACADEMY • DEPARTMENT OF PHYSICS</text>
  <text x="500" y="95" class="hdr-sub">AP Physics C: Mechanics — Midterm Examination</text>
  <text x="500" y="115" class="hdr-sub">Time Allowed: 60 Minutes • Total Marks: 100 • Show all formulas and units</text>
  <line x1="50" y1="130" x2="950" y2="130" class="rule" />

  <!-- Student Info Fields -->
  <text x="60" y="160" font-family="Helvetica Neue" font-size="13" fill="#334155" font-weight="bold">Student Name: ________________________________</text>
  <text x="550" y="160" font-family="Helvetica Neue" font-size="13" fill="#334155" font-weight="bold">Date: October 14, 2026</text>
  <text x="760" y="160" font-family="Helvetica Neue" font-size="13" fill="#334155" font-weight="bold">Period: 3B</text>
  <line x1="50" y1="180" x2="950" y2="180" class="rule" />

  <!-- Question 1 -->
  <g transform="translate(60, 220)">
    <rect x="0" y="-18" width="880" height="30" fill="#f8fafc" rx="4" />
    <text x="10" y="2" class="q-num">Question 1</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">State Newton's Second Law of Motion in both conceptual and algebraic form.</text>
    <text x="10" y="56" class="q-txt">Then, calculate the magnitude of the net force (F_net) required to accelerate</text>
    <text x="10" y="80" class="q-txt">a 5.0 kg crate across a frictionless floor at an acceleration of 3.2 m/s².</text>
  </g>
  <line x1="60" y1="340" x2="940" y2="340" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Question 2 -->
  <g transform="translate(60, 380)">
    <rect x="0" y="-18" width="880" height="30" fill="#f8fafc" rx="4" />
    <text x="10" y="2" class="q-num">Question 2</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">State the formula for translational Kinetic Energy (KE) of a rigid object.</text>
    <text x="10" y="56" class="q-txt">Calculate the total kinetic energy of an 800 kg electric vehicle traveling</text>
    <text x="10" y="80" class="q-txt">at a constant speed of 20 m/s along a straight highway.</text>
  </g>
  <line x1="60" y1="500" x2="940" y2="500" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Question 3 -->
  <g transform="translate(60, 540)">
    <rect x="0" y="-18" width="880" height="30" fill="#f8fafc" rx="4" />
    <text x="10" y="2" class="q-num">Question 3</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">A 2.0 kg ball traveling horizontally at 6.0 m/s collides head-on with a stationary 4.0 kg ball.</text>
    <text x="10" y="56" class="q-txt">Assuming a perfectly inelastic collision where both bodies stick together,</text>
    <text x="10" y="80" class="q-txt">determine the combined final velocity (v_f) immediately after impact.</text>
  </g>
  <line x1="60" y1="660" x2="940" y2="660" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Question 4 -->
  <g transform="translate(60, 700)">
    <rect x="0" y="-18" width="880" height="30" fill="#f8fafc" rx="4" />
    <text x="10" y="2" class="q-num">Question 4</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">An object is released from rest from the edge of a high cliff (take g = 9.8 m/s²).</text>
    <text x="10" y="56" class="q-txt">Ignoring air resistance, determine:</text>
    <text x="10" y="80" class="q-txt">(a) Its instantaneous downward velocity after t = 3.0 seconds.</text>
    <text x="10" y="104" class="q-txt">(b) The total vertical displacement fallen after t = 3.0 seconds.</text>
  </g>

  <!-- Instructions footer -->
  <rect x="60" y="1120" width="880" height="110" fill="#f1f5f9" rx="8" stroke="#cbd5e1" />
  <text x="80" y="1150" font-family="Helvetica Neue" font-size="13" font-weight="bold" fill="#334155">EXAMINATION RULES:</text>
  <text x="80" y="1175" font-family="Times New Roman" font-size="13" fill="#475569">• Write all answers clearly on the official lined Student Answer Sheet provided.</text>
  <text x="80" y="1195" font-family="Times New Roman" font-size="13" fill="#475569">• State explicit equations, numerical values, and appropriate SI units in final answers.</text>
  <text x="80" y="1215" font-family="Times New Roman" font-size="13" fill="#475569">• Partial credit is awarded for correct algebraic working even if computational slip occurs.</text>
</svg>
`;

const physicsStudentAnswerSheetSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <!-- Filter for realistic ink bleed / hand stroke -->
    <filter id="inkBleed" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <style>
      .hand-ink { font-family: 'Caveat', 'Segoe Script', 'Comic Sans MS', cursive, sans-serif; fill: #1e3a8a; font-size: 24px; }
      .hand-lead { font-family: 'Caveat', cursive; font-size: 26px; font-weight: bold; fill: #0f172a; }
      .red-margin { stroke: #f87171; stroke-width: 1.5; }
      .blue-rule { stroke: #bfdbfe; stroke-width: 1; }
    </style>
  </defs>

  <!-- Legal yellow / cream paper -->
  <rect width="1000" height="1300" fill="#fefce8" />

  <!-- Ruled notebook lines -->
  <g class="blue-rule">
    <line x1="0" y1="90" x2="1000" y2="90" />
    <line x1="0" y1="130" x2="1000" y2="130" />
    <line x1="0" y1="170" x2="1000" y2="170" />
    <line x1="0" y1="210" x2="1000" y2="210" />
    <line x1="0" y1="250" x2="1000" y2="250" />
    <line x1="0" y1="290" x2="1000" y2="290" />
    <line x1="0" y1="330" x2="1000" y2="330" />
    <line x1="0" y1="370" x2="1000" y2="370" />
    <line x1="0" y1="410" x2="1000" y2="410" />
    <line x1="0" y1="450" x2="1000" y2="450" />
    <line x1="0" y1="490" x2="1000" y2="490" />
    <line x1="0" y1="530" x2="1000" y2="530" />
    <line x1="0" y1="570" x2="1000" y2="570" />
    <line x1="0" y1="610" x2="1000" y2="610" />
    <line x1="0" y1="650" x2="1000" y2="650" />
    <line x1="0" y1="690" x2="1000" y2="690" />
    <line x1="0" y1="730" x2="1000" y2="730" />
    <line x1="0" y1="770" x2="1000" y2="770" />
    <line x1="0" y1="810" x2="1000" y2="810" />
    <line x1="0" y1="850" x2="1000" y2="850" />
    <line x1="0" y1="890" x2="1000" y2="890" />
    <line x1="0" y1="930" x2="1000" y2="930" />
    <line x1="0" y1="970" x2="1000" y2="970" />
    <line x1="0" y1="1010" x2="1000" y2="1010" />
    <line x1="0" y1="1050" x2="1000" y2="1050" />
    <line x1="0" y1="1090" x2="1000" y2="1090" />
    <line x1="0" y1="1130" x2="1000" y2="1130" />
    <line x1="0" y1="1170" x2="1000" y2="1170" />
    <line x1="0" y1="1210" x2="1000" y2="1210" />
  </g>

  <!-- Left vertical red margin -->
  <line x1="90" y1="0" x2="90" y2="1300" class="red-margin" />

  <!-- Student Header in handwritten blue ink -->
  <g class="hand-ink" filter="url(#inkBleed)">
    <text x="110" y="55" font-size="20">Name: Alex Morgan</text>
    <text x="520" y="55" font-size="20">Exam: AP Physics C Midterm</text>
    <text x="820" y="55" font-size="20">Oct 14</text>
  </g>

  <!-- RESPONSE 1: (ymin=140, xmin=80, ymax=315, xmax=940) -->
  <g class="hand-ink" filter="url(#inkBleed)">
    <text x="60" y="165" class="hand-lead" fill="#b91c1c">Q1.</text>
    <text x="115" y="165">Newton's 2nd Law: The acceleration of an object is directly proportional</text>
    <text x="115" y="205">to net force and inversely proportional to mass: F_net = m * a.</text>
    <text x="115" y="245">Given: m = 5.0 kg, a = 3.2 m/s²</text>
    <text x="115" y="285">F_net = (5.0 kg) * (3.2 m/s²) = 16.0 N (directed along acceleration)</text>
    <!-- boxed answer -->
    <rect x="115" y="295" width="220" height="40" fill="none" stroke="#1e3a8a" stroke-width="1.8" rx="4" />
    <text x="125" y="325" font-weight="bold">Ans: F = 16.0 N</text>
  </g>

  <!-- RESPONSE 2: (ymin=350, xmin=80, ymax=520, xmax=940) -->
  <g class="hand-ink" filter="url(#inkBleed)">
    <text x="60" y="375" class="hand-lead" fill="#b91c1c">Q2.</text>
    <text x="115" y="375">Kinetic Energy formula: KE = 1/2 m * v²</text>
    <text x="115" y="415">Given: m = 800 kg, v = 20 m/s</text>
    <text x="115" y="455">KE = 0.5 * 800 kg * (20 m/s)² = 400 * 400 = 160,000 Joules</text>
    <!-- boxed answer -->
    <rect x="115" y="465" width="280" height="42" fill="none" stroke="#1e3a8a" stroke-width="1.8" rx="4" />
    <text x="125" y="495" font-weight="bold">Ans: KE = 160,000 J (160 kJ)</text>
  </g>

  <!-- RESPONSE 3: (ymin=540, xmin=80, ymax=710, xmax=940) -->
  <g class="hand-ink" filter="url(#inkBleed)">
    <text x="60" y="565" class="hand-lead" fill="#b91c1c">Q3.</text>
    <text x="115" y="565">Inelastic collision: Conservation of Linear Momentum applies.</text>
    <text x="115" y="605">p_initial = p_final =&gt; m1*v1 + m2*v2 = (m1 + m2) * v_f</text>
    <text x="115" y="645">(2.0 kg)(6.0 m/s) + (4.0 kg)(0) = (2.0 + 4.0 kg) * v_f</text>
    <text x="115" y="685">12.0 kg·m/s = 6.0 kg * v_f  =&gt;  v_f = 12.0 / 6.0 = 2.0 m/s</text>
    <!-- boxed answer -->
    <rect x="620" y="660" width="220" height="40" fill="none" stroke="#1e3a8a" stroke-width="1.8" rx="4" />
    <text x="630" y="690" font-weight="bold">Ans: v_f = 2.0 m/s</text>
  </g>

  <!-- RESPONSE 4: (ymin=730, xmin=80, ymax=930, xmax=940) -->
  <g class="hand-ink" filter="url(#inkBleed)">
    <text x="60" y="755" class="hand-lead" fill="#b91c1c">Q4.</text>
    <text x="115" y="755">(a) Free fall velocity: v(t) = g * t</text>
    <text x="115" y="795">v = (9.8 m/s²) * (3.0 s) = 29.4 m/s downward. [Correct]</text>
    <text x="115" y="835">(b) Distance fallen: d = g * t = 9.8 * 3.0 = 29.4 meters</text>
    <text x="115" y="875">Total displacement after 3 seconds is 29.4 m.</text>
    <!-- boxed answer -->
    <rect x="115" y="885" width="410" height="42" fill="none" stroke="#1e3a8a" stroke-width="1.8" rx="4" />
    <text x="125" y="915" font-weight="bold">Ans: (a) 29.4 m/s, (b) 29.4 m</text>
  </g>
</svg>
`;

// -------------------------------------------------------------
// SAMPLE 2: General Chemistry & Reaction Kinetics
// -------------------------------------------------------------
const chemQuestionPaperSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <style>
      .hdr-title { font-family: 'Times New Roman', serif; font-size: 24px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
      .hdr-sub { font-family: 'Times New Roman', serif; font-size: 14px; fill: #475569; text-anchor: middle; }
      .q-num { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #047857; }
      .q-pts { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #059669; }
      .q-txt { font-family: 'Times New Roman', serif; font-size: 15px; fill: #1e293b; line-height: 1.5; }
      .rule { stroke: #cbd5e1; stroke-width: 1.5; }
    </style>
  </defs>

  <rect width="1000" height="1300" fill="#ffffff" />
  <rect x="25" y="25" width="950" height="1250" fill="none" stroke="#94a3b8" stroke-width="1.5" />

  <text x="500" y="70" class="hdr-title">WESTLAKE INSTITUTE • DEPARTMENT OF CHEMISTRY</text>
  <text x="500" y="95" class="hdr-sub">CHEM 201: Equilibrium, Acids, Bases &amp; Thermodynamics</text>
  <text x="500" y="115" class="hdr-sub">Midterm Evaluation • Max Marks: 100 • Show work clearly</text>
  <line x1="50" y1="130" x2="950" y2="130" class="rule" />

  <text x="60" y="160" font-family="Helvetica Neue" font-size="13" fill="#334155" font-weight="bold">Student: ________________________________</text>
  <text x="550" y="160" font-family="Helvetica Neue" font-size="13" fill="#334155" font-weight="bold">Date: October 2026</text>
  <line x1="50" y1="180" x2="950" y2="180" class="rule" />

  <!-- Q1 -->
  <g transform="translate(60, 220)">
    <rect x="0" y="-18" width="880" height="30" fill="#ecfdf5" rx="4" />
    <text x="10" y="2" class="q-num">Question 1</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">State Bronsted-Lowry acid-base theory. For the aqueous reaction:</text>
    <text x="10" y="56" class="q-txt">NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)</text>
    <text x="10" y="80" class="q-txt">identify both conjugate acid-base pairs.</text>
  </g>
  <line x1="60" y1="340" x2="940" y2="340" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Q2 -->
  <g transform="translate(60, 380)">
    <rect x="0" y="-18" width="880" height="30" fill="#ecfdf5" rx="4" />
    <text x="10" y="2" class="q-num">Question 2</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Calculate the hydroxide ion concentration [OH⁻], pOH, and pH of a 0.0050 M</text>
    <text x="10" y="56" class="q-txt">barium hydroxide Ba(OH)₂ strong base solution at 25°C.</text>
  </g>
  <line x1="60" y1="500" x2="940" y2="500" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Q3 -->
  <g transform="translate(60, 540)">
    <rect x="0" y="-18" width="880" height="30" fill="#ecfdf5" rx="4" />
    <text x="10" y="2" class="q-num">Question 3</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Consider Haber process: N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g), ΔH = -92.4 kJ/mol (exothermic).</text>
    <text x="10" y="56" class="q-txt">According to Le Chatelier's principle, predict the shift in equilibrium position</text>
    <text x="10" y="80" class="q-txt">when (a) reaction vessel is heated, and (b) total system pressure is doubled.</text>
  </g>
  <line x1="60" y1="660" x2="940" y2="660" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Q4 -->
  <g transform="translate(60, 700)">
    <rect x="0" y="-18" width="880" height="30" fill="#ecfdf5" rx="4" />
    <text x="10" y="2" class="q-num">Question 4</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Write the balanced chemical redox equation for copper metal (Cu) reacting with</text>
    <text x="10" y="56" class="q-txt">dilute nitric acid (HNO₃) to produce copper(II) nitrate, nitric oxide gas (NO), and water.</text>
  </g>
</svg>
`;

const chemStudentAnswerSheetSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <filter id="inkChem" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <style>
      .hand-ink { font-family: 'Caveat', cursive, sans-serif; fill: #0f172a; font-size: 24px; }
      .hand-lead { font-family: 'Caveat', cursive; font-size: 26px; font-weight: bold; fill: #047857; }
    </style>
  </defs>

  <rect width="1000" height="1300" fill="#ffffff" />

  <!-- Light gray grid paper -->
  <pattern id="gridPattern" width="25" height="25" patternUnits="userSpaceOnUse">
    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" stroke-width="1" />
  </pattern>
  <rect width="1000" height="1300" fill="url(#gridPattern)" />
  <line x1="85" y1="0" x2="85" y2="1300" stroke="#fca5a5" stroke-width="1.5" />

  <!-- Student Header -->
  <g class="hand-ink" filter="url(#inkChem)">
    <text x="100" y="50" font-size="21">Chloe Bennett</text>
    <text x="450" y="50" font-size="21">Chemistry 201 Midterm</text>
    <text x="820" y="50" font-size="21">Score: /100</text>
  </g>
  <line x1="0" y1="75" x2="1000" y2="75" stroke="#cbd5e1" stroke-width="1" />

  <!-- Q1 Response: [100, 70, 310, 940] -->
  <g class="hand-ink" filter="url(#inkChem)">
    <text x="45" y="125" class="hand-lead">Q1.</text>
    <text x="100" y="125">Bronsted-Lowry: Acid is a proton (H+) donor; Base is a proton acceptor.</text>
    <text x="100" y="165">In NH3 + H2O &lt;=&gt; NH4+ + OH- :</text>
    <text x="100" y="205">Pair 1: Base = NH3, Conjugate Acid = NH4+</text>
    <text x="100" y="245">Pair 2: Acid = H2O, Conjugate Base = OH-</text>
    <rect x="100" y="260" width="550" height="35" fill="none" stroke="#047857" stroke-width="1.5" rx="3" />
    <text x="110" y="285" fill="#047857">Conjugate pairs: (NH3 / NH4+) and (H2O / OH-)</text>
  </g>

  <!-- Q2 Response: [330, 70, 530, 940] -->
  <g class="hand-ink" filter="url(#inkChem)">
    <text x="45" y="355" class="hand-lead">Q2.</text>
    <text x="100" y="355">Ba(OH)2 dissociates completely: Ba(OH)2 -&gt; Ba2+ + 2 OH-</text>
    <text x="100" y="395">[OH-] = 2 * [Ba(OH)2] = 2 * 0.0050 M = 0.010 M = 1.0 x 10^-2 M</text>
    <text x="100" y="435">pOH = -log[OH-] = -log(0.010) = 2.0</text>
    <text x="100" y="475">pH = 14.0 - pOH = 14.0 - 2.0 = 12.0</text>
    <rect x="100" y="490" width="380" height="35" fill="none" stroke="#047857" stroke-width="1.5" rx="3" />
    <text x="110" y="515" fill="#047857">[OH-] = 0.010 M, pOH = 2.0, pH = 12.0</text>
  </g>

  <!-- Q3 Response: [550, 70, 740, 940] -->
  <g class="hand-ink" filter="url(#inkChem)">
    <text x="45" y="575" class="hand-lead">Q3.</text>
    <text x="100" y="575">Reaction: N2(g) + 3 H2(g) &lt;=&gt; 2 NH3(g) + 92.4 kJ</text>
    <text x="100" y="615">(a) Temperature increase: Heat is a product (exothermic), so equilibrium</text>
    <text x="100" y="655">shifts LEFT (towards reactants) to consume added thermal energy.</text>
    <text x="100" y="695">(b) Pressure increase: System shifts RIGHT (fewer gas moles: 4 moles -&gt; 2 moles).</text>
  </g>

  <!-- Q4 Response: [760, 70, 940, 940] -->
  <g class="hand-ink" filter="url(#inkChem)">
    <text x="45" y="785" class="hand-lead">Q4.</text>
    <text x="100" y="785">Redox equation: Copper + dilute nitric acid:</text>
    <text x="100" y="825">Cu + HNO3 -&gt; Cu(NO3)2 + NO + H2O  (unbalanced)</text>
    <text x="100" y="865">Balanced: 3 Cu + 8 HNO3 -&gt; 3 Cu(NO3)2 + 2 NO + 4 H2O</text>
    <text x="100" y="905">Oxidation: Cu -&gt; Cu2+ + 2e-; Reduction: NO3- + 4H+ + 3e- -&gt; NO + 2H2O</text>
  </g>
</svg>
`;

// -------------------------------------------------------------
// SAMPLE 3: Calculus & Analytical Problem Set
// -------------------------------------------------------------
const calculusQuestionPaperSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <style>
      .hdr-title { font-family: 'Times New Roman', serif; font-size: 24px; font-weight: bold; fill: #0f172a; text-anchor: middle; }
      .hdr-sub { font-family: 'Times New Roman', serif; font-size: 14px; fill: #475569; text-anchor: middle; }
      .q-num { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #9333ea; }
      .q-pts { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #7c3aed; }
      .q-txt { font-family: 'Times New Roman', serif; font-size: 15px; fill: #1e293b; line-height: 1.5; }
      .rule { stroke: #cbd5e1; stroke-width: 1.5; }
    </style>
  </defs>

  <rect width="1000" height="1300" fill="#ffffff" />
  <rect x="25" y="25" width="950" height="1250" fill="none" stroke="#94a3b8" stroke-width="1.5" />

  <text x="500" y="70" class="hdr-title">COLUMBIA MATHEMATICAL FOUNDATION</text>
  <text x="500" y="95" class="hdr-sub">MATH 115: Calculus I — Problem Set &amp; Diagnostic Exam</text>
  <text x="500" y="115" class="hdr-sub">Max Score: 100 Points • Duration: 50 Min</text>
  <line x1="50" y1="130" x2="950" y2="130" class="rule" />

  <g transform="translate(60, 220)">
    <rect x="0" y="-18" width="880" height="30" fill="#faf5ff" rx="4" />
    <text x="10" y="2" class="q-num">Question 1</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Find the derivative f'(x) of the function f(x) = 3x² + 5x - 7 using power rule.</text>
    <text x="10" y="56" class="q-txt">Then evaluate the slope of the tangent line at x = 2.</text>
  </g>
  <line x1="60" y1="340" x2="940" y2="340" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <g transform="translate(60, 380)">
    <rect x="0" y="-18" width="880" height="30" fill="#faf5ff" rx="4" />
    <text x="10" y="2" class="q-num">Question 2</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Evaluate the definite integral ∫ (2x) dx evaluated from lower limit a = 0</text>
    <text x="10" y="56" class="q-txt">to upper limit b = 4 using the Fundamental Theorem of Calculus.</text>
  </g>
  <line x1="60" y1="500" x2="940" y2="500" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <g transform="translate(60, 540)">
    <rect x="0" y="-18" width="880" height="30" fill="#faf5ff" rx="4" />
    <text x="10" y="2" class="q-num">Question 3</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Find both real roots of the quadratic equation x² - 5x + 6 = 0</text>
    <text x="10" y="56" class="q-txt">by factoring or quadratic formula.</text>
  </g>
  <line x1="60" y1="660" x2="940" y2="660" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />

  <g transform="translate(60, 700)">
    <rect x="0" y="-18" width="880" height="30" fill="#faf5ff" rx="4" />
    <text x="10" y="2" class="q-num">Question 4</text>
    <text x="800" y="2" class="q-pts">[25 Points]</text>
    <text x="10" y="32" class="q-txt">Given the 2x2 matrix A = [[4, 2], [3, 2]], compute its determinant det(A).</text>
    <text x="10" y="56" class="q-txt">Is matrix A invertible?</text>
  </g>
</svg>
`;

const calculusStudentAnswerSheetSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <style>
      .hand-ink { font-family: 'Caveat', cursive, sans-serif; fill: #1e1b4b; font-size: 24px; }
      .hand-lead { font-family: 'Caveat', cursive; font-size: 26px; font-weight: bold; fill: #6b21a8; }
      .blue-rule { stroke: #e0e7ff; stroke-width: 1; }
    </style>
  </defs>

  <rect width="1000" height="1300" fill="#ffffff" />
  <g class="blue-rule">
    <line x1="0" y1="80" x2="1000" y2="80" />
    <line x1="0" y1="120" x2="1000" y2="120" />
    <line x1="0" y1="160" x2="1000" y2="160" />
    <line x1="0" y1="200" x2="1000" y2="200" />
    <line x1="0" y1="240" x2="1000" y2="240" />
    <line x1="0" y1="280" x2="1000" y2="280" />
    <line x1="0" y1="320" x2="1000" y2="320" />
    <line x1="0" y1="360" x2="1000" y2="360" />
    <line x1="0" y1="400" x2="1000" y2="400" />
    <line x1="0" y1="440" x2="1000" y2="440" />
    <line x1="0" y1="480" x2="1000" y2="480" />
    <line x1="0" y1="520" x2="1000" y2="520" />
    <line x1="0" y1="560" x2="1000" y2="560" />
    <line x1="0" y1="600" x2="1000" y2="600" />
    <line x1="0" y1="640" x2="1000" y2="640" />
    <line x1="0" y1="680" x2="1000" y2="680" />
    <line x1="0" y1="720" x2="1000" y2="720" />
    <line x1="0" y1="760" x2="1000" y2="760" />
    <line x1="0" y1="800" x2="1000" y2="800" />
    <line x1="0" y1="840" x2="1000" y2="840" />
    <line x1="0" y1="880" x2="1000" y2="880" />
    <line x1="0" y1="920" x2="1000" y2="920" />
  </g>
  <line x1="90" y1="0" x2="90" y2="1300" stroke="#f43f5e" stroke-width="1.5" />

  <g class="hand-ink">
    <text x="110" y="55" font-size="20">Liam Vance • Math 115 Section 2</text>
  </g>

  <!-- Q1: [140, 75, 310, 940] -->
  <g class="hand-ink">
    <text x="50" y="155" class="hand-lead">Q1.</text>
    <text x="110" y="155">f(x) = 3x² + 5x - 7</text>
    <text x="110" y="195">f'(x) = d/dx(3x²) + d/dx(5x) - d/dx(7) = 6x + 5</text>
    <text x="110" y="235">At x = 2: Slope m = f'(2) = 6(2) + 5 = 12 + 5 = 17</text>
    <text x="110" y="275">Tangent line slope = 17.</text>
  </g>

  <!-- Q2: [340, 75, 510, 940] -->
  <g class="hand-ink">
    <text x="50" y="355" class="hand-lead">Q2.</text>
    <text x="110" y="355">∫₀⁴ (2x) dx = [x²]₀⁴ = (4)² - (0)² = 16 - 0 = 16</text>
    <text x="110" y="395">Anti-derivative of 2x is x².</text>
    <text x="110" y="435">Result = 16.</text>
  </g>

  <!-- Q3: [530, 75, 710, 940] -->
  <g class="hand-ink">
    <text x="50" y="555" class="hand-lead">Q3.</text>
    <text x="110" y="555">x² - 5x + 6 = 0</text>
    <text x="110" y="595">Factor: (x - 2)(x - 3) = 0</text>
    <text x="110" y="635">x - 2 = 0 =&gt; x = 2,  x - 3 = 0 =&gt; x = 3</text>
    <text x="110" y="675">Roots are x = 2 and x = 3.</text>
  </g>

  <!-- Q4: [730, 75, 910, 940] -->
  <g class="hand-ink">
    <text x="50" y="755" class="hand-lead">Q4.</text>
    <text x="110" y="755">A = [[4, 2], [3, 2]]</text>
    <text x="110" y="795">det(A) = (4 * 2) - (2 * 3) = 8 - 6 = 2</text>
    <text x="110" y="835">Since det(A) = 2 != 0, matrix A is invertible (non-singular).</text>
    <text x="110" y="875">det(A) = 2, Yes invertible.</text>
  </g>
</svg>
`;

export const EXAM_SAMPLES: ExamSetSample[] = [
  {
    id: 'physics-midterm',
    title: 'AP Physics C: Mechanics Midterm',
    subject: 'Physics',
    studentName: 'Alex Morgan',
    description: '4-question examination on Newton’s 2nd Law, Kinetic Energy, Inelastic Collisions, and Kinematics Free Fall.',
    questionPaperUrl: svgToDataUrl(physicsQuestionPaperSvg),
    answerSheetUrl: svgToDataUrl(physicsStudentAnswerSheetSvg),
    report: {
      total_score: 85,
      max_score: 100,
      questions: [
        {
          question_number: '1',
          page_number: 1,
          confidence_score: 97,
          question_text: "State Newton's Second Law of Motion and calculate the net force required to accelerate a 5.0 kg crate at 3.2 m/s².",
          expected_answer: "F_net = m * a; F_net = 5.0 kg * 3.2 m/s² = 16.0 N in direction of acceleration.",
          student_answer_text: "Newton's 2nd Law: The acceleration of an object is directly proportional to net force and inversely proportional to mass: F_net = m * a. Given: m = 5.0 kg, a = 3.2 m/s². F_net = (5.0 kg) * (3.2 m/s²) = 16.0 N (directed along acceleration). Ans: F = 16.0 N",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Exemplary answer. Correct law statement, formula substitution, and SI units (16.0 N) with directional note.",
          box_2d: [140, 80, 315, 940],
        },
        {
          question_number: '2',
          page_number: 1,
          confidence_score: 95,
          question_text: "State the formula for translational Kinetic Energy and calculate the KE of an 800 kg car moving at 20 m/s.",
          expected_answer: "KE = 0.5 * m * v²; KE = 0.5 * 800 * (20)² = 160,000 J (160 kJ).",
          student_answer_text: "Kinetic Energy formula: KE = 1/2 m * v². Given: m = 800 kg, v = 20 m/s. KE = 0.5 * 800 kg * (20 m/s)² = 400 * 400 = 160,000 Joules. Ans: KE = 160,000 J (160 kJ)",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Correct formula and algebraic evaluation yielding 160,000 Joules (160 kJ).",
          box_2d: [350, 80, 520, 940],
        },
        {
          question_number: '3',
          page_number: 1,
          confidence_score: 94,
          question_text: "A 2.0 kg ball at 6.0 m/s undergoes a perfectly inelastic collision with a stationary 4.0 kg ball. Determine combined final velocity.",
          expected_answer: "m1*v1 + m2*v2 = (m1+m2)*vf => (2.0*6.0) + 0 = 6.0*vf => vf = 2.0 m/s.",
          student_answer_text: "Inelastic collision: Conservation of Linear Momentum applies. p_initial = p_final => m1*v1 + m2*v2 = (m1 + m2) * v_f. (2.0 kg)(6.0 m/s) + (4.0 kg)(0) = (2.0 + 4.0 kg) * v_f. 12.0 kg·m/s = 6.0 kg * v_f => v_f = 12.0 / 6.0 = 2.0 m/s. Ans: v_f = 2.0 m/s",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Correct application of momentum conservation and isolated final velocity calculation.",
          box_2d: [540, 80, 710, 940],
        },
        {
          question_number: '4',
          page_number: 1,
          confidence_score: 91,
          question_text: "An object is dropped from rest (g = 9.8 m/s²). Calculate (a) velocity at t = 3.0 s, and (b) total distance fallen at t = 3.0 s.",
          expected_answer: "(a) v = g * t = 9.8 * 3.0 = 29.4 m/s downward; (b) d = 0.5 * g * t² = 0.5 * 9.8 * 9 = 44.1 m.",
          student_answer_text: "(a) Free fall velocity: v(t) = g * t. v = (9.8 m/s²) * (3.0 s) = 29.4 m/s downward. [Correct]. (b) Distance fallen: d = g * t = 9.8 * 3.0 = 29.4 meters. Total displacement after 3 seconds is 29.4 m. Ans: (a) 29.4 m/s, (b) 29.4 m",
          status: 'partial',
          score_given: 10,
          max_score: 25,
          feedback: "Part (a) is correct (29.4 m/s). In part (b), incorrect equation d = gt was used instead of d = 1/2 g t² (correct distance is 44.1 m). Deducted 15 points.",
          box_2d: [730, 80, 930, 940],
        },
      ],
    },
  },
  {
    id: 'chem-midterm',
    title: 'General Chemistry 201 Midterm',
    subject: 'Chemistry',
    studentName: 'Chloe Bennett',
    description: 'Questions covering Bronsted-Lowry acid-base pairs, strong base pH calculation, Le Chatelier principle, and redox balancing.',
    questionPaperUrl: svgToDataUrl(chemQuestionPaperSvg),
    answerSheetUrl: svgToDataUrl(chemStudentAnswerSheetSvg),
    report: {
      total_score: 95,
      max_score: 100,
      questions: [
        {
          question_number: '1',
          page_number: 1,
          confidence_score: 98,
          question_text: "State Bronsted-Lowry acid-base theory and identify conjugate pairs in NH3 + H2O <=> NH4+ + OH-.",
          expected_answer: "Acid = proton donor, Base = proton acceptor. Pairs: (NH3 / NH4+) and (H2O / OH-).",
          student_answer_text: "Bronsted-Lowry: Acid is a proton (H+) donor; Base is a proton acceptor. In NH3 + H2O <=> NH4+ + OH- : Pair 1: Base = NH3, Conjugate Acid = NH4+. Pair 2: Acid = H2O, Conjugate Base = OH-. Conjugate pairs: (NH3 / NH4+) and (H2O / OH-)",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Complete and clear definitions and accurate identification of both conjugate pairs.",
          box_2d: [100, 70, 310, 940],
        },
        {
          question_number: '2',
          page_number: 1,
          confidence_score: 96,
          question_text: "Calculate [OH-], pOH, and pH of a 0.0050 M Ba(OH)2 solution at 25°C.",
          expected_answer: "[OH-] = 2 * 0.0050 = 0.010 M; pOH = -log(0.010) = 2.0; pH = 14.0 - 2.0 = 12.0.",
          student_answer_text: "Ba(OH)2 dissociates completely: Ba(OH)2 -> Ba2+ + 2 OH-. [OH-] = 2 * [Ba(OH)2] = 2 * 0.0050 M = 0.010 M = 1.0 x 10^-2 M. pOH = -log[OH-] = -log(0.010) = 2.0. pH = 14.0 - pOH = 14.0 - 2.0 = 12.0. [OH-] = 0.010 M, pOH = 2.0, pH = 12.0",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Great attention to the stoichiometry of 2 hydroxide ions per Ba(OH)2 formula unit.",
          box_2d: [330, 70, 530, 940],
        },
        {
          question_number: '3',
          page_number: 1,
          confidence_score: 95,
          question_text: "Predict shift in N2 + 3H2 <=> 2NH3 (exothermic) when heated, and when pressure is doubled.",
          expected_answer: "(a) Temperature increase shifts LEFT (endothermic direction); (b) Pressure increase shifts RIGHT (fewer gas moles).",
          student_answer_text: "Reaction: N2(g) + 3 H2(g) <=> 2 NH3(g) + 92.4 kJ. (a) Temperature increase: Heat is a product (exothermic), so equilibrium shifts LEFT (towards reactants) to consume added thermal energy. (b) Pressure increase: System shifts RIGHT (fewer gas moles: 4 moles -> 2 moles).",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Correct conceptual reasoning based on Le Chatelier's thermodynamic and pressure equilibria.",
          box_2d: [550, 70, 740, 940],
        },
        {
          question_number: '4',
          page_number: 1,
          confidence_score: 92,
          question_text: "Write the balanced redox equation for copper reacting with dilute nitric acid.",
          expected_answer: "3 Cu + 8 HNO3 -> 3 Cu(NO3)2 + 2 NO + 4 H2O",
          student_answer_text: "Redox equation: Copper + dilute nitric acid: Cu + HNO3 -> Cu(NO3)2 + NO + H2O (unbalanced). Balanced: 3 Cu + 8 HNO3 -> 3 Cu(NO3)2 + 2 NO + 4 H2O. Oxidation: Cu -> Cu2+ + 2e-; Reduction: NO3- + 4H+ + 3e- -> NO + 2H2O",
          status: 'partial',
          score_given: 20,
          max_score: 25,
          feedback: "Final equation is correctly balanced, but half-reaction for reduction is missing spectator balance. Deducted 5 points.",
          box_2d: [760, 70, 940, 940],
        },
      ],
    },
  },
  {
    id: 'calculus-midterm',
    title: 'MATH 115: Calculus I Diagnostic',
    subject: 'Mathematics',
    studentName: 'Liam Vance',
    description: 'Power rule differentiation, definite integration, quadratic equation solving, and matrix determinant calculation.',
    questionPaperUrl: svgToDataUrl(calculusQuestionPaperSvg),
    answerSheetUrl: svgToDataUrl(calculusStudentAnswerSheetSvg),
    report: {
      total_score: 100,
      max_score: 100,
      questions: [
        {
          question_number: '1',
          page_number: 1,
          confidence_score: 99,
          question_text: "Find derivative f'(x) for f(x) = 3x² + 5x - 7 and tangent slope at x = 2.",
          expected_answer: "f'(x) = 6x + 5; at x = 2, f'(2) = 6(2) + 5 = 17.",
          student_answer_text: "f(x) = 3x² + 5x - 7. f'(x) = d/dx(3x²) + d/dx(5x) - d/dx(7) = 6x + 5. At x = 2: Slope m = f'(2) = 6(2) + 5 = 12 + 5 = 17. Tangent line slope = 17.",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Correct differentiation steps and tangent slope calculation.",
          box_2d: [140, 75, 310, 940],
        },
        {
          question_number: '2',
          page_number: 1,
          confidence_score: 97,
          question_text: "Evaluate definite integral of 2x dx from 0 to 4.",
          expected_answer: "∫ 2x dx = [x²] from 0 to 4 = 16 - 0 = 16.",
          student_answer_text: "∫₀⁴ (2x) dx = [x²]₀⁴ = (4)² - (0)² = 16 - 0 = 16. Anti-derivative of 2x is x². Result = 16.",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Accurate fundamental theorem evaluation.",
          box_2d: [340, 75, 510, 940],
        },
        {
          question_number: '3',
          page_number: 1,
          confidence_score: 96,
          question_text: "Find roots of x² - 5x + 6 = 0.",
          expected_answer: "(x - 2)(x - 3) = 0 => x = 2, x = 3.",
          student_answer_text: "x² - 5x + 6 = 0. Factor: (x - 2)(x - 3) = 0. x - 2 = 0 => x = 2, x - 3 = 0 => x = 3. Roots are x = 2 and x = 3.",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Correct algebraic factoring and identification of roots.",
          box_2d: [530, 75, 710, 940],
        },
        {
          question_number: '4',
          page_number: 1,
          confidence_score: 94,
          question_text: "Compute det(A) for A = [[4, 2], [3, 2]] and state if invertible.",
          expected_answer: "det(A) = (4)(2) - (2)(3) = 8 - 6 = 2 != 0; Yes, invertible.",
          student_answer_text: "A = [[4, 2], [3, 2]]. det(A) = (4 * 2) - (2 * 3) = 8 - 6 = 2. Since det(A) = 2 != 0, matrix A is invertible (non-singular). det(A) = 2, Yes invertible.",
          status: 'correct',
          score_given: 25,
          max_score: 25,
          feedback: "Proper ad - bc formula application and determinant invertibility theorem.",
          box_2d: [730, 75, 910, 940],
        },
      ],
    },
  },
];

// Initialize detailed word detections for every question in sample sets
EXAM_SAMPLES.forEach((set: ExamSetSample) => {
  set.report.questions.forEach((q: GradedQuestion) => {
    if (!q.word_detections || q.word_detections.length === 0) {
      q.word_detections = generateWordDetectionsFromText(
        q.student_answer_text || '',
        q.box_2d || [100, 100, 300, 900],
        q.page_number || 1
      );
    }
  });
});
