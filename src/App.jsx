import React, { useState, useMemo, useEffect } from 'react';
import { Monitor, Ruler, Eye, CheckCircle2, AlertTriangle, Sparkles, Glasses, Maximize, Check, Crosshair, Globe2 } from 'lucide-react';

const RESOLUTIONS = [
  { label: '240p', h: 240, w: 426 },
  { label: '360p', h: 360, w: 640 },
  { label: '480p', h: 480, w: 854 },
  { label: '720p', h: 720, w: 1280 },
  { label: '1080p', h: 1080, w: 1920 },
  { label: '1440p', h: 1440, w: 2560 },
  { label: '4K (2160p)', h: 2160, w: 3840 },
  { label: '8K (4320p)', h: 4320, w: 7680 },
];

const DICT = {
  pt: {
    appTitle: "Analisador de Resolução",
    appSubtitle: "Calculadora ótica avançada baseada no limiar de resolução física humana, hiperacuidade Vernier e Campo de Visão (FOV).",
    screenParams: "Parâmetros do Ecrã",
    diagonal: "Diagonal do Ecrã (polegadas)",
    inches: "pol",
    tvRes: "Resolução do Ecrã",
    eyeDist: "Distância do olho ao ecrã",
    readDist: "Distância (Lês 1mm)",
    m: "m",
    cm: "cm",
    mm: "mm",
    preset2015: "Visão 20/15",
    preset2015Desc: "Acima da média (Fita a ~3m)",
    preset2020: "Visão 20/20",
    preset2020Desc: "Padrão \"Retina\" (Fita a ~2.3m)",
    preset2030: "Visão 20/30",
    preset2030Desc: "Média população (Fita a ~1.5m)",
    preset2040: "Visão 20/40",
    preset2040Desc: "Limite condução (Fita a ~1.1m)",
    cardDensity: "Densidade do Ecrã",
    cardSize: "Tamanho:",
    cardTarget: "Teu Alvo (Limiar)",
    cardMaxSize: "Tamanho máx:",
    cardFov: "Campo de Visão (FOV)",
    cinemaTHX: "Cinema THX",
    mixed: "Misto",
    monitor: "Monitor",
    verdictVernier: "Texto Nítido (Vernier)",
    verdictVernierDesc: "Densidade muito superior ao necessário. Letras finas e curvas sem serrilhado.",
    verdictRetina: "Excelente (Retina)",
    verdictRetinaDesc: "Píxeis invisíveis à vista desarmada. Qualidade de imagem imaculada.",
    verdictGood: "Bom / Aceitável",
    verdictGoodDesc: "Grelha não distrai, mas pode ser notada em texto pequeno. Ponto de equilíbrio p/ jogos.",
    verdictBad: "Píxeis Visíveis",
    verdictBadDesc: "A resolução é muito baixa para esta distância. Imagem e texto parecerão desfocados.",
    upToLimit: "Até {ratio}% do limite.",
    graph1Title: "Relevância do Aumento de Resolução",
    graph1Desc: "O olho humano tem uma zona de tolerância. Entre 85% e 150% do limite, a resolução é Retina. Só abaixo de 60% é que a grelha distrai.",
    limitAbsolute: "Limite Absoluto",
    limitVernier: "Limite Vernier",
    badgeOverkill: "Overkill",
    badgeRetina: "Retina Ideal",
    badgeGood: "Bom / Jogos",
    badgeBad: "Grelha Visível",
    graph2Title: "A que distância os píxeis desaparecem?",
    graph2Desc: "Mostra a distância exata de fusão matemática. A linha vermelha e o pino marcam a tua posição atual ({dist}m).",
    you: "Tu",
    fuseAt: "Fundem aos"
  },
  en: {
    appTitle: "Resolution Analyzer",
    appSubtitle: "Advanced optical calculator based on human physical resolution threshold, Vernier hyperacuity, and Field of View (FOV).",
    screenParams: "Screen Parameters",
    diagonal: "Screen Diagonal (inches)",
    inches: "in",
    tvRes: "Screen Resolution",
    eyeDist: "Distance from eye to screen",
    readDist: "Distance (You read 1mm)",
    m: "m",
    cm: "cm",
    mm: "mm",
    preset2015: "20/15 Vision",
    preset2015Desc: "Above avg (Tape at ~3m)",
    preset2020: "20/20 Vision",
    preset2020Desc: "\"Retina\" std (Tape at ~2.3m)",
    preset2030: "20/30 Vision",
    preset2030Desc: "Pop. average (Tape at ~1.5m)",
    preset2040: "20/40 Vision",
    preset2040Desc: "Driving limit (Tape at ~1.1m)",
    cardDensity: "Screen Density",
    cardSize: "Size:",
    cardTarget: "Your Target (Threshold)",
    cardMaxSize: "Max size:",
    cardFov: "Field of View (FOV)",
    cinemaTHX: "THX Cinema",
    mixed: "Mixed",
    monitor: "Monitor",
    verdictVernier: "Sharp Text (Vernier)",
    verdictVernierDesc: "Density far exceeds needs. Thin letters and curves have no aliasing.",
    verdictRetina: "Excellent (Retina)",
    verdictRetinaDesc: "Pixels invisible to the naked eye. Immaculate image quality.",
    verdictGood: "Good / Acceptable",
    verdictGoodDesc: "Grid isn't distracting, but may be noticed on tiny text. Sweet spot for gaming.",
    verdictBad: "Visible Pixels",
    verdictBadDesc: "Resolution is too low for this distance. Image and text will look blurry.",
    upToLimit: "Up to {ratio}% of the limit.",
    graph1Title: "Relevance of Resolution Increase",
    graph1Desc: "The human eye has a tolerance zone. Between 85% and 150% of the limit, resolution is Retina. Only below 60% is the grid truly distracting.",
    limitAbsolute: "Absolute Limit",
    limitVernier: "Vernier Limit",
    badgeOverkill: "Overkill",
    badgeRetina: "Ideal Retina",
    badgeGood: "Good / Gaming",
    badgeBad: "Visible Grid",
    graph2Title: "At what distance do pixels disappear?",
    graph2Desc: "Shows the exact mathematical fusion distance. The red line and pin mark your current position ({dist}m).",
    you: "You",
    fuseAt: "Fuse at"
  }
};

export default function App() {
  const [diagonal, setDiagonal] = useState(27);
  const [resolutionH, setResolutionH] = useState(2160);
  const [distance, setDistance] = useState(0.5);
  const [acuityInput, setAcuityInput] = useState(229);
  
  // Deteta o idioma baseando-se no navegador
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const browserLang = window.navigator.language || window.navigator.userLanguage;
      return browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
    }
    return 'en';
  });

  const t = DICT[lang];

  const getAcuityPresets = () => [
    { label: t.preset2015, value: 305, desc: t.preset2015Desc },
    { label: t.preset2020, value: 229, desc: t.preset2020Desc },
    { label: t.preset2030, value: 153, desc: t.preset2030Desc },
    { label: t.preset2040, value: 115, desc: t.preset2040Desc },
  ];

  const calculations = useMemo(() => {
    const effectiveAcuity = parseFloat(acuityInput) > 0 ? (parseFloat(acuityInput) * 1.5) / 100 : 3.44;
    
    const tvHeight_mm = (diagonal * 25.4) * (9 / Math.sqrt(337));
    const tvWidth_mm = (diagonal * 25.4) * (16 / Math.sqrt(337));
    
    const selectedRes = RESOLUTIONS.find(r => r.h === resolutionH) || RESOLUTIONS[6];
    
    const pixelSize_mm = tvHeight_mm / selectedRes.h;
    const maxResolvablePixel_mm = distance / effectiveAcuity;
    const optimalResHeight = tvHeight_mm / maxResolvablePixel_mm;

    const distance_mm = distance * 1000;
    const fov_rad = 2 * Math.atan(tvWidth_mm / (2 * distance_mm));
    const fov_deg = fov_rad * (180 / Math.PI);

    const tvPPI = Math.sqrt(selectedRes.w ** 2 + selectedRes.h ** 2) / diagonal;
    const targetPPI = (25.4 * effectiveAcuity) / distance;
    const vernierPPI = targetPPI * 1.5;
    const vernierPixelSize_mm = maxResolvablePixel_mm / 1.5;
    
    const perfectionRatio = tvPPI / targetPPI;

    const resDistances = RESOLUTIONS.map(res => {
      const pSize = tvHeight_mm / res.h;
      return {
        ...res,
        pixelSize: pSize,
        maxDist: pSize * effectiveAcuity
      };
    });

    return {
      selectedRes,
      pixelSize_mm,
      maxResolvablePixel_mm,
      optimalResHeight,
      resDistances,
      tvPPI,
      targetPPI,
      vernierPPI,
      vernierPixelSize_mm,
      fov_deg,
      perfectionRatio
    };
  }, [diagonal, resolutionH, distance, acuityInput]);

  const getVerdict = (ratio) => {
    if (ratio >= 1.5) return { color: 'blue', text: t.verdictVernier, icon: Sparkles, desc: t.verdictVernierDesc };
    if (ratio >= 0.85) return { color: 'emerald', text: t.verdictRetina, icon: CheckCircle2, desc: t.verdictRetinaDesc };
    if (ratio >= 0.60) return { color: 'amber', text: t.verdictGood, icon: Check, desc: t.verdictGoodDesc };
    return { color: 'red', text: t.verdictBad, icon: AlertTriangle, desc: t.verdictBadDesc };
  };

  const verdict = getVerdict(calculations.perfectionRatio);
  const presets = getAcuityPresets();

  const verdictGradients = {
    blue: 'from-blue-50 to-indigo-100 border-blue-200 text-blue-900',
    emerald: 'from-emerald-50 to-green-100 border-emerald-200 text-emerald-900',
    amber: 'from-amber-50 to-yellow-100 border-amber-200 text-amber-900',
    red: 'from-red-50 to-rose-100 border-red-200 text-red-900'
  };
  const iconColors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600'
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200 text-slate-800 p-4 md:p-8 font-sans selection:bg-indigo-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-center md:text-left">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 inline-block w-max mx-auto md:mx-0">
              <Monitor className="text-indigo-600 drop-shadow-sm" size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600">
                {t.appTitle}
              </h1>
              <p className="text-slate-500 mt-1.5 font-medium max-w-2xl">
                {t.appSubtitle}
              </p>
            </div>
          </div>
          
          <div className="self-center md:self-start bg-slate-200/50 p-1.5 rounded-xl flex items-center shadow-inner border border-slate-200/50">
            <button 
              onClick={() => setLang('pt')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'pt' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              PT
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL DE CONTROLOS */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/80">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Ruler size={20} /></div>
                {t.screenParams}
              </h2>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  {t.diagonal}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={diagonal} 
                    onChange={(e) => setDiagonal(Number(e.target.value))}
                    className="w-full p-3.5 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-lg text-slate-800 shadow-sm"
                    min="10" max="200"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium select-none">{t.inches}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  {t.tvRes}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {RESOLUTIONS.map(r => {
                    const isSelected = resolutionH === r.h;
                    return (
                      <button
                        key={r.h}
                        onClick={() => setResolutionH(r.h)}
                        className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all duration-200 border transform hover:-translate-y-0.5 ${
                          isSelected
                            ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-200/60 mt-6">
                <label className="flex justify-between text-sm font-semibold text-slate-700">
                  <span>{t.eyeDist}</span>
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{distance.toFixed(2)}{t.m}</span>
                </label>
                <div className="px-1">
                  <input 
                    type="range" 
                    min="0.2" max="10" step="0.05" 
                    value={distance} 
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-5 pt-8 border-t border-slate-200/60 mt-6">
                <div>
                  <label className="flex justify-between text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Eye size={16}/></div>
                      {t.readDist}
                    </span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{acuityInput}{t.cm}</span>
                  </label>
                  <div className="flex items-center gap-4 mt-4 px-1">
                    <span className="text-xs font-bold text-slate-400">30</span>
                    <input 
                      type="range" 
                      min="30" max="400" step="1"
                      value={acuityInput} 
                      onChange={(e) => setAcuityInput(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                    />
                    <span className="text-xs font-bold text-slate-400">400</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {presets.map(preset => {
                    const isSelected = acuityInput === preset.value;
                    return (
                      <button 
                        key={preset.label}
                        onClick={() => setAcuityInput(preset.value)}
                        className={`text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200 border ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-1 ring-blue-500/20' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow'
                        }`}
                      >
                        <div className="font-bold">{preset.label}</div>
                        <div className={`text-[10px] mt-1 leading-tight ${isSelected ? 'text-blue-600/80' : 'text-slate-500'}`}>{preset.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* PAINEL DE RESULTADOS E GRÁFICOS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Cards de Resultado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-3xl shadow-lg shadow-indigo-200/50 border-0 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex flex-col justify-center relative overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-4 -bottom-4 text-white/10 transform -rotate-12"><Maximize size={96}/></div>
                <div className="text-[10px] text-indigo-100 mb-1.5 uppercase tracking-widest font-bold relative z-10">{t.cardDensity}</div>
                <div className="text-4xl font-black relative z-10 flex items-baseline gap-1.5 tracking-tight">
                  {calculations.tvPPI.toFixed(0)} <span className="text-base font-semibold text-indigo-200">PPI</span>
                </div>
                <div className="text-xs text-indigo-200 mt-2 relative z-10 font-medium">
                  {t.cardSize} <strong className="text-white bg-white/20 px-1.5 py-0.5 rounded">{calculations.pixelSize_mm.toFixed(3)} {t.mm}</strong>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 flex flex-col justify-center transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-widest font-bold">{t.cardTarget}</div>
                <div className="text-3xl font-black text-slate-800 flex items-baseline gap-1 tracking-tight">
                  <span className="text-xl text-slate-300 font-normal mr-1">~</span> {calculations.targetPPI.toFixed(0)} <span className="text-base font-semibold text-slate-400">PPI</span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">
                  {t.cardMaxSize} <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{calculations.maxResolvablePixel_mm.toFixed(3)} {t.mm}</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 flex flex-col justify-center transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-widest font-bold">{t.cardFov}</div>
                <div className="text-3xl font-black text-slate-800 flex items-baseline gap-1.5 tracking-tight">
                  {calculations.fov_deg.toFixed(1)}°
                </div>
                <div className="mt-2">
                  <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 inline-flex items-center gap-1.5 border border-slate-200 whitespace-nowrap">
                    <Crosshair size={12} className="text-slate-400"/>
                    {calculations.fov_deg >= 40 ? t.cinemaTHX : calculations.fov_deg >= 30 ? t.mixed : t.monitor}
                  </span>
                </div>
              </div>

              <div className={`p-5 rounded-3xl shadow-md border flex flex-col justify-center bg-gradient-to-br ${verdictGradients[verdict.color]} transform transition duration-300 hover:-translate-y-1 hover:shadow-lg`}>
                <div className="text-sm font-black mb-1.5 flex items-center gap-2">
                  <verdict.icon className={iconColors[verdict.color]} size={20}/> 
                  <span>{verdict.text}</span>
                </div>
                <div className="text-xs leading-relaxed opacity-90 font-medium">
                  {verdict.desc} <span className="font-bold block mt-1">{t.upToLimit.replace('{ratio}', (calculations.perfectionRatio * 100).toFixed(0))}</span>
                </div>
              </div>
            </div>

            {/* GRÁFICO 1: Eficiência da Resolução */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white">
              <h3 className="text-xl font-bold mb-2 text-slate-800">{t.graph1Title}</h3>
              <p className="text-sm text-slate-500 mb-12 font-medium">
                {t.graph1Desc}
              </p>
              
              <div className="relative pb-8 pt-2">
                <div className="absolute top-0 bottom-8 left-20 md:left-24 right-28 md:right-36 pointer-events-none z-10">
                  <div 
                    className="absolute top-0 bottom-0 border-l-[3px] border-dashed border-emerald-500/80"
                    style={{ left: `${Math.min((calculations.optimalResHeight / 4320) * 100, 100)}%` }}
                  >
                    <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 backdrop-blur-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm border border-emerald-200/50 uppercase tracking-wide">
                      {t.limitAbsolute}
                    </div>
                  </div>

                  <div 
                    className="absolute top-0 bottom-0 border-l-[3px] border-dotted border-indigo-400/60"
                    style={{ left: `${Math.min(((calculations.optimalResHeight * 1.5) / 4320) * 100, 100)}%` }}
                  >
                    <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-indigo-800 bg-indigo-50/90 backdrop-blur-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm border border-indigo-200/50 uppercase tracking-wide">
                      {t.limitVernier}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative">
                  {RESOLUTIONS.map(res => {
                    const widthPercent = (res.h / 4320) * 100;
                    const resRatio = res.h / calculations.optimalResHeight;
                    
                    let barColor = 'from-red-400 to-red-500';
                    let badgeText = t.badgeBad;
                    let badgeColor = 'text-red-600 bg-red-50 ring-red-200';
                    
                    if (resRatio >= 1.5) {
                      barColor = 'from-slate-200 to-slate-300'; 
                      badgeText = t.badgeOverkill;
                      badgeColor = 'text-slate-500 bg-slate-50 ring-slate-200';
                    } else if (resRatio >= 0.85) {
                      barColor = 'from-emerald-400 to-emerald-500'; 
                      badgeText = t.badgeRetina;
                      badgeColor = 'text-emerald-700 bg-emerald-50 ring-emerald-200';
                    } else if (resRatio >= 0.60) {
                      barColor = 'from-amber-400 to-amber-500'; 
                      badgeText = t.badgeGood;
                      badgeColor = 'text-amber-700 bg-amber-50 ring-amber-200';
                    }

                    const isSelected = res.h === resolutionH;
                    
                    return (
                      <div key={res.h} className="flex items-center gap-3 md:gap-4 group">
                        <div className={`w-16 md:w-20 shrink-0 text-right text-sm font-bold tracking-tight ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {res.label}
                        </div>
                        <div className="flex-1 h-7 bg-slate-100 rounded-full relative overflow-hidden shadow-inner border border-slate-200/60">
                          <div 
                            className={`h-full transition-all duration-700 ease-out bg-gradient-to-r ${barColor} ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'} shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <div className={`w-28 md:w-32 shrink-0 text-[10px] md:text-xs font-bold text-center py-1 rounded-full ring-1 transition-all whitespace-nowrap ${isSelected ? badgeColor : 'text-slate-400 bg-transparent ring-transparent group-hover:bg-slate-50 group-hover:ring-slate-200'}`}>
                          {badgeText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* GRÁFICO 2: Distâncias Limite por Resolução */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white overflow-x-auto">
              <h3 className="text-xl font-bold mb-2 text-slate-800">{t.graph2Title}</h3>
              <p className="text-sm text-slate-500 mb-12 font-medium">
                {t.graph2Desc.replace('{dist}', distance.toFixed(2))}
              </p>
              
              <div className="space-y-5 relative min-w-[500px] mt-4">
                <div 
                  className="absolute top-0 bottom-0 border-l-[2px] border-red-500 z-20 pointer-events-none"
                  style={{ left: `${Math.min((distance / 10) * 100, 100)}%` }}
                >
                  <div className="absolute top-1/2 -left-4 bg-red-500 text-white p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] transform -translate-y-1/2 ring-4 ring-white flex items-center justify-center">
                    <Glasses size={16} />
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-black text-red-600 bg-red-50 px-3 py-1 rounded-full shadow-sm border border-red-100 whitespace-nowrap">
                    {t.you} ({distance}{t.m})
                  </div>
                </div>

                {calculations.resDistances.map(res => {
                  const maxChartDistance = 10; 
                  const widthPercent = Math.min((res.maxDist / maxChartDistance) * 100, 100);
                  const isVisibleAtCurrentDistance = distance < (res.maxDist * 0.85); // Tolerância
                  const isSelected = res.h === resolutionH;

                  return (
                    <div key={res.h} className="flex flex-col gap-1.5 relative z-10">
                      <div className="flex justify-between text-xs px-2">
                        <span className={`font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>{res.label}</span>
                        <span className="text-slate-500 font-medium">{t.fuseAt} <strong className="text-slate-800">{res.maxDist.toFixed(2)}{t.m}</strong></span>
                      </div>
                      <div className="w-full h-8 bg-slate-100 rounded-2xl relative flex items-center shadow-inner border border-slate-200/60 p-0.5">
                        <div 
                          className={`h-full rounded-xl transition-all duration-700 ease-out flex items-center px-3 ${
                            isVisibleAtCurrentDistance 
                            ? 'bg-gradient-to-r from-red-400 to-amber-400 text-amber-900 shadow-sm'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm'
                          } ${isSelected ? 'ring-2 ring-offset-2 ring-indigo-400' : 'opacity-90'}`}
                          style={{ width: `${widthPercent}%` }}
                        >
                          {isVisibleAtCurrentDistance ? (
                            <AlertTriangle size={14} className="opacity-80 mr-2 shrink-0" />
                          ) : (
                            <CheckCircle2 size={14} className="opacity-90 mr-2 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex justify-between border-t-2 border-slate-100 pt-3 text-xs font-bold text-slate-400 mt-6 relative z-10">
                  <span>0{t.m}</span>
                  <span>2.5{t.m}</span>
                  <span>5{t.m}</span>
                  <span>7.5{t.m}</span>
                  <span>10{t.m}+</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}