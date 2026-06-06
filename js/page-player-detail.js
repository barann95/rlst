// js/page-player-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    const isLoaded = await API.init();
    
    if (isLoaded) {
        renderPlayerProfile();
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden-loader');
    }
});

function getRankColor(rank) {
    if (!rank) return "text-slate-400 border-slate-600 bg-slate-800/50";
    const r = rank.toLowerCase();
    if (r.includes('supersonic legend')) return "text-pink-300 border-pink-500/40 bg-pink-600/15 shadow-[0_0_15px_rgba(236,72,153,0.3)]";
    if (r.includes('grand champion')) return "text-red-400 border-red-500/40 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
    if (r.includes('champion')) return "text-purple-400 border-purple-500/40 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]";
    if (r.includes('diamond')) return "text-blue-400 border-blue-500/40 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
    if (r.includes('platinum')) return "text-teal-400 border-teal-500/40 bg-teal-900/20 shadow-[0_0_15px_rgba(20,184,166,0.3)]";
    if (r.includes('gold')) return "text-yellow-400 border-yellow-500/40 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
    return "text-slate-300 border-slate-600 bg-slate-800/50";
}

function renderPlayerProfile() {
    const container = document.getElementById('player-profile-container');
    
    // URL'den oyuncu ismini al (Örn: player-detail.html?name=Krewzyy?)
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name');

    if (!playerName) {
        container.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl text-slate-400 font-bold uppercase">Oyuncu Bulunamadı</h2><a href="players.html" class="text-blue-400 underline mt-4 inline-block">Oyunculara Dön</a></div>`;
        return;
    }

    const allPlayers = API.getAllPlayers();
    const player = allPlayers.find(p => p.name === playerName);

    if (!player) {
        container.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl text-slate-400 font-bold uppercase">Böyle Bir Oyuncu Kayıtlı Değil</h2><a href="players.html" class="text-blue-400 underline mt-4 inline-block">Oyunculara Dön</a></div>`;
        return;
    }

    const marketValueStr = API.formatCurrency(player.marketValue);
    const rankColorClass = getRankColor(player.rank);

    container.innerHTML = `
        <!-- ÜST KİMLİK KARTI -->
        <div class="glass-card rounded-2xl p-6 md:p-10 border border-slate-700/40 relative overflow-hidden mb-8">
            <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <!-- Avatar / Logo -->
                <div class="relative shrink-0">
                    <img src="${player.teamLogo || 'https://placehold.co/150x150/1e293b/FFFFFF?text=?'}" class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-700 bg-slate-950 object-cover shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-check"></i>
                    </div>
                </div>

                <!-- Kişisel Bilgiler -->
                <div class="flex-grow text-center md:text-left">
                    <div class="inline-block px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wider mb-3 ${rankColorClass}">
                        ${player.rank || 'Derecesiz'}
                    </div>
                    <h2 class="esport-font text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-2">${player.name}</h2>
                    <p class="text-slate-400 text-sm uppercase tracking-widest font-semibold flex items-center justify-center md:justify-start gap-2">
                        <i class="fa-solid fa-shield-halved text-purple-400"></i> ${player.teamName}
                    </p>
                </div>

                <!-- Piyasa Değeri -->
                <div class="shrink-0 bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)] min-w-[200px]">
                    <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Güncel Piyasa Değeri</div>
                    <div class="text-3xl md:text-4xl font-black text-emerald-400">${marketValueStr}</div>
                </div>
            </div>
        </div>

        <!-- İSTATİSTİKLER GRİDİ -->
        <h3 class="esport-font text-2xl font-black text-white uppercase tracking-wider mb-4 border-l-4 border-emerald-500 pl-3">Performans Verileri</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div class="glass-card rounded-xl p-6 border border-slate-700/40 text-center hover:border-emerald-500/30 transition-colors">
                <i class="fa-solid fa-futbol text-2xl text-emerald-400 mb-3 opacity-80"></i>
                <div class="text-[11px] text-slate-500 uppercase font-bold tracking-widest mb-1">Toplam Gol</div>
                <div class="text-3xl font-black text-white">${player.goals || 0}</div>
            </div>
            <div class="glass-card rounded-xl p-6 border border-slate-700/40 text-center hover:border-blue-500/30 transition-colors">
                <i class="fa-solid fa-handshake text-2xl text-blue-400 mb-3 opacity-80"></i>
                <div class="text-[11px] text-slate-500 uppercase font-bold tracking-widest mb-1">Toplam Asist</div>
                <div class="text-3xl font-black text-white">${player.assists || 0}</div>
            </div>
            <div class="glass-card rounded-xl p-6 border border-slate-700/40 text-center hover:border-rose-500/30 transition-colors">
                <i class="fa-solid fa-shield text-2xl text-rose-400 mb-3 opacity-80"></i>
                <div class="text-[11px] text-slate-500 uppercase font-bold tracking-widest mb-1">Kurtarış</div>
                <div class="text-3xl font-black text-white">${player.saves || 0}</div>
            </div>
            <div class="glass-card rounded-xl p-6 border border-slate-700/40 text-center hover:border-yellow-500/30 transition-colors">
                <i class="fa-solid fa-star text-2xl text-yellow-400 mb-3 opacity-80"></i>
                <div class="text-[11px] text-slate-500 uppercase font-bold tracking-widest mb-1">Kariyer Puanı</div>
                <div class="text-3xl font-black text-white">${player.score || 0}</div>
            </div>
        </div>
    `;
}