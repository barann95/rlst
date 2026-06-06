// js/page-standings.js

const DEFAULT_BRACKET_MATCHES = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    const isLoaded = await API.init();
    
    if (isLoaded) {
        document.querySelectorAll('.b-match').forEach(m => {
            if(m.id) DEFAULT_BRACKET_MATCHES.set(m.id, m.innerHTML);
        });

        initBracketDrag();
        changeSeason(API.currentSeason || 1);
        document.getElementById('loader').classList.add('hidden-loader');
    }
});

// Sezon değiştirme 
window.changeSeason = function(season) {
    API.currentSeason = season;
    
    document.getElementById('btn-season-1').className = season === 1 
        ? "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
        : "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white";
        
    document.getElementById('btn-season-2').className = season === 2 
        ? "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border bg-gradient-to-r from-blue-500/20 to-sky-500/10 border-blue-500/50 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
        : "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white";

    // Playoff ağaçlarını göster/gizle
    const bracketS1 = document.getElementById('bracket-s1');
    const bracketS2 = document.getElementById('bracket-s2');
    
    if (season === 1) {
        bracketS1.classList.remove('hidden');
        bracketS2.classList.add('hidden');
    } else {
        bracketS1.classList.add('hidden');
        bracketS2.classList.remove('hidden');
    }

    renderStandings();
    if(season === 1) renderBracket();
};

function renderStandings() {
    const seasonData = API.getSeasonData();
    const container = document.getElementById('standings-container');
    if (!seasonData) return;

    if (API.currentSeason === 1) {
        // --- SEZON 1: GRUP A ve GRUP B SİSTEMİ ---
        container.innerHTML = `
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section class="glass-card rounded-2xl overflow-hidden glow-border">
                    <div class="p-5 md:p-6">
                        <div class="flex items-center gap-3 mb-6"><div class="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div><h2 class="esport-font text-3xl font-black uppercase text-white tracking-wider">GRUP A</h2></div>
                        <div class="overflow-x-auto -mx-2 px-2"><table class="w-full min-w-[440px] text-left border-collapse"><thead><tr class="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><th class="p-2 font-semibold w-8 text-center">#</th><th class="p-2 font-semibold">Takım</th><th class="p-2 font-semibold text-center w-8">O</th><th class="p-2 font-semibold text-center w-8 text-emerald-500/70">G</th><th class="p-2 font-semibold text-center w-8 text-red-500/70">M</th><th class="p-2 font-semibold text-center w-8 text-slate-400">Av</th><th class="p-2 font-semibold text-center text-blue-400 w-12">P</th></tr></thead><tbody class="text-sm">${generateTableRows(seasonData.groupA, 4)}</tbody></table></div>
                    </div>
                </section>
                <section class="glass-card rounded-2xl overflow-hidden glow-border">
                    <div class="p-5 md:p-6">
                        <div class="flex items-center gap-3 mb-6"><div class="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full"></div><h2 class="esport-font text-3xl font-black uppercase text-white tracking-wider">GRUP B</h2></div>
                        <div class="overflow-x-auto -mx-2 px-2"><table class="w-full min-w-[440px] text-left border-collapse"><thead><tr class="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><th class="p-2 font-semibold w-8 text-center">#</th><th class="p-2 font-semibold">Takım</th><th class="p-2 font-semibold text-center w-8">O</th><th class="p-2 font-semibold text-center w-8 text-emerald-500/70">G</th><th class="p-2 font-semibold text-center w-8 text-red-500/70">M</th><th class="p-2 font-semibold text-center w-8 text-slate-400">Av</th><th class="p-2 font-semibold text-center text-orange-400 w-12">P</th></tr></thead><tbody class="text-sm">${generateTableRows(seasonData.groupB, 4)}</tbody></table></div>
                    </div>
                </section>
            </div>
        `;
    } else if (API.currentSeason === 2) {
        // --- SEZON 2: GÖRSELDEKİ GİBİ SWISS STAGE SİSTEMİ ---
        container.innerHTML = `
            <div class="flex items-center gap-3 mb-6">
                <div class="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 class="esport-font text-3xl font-black uppercase text-white tracking-wider">SWISS AŞAMASI EŞLEŞMELERİ</h2>
            </div>
            
            <div class="overflow-x-auto pb-6 custom-scrollbar">
                <div class="flex gap-8 min-w-max items-center py-4">
                    
                    <!-- Round 1 (0-0) -->
                    <div class="flex flex-col gap-6 shrink-0">
                        ${createSwissBox("0 - 0", 8, "BO1 (TUR 1)")}
                    </div>

                    <!-- Round 2 (1-0, 0-1) -->
                    <div class="flex flex-col gap-8 shrink-0">
                        ${createSwissBox("1 - 0", 4, "BO1 (TUR 2)")}
                        ${createSwissBox("0 - 1", 4, "BO1 (TUR 2)")}
                    </div>

                    <!-- Round 3 (2-0, 1-1, 0-2) -->
                    <div class="flex flex-col gap-8 shrink-0">
                        ${createSwissBox("2 - 0", 2, "BO3 (TUR 3)")}
                        ${createSwissBox("1 - 1", 4, "BO1 (TUR 3)")}
                        ${createSwissBox("0 - 2", 2, "BO3 (TUR 3)")}
                    </div>

                    <!-- Round 4 & Results (3-0, 2-1, 1-2, 0-3) -->
                    <div class="flex flex-col gap-8 shrink-0">
                        ${createSwissStatus("3-0 TURA ÇIKANLAR", true)}
                        ${createSwissBox("2 - 1", 3, "BO3 (TUR 4)")}
                        ${createSwissBox("1 - 2", 3, "BO3 (TUR 4)")}
                        ${createSwissStatus("0-3 ELENENLER", false)}
                    </div>

                    <!-- Round 5 & Final Results (3-1, 2-2, 1-3) -->
                    <div class="flex flex-col gap-8 shrink-0">
                        ${createSwissStatus("3-1 TURA ÇIKANLAR", true)}
                        ${createSwissBox("2 - 2", 3, "BO3 (TUR 5)")}
                        ${createSwissStatus("1-3 ELENENLER", false)}
                    </div>

                </div>
            </div>
        `;
    }
}

// Swiss Box HTML Oluşturucu (Görseldeki tasarıma uygun)
function createSwissBox(title, matchCount, infoText) {
    let matchesHtml = '';
    for(let i=0; i<matchCount; i++) {
        matchesHtml += `
        <div class="swiss-match">
            <span class="text-xs text-slate-500 font-semibold italic w-10 truncate">TBD</span>
            <span class="bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-400 font-mono tracking-widest">-:-</span>
            <span class="text-xs text-slate-500 font-semibold italic w-10 text-right truncate">TBD</span>
        </div>`;
    }
    
    return `
    <div class="swiss-box">
        <h4 class="text-white font-black text-lg mb-3 px-1 font-mono tracking-wider">${title}</h4>
        <div class="flex flex-col">${matchesHtml}</div>
        <div class="text-[9px] text-slate-500 uppercase mt-3 font-bold tracking-widest text-center">${infoText}</div>
    </div>`;
}

// Swiss Çıkanlar/Elenenler HTML Oluşturucu
function createSwissStatus(title, isAdvance) {
    const colorClass = isAdvance ? "text-emerald-400 border-emerald-500/30 bg-emerald-900/10" : "text-rose-400 border-rose-500/30 bg-rose-900/10";
    return `
    <div class="swiss-status border ${colorClass}">
        <div class="text-xs font-bold mb-1">${title}</div>
        <div class="text-white text-[10px] font-medium tracking-widest">TBD / TBD / TBD</div>
    </div>`;
}

function generateTableRows(teamArray, limit = 4) {
    if (!teamArray) return '';
    const sortedTeams = [...teamArray].map(t => { 
        t.Av = (t.AG || 0) - (t.YG || 0); t.Puan = (t.G || 0) * 3; return t; 
    }).sort((a, b) => { 
        if (b.Puan !== a.Puan) return b.Puan - a.Puan; 
        if (b.Av !== a.Av) return b.Av - a.Av;
        return (b.AG || 0) - (a.AG || 0);
    });

    let html = '';
    sortedTeams.forEach((team, index) => {
        const i = index + 1;
        const isEliminated = i > limit; 
        const rowClass = isEliminated ? "border-b border-slate-800/40 opacity-50" : "border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors";
        const lineClass = i === (limit + 1) ? "border-t-2 border-dashed border-red-500/30" : "";
        let rankColor = "text-slate-500";
        if (i === 1) rankColor = "text-yellow-500"; else if (i === 2) rankColor = "text-slate-300"; else if (i <= limit) rankColor = "text-blue-400";
        const logoHtml = team.logo && team.name !== "TBD" ? `<img src="${team.logo}" class="w-6 h-6 rounded-full object-cover border border-slate-600 bg-slate-900 shrink-0">` : `<div class="w-6 h-6 rounded-full border border-dashed border-slate-600 bg-slate-900 flex items-center justify-center shrink-0"><span class="text-[8px] text-slate-500">?</span></div>`;
        const nameStyle = team.name === "TBD" ? "text-slate-500 italic font-medium" : "text-slate-200 font-semibold";

        html += `<tr class="${rowClass} ${lineClass}"><td class="p-2 text-center font-black text-xs ${rankColor}">${i}</td><td class="p-2 py-3"><div class="flex items-center gap-2.5">${logoHtml}<span class="${nameStyle} truncate max-w-[120px] md:max-w-none text-sm">${team.name}</span></div></td><td class="p-2 text-center text-slate-400 text-xs md:text-sm">${team.O || 0}</td><td class="p-2 text-center text-emerald-500/80 font-bold text-xs md:text-sm">${team.G || 0}</td><td class="p-2 text-center text-red-500/80 font-bold text-xs md:text-sm">${team.M || 0}</td><td class="p-2 text-center font-bold text-xs md:text-sm ${team.Av > 0 ? 'text-emerald-400' : team.Av < 0 ? 'text-rose-400' : 'text-slate-400'}">${team.Av > 0 ? '+'+team.Av : team.Av}</td><td class="p-2 text-center font-black text-lg tracking-wider ${i <= limit ? 'text-white' : 'text-slate-600'}">${team.Puan}</td></tr>`;
    });
    return html;
}

// ----------------------------------------------------
// PLAYOFF BRACKET RENDER (SADECE S1 İÇİN ÇALIŞIR ŞU AN)
// ----------------------------------------------------
function updateMatchUI(elementId, matchData) {
    const el = document.getElementById(elementId);
    if (!el || !matchData) return;
    const t1Team = el.querySelector('.b-team:first-child');
    const t2Team = el.querySelector('.b-team:last-child');
    if (!t1Team || !t2Team) return;
    
    const getTeamSpanClass = (name) => {
        return name === "TBD" || name.includes("Galibi") || name.includes("Mağlubu")
            ? "text-slate-500 italic text-[10px] truncate"
            : "text-white font-semibold text-[11px] truncate";
    };

    const createTeamContent = (teamName, scoreStr) => {
        const tName = teamName || "TBD";
        const teamData = API.getAllTeams().find(t => t.name === tName);
        const nameClass = getTeamSpanClass(tName);
        let logoHtml = '';
        if (teamData && teamData.logo) {
            logoHtml = `<img src="${teamData.logo}" class="w-4 h-4 rounded-full object-cover border border-slate-500 bg-slate-900 shrink-0">`;
        }
        return `<div class="flex items-center gap-2 overflow-hidden pr-2">${logoHtml}<span class="${nameClass}">${tName}</span></div><span class="b-score ${scoreStr !== "-" ? 'text-white' : ''}">${scoreStr || "-"}</span>`;
    };

    t1Team.innerHTML = createTeamContent(matchData.t1, matchData.s1);
    t2Team.innerHTML = createTeamContent(matchData.t2, matchData.s2);
}

function renderBracket() {
    const seasonData = API.getSeasonData();
    document.querySelectorAll('.b-match').forEach(m => {
        const def = DEFAULT_BRACKET_MATCHES.get(m.id);
        if (def !== undefined) m.innerHTML = def;
    });

    if (!seasonData || !seasonData.bracket) return;
    const b = seasonData.bracket;
    
    if (b.upperR1) { updateMatchUI('b-ur1-m1', b.upperR1[0]); updateMatchUI('b-ur1-m2', b.upperR1[1]); }
    if (b.upperSF) { updateMatchUI('b-usf-m1', b.upperSF[0]); updateMatchUI('b-usf-m2', b.upperSF[1]); }
    if (b.upperFinal) updateMatchUI('b-uf-m1', b.upperFinal[0]);
    if (b.lowerR1) { updateMatchUI('b-lr1-m1', b.lowerR1[0]); updateMatchUI('b-lr1-m2', b.lowerR1[1]); }
    if (b.lowerQF) { updateMatchUI('b-lqf-m1', b.lowerQF[0]); updateMatchUI('b-lqf-m2', b.lowerQF[1]); }
    if (b.lowerSF) updateMatchUI('b-lsf-m1', b.lowerSF[0]);
    if (b.lowerFinal) updateMatchUI('b-lf-m1', b.lowerFinal[0]);
    
    if (b.grandFinal) {
        const gf = document.getElementById('b-gf-m1');
        if(gf) {
            updateMatchUI('b-gf-m1', b.grandFinal[0]);
            gf.querySelectorAll('.b-score').forEach(s => s.classList.add('text-amber-400'));
        }
    }
}

function initBracketDrag() {
    const slider = document.getElementById('bracket-drag');
    if (!slider) return;
    let isDown = false, startX, scrollLeft;
    slider.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => { 
        if (!isDown) return; 
        e.preventDefault(); 
        slider.scrollLeft = scrollLeft - (e.pageX - slider.offsetLeft - startX) * 2; 
    });
}



