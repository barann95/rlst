// js/api.js

const API = {
    data: null,
    currentSeason: 1,

    // JSON dosyasını güvenli bir şekilde çeker
    async init() {
        try {
            // Dosya yolunu oluşturduğun klasör yapısına göre ayarla
            const response = await fetch('data/data.json'); 
            if (!response.ok) throw new Error('Veri çekilemedi.');
            const rawData = await response.json();
            this.data = rawData.seasons;
            return true;
        } catch (error) {
            console.error("API Hatası:", error);
            return false;
        }
    },

    getSeasonData() {
        return this.data ? this.data[this.currentSeason] : null;
    },

    // "TBD" (Belirlenmemiş) takımları filtreleyerek gerçek takımları getirir
    getAllTeams() {
        const season = this.getSeasonData();
        if (!season) return [];
        const teams = [...(season.groupA || []), ...(season.groupB || [])];
        return teams.filter(t => t.name !== "TBD" && t.name.trim() !== "");
    },

    // eMajorLeague Tarzı Piyasa Değeri Hesaplama Algoritması
    calculatePlayerValue(player) {
        let baseValue = 0;
        const rank = (player.rank || "").toLowerCase();

        // Rank taban fiyatlandırması (Sanal RL Para Birimi)
        if (rank.includes('supersonic legend')) baseValue = 50000;
        else if (rank.includes('grand champion iii')) baseValue = 40000;
        else if (rank.includes('grand champion ii')) baseValue = 35000;
        else if (rank.includes('grand champion i')) baseValue = 30000;
        else if (rank.includes('champion')) baseValue = 20000;
        else if (rank.includes('diamond')) baseValue = 10000;
        else if (rank.includes('platinum')) baseValue = 5000;
        else if (rank.includes('gold')) baseValue = 2500;
        else baseValue = 1000; 

        // İstatistik performans bonusları
        const performanceBonus = 
            ((player.goals || 0) * 1000) + 
            ((player.assists || 0) * 800) + 
            ((player.saves || 0) * 600) + 
            ((player.score || 0) * 10);

        return baseValue + performanceBonus;
    },

    // Tüm oyuncuları piyasa değerleriyle birlikte döndürür
    getAllPlayers() {
        const teams = this.getAllTeams();
        let allPlayers = [];

        teams.forEach(team => {
            if (team.players) {
                team.players.forEach(p => {
                    const marketValue = this.calculatePlayerValue(p);
                    allPlayers.push({
                        ...p,
                        teamName: team.name,
                        teamLogo: team.logo, // Takım logosunu doğrudan imaj url'si olarak bağlıyoruz
                        marketValue: marketValue
                    });
                });
            }
        });

        // Değere göre en pahalıdan en ucuza sırala
        return allPlayers.sort((a, b) => b.marketValue - a.marketValue);
    },

    // Okunabilir para birimi formatı (Örn: $64,500)
    formatCurrency(value) {
        const formatted = new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1 // Sadece tek küsürat gösterir (9.1K gibi)
        }).format(value);
        
        return `$ ${formatted}`;
    }
};