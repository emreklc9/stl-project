# STL Studio

STL dosyalarını tarayıcıda 3D olarak görüntüleyen, yüzeyde nokta seçip koordinatlarını okuyan bir React uygulaması.

## Özellikler

- **3D görüntüleyici** — Three.js ile STL model önizleme
- **Model seçimi** — Üst bardan hazır modeller veya bilgisayardan `.stl` yükleme
- **Nokta seçimi** — `Shift` + sol tık ile yüzeyde koordinat işaretleme
- **Koordinat paneli** — X, Y, Z değerleri eksen renkleriyle listelenir
- **Orbit kontrolleri** — Döndürme, yakınlaştırma, kaydırma
- **Açık / koyu tema** — Sistem tercihine göre otomatik uyum

## Dahil modeller

| Model | Dosya |
|-------|--------|
| Spiderman | `src/assets/file/Spiderman.stl` |
| The Rock Head | `src/assets/file/The-Rock-Head.stl` |

## Teknolojiler

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Three.js](https://threejs.org/)
- SCSS (Sass)

## Kurulum

```bash
cd stl-project
npm install
```

## Geliştirme

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini açın.

## Diğer komutlar

```bash
npm run build    # Üretim derlemesi (dist/)
npm run preview  # Derlenmiş sürümü önizleme
npm run lint     # ESLint
```

## Kullanım

| İşlem | Kontrol |
|--------|---------|
| Model döndürme | Sol tık + sürükle |
| Yakınlaştırma | Fare tekerleği |
| Nokta seçme | `Shift` + sol tık |
| Model değiştirme | Üst bar → **Model** açılır listesi |
| Bilgisayardan yükleme | Üst bar → **Dosya seç** (`.stl`) |

Seçilen noktalar sağ panelde listelenir. Her satırdaki **Sil** ile tek nokta kaldırılır; **Temizle** ile hepsi silinir. Model değiştirildiğinde nokta listesi sıfırlanır.

## Proje yapısı

```
stl-project/
├── public/
├── src/
│   ├── assets/file/     # STL dosyaları
│   ├── components/
│   │   ├── StlViewer.jsx / .scss
│   │   └── Topbar.jsx / .scss
│   ├── App.jsx / .scss
│   ├── index.scss       # Global değişkenler ve tema
│   ├── models.js        # Model listesi ve varsayılan seçim
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Yeni STL modeli ekleme

1. `.stl` dosyasını `src/assets/file/` klasörüne koyun.
2. `src/models.js` içinde import edip `STL_MODELS` dizisine ekleyin:

```js
import yeniModel from './assets/file/YeniModel.stl?url'

export const STL_MODELS = [
  // ...
  { id: 'yeni-model', label: 'YeniModel.stl', url: yeniModel },
]
```

3. `id` benzersiz olmalı; `label` üst bardaki açılır listede görünür.

## Lisans

Bu proje özel kullanım içindir (`private`).
