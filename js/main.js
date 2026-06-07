// js/main.js

// 1. KENDİ FİREBASE BİLGİLERİNİ BURAYA YAPIŞTIR
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "-",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

let app, auth;
let firebaseAktif = false;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    firebaseAktif = true;
} catch (error) {
    console.warn("Firebase başlatılamadı. Bilgileri girdin mi?", error);
}

const UI = {
    init() {
        this.handleLoader();
        this.setupModal();
    },
    handleLoader() {
        const loader = document.getElementById('loader');
        if(!loader) return;
        if (sessionStorage.getItem('siteLoaded')) loader.style.display = 'none';
        else sessionStorage.setItem('siteLoaded', 'true');
    },
    setupModal() {
        const modalHtml = `
            <div id="global-modal" class="fixed inset-0 z-[100] hidden items-center justify-center transition-opacity duration-300 opacity-0">
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm modal-overlay"></div>
                <div id="modal-content" class="relative glass-card border border-slate-700 rounded-2xl w-full max-w-[400px] mx-4 p-6 shadow-2xl overflow-y-auto max-h-[90vh] transform scale-95 transition-transform duration-300"></div>
            </div>
        `;
        if(!document.getElementById('global-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeModal(); });
        }
    },
    openModal(htmlContent) {
        const modal = document.getElementById('global-modal');
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <button onclick="UI.closeModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors z-10"><i class="fa-solid fa-xmark"></i></button>
            ${htmlContent}
        `;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        });
        document.body.style.overflow = 'hidden'; 
    },
    closeModal() {
        const modal = document.getElementById('global-modal');
        const content = document.getElementById('modal-content');
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300);
    }
};

const Auth = {
    init() {
        if (!firebaseAktif) {
            this.updateUI(null);
            return;
        }
        auth.onAuthStateChanged((user) => {
            this.updateUI(user);
        });
    },
    updateUI(user) {
        const container = document.getElementById('auth-container');
        if (!container) return;

        if (user) {
            container.innerHTML = `
                <div class="relative group">
                    <button class="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <i class="fa-solid fa-circle-user text-emerald-400 text-lg"></i> 
                        <span class="max-w-[100px] truncate">${user.displayName || 'Oyuncu'}</span>
                    </button>
                    <div class="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div class="px-4 py-3 border-b border-slate-700">
                            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Giriş Yapıldı</p>
                            <p class="text-sm font-semibold text-white truncate">${user.email}</p>
                        </div>
                        <a href="#" onclick="alert('Profil Sayfası yakında eklenecek!');" class="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"><i class="fa-solid fa-user-pen mr-2 text-slate-500"></i> Profilim</a>
                        <a href="#" onclick="Auth.logout()" class="block px-4 py-2 text-sm text-rose-400 hover:bg-slate-700 hover:text-rose-300 transition-colors rounded-b-xl"><i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> Çıkış Yap</a>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button onclick="Auth.showLoginModal()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2">
                    <i class="fa-solid fa-user"></i> <span class="hidden sm:inline">Giriş Yap</span>
                </button>
            `;
        }
    },
    async loginWithGoogle() {
        if(!firebaseAktif) return alert("Firebase bağlı değil! Ayarları kontrol et.");
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            UI.closeModal();
        } catch (error) {
            console.error("Google Giriş Hatası:", error);
            alert("Google girişi başarısız oldu: " + error.message);
        }
    },
    async register(event) {
        event.preventDefault();
        if(!firebaseAktif) return alert("Firebase bağlı değil!");
        
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: username });
            UI.closeModal();
        } catch (error) {
            alert("Kayıt Hatası: " + error.message);
        }
    },
    async login(event) {
        event.preventDefault();
        if(!firebaseAktif) return alert("Firebase bağlı değil!");
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            UI.closeModal();
        } catch (error) {
            alert('Hatalı e-posta adresi veya şifre girdiniz.');
        }
    },
    async logout() {
        if(firebaseAktif) await auth.signOut();
    },
    showLoginModal() {
        const html = `
            <div class="text-center mb-6 mt-2">
                <div class="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-right-to-bracket text-xl text-blue-400"></i>
                </div>
                <h2 class="esport-font text-2xl font-black text-white uppercase tracking-wider">Tekrar Hoş Geldin</h2>
            </div>
            
            <button type="button" onclick="Auth.loginWithGoogle()" class="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg mb-4">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" class="w-5 h-5" alt="Google">
                Google ile Giriş Yap
            </button>
            
            <div class="flex items-center gap-3 my-4 opacity-60">
                <div class="h-px bg-slate-700 flex-grow"></div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VEYA</span>
                <div class="h-px bg-slate-700 flex-grow"></div>
            </div>

            <form onsubmit="Auth.login(event)" class="flex flex-col gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-Posta Adresi</label>
                    <input type="email" id="login-email" required autocomplete="username" class="w-full bg-slate-900/80 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Şifre</label>
                    <input type="password" id="login-password" required autocomplete="current-password" class="w-full bg-slate-900/80 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all">
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-4 rounded-xl uppercase tracking-widest transition-all mt-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]">Giriş Yap</button>
            </form>
            <div class="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-medium">
                Hesabın yok mu? <a href="#" onclick="Auth.showRegisterModal()" class="text-blue-400 hover:text-blue-300 font-bold underline transition-colors">Hemen Kayıt Ol</a>
            </div>
        `;
        UI.openModal(html);
    },
    showRegisterModal() {
        const html = `
            <div class="text-center mb-6 mt-2">
                <div class="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-user-plus text-xl text-emerald-400"></i>
                </div>
                <h2 class="esport-font text-2xl font-black text-white uppercase tracking-wider">Aramıza Katıl</h2>
            </div>

            <button type="button" onclick="Auth.loginWithGoogle()" class="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg mb-4">
                <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" class="w-5 h-5" alt="Google">
                Google ile Kayıt Ol
            </button>
            
            <div class="flex items-center gap-3 my-4 opacity-60">
                <div class="h-px bg-slate-700 flex-grow"></div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VEYA</span>
                <div class="h-px bg-slate-700 flex-grow"></div>
            </div>
            
            <form onsubmit="Auth.register(event)" class="flex flex-col gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kullanıcı Adı</label>
                    <input type="text" id="reg-username" required autocomplete="username" class="w-full bg-slate-900/80 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all" placeholder="Örn: Krewzyy?">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-Posta Adresi</label>
                    <input type="email" id="reg-email" required autocomplete="email" class="w-full bg-slate-900/80 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Şifre</label>
                    <input type="password" id="reg-password" required minlength="6" autocomplete="new-password" class="w-full bg-slate-900/80 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all">
                </div>
                <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl uppercase tracking-widest transition-all mt-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">Kayıt Ol</button>
            </form>
            <div class="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-medium">
                Zaten hesabın var mı? <a href="#" onclick="Auth.showLoginModal()" class="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors">Giriş Yap</a>
            </div>
        `;
        UI.openModal(html);
    }
};

window.UI = UI;
window.Auth = Auth;

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
    Auth.init();
});
