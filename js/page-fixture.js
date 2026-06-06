// js/page-fixture.js

let currentWeek = 1;
let currentGroupFilter = 'all';
let totalWeeks = 5;

document.addEventListener('DOMContentLoaded', async () => {
    const isLoaded = await API.init();
    if (isLoaded) {
        changeSeason(1);
        document.getElementById('loader').classList.add('hidden-loader');
    }
});

window.changeSeason = function(season) {
    API.currentSeason = season;

    document.getElementById('btn-s1').className = season === 1
        ? "week-btn px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        : "week-btn px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white";
    document.getElementById('btn-s2').className = season === 2
        ? "week-btn px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border bg-gradient-to-r from-blue-500/20 to-sky-500/10 border-blue-500/50 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]"
        : "week-btn px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white";

    const seasonData = API.getSeasonData();
    if (!seasonData || !seasonData.schedule) return;

    totalWeeks = Object.keys(seasonData.schedule).length;
    currentWeek = 1;
    currentGroupFilter = 'all';

    setGroupFilter('all', false);
    buildWeekTabs();
    renderWeek(currentWeek);
};

window.setGroupFilter = function(group, rerender = true) {
    currentGroupFilter = group;
    ['all', 'A', 'B'].forEach(g => {
        const btn = document.getElementById('filter-' + g.toLowerCase());
        if (btn) btn.classList.toggle('active', g === group);
    });
    if (rerender) renderWeek(currentWeek);
};

function buildWeekTabs() {
    const container = document.getElementById('week-tabs');
    container.innerHTML = '';
    for (let w = 1; w <= totalWeeks; w++) {
        const btn = document.createElement('button');
        btn.className = `week-btn px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-700 text-slate-400 hover:text-white transition-all ${w === currentWeek ? 'active' : ''}`;
        btn.id = `week-btn-${w}`;
        btn.textContent = `Gün ${w}`;
        btn.onclick = () => selectWeek(w);
        container.appendChild(btn);
    }
}

window.selectWeek = function(week) {
    currentWeek = week;
    document.querySelectorAll('.week-btn[id^="week-btn-"]').forEach(b => b.classList.remove('active'));
    const active = document.getElementById(`week-btn-${week}`);
    if (active) active.classList.add('active');
    renderWeek(week);
};

function renderWeek(week) {
    const seasonData = API.getSeasonData();
    if (!seasonData || !seasonData.schedule) return;

    const weekMatches = (seasonData.schedule[String(week)] || []);
    const filtered = currentGroupFilter === 'all'
        ? weekMatches
        : weekMatches.filter(m => m.group === currentGroupFilter);

    renderStatsBar(weekMatches);
    renderMatches(filtered, seasonData);
}

function renderStatsBar(matches) {
    const bar = document.getElementById('week-stats-bar');
    if (!matches || matches.length === 0) { bar.innerHTML = ''; return; }

    const played = matches.filter(m => m.s1 !== '-' && m.s1 !== '' && m.s2 !== '-' && m.s2 !== '').length;
    const totalGoals = matches.reduce((sum, m) => {
        const g1 = parseInt(m.s1) || 0;
        const g2 = parseInt(m.s2) || 0;
        return sum + g1 + g2;
    }, 0);
    const avgGoals = played > 0 ? (totalGoals / played).toFixed(1) : '-';

    const mvps = matches.map(m => m.details?.mvp).filter(Boolean);
    const mvpCounts = {};
    mvps.forEach(name => { mvpCounts[name] = (mvpCounts[name] || 0) + 1; });
    const topMvp = Object.entries(mvpCounts).sort((a, b) => b[1] - a[1])[0];

    const biggestWin = matches.reduce((best, m) => {
        const diff = Math.abs((parseInt(m.s1) || 0) - (parseInt(m.s2) || 0));
        return diff > best.diff ? { diff, match: m } : best;
    }, { diff: -1, match: null });

    const stats = [
        {
            label: 'Oynanan Maç',
            value: `${played} / ${matches.length}`,
            icon: 'fa-gamepad',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20'
        },
        {
            label: 'Toplam Gol',
            value: totalGoals,
            icon: 'fa-futbol',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20'
        },
        {
            label: 'Maç Başı Ort.',
            value: avgGoals,
            icon: 'fa-chart-line',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20'
        },
        {
            label: 'En Büyük Fark',
            value: biggestWin.match ? `${biggestWin.diff} Gol` : '-',
            sub: biggestWin.match ? `${biggestWin.match.t1} vs ${biggestWin.match.t2}` : '',
            icon: 'fa-fire',
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20'
        }
    ];

    bar.innerHTML = stats.map(s => `
        <div class="glass-card rounded-xl p-4 border ${s.bg} flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0">
                <i class="fa-solid ${s.icon} ${s.color}"></i>
            </div>
            <div class="min-w-0">
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${s.label}</p>
                <p class="font-black text-white text-xl font-['Rajdhani']">${s.value}</p>
                ${s.sub ? `<p class="text-[10px] text-slate-500 truncate">${s.sub}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function renderMatches(matches, seasonData) {
    const container = document.getElementById('matches-container');
    const emptyState = document.getElementById('empty-state');

    if (!matches || matches.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    const allTeams = API.getAllTeams();
    const getTeam = (name) => allTeams.find(t => t.name === name);

    container.innerHTML = matches.map((match, idx) => {
        const s1 = parseInt(match.s1);
        const s2 = parseInt(match.s2);
        const isPlayed = !isNaN(s1) && !isNaN(s2) && match.s1 !== '-';
        const t1Wins = isPlayed && s1 > s2;
        const t2Wins = isPlayed && s2 > s1;
        const isDraw = isPlayed && s1 === s2;

        const team1 = getTeam(match.t1);
        const team2 = getTeam(match.t2);
        const isGroupB = match.group === 'B';

        const groupTagClass = isGroupB ? 'group-tag-b' : 'group-tag-a';
        const groupLabel = `Grup ${match.group || '?'}`;

        const logoHtml = (team, name) => {
            if (team && team.logo) {
                return `<img src="${team.logo}" alt="${name}" class="w-full h-full object-cover rounded-full">`;
            }
            return `<span class="text-slate-500 text-lg font-black font-['Rajdhani']">${(name || '?')[0]}</span>`;
        };

        const t1Class = isPlayed ? (t1Wins ? 'winner-team' : 'loser-team') : '';
        const t2Class = isPlayed ? (t2Wins ? 'winner-team' : 'loser-team') : '';

        const details = match.details || {};
        const mvp = details.mvp || '';
        const scorers = details.scorers || {};
        const t1Scorers = (scorers[match.t1] || []);
        const t2Scorers = (scorers[match.t2] || []);
        const hasDetails = mvp || t1Scorers.length > 0 || t2Scorers.length > 0;

        const mvpHtml = mvp ? `
            <div class="flex items-center gap-2 mvp-badge rounded-lg px-3 py-1.5">
                <i class="fa-solid fa-star text-amber-400 text-xs"></i>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MVP</span>
                <span class="text-sm text-amber-300 font-black font-['Rajdhani']">${mvp}</span>
            </div>
        ` : '';

        const scorerListHtml = (scorerArr) => {
            if (!scorerArr || scorerArr.length === 0) return '<span class="text-slate-600 text-xs italic">Detay yok</span>';
            return scorerArr.map(s => `
                <span class="stat-pill text-slate-300"><i class="fa-solid fa-futbol text-emerald-400/70 mr-1 text-[9px]"></i>${s}</span>
            `).join('');
        };

        const detailsPanel = hasDetails ? `
            <div class="detail-panel p-4" id="detail-${idx}">
                <div class="flex flex-col sm:flex-row gap-4">
                    ${mvpHtml}
                    <div class="flex-1 grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">${match.t1} - Goller</p>
                            <div class="flex flex-wrap gap-1.5">${scorerListHtml(t1Scorers)}</div>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">${match.t2} - Goller</p>
                            <div class="flex flex-wrap gap-1.5">${scorerListHtml(t2Scorers)}</div>
                        </div>
                    </div>
                </div>
            </div>
        ` : '';

        const scoreDisplay = isPlayed
            ? `<div class="flex items-center gap-2 shrink-0">
                <span class="score-box ${t1Wins ? 'text-white' : isDraw ? 'text-slate-400' : 'text-slate-600'}">${match.s1}</span>
                <span class="text-slate-600 font-black text-xl font-['Rajdhani']">:</span>
                <span class="score-box ${t2Wins ? 'text-white' : isDraw ? 'text-slate-400' : 'text-slate-600'}">${match.s2}</span>
               </div>`
            : `<div class="shrink-0 text-center">
                <div class="text-slate-600 font-black text-lg font-['Rajdhani'] tracking-widest">VS</div>
                <div class="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">${match.time || '20:00'}</div>
               </div>`;

        const detailToggle = hasDetails
            ? `<button onclick="toggleDetail(${idx})" class="absolute bottom-3 right-4 text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors flex items-center gap-1" id="toggle-btn-${idx}">
                <i class="fa-solid fa-chevron-down text-[8px]" id="toggle-icon-${idx}"></i> Detay
               </button>`
            : '';

        const statusBadge = isPlayed
            ? `<span class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> Oynandı</span>`
            : `<span class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-600"><span class="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block"></span> Bekliyor</span>`;

        return `
        <div class="match-card ${isGroupB ? 'group-b-card' : ''} overflow-hidden relative">
            <div class="p-4 md:p-5">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${groupTagClass}">${groupLabel}</span>
                    ${statusBadge}
                </div>
                <div class="flex items-center gap-3 md:gap-4">
                    <!-- Takım 1 -->
                    <div class="flex-1 flex items-center gap-3 ${t1Class} justify-end md:justify-start flex-row-reverse md:flex-row">
                        <div>
                            <p class="font-black text-white text-sm md:text-base font-['Rajdhani'] uppercase tracking-wide text-right md:text-left leading-tight">${match.t1}</p>
                            ${t1Wins ? '<p class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest text-right md:text-left">Galibiyet</p>' : ''}
                        </div>
                        <div class="team-logo-wrap ${t1Wins ? 'border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]' : ''}">
                            ${logoHtml(team1, match.t1)}
                        </div>
                    </div>

                    <!-- Skor -->
                    ${scoreDisplay}

                    <!-- Takım 2 -->
                    <div class="flex-1 flex items-center gap-3 ${t2Class}">
                        <div class="team-logo-wrap ${t2Wins ? 'border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]' : ''}">
                            ${logoHtml(team2, match.t2)}
                        </div>
                        <div>
                            <p class="font-black text-white text-sm md:text-base font-['Rajdhani'] uppercase tracking-wide leading-tight">${match.t2}</p>
                            ${t2Wins ? '<p class="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Galibiyet</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
            ${detailsPanel}
            ${detailToggle}
            ${hasDetails ? '<div class="pb-6"></div>' : ''}
        </div>
        `;
    }).join('');
}

window.toggleDetail = function(idx) {
    const panel = document.getElementById(`detail-${idx}`);
    const icon = document.getElementById(`toggle-icon-${idx}`);
    if (!panel) return;
    const isOpen = panel.classList.toggle('open');
    if (icon) {
        icon.className = isOpen
            ? 'fa-solid fa-chevron-up text-[8px]'
            : 'fa-solid fa-chevron-down text-[8px]';
    }
};
