// js/page-team-detail.js

document.addEventListener('DOMContentLoaded', async () => {
    const isLoaded = await API.init();
    
    if (isLoaded) {
        renderTeamProfile();
        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('hidden-loader');
    }
});

function renderTeamProfile() {
    const container = document.getElementById('team-profile-container');
    const urlParams = new URLSearchParams(window.location.search);
    const teamName = urlParams.get('team');

    if (!teamName) {
        container.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl text-slate-400 font-bold uppercase">Takım Bulunamadı</h2><a href="teams.html" class="text-blue-400 underline mt-4 inline-block">Takımlara Dön</a></div>`;
        return;
    }

    const seasonData = API.getSeasonData();
    const allTeams = API.getAllTeams();
    const team = allTeams.find(t => t.name === teamName);

    if (!team) {
        container.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl text-slate-400 font-bold uppercase">Böyle Bir Takım Kayıtlı Değil</h2><a href="teams.html" class="text-blue-400 underline mt-4 inline-block">Takımlara Dön</a></div>`;
        return;
    }

    const points = (team.G || 0) * 3;
    const goalDiff = (team.AG || 0) - (team.YG || 0);
    const goalDiffText = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
    const goalDiffColor = goalDiff > 0 ? 'text-emerald-400' : (goalDiff < 0 ? 'text-rose-400' : 'text-slate-400');

    // Kadro (Roster) HTML'i oluşturma
    let rosterHtml = '';
    if (team.players && team.players.length > 0) {
        // Takım oyuncularını piyasa değerine göre sırala (en değerli oyuncu ilk gelsin)
        const sortedPlayers = [...team.players].map(p => {
            return { ...p, marketValue: API.calculatePlayerValue(p) };
        }).sort((a, b) => b.marketValue - a.marketValue);

        sortedPlayers.forEach(p => {
            const safeName = encodeURIComponent(p.name);
            rosterHtml += `
            <div onclick="window.location.href='player-detail.html?name=${safeName}'" class="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <div class="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">${p.name}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">${p.rank || 'Derecesiz'}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Piyasa Değeri</div>
                    <div class="text-sm font-black text-emerald-400">${API.formatCurrency(p.marketValue)}</div>
                </div>
            </div>`;
        });
    } else {
        rosterHtml = `<div class="col-span-full text-center py-6 text-slate-500 italic border border-dashed border-slate-700 rounded-xl">Kadrosunda henüz oyuncu bulunmuyor.</div>`;
    }

    // Maç Geçmişi HTML'i oluşturma
    let matchHistoryHtml = '';
    let matchesFound = false;

    if (seasonData && seasonData.schedule) {
        Object.keys(seasonData.schedule).forEach(day => {
            seasonData.schedule[day].forEach(m => {
                if(m.t1 === team.name || m.t2 === team.name) {
                    matchesFound = true;
                    const isPlayed = m.s1 !== "-";
                    let resultBadge = `<span class="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Bekleniyor</span>`;
                    let borderStyle = "border-slate-700/50";
                    
                    if(isPlayed) {
                        const isT1 = m.t1 === team.name;
                        const myScore = isT1 ? parseInt(m.s1) : parseInt(m.s2);
                        const oppScore = isT1 ? parseInt(m.s2) : parseInt(m.s1);
                        if(myScore > oppScore) { 
                            resultBadge = `<span class="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Galibiyet</span>`;
                            borderStyle = "border-emerald-500/40";
                        } else { 
                            resultBadge = `<span class="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Mağlubiyet</span>`;
                            borderStyle = "border-rose-500/30";
                        }
                    }

                    matchHistoryHtml += `
                    <div class="flex items-center justify-between p-4 bg-slate-950/40 border ${borderStyle} rounded-xl mb-3 hover:bg-slate-900/60 transition-colors">
                        <div class="w-1/4 flex flex-col items-start gap-1">
                            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gün ${day}</span>
                            ${resultBadge}
                        </div>
                        <div class="flex items-center justify-center gap-3 w-2/4 font-bold text-sm">
                            <span class="${m.t1 === team.name ? 'text-white' : 'text-slate-400'} truncate text-right w-1/3">${m.t1}</span>
                            <span class="${isPlayed ? 'text-white bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700' : 'text-slate-600'} text-base font-black tracking-widest shrink-0">${m.s1} - ${m.s2}</span>
                            <span class="${m.t2 === team.name ? 'text-white' : 'text-slate-400'} truncate w-1/3">${m.t2}</span>
                        </div>
                        <div class="w-1/4 flex justify-end"><span class="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded uppercase tracking-wider font-bold">BO1</span></div>
                    </div>`;
                }
            });
        });
    }

    if(!matchesFound) {
        matchHistoryHtml = `<div class="text-center py-6 text-slate-500 italic border border-dashed border-slate-700 rounded-xl">Fikstürde kayıtlı maçı bulunmuyor.</div>`;
    }

    container.innerHTML = `
        <!-- ÜST KİMLİK KARTI -->
        <div class="glass-card rounded-2xl p-6 md:p-10 border border-slate-700/40 relative overflow-hidden mb-8 group">
            <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <img src="${team.logo || 'https://placehold.co/150x150/1e293b/FFFFFF?text=?'}" class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-700 bg-slate-950 object-cover shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                
                <div class="flex-grow text-center md:text-left">
                    <h2 class="esport-font text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-2">${team.name}</h2>
                    <p class="text-slate-400 text-sm uppercase tracking-widest font-semibold flex items-center justify-center md:justify-start gap-2">
                        <i class="fa-solid fa-users text-purple-400"></i> ${team.players ? team.players.length : 0} Kayıtlı Oyuncu
                    </p>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0 w-full md:w-auto">
                    <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-center">
                        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Puan</div>
                        <div class="text-2xl font-black text-purple-400">${points}</div>
                    </div>
                    <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-center">
                        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Galibiyet</div>
                        <div class="text-2xl font-black text-emerald-400">${team.G || 0}</div>
                    </div>
                    <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-center">
                        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Mağlubiyet</div>
                        <div class="text-2xl font-black text-rose-400">${team.M || 0}</div>
                    </div>
                    <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 text-center">
                        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Averaj</div>
                        <div class="text-2xl font-black ${goalDiffColor}">${goalDiffText}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- KADRO -->
            <div class="lg:col-span-1">
                <h3 class="esport-font text-2xl font-black text-white uppercase tracking-wider mb-4 border-l-4 border-purple-500 pl-3">Takım Kadrosu</h3>
                <div class="flex flex-col gap-3">
                    ${rosterHtml}
                </div>
            </div>

            <!-- MAÇ GEÇMİŞİ -->
            <div class="lg:col-span-2">
                <h3 class="esport-font text-2xl font-black text-white uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-3">Maç Geçmişi</h3>
                <div class="glass-card rounded-2xl p-4 border border-slate-700/40">
                    ${matchHistoryHtml}
                </div>
            </div>
        </div>
    `;
}