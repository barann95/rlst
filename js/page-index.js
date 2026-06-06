// js/page-index.js

document.addEventListener('DOMContentLoaded', async () => {
    const isLoaded = await API.init();
    
    if (isLoaded) {
        renderFeaturedTeam();
        renderFeaturedMatches();
        renderTopPlayers(); 
        
        const loader = document.getElementById('loader');
        if(loader && !loader.style.display) {
            loader.classList.add('hidden-loader');
        }
    }
});

function renderTopPlayers() {
    const allPlayers = API.getAllPlayers();
    if(!allPlayers || allPlayers.length === 0) return;

    const mvp = allPlayers[0]; 
    const topScorer = [...allPlayers].sort((a,b) => (b.goals || 0) - (a.goals || 0))[0];

    document.getElementById('most-expensive-player').innerHTML = `
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full"></div>
        <h3 class="esport-font text-xs text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i class="fa-solid fa-sack-dollar"></i> En Değerli Oyuncu
        </h3>
        <div class="flex items-center gap-4 relative z-10">
            <img src="${mvp.teamLogo}" class="w-14 h-14 rounded-full border-2 border-emerald-500/30 bg-slate-900 object-cover">
            <div>
                <h4 class="esport-font text-xl font-black text-white uppercase">${mvp.name}</h4>
                <div class="text-[10px] text-slate-400 uppercase tracking-widest">${mvp.teamName}</div>
            </div>
        </div>
        <div class="mt-4 bg-slate-950/50 border border-emerald-500/20 rounded-lg p-3 flex justify-between items-center relative z-10">
            <span class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Piyasa Değeri</span>
            <span class="text-xl font-black text-emerald-400">${API.formatCurrency(mvp.marketValue)}</span>
        </div>
    `;

    document.getElementById('top-scorer-player').innerHTML = `
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full"></div>
        <h3 class="esport-font text-xs text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i class="fa-solid fa-futbol"></i> Gol Kralı
        </h3>
        <div class="flex items-center gap-4 relative z-10">
            <img src="${topScorer.teamLogo}" class="w-14 h-14 rounded-full border-2 border-orange-500/30 bg-slate-900 object-cover">
            <div>
                <h4 class="esport-font text-xl font-black text-white uppercase">${topScorer.name}</h4>
                <div class="text-[10px] text-slate-400 uppercase tracking-widest">${topScorer.teamName}</div>
            </div>
        </div>
        <div class="mt-4 bg-slate-950/50 border border-orange-500/20 rounded-lg p-3 flex justify-between items-center relative z-10">
            <span class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Toplam Gol</span>
            <span class="text-xl font-black text-orange-400">${topScorer.goals}</span>
        </div>
    `;
}

function renderFeaturedTeam() {
    const container = document.getElementById('team-of-the-day-content');
    const seasonData = API.getSeasonData();
    
    if (!seasonData || !seasonData.teamOfTheDay || !seasonData.teamOfTheDay.show) {
        container.innerHTML = `<p class="text-slate-500 text-sm italic">Şu an öne çıkan bir takım yok.</p>`;
        return;
    }

    const tod = seasonData.teamOfTheDay;
    const teamData = [...(seasonData.groupA || []), ...(seasonData.groupB || [])].find(t => t.name === tod.name);
    const logoUrl = teamData && teamData.logo ? teamData.logo : 'https://placehold.co/150x150/1e293b/FFFFFF?text=?';

    container.innerHTML = `
        <div class="flex items-center gap-4 relative z-10">
            <img src="${logoUrl}" class="w-14 h-14 rounded-full border-2 border-blue-500/30 bg-slate-900 object-cover">
            <div>
                <h4 class="esport-font text-xl font-black text-white uppercase">${tod.name}</h4>
                <div class="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 tracking-wider">
                    <i class="fa-solid fa-star text-[9px]"></i> MVP: ${tod.mvp}
                </div>
            </div>
        </div>
        <div class="mt-4 bg-slate-950/50 border border-blue-500/20 rounded-lg p-3 flex justify-between items-center relative z-10">
            <span class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Son Seri Durumu</span>
            <span class="text-sm font-black text-blue-400 tracking-wider">${tod.stat}</span>
        </div>
    `;
}

function renderFeaturedMatches() {
    const container = document.getElementById('featured-matches-container');
    const seasonData = API.getSeasonData();
    let matchesToShow = [];

    if (seasonData && seasonData.schedule) {
        for (let day in seasonData.schedule) {
            const dayMatches = seasonData.schedule[day].filter(m => m.s1 !== "-" && m.t1 !== "TBD");
            matchesToShow = matchesToShow.concat(dayMatches);
        }
    }

    matchesToShow = matchesToShow.slice(-4).reverse();

    if (matchesToShow.length === 0) {
        container.innerHTML = `<p class="col-span-full text-slate-500 text-sm italic">Henüz oynanmış maç bulunmuyor.</p>`;
        return;
    }

    let html = '';
    const allTeams = [...(seasonData.groupA || []), ...(seasonData.groupB || [])];

    matchesToShow.forEach(match => {
        const team1 = allTeams.find(t => t.name === match.t1);
        const team2 = allTeams.find(t => t.name === match.t2);
        
        const logo1 = team1 && team1.logo ? `<img src="${team1.logo}" class="w-6 h-6 rounded-full object-cover">` : `<div class="w-6 h-6 rounded-full bg-slate-800"></div>`;
        const logo2 = team2 && team2.logo ? `<img src="${team2.logo}" class="w-6 h-6 rounded-full object-cover">` : `<div class="w-6 h-6 rounded-full bg-slate-800"></div>`;

        const t1Win = parseInt(match.s1) > parseInt(match.s2);
        const t2Win = parseInt(match.s2) > parseInt(match.s1);

        html += `
        <div class="bg-slate-900/40 rounded-xl p-3 border border-slate-700/40 hover:border-slate-500/50 transition-colors">
            <div class="flex justify-between items-center mb-2">
                <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Grup ${match.group || '-'} • ${match.time}</span>
                <span class="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">BO1</span>
            </div>
            <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border ${t1Win ? 'border-emerald-500/30' : 'border-transparent'}">
                    <div class="flex items-center gap-2">${logo1} <span class="text-xs font-semibold ${t1Win ? 'text-white' : 'text-slate-400'} truncate">${match.t1}</span></div>
                    <span class="font-black text-sm ${t1Win ? 'text-emerald-400' : 'text-slate-500'}">${match.s1}</span>
                </div>
                <div class="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border ${t2Win ? 'border-emerald-500/30' : 'border-transparent'}">
                    <div class="flex items-center gap-2">${logo2} <span class="text-xs font-semibold ${t2Win ? 'text-white' : 'text-slate-400'} truncate">${match.t2}</span></div>
                    <span class="font-black text-sm ${t2Win ? 'text-emerald-400' : 'text-slate-500'}">${match.s2}</span>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}