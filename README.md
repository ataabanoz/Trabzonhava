# TrabzonHava v6.5 — Radar & Erken Uyarı
Yeni: kısa vadeli yağmur, kar, kuvvetli rüzgâr, sis/görüş, gök gürültüsü-yıldırım potansiyeli, yoğun yağış/su baskını riski ve hızlı sıcaklık değişimi taraması; radar görünümü; Service Worker ve iPhone bildirim izin/test altyapısı.

Önemli: Otomatik risk motoru Open-Meteo model verisini kullanır; radar iframe'i görsel doğrulama içindir ve piksel verisi otomatik analiz edilmez. Türkiye'de Open-Meteo 15 dakikalık veriler saatlik modelden interpolasyon olabilir. Site kapalıyken otomatik push göndermek için ayrıca VAPID/Web Push sunucu-worker gerekir.
