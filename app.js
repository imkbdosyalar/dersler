// ==========================================
// KENDİ FIREBASE BİLGİLERİNİZİ BURAYA YAPIŞTIRIN
// ==========================================
const firebaseConfig = {
  apiKey: "BURAYA_API_KEY_GELECEK",
  authDomain: "ders-asistani-780f2.firebaseapp.com",
  projectId: "ders-asistani-780f2",
  storageBucket: "ders-asistani-780f2.appspot.com",
  messagingSenderId: "BURAYA_MESSAGING_SENDER_ID_GELECEK",
  appId: "BURAYA_APP_ID_GELECEK"
};

let db;
let dersData = [];

// Sayfa açıldığında Firebase'i başlat ve verileri çek
window.addEventListener('DOMContentLoaded', async () => {
    // Firebase modüllerinin yüklenmesini kısa bir süre bekleyelim
    while (!window.firebaseModules) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const { initializeApp, getFirestore } = window.firebaseModules;
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    verileriCek();
});

// Firestore'dan Dersleri Çekme
async function verileriCek() {
    try {
        const { collection, getDocs } = window.firebaseModules;
        const querySnapshot = await getDocs(collection(db, "dersler"));
        
        dersData = [];
        querySnapshot.forEach((docSnap) => {
            dersData.push({
                firebaseId: docSnap.id, // Firestore'un kendi benzersiz ID'si
                ...docSnap.data()
            });
        });

        // Eğer veritabanı tamamen boşsa başlangıç verisi ekleyebiliriz
        if (dersData.length === 0) {
            await ornekVeriEkle();
            return;
        }

        menuyuOlustur();
    } catch (err) {
        console.error("Veriler çekilirken hata oluştu:", err);
    }
}

// İlk kurulum için boşsa örnek ders ekleme
async function ornekVeriEkle() {
    const { collection, addDoc } = window.firebaseModules;
    const ilkDers = {
        baslik: "C# Programlama",
        aciklama: "Nesne Tabanlı Programlama Temelleri",
        konular: [
            {
                id: "giris",
                baslik: "Giriş ve Konsol Komutları",
                ozet: "C# dilinde temel girdi çıktı işlemleri.",
                ornekler: [
                    {
                        baslik: "Merhaba Dünya Örneği",
                        kod: "Console.WriteLine(\"Merhaba Dünya!\");",
                        aciklama: "Ekrana metin yazdırma komutu."
                    }
                ]
            }
        ]
    };

    await addDoc(collection(db, "dersler"), ilkDers);
    verileriCek(); // Tekrar verileri çek
}

// Menüyü Dinamik Oluştur
function menuyuOlustur() {
    const dersListesi = document.getElementById('ders-listesi');
    dersListesi.innerHTML = '';

    dersData.forEach(ders => {
        const header = document.createElement('div');
        header.className = 'ders-item-header';

        const title = document.createElement('span');
        title.className = 'ders-baslik';
        title.innerText = ders.baslik;

        const btnSil = document.createElement('button');
        btnSil.className = 'btn-delete';
        btnSil.innerText = '🗑️ Sil';
        btnSil.onclick = (e) => {
            e.stopPropagation();
            dersSil(ders.firebaseId);
        };

        header.appendChild(title);
        header.appendChild(btnSil);
        dersListesi.appendChild(header);

        if (ders.konular && ders.konular.length > 0) {
            ders.konular.forEach(konu => {
                const konuBtn = document.createElement('div');
                konuBtn.className = 'konu-item';
                konuBtn.innerText = konu.baslik;
                konuBtn.onclick = () => konuGoster(ders.firebaseId, konu.id, konuBtn);
                dersListesi.appendChild(konuBtn);
            });
        }
    });
}

// Yeni Ders Ekle (Firestore'a Kayıt)
async function dersEkle() {
    const adi = document.getElementById('yeniDersAdi').value.trim();
    const aciklama = document.getElementById('yeniDersAciklama').value.trim();

    if (!adi) {
        alert('Lütfen bir ders adı girin!');
        return;
    }

    const yeniDers = {
        baslik: adi,
        aciklama: aciklama || 'Açıklama girilmedi.',
        konular: []
    };

    try {
        const { collection, addDoc } = window.firebaseModules;
        await addDoc(collection(db, "dersler"), yeniDers);
        
        document.getElementById('yeniDersAdi').value = '';
        document.getElementById('yeniDersAciklama').value = '';
        modalKapat('dersModal');

        verileriCek(); // Listeyi güncelle
    } catch (err) {
        console.error("Ders eklenirken hata:", err);
        alert("Ders eklenemedi!");
    }
}

// Ders Sil (Firestore'dan Sil)
async function dersSil(firebaseId) {
    if (confirm('Bu dersi ve konularını buluttan silmek istediğinize emin misiniz?')) {
        try {
            const { doc, deleteDoc } = window.firebaseModules;
            await deleteDoc(doc(db, "dersler", firebaseId));
            
            verileriCek();
            
            document.getElementById('secili-ders-baslik').innerText = 'Lütfen Bir Konu Seçin';
            document.getElementById('secili-ders-aciklama').innerText = 'Sol menüden bir konu seçebilirsiniz.';
            document.getElementById('konu-icerik').innerHTML = '';
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    }
}

function konuGoster(dersFirebaseId, konuId, el) {
    document.querySelectorAll('.konu-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');

    const ders = dersData.find(d => d.firebaseId === dersFirebaseId);
    if (!ders) return;
    const konu = ders.konular.find(k => k.id === konuId);
    if (!konu) return;

    document.getElementById('secili-ders-baslik').innerText = `${ders.baslik} - ${konu.baslik}`;
    document.getElementById('secili-ders-aciklama').innerText = ders.aciklama;

    let html = `
        <div class="konu-ozet-box">
            <strong>Konu Özeti:</strong> ${konu.ozet}
        </div>
        <h2>Örnekler (${konu.ornekler ? konu.ornekler.length : 0})</h2>
        <br>
    `;

    if (konu.ornekler) {
        konu.ornekler.forEach(ornek => {
            html += `
                <div class="ornek-karti">
                    <h3>${ornek.baslik}</h3>
                    <div class="kod-blogu"><code>${escapeHtml(ornek.kod)}</code></div>
                    <p class="aciklama-metni">💡 ${ornek.aciklama}</p>
                </div>
            `;
        });
    }

    document.getElementById('konu-icerik').innerHTML = html;
}

// Modal Yardımcıları
function modalAc(id) { document.getElementById(id).classList.add('active'); }
function modalKapat(id) { document.getElementById(id).classList.remove('active'); }

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}