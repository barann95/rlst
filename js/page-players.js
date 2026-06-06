// js/page-players.js

document.addEventListener('DOMContentLoaded', async () => {
    // API'den verileri yükle
    const isLoaded = await API.init();
    
    if (isLoaded) {
        renderPlayers();
        // Yüklenme ekranını kapat
        document.getElementById('loader').classList.add('hidden-loader');
    }

    // Arama işlevi
    document.getElementById('player-search').addEventListener('input', (e) => {
        renderPlayers(e.target.value);
    });
});

function renderPlayers(searchQuery = '') {
    const container = document.getElementById('players-container');
    let allPlayers = API.getAllPlayers();

    // Arama kelimesi varsa filtrele
    if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        allPlayers = allPlayers.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.teamName.toLowerCase().includes(q)
        );
    }

    if (allPlayers.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-500 italic">Oyuncu bulunamadı.</div>`;
        return;
    }

let html = '';
    allPlayers.forEach(p => {
        const marketValueStr = API.formatCurrency(p.marketValue);
        // İsimde geçebilecek özel karakterleri encode etmek önemlidir
        const safeName = encodeURIComponent(p.name);
        
        // Kart tasarımı - onclick eklendi
        html += `
        <div onclick="window.location.href='player-detail.html?name=${safeName}'" class="glass-card rounded-xl p-5 border border-slate-700/40 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden group cursor-pointer">
            <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div class="flex items-center gap-3 mb-4 border-b border-slate-800/60 pb-3">
                <img src="${p.teamLogo || 'https://placehold.co/100x100/1e293b/FFFFFF?text=?'}" class="w-10 h-10 rounded-full border-2 border-slate-600 bg-slate-950 object-cover group-hover:border-emerald-500/50 transition-all">
                <div class="min-w-0">
                    <h4 class="font-bold text-white text-base truncate">${p.name}</h4>
                    <div class="text-[10px] uppercase text-slate-500 tracking-wider truncate">${p.teamName}</div>
                </div>
            </div>

            <!-- Piyasa Değeri -->
            <div class="bg-slate-900/60 rounded-lg p-3 mb-4 border border-emerald-500/20 text-center group-hover:bg-emerald-900/20 transition-colors">
                <div class="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Piyasa Değeri</div>
                <div class="text-xl font-black text-emerald-400 tracking-wider">${marketValueStr}</div>
            </div>

            <div class="grid grid-cols-4 gap-2 text-[10px]">
                <div class="bg-slate-950/50 py-2 rounded-lg border border-slate-800/60 text-center">
                    <div class="text-slate-500 font-bold uppercase text-[9px] mb-1">Gol</div>
                    <div class="text-white font-black text-sm">${p.goals || 0}</div>
                </div>
                <div class="bg-slate-950/50 py-2 rounded-lg border border-slate-800/60 text-center">
                    <div class="text-slate-500 font-bold uppercase text-[9px] mb-1">Ast</div>
                    <div class="text-white font-black text-sm">${p.assists || 0}</div>
                </div>
                <div class="bg-slate-950/50 py-2 rounded-lg border border-slate-800/60 text-center">
                    <div class="text-slate-500 font-bold uppercase text-[9px] mb-1">Krt</div>
                    <div class="text-white font-black text-sm">${p.saves || 0}</div>
                </div>
                <div class="bg-slate-950/50 py-2 rounded-lg border border-slate-800/60 text-center">
                    <div class="text-slate-500 font-bold uppercase text-[9px] mb-1">Puan</div>
                    <div class="text-yellow-400 font-black text-sm">${p.score || 0}</div>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}