// Firebase SDK Modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Sizin Firebase Yapılandırma Bilgileriniz
const firebaseConfig = {
  apiKey: "AIzaSyB4aUyg2d7Z_w8G4oAfageB4_FlKo-xipw",
  authDomain: "ders-asistani-780f2.firebaseapp.com",
  projectId: "ders-asistani-780f2",
  storageBucket: "ders-asistani-780f2.firebasestorage.app",
  messagingSenderId: "861917441303",
  appId: "1:861917441303:web:b1879a5f819329c7b4db52",
  measurementId: "G-PLVE9ZJXR6"
};

// Firebase Başlatma
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore'dan dersleri çekip akordiyon şeklinde ekrana basma fonksiyonu
async function dersleriYukle() {
  const derslerContainer = document.getElementById("derslerListesi");
  derslerContainer.innerHTML = `<p class="yukleniyor">Dersler yükleniyor...</p>`;

  try {
    const querySnapshot = await getDocs(collection(db, "dersler"));
    
    if (querySnapshot.empty) {
      derslerContainer.innerHTML = `<p class="yukleniyor">Henüz veritabanında ders bulunmuyor.</p>`;
      return;
    }

    derslerContainer.innerHTML = ""; // Yükleniyor yazısını temizle
    
    querySnapshot.forEach((doc) => {
      const ders = doc.data();
      
      // Dersin konularını liste maddelerine dönüştür
      const konularHtml = (ders.konular || [])
        .map(konu => `<li>📌 ${konu}</li>`)
        .join("");

      // Akordiyon kartı HTML şablonu
      const itemHtml = `
        <div class="accordion-item">
          <div class="accordion-header" onclick="window.akordiyonAcKapa(this)">
            <span>${ders.dersAdi || ders.dersAdı || "İsimsiz Ders"}</span>
            <span class="arrow">▼</span>
          </div>
          <div class="accordion-content">
            <ul class="konu-listesi">
              ${konularHtml || "<li>Bu derse ait konu bulunamadı.</li>"}
            </ul>
          </div>
        </div>
      `;
      
      derslerContainer.innerHTML += itemHtml;
    });

  } catch (error) {
    console.error("Dersler yüklenirken hata oluştu: ", error);
    derslerContainer.innerHTML = `<p class="yukleniyor" style="color: red;">Dersler yüklenirken bir hata oluştu.</p>`;
  }
}

// Tıklanan akordiyonun açılıp kapanmasını sağlayan fonksiyon (Global scope'a ekleniyor)
window.akordiyonAcKapa = function(element) {
  const mevcutItem = element.parentElement;
  
  // Diğer açık sekmeleri kapat (İsteğe bağlı: Tek seferde tek ders açık kalır)
  const tumItems = document.querySelectorAll(".accordion-item");
  tumItems.forEach(item => {
    if (item !== mevcutItem) {
      item.classList.remove("active");
    }
  });

  // Tıklanan derse "active" sınıfını ekle/çıkar
  mevcutItem.classList.toggle("active");
};

// Sayfa yüklendiğinde dersleri çağır
document.addEventListener("DOMContentLoaded", dersleriYukle);