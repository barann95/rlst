// js/page-teams.js

document.addEventListener('DOMContentLoaded', async () => {
    const isLoaded = await API.init();
    
    if (isLoaded) {
        renderTeams();
        document.getElementById('loader').classList.add('hidden-loader');
    }
});

function renderTeams() {
    const container = document.getElementById('teams-container');
    const allTeams = API.getAllTeams();

    if (allTeams.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-500 italic">Takım verisi bulunamadı.</div>`;
        return;
    }

let html = '';
    allTeams.forEach(team => {
        const points = (team.G || 0) * 3;
        const totalMatches = team.O || 0;
        const playersCount = team.players ? team.players.length : 0;
        const safeTeamName = encodeURIComponent(team.name);

        html += `
        <div onclick="window.location.href='team-detail.html?team=${safeTeamName}'" class="glass-card rounded-2xl p-6 border border-slate-700/40 hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden group cursor-pointer">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div class="flex items-center gap-5 mb-5 border-b border-slate-800/60 pb-5">
                <img src="${team.logo || 'https://placehold.co/150x150/1e293b/FFFFFF?text=?'}" class="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-950 object-cover group-hover:border-purple-500/50 transition-all group-hover:scale-105 duration-300">
                <div>
                    <h3 class="esport-font text-2xl font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-wider">${team.name}</h3>
                    <span class="inline-block mt-1 text-[10px] text-slate-400 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                        ${playersCount} Oyuncu
                    </span>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-slate-950/50 py-3 rounded-xl border border-slate-800/60 group-hover:border-purple-500/20 transition-colors">
                    <div class="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Puan</div>
                    <div class="text-purple-400 font-black text-xl">${points}</div>
                </div>
                <div class="bg-slate-950/50 py-3 rounded-xl border border-slate-800/60">
                    <div class="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">G - M</div>
                    <div class="text-slate-200 font-black text-xl"><span class="text-emerald-400">${team.G || 0}</span><span class="text-slate-600 mx-1">-</span><span class="text-red-400">${team.M || 0}</span></div>
                </div>
                <div class="bg-slate-950/50 py-3 rounded-xl border border-slate-800/60">
                    <div class="text-slate-500 font-bold uppercase text-[10px] tracking-wider mb-1">Oynanan</div>
                    <div class="text-slate-200 font-black text-xl">${totalMatches}</div>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}