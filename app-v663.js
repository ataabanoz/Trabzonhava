const D={
'Akçaabat':[41.019,39.571],'Araklı':[40.939,40.058],'Arsin':[40.953,39.927],'Beşikdüzü':[41.052,39.232],'Çarşıbaşı':[41.083,39.383],'Çaykara':[40.742,40.235],'Dernekpazarı':[40.801,40.244],'Düzköy':[40.874,39.427],'Hayrat':[40.888,40.369],'Köprübaşı':[40.806,40.124],'Maçka':[40.818,39.614],'Of':[40.945,40.264],'Ortahisar':[41.005,39.727],'Sürmene':[40.912,40.114],'Şalpazarı':[40.941,39.195],'Tonya':[40.886,39.293],'Vakfıkebir':[41.046,39.277],'Yomra':[40.953,39.855]};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s); let selected='Ortahisar';
const codeInfo=c=>({0:['Açık','☀️'],1:['Çoğunlukla açık','🌤️'],2:['Parçalı bulutlu','⛅'],3:['Kapalı','☁️'],45:['Sisli','🌫️'],48:['Kırağılı sis','🌫️'],51:['Hafif çisenti','🌦️'],53:['Çisenti','🌦️'],55:['Yoğun çisenti','🌧️'],61:['Hafif yağmur','🌦️'],63:['Yağmurlu','🌧️'],65:['Kuvvetli yağmur','🌧️'],71:['Hafif kar','🌨️'],73:['Karlı','❄️'],75:['Yoğun kar','❄️'],77:['Kar taneleri','🌨️'],80:['Sağanak','🌦️'],81:['Sağanak','🌧️'],82:['Kuvvetli sağanak','⛈️'],85:['Kar sağanağı','🌨️'],86:['Yoğun kar sağanağı','❄️'],95:['Gök gürültülü','⛈️'],96:['Dolu riski','⛈️'],99:['Şiddetli dolu riski','⛈️']}[c]||['Değişken','🌥️']);
const compass=d=>['K','KKD','KD','DKD','D','DGD','GD','GGD','G','GGB','GB','BGB','B','BKB','KB','KKB'][Math.round((((d||0)%360)/22.5))%16];
function tick(){$('#clock').textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})} tick();setInterval(tick,30000);
const sel=$('#district'); Object.keys(D).forEach(n=>{sel.add(new Option(n,n)); $('#districts').insertAdjacentHTML('beforeend',`<div class="district" data-name="${n}"><b>${n}</b><span>hava durumunu aç</span></div>`)}); sel.value=selected;
$$('#nav button').forEach(b=>b.onclick=()=>{ $$('#nav button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $$('.view').forEach(v=>v.classList.remove('active')); $('#'+b.dataset.view).classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); if(b.dataset.view==='sea') loadSea(); if(b.dataset.view==='map3d') init3DMap(); if(b.dataset.view==='fishing') loadFishing(); if(b.dataset.view==='snow') loadSnow(); if(b.dataset.view==='mountains') loadMountains(); if(b.dataset.view==='sun') loadSun(); if(b.dataset.view==='charts') renderCharts(); if(b.dataset.view==='alerts') loadAlerts(); if(b.dataset.view==='models') loadModels(); if(b.dataset.view==='nature') renderNaturePoints(); });
async function loadWeather(){const [lat,lon]=D[selected]; $('#status').className='status';$('#status').textContent='Canlı veri alınıyor…'; try{const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,freezing_level_height,snow_depth,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max&timezone=Europe%2FIstanbul&forecast_days=7`; const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw Error(r.status); const d=await r.json(); const c=d.current, ci=codeInfo(c.weather_code); $('#place').textContent=`${selected.toUpperCase()} • CANLI`; $('#temp').textContent=Math.round(c.temperature_2m)+'°'; $('#condition').textContent=ci[0]; $('#weatherIcon').textContent=ci[1]; $('#feels').textContent=`Hissedilen ${Math.round(c.apparent_temperature)}° • Hamle ${Math.round(c.wind_gusts_10m)} km/sa`; $('#humidity').textContent=Math.round(c.relative_humidity_2m)+'%'; $('#wind').textContent=Math.round(c.wind_speed_10m)+' km/sa'; $('#winddir').textContent=`${compass(c.wind_direction_10m)} • ${Math.round(c.wind_direction_10m)}°`; $('#pressure').textContent=Math.round(c.pressure_msl)+' hPa'; $('#rain').textContent=(c.precipitation??0).toFixed(1)+' mm'; $('#cloud').textContent=Math.round(c.cloud_cover)+'%'; $('#status').className='status ok'; $('#status').textContent=`Güncellendi: ${new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})} • Kaynak: Open-Meteo`; window.lastWeather=d; renderForecast(d); renderCharts(); }catch(e){$('#status').className='status err';$('#status').textContent='Canlı hava verisi alınamadı. İnternet bağlantısını kontrol edip Yenile’ye bas.';$('#condition').textContent='Veri bağlantısı kurulamadı';}}
function renderForecast(d){$('#forecastTitle').textContent=selected+' • 7 günlük görünüm'; $('#daily').innerHTML=''; d.daily.time.forEach((t,i)=>{let ci=codeInfo(d.daily.weather_code[i]);let day=new Date(t+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'short',day:'numeric'});$('#daily').insertAdjacentHTML('beforeend',`<article><b>${day}</b><div class="big">${ci[1]}</div><b>${Math.round(d.daily.temperature_2m_max[i])}° / ${Math.round(d.daily.temperature_2m_min[i])}°</b><span>${ci[0]}</span><span>Yağış %${d.daily.precipitation_probability_max[i]??0} • ${d.daily.precipitation_sum[i]} mm</span></article>`)}); let now=Date.now(), rows=d.hourly.time.map((t,i)=>({t:new Date(t),i})).filter(x=>x.t.getTime()>=now-3600000).slice(0,24); $('#hourly').innerHTML=''; rows.forEach(x=>{let i=x.i,ci=codeInfo(d.hourly.weather_code[i]);$('#hourly').insertAdjacentHTML('beforeend',`<article><b>${x.t.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b><span style="font-size:25px">${ci[1]}</span><b>${Math.round(d.hourly.temperature_2m[i])}°</b><span>💧 %${d.hourly.precipitation_probability[i]??0}</span><span>🌬️ ${Math.round(d.hourly.wind_speed_10m[i])}</span></article>`)});}
sel.onchange=()=>{selected=sel.value;loadWeather()}; $('#refresh').onclick=loadWeather; $('#districts').onclick=e=>{let c=e.target.closest('.district');if(c){selected=c.dataset.name;sel.value=selected;loadWeather();window.scrollTo({top:0,behavior:'smooth'})}};
async function loadSea(){if($('#seaStatus').dataset.loaded==='1')return; try{let url='https://marine-api.open-meteo.com/v1/marine?latitude=41.08&longitude=39.72&current=wave_height,wave_direction,wave_period,wind_wave_height,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&timezone=Europe%2FIstanbul';let r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error();let d=await r.json(),c=d.current;$('#wave').textContent=(c.wave_height??0).toFixed(1)+' m';$('#period').textContent=(c.wave_period??0).toFixed(1)+' sn';$('#wavedir').textContent=`${compass(c.wave_direction)} • ${Math.round(c.wave_direction)}°`;$('#windwave').textContent=(c.wind_wave_height??0).toFixed(1)+' m';$('#sst').textContent=(c.sea_surface_temperature??0).toFixed(1)+' °C';$('#currentSea').textContent=(c.ocean_current_velocity??0).toFixed(1)+' km/sa • '+compass(c.ocean_current_direction);let h=c.wave_height??0;$('#fishNote').textContent=h<0.5?'Dalga düşük görünüyor. Yine de kıyıdaki yerel rüzgâr ve akıntıyı kontrol et.':h<1?'Deniz hafif-orta dalgalı. Kıyı ve tekne koşulları konuma göre değişebilir.':'Dalga belirgin. Küçük tekne ve kıyı faaliyetlerinde ekstra dikkat gerekir.';$('#seaStatus').className='status ok';$('#seaStatus').textContent='Güncel model deniz verisi • Open-Meteo Marine';$('#seaStatus').dataset.loaded='1'}catch(e){$('#seaStatus').className='status err';$('#seaStatus').textContent='Deniz verisi şu anda alınamadı.'}}
const CAMERAS=['Akyazı Paparapark','Ayasofya Kavşak','Millet Bahçesi','Pazarkapı','Boztepe Manzara','Atatürk Köşkü','Değirmendere','Uzungöl','Oyuncakistan','Kanunievi','Of Manzara','Sümela Manastırı','Meydan Park','Meydan','Şalpazarı Merkez','Arsin Manzara','Çarşıbaşı Manzara','Akçaabat Manzara','Hayrat Manzara','Dernekpazarı Manzara','Maçka Manzara','Çaykara Merkez','Köprübaşı Manzara','Sisdağı Yaylası','Düzköy Manzara','Yomra Manzara','Hıdırnebi Yaylası','Ganita Şehir Kamerası'];
const CAMERA_URL='https://www.trabzon.bel.tr/Web/SehirKameralari';
function renderCameras(q=''){const term=q.trim().toLocaleLowerCase('tr-TR');const arr=CAMERAS.filter(x=>x.toLocaleLowerCase('tr-TR').includes(term));$('#cameraGrid').innerHTML=arr.map(x=>`<a class="cameraCard" href="${CAMERA_URL}" target="_blank" rel="noopener"><div class="cameraPreview">📹<span class="liveDot"></span><em>CANLI</em></div><b>${x}</b><span>Resmî yayını aç ↗</span></a>`).join('');$('#cameraCount').textContent=`${arr.length} aktif kamera noktası gösteriliyor • Kaynak: Trabzon Büyükşehir Belediyesi`; }
renderCameras(); $('#cameraSearch').addEventListener('input',e=>renderCameras(e.target.value));
const maxDate=new Date();maxDate.setDate(maxDate.getDate()-5);$('#archiveDate').max=maxDate.toISOString().slice(0,10);$('#archiveDate').value=new Date(Date.now()-7*86400000).toISOString().slice(0,10);$('#archiveBtn').onclick=async()=>{let date=$('#archiveDate').value;if(!date)return;let [lat,lon]=D[selected];$('#archiveStatus').textContent='Geçmiş veri alınıyor…';try{let url=`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max&timezone=Europe%2FIstanbul`;let r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error();let d=await r.json(),x=d.daily;$('#archiveData').innerHTML=`<article><span>En yüksek</span><b>${x.temperature_2m_max[0]}°C</b></article><article><span>En düşük</span><b>${x.temperature_2m_min[0]}°C</b></article><article><span>Yağış</span><b>${x.precipitation_sum[0]} mm</b></article><article><span>Kar</span><b>${x.snowfall_sum[0]} cm</b></article><article><span>Maks. rüzgâr</span><b>${x.wind_speed_10m_max[0]} km/sa</b></article>`;$('#archiveStatus').className='status ok';$('#archiveStatus').textContent=`${selected} • ${date} • tarihsel model/reanalysis verisi`;}catch(e){$('#archiveStatus').className='status err';$('#archiveStatus').textContent='Bu tarih için veri alınamadı.'}};
loadWeather();
if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{}); if('caches'in window)caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))));}
let terrainMap=null;
async function init3DMap(){
  if(terrainMap){setTimeout(()=>terrainMap.resize(),80);return;}
  const st=$('#map3dStatus');
  st.textContent='3D arazi yükleniyor…';
  try{
    const maplibregl=await import('https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl.mjs');
    terrainMap=new maplibregl.Map({
      container:'terrainMap',center:[39.72,40.93],zoom:8.5,pitch:62,bearing:-12,maxPitch:85,
      style:{version:8,sources:{
        osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:'© OpenStreetMap contributors'},
        terrainSource:{type:'raster-dem',url:'https://tiles.mapterhorn.com/tilejson.json'},
        hillshadeSource:{type:'raster-dem',url:'https://tiles.mapterhorn.com/tilejson.json'}
      },layers:[
        {id:'osm',type:'raster',source:'osm'},
        {id:'hills',type:'hillshade',source:'hillshadeSource',paint:{'hillshade-exaggeration':0.45}}
      ],terrain:{source:'terrainSource',exaggeration:1.25}}
    });
    terrainMap.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
    terrainMap.on('load',()=>{
      st.className='status ok';st.textContent='3D arazi hazır • sürükle, döndür ve eğ';
      [
        ['Trabzon',[39.727,41.005]],['Uzungöl',[40.295,40.619]],['Sümela',[39.658,40.690]],['Hıdırnebi',[39.407,40.961]]
      ].forEach(([n,c])=>new maplibregl.Marker().setLngLat(c).setPopup(new maplibregl.Popup().setText(n)).addTo(terrainMap));
    });
    const fly=(center,zoom=12)=>terrainMap.flyTo({center,zoom,pitch:68,bearing:-15,duration:1400});
    $('#mapHome').onclick=()=>fly([39.72,40.93],8.5);
    $('#mapUzungol').onclick=()=>fly([40.295,40.619],12);
    $('#mapSumela').onclick=()=>fly([39.658,40.690],13);
    $('#mapHidirnebi').onclick=()=>fly([39.407,40.961],12);
  }catch(e){st.className='status err';st.textContent='3D harita yüklenemedi. İnternet bağlantısını kontrol edip sekmeyi yeniden aç.';}
}

const MOUNTAINS={
'Uzungöl':{c:[40.619,40.295],e:'~1.090 m'},'Hıdırnebi':{c:[40.961,39.407],e:'~1.600 m'},'Sultan Murat':{c:[40.674,40.155],e:'~2.200 m'},'Kadırga':{c:[40.617,39.184],e:'~2.300 m'},'Sis Dağı':{c:[40.853,39.092],e:'~2.180 m'},'Çakırgöl':{c:[40.551,39.679],e:'~2.500 m'},'Sümela':{c:[40.690,39.658],e:'~1.200 m'},'Lapazan':{c:[40.679,39.548],e:'yüksek yayla'}
};
async function loadSnow(){const st=$('#snowStatus');st.textContent='Kar verisi alınıyor…';try{let d=window.lastWeather;if(!d){await loadWeather();d=window.lastWeather}const h=d.hourly;let i=Math.max(0,h.time.findIndex(t=>new Date(t).getTime()>=Date.now()));let dep=(h.snow_depth?.[i]??0)*100;$('#snowToday').textContent=(d.daily.snowfall_sum?.[0]??0).toFixed(1)+' cm';$('#snowDepth').textContent=dep.toFixed(1)+' cm';$('#freezing').textContent=Math.round(h.freezing_level_height?.[i]??0)+' m';$('#visibility').textContent=((h.visibility?.[i]??0)/1000).toFixed(1)+' km';$('#snowWeek').innerHTML=d.daily.time.map((t,j)=>`<article><b>${new Date(t+'T12:00').toLocaleDateString('tr-TR',{weekday:'short'})}</b><div class="big">${(d.daily.snowfall_sum?.[j]??0)>0?'❄️':'—'}</div><b>${(d.daily.snowfall_sum?.[j]??0).toFixed(1)} cm</b><span>Yağış %${d.daily.precipitation_probability_max?.[j]??0}</span></article>`).join('');st.className='status ok';st.textContent=selected+' • Open-Meteo tahmin/model verisi'}catch(e){st.className='status err';st.textContent='Kar verisi alınamadı.'}}
async function loadMountains(){const st=$('#mountainStatus');st.textContent='Dağ ve yayla verileri alınıyor…';try{let entries=Object.entries(MOUNTAINS);let results=await Promise.all(entries.map(async([n,x])=>{let [lat,lon]=x.c;let u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,snowfall&timezone=Europe%2FIstanbul&forecast_days=1`;let d=await (await fetch(u,{cache:'no-store'})).json();return[n,x,d.current]}));$('#mountainGrid').innerHTML=results.map(([n,x,c])=>{let ci=codeInfo(c.weather_code);return `<article><div class="mountainIcon">${ci[1]}</div><b>${n}</b><span>${x.e}</span><strong>${Math.round(c.temperature_2m)}°C</strong><small>${ci[0]} • 🌬️ ${Math.round(c.wind_speed_10m)} km/sa<br>Hamle ${Math.round(c.wind_gusts_10m)} • Yağış ${(c.precipitation??0).toFixed(1)} mm</small></article>`}).join('');st.className='status ok';st.textContent='8 yüksek nokta güncellendi • Open-Meteo'}catch(e){st.className='status err';st.textContent='Dağ/yayla verileri alınamadı.'}}
async function loadSun(){const st=$('#sunStatus');st.textContent='Güneş verisi alınıyor…';try{let d=window.lastWeather;if(!d){await loadWeather();d=window.lastWeather}let x=d.daily;let rise=x.sunrise[0],set=x.sunset[0];let fmt=t=>new Date(t).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});$('#sunrise').textContent=fmt(rise);$('#sunset').textContent=fmt(set);$('#daylight').textContent=(x.daylight_duration[0]/3600).toFixed(1)+' sa';$('#sunshine').textContent=(x.sunshine_duration[0]/3600).toFixed(1)+' sa';$('#uv').textContent=(x.uv_index_max[0]??0).toFixed(1);let r=new Date(rise),s=new Date(set);let am=new Date(r.getTime()+3600000),pm=new Date(s.getTime()-3600000);$('#golden').textContent=fmt(am)+' / '+fmt(pm);st.className='status ok';st.textContent=selected+' • Bugünün güneş bilgileri'}catch(e){st.className='status err';st.textContent='Güneş verisi alınamadı.'}}
function renderCharts(){let d=window.lastWeather;if(!d||!$('#tempChart'))return;let now=Date.now();let rows=d.hourly.time.map((t,i)=>({t:new Date(t),i})).filter(x=>x.t.getTime()>=now-3600000).slice(0,24);let make=(id,get,suffix)=>{let vals=rows.map(x=>get(x.i));let max=Math.max(...vals.map(v=>Math.abs(v)),1);$(id).innerHTML=rows.map((x,j)=>`<div class="barItem"><div class="bar" style="height:${Math.max(6,Math.abs(vals[j])/max*100)}%"></div><b>${Math.round(vals[j])}${suffix}</b><span>${x.t.getHours().toString().padStart(2,'0')}</span></div>`).join('')};make('#tempChart',i=>d.hourly.temperature_2m[i],'°');make('#rainChart',i=>d.hourly.precipitation_probability[i]??0,'%');make('#windChart',i=>d.hourly.wind_speed_10m[i]??0,'');$('#chartStatus').className='status ok';$('#chartStatus').textContent=selected+' • Önümüzdeki 24 saat'}


// --- v6 Balıkçı & Tekne Merkezi ---
const FISH_ZONES={
 west:{name:'Vakfıkebir–Akçaabat',sea:[41.10,39.38],land:[41.02,39.57]},
 center:{name:'Trabzon Merkez',sea:[41.08,39.72],land:[41.005,39.727]},
 east1:{name:'Yomra–Arsin',sea:[41.06,39.91],land:[40.953,39.90]},
 east2:{name:'Araklı–Sürmene',sea:[41.02,40.10],land:[40.92,40.09]},
 east3:{name:'Of kıyısı',sea:[41.02,40.27],land:[40.945,40.264]}
};
const FISH_SPECIES={
 'İstavrit':{months:'Nisan–Kasım; sürü olduğunda diğer aylarda da görülebilir',times:'Şafak, gün batımı ve gece ışık çevresi sık denenir',rig:'Çapari • LRF • mikro jig',bait:'Küçük silikon, mikro jig, istavrit çaparisi',depth:'Sürünün bulunduğu orta/alt suyu tara',colors:'Beyaz/simli, yeşil, pembe; gece glow/fosforlu alternatif'},
 'Palamut':{months:'Genellikle yaz sonu–sonbahar göç dönemi',times:'Gün doğumu çevresi ve akşamüstü sık denenir',rig:'Spin • jig • sırtı',bait:'Minnow, metal jig, kaşık',depth:'Yüzey hareketinden orta suya kadar tara',colors:'Gümüş, sardalya/doğal desen; bulanık suda kontrast'},
 'Zargana':{months:'Ilık dönemlerde daha sık hedeflenir',times:'Aydınlık saatler ve sakin yüzey koşulları',rig:'Şamandıralı • ince takım • küçük sahte',bait:'İnce doğal yem veya küçük yüzey sahtesi',depth:'Yüzey ve yüzeye yakın',colors:'Doğal/gümüş, beyaz; berrak suda sade'},
 'Mezgit':{months:'Serin dönemler dahil yılın geniş bölümünde denenebilir',times:'Gün boyu; dip avında saatten çok konum/derinlik önemlidir',rig:'Yemli dip takımı',bait:'Kurt, karides/parça yem gibi yerel ve yasal yemler',depth:'Dip',colors:'Renkten çok yem ve dip sunumu'},
 'Levrek':{months:'Sonbahar–ilkbahar kıyıda sık hedeflenir',times:'Şafak, gün batımı, gece; köpüklü su avantaj sağlayabilir',rig:'Spin • LRF',bait:'Minnow, silikon, küçük jig',depth:'Kıyı kırıkları, akıntı ve köpüklü hatlar',colors:'Berrakta doğal; köpüklü/bulanıkta beyaz, chartreuse veya kontrast'},
 'Lüfer/Çinekop':{months:'Göç dönemleri özellikle sonbaharda öne çıkar',times:'Şafak, akşam ve gece denenir',rig:'Spin • kaşık • jig',bait:'Minnow, metal jig, kaşık',depth:'Yem balığının bulunduğu katman',colors:'Gümüş/mavi doğal; düşük ışıkta parlak/kontrast'}
};
let fishingLoaded=false, fishingWeather=null, fishingMarine=null;
const nval=(v,d=0)=>Number.isFinite(+v)?+v:d;
function fishTimeBand(h){return h<7?'dawn':h<17?'day':h<20?'dawn':'night'}
function lureAdvice(mode){
 const a={
  clear:'Berrak gündüz: doğal ve daha az bağıran renklerle başla. Beyaz-şeffaf, gümüş, yem balığı desenleri; çapari için beyaz/simli veya açık yeşil.',
  cloudy:'Kapalı hava: mor, pembe, yeşil ve simli seçenekleri sıraya al. Işık azaldıkça biraz daha görünür renk dene.',
  rough:'Dalgalı/bulanık su: beyaz, chartreuse, pembe/mor veya güçlü kontrast; titreşimli silikon/minnow ve parlak metal jig daha kolay fark edilebilir.',
  night:'Gece: glow/fosforlu, UV, beyaz veya yüksek kontrastla başla. Çaparide fosforlu/yeşil-pembe kombinasyon denenebilir.',
  dawn:'Şafak/gün batımı: gümüş, beyaz, pembe/mor ve doğal yem balığı desenlerini dönüşümlü dene; yüzey hareketini takip et.'
 }; return a[mode]||a.clear;
}
function speciesForNow(month,h,rough){
 if(month>=8&&month<=11 && (h<9||h>16)) return 'Palamut';
 if(h>=20||h<8) return 'İstavrit';
 if(rough && (month<=4||month>=10)) return 'Levrek';
 return 'İstavrit';
}
function boatScore(wave,wind,gust,vis){
 let s=100;
 s-=Math.max(0,wave-.25)*45; s-=Math.max(0,wind-8)*1.7; s-=Math.max(0,gust-15)*1.2;
 if(vis<5)s-=25; else if(vis<10)s-=10;
 return Math.max(0,Math.min(100,Math.round(s)));
}
async function loadFishing(force=false){
 if(fishingLoaded&&!force)return;
 const zone=FISH_ZONES[$('#fishZone').value||'center']; const [slat,slon]=zone.sea,[lat,lon]=zone.land;
 $('#fishStatus').className='status';$('#fishStatus').textContent=`${zone.name} için deniz ve hava verisi alınıyor…`;
 try{
  const marineURL=`https://marine-api.open-meteo.com/v1/marine?latitude=${slat}&longitude=${slon}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&current=wave_height,wave_direction,wave_period,wind_wave_height,sea_surface_temperature,ocean_current_velocity,ocean_current_direction&forecast_hours=24&timezone=Europe%2FIstanbul&cell_selection=sea`;
  const weatherURL=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility,pressure_msl,weather_code&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility,pressure_msl,weather_code&daily=sunrise,sunset&forecast_days=2&forecast_hours=24&timezone=Europe%2FIstanbul`;
  const [mr,wr]=await Promise.all([fetch(marineURL,{cache:'no-store'}),fetch(weatherURL,{cache:'no-store'})]);
  if(!mr.ok||!wr.ok)throw Error('API');
  fishingMarine=await mr.json(); fishingWeather=await wr.json();
  const m=fishingMarine.current||{}, w=fishingWeather.current||{};
  const wave=nval(m.wave_height), wind=nval(w.wind_speed_10m), gust=nval(w.wind_gusts_10m), vis=nval(w.visibility)/1000;
  $('#fWave').textContent=wave.toFixed(1)+' m'; $('#fPeriod').textContent=nval(m.wave_period).toFixed(1)+' sn';
  $('#fWind').textContent=Math.round(wind)+' km/sa'; $('#fGust').textContent=Math.round(gust)+' km/sa';
  $('#fSst').textContent=nval(m.sea_surface_temperature).toFixed(1)+' °C';
  $('#fCurrent').textContent=`${nval(m.ocean_current_velocity).toFixed(1)} km/sa • ${compass(nval(m.ocean_current_direction))}`;
  $('#fVisibility').textContent=vis.toFixed(1)+' km'; $('#fPressure').textContent=Math.round(nval(w.pressure_msl))+' hPa';
  const score=boatScore(wave,wind,gust,vis);
  let label=score>=75?'🟢 Daha elverişli':score>=50?'🟡 Dikkat':'🔴 Elverişsiz görünüyor';
  $('#boatRating').className='boatRating '+(score>=75?'good':score>=50?'warn':'bad');
  $('#boatRating').innerHTML=`<b>${label}</b><span>Model koşul puanı ${score}/100 • Bu bir seyir güvenliği onayı değildir.</span>`;
  const now=new Date(), target=speciesForNow(now.getMonth()+1,now.getHours(),wave>.8);
  $('#fishTarget').textContent=target; $('#fishRig').textContent=FISH_SPECIES[target].rig;
  const mode=wave>.8?'rough':fishTimeBand(now.getHours());
  $('#fishAdvice').innerHTML=`<article><span>Teknik</span><b>${FISH_SPECIES[target].rig}</b></article><article><span>Yem / sahte</span><b>${FISH_SPECIES[target].bait}</b></article><article><span>Renk başlangıcı</span><b>${mode==='night'?'Glow / beyaz / UV':mode==='rough'?'Beyaz / mor / kontrast':'Beyaz-simli / doğal'}</b></article><article><span>Katman</span><b>${FISH_SPECIES[target].depth}</b></article>`;
  $('#colorAdvice').textContent=lureAdvice(mode);
  renderFishHours();
  $('#fishStatus').className='status ok'; $('#fishStatus').textContent=`${zone.name} • canlı model verileri güncellendi`;
  fishingLoaded=true;
 }catch(e){$('#fishStatus').className='status err';$('#fishStatus').textContent='Balıkçı/tekne verileri şu anda alınamadı. Biraz sonra Güncelle’ye bas.';}
}
function renderFishHours(){
 const mh=fishingMarine.hourly, wh=fishingWeather.hourly; if(!mh||!wh)return;
 const count=Math.min(12,mh.time.length,wh.time.length); let scores=[];
 $('#fishHours').innerHTML='';
 for(let i=0;i<count;i++){
  const wave=nval(mh.wave_height[i]), wind=nval(wh.wind_speed_10m[i]), gust=nval(wh.wind_gusts_10m[i]), vis=nval(wh.visibility[i])/1000;
  const s=boatScore(wave,wind,gust,vis); scores.push({i,s,wave,wind});
  const t=new Date(mh.time[i]), mark=s>=75?'🟢':s>=50?'🟡':'🔴';
  $('#fishHours').insertAdjacentHTML('beforeend',`<article><b>${t.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b><span>${mark}</span><span>🌊 ${wave.toFixed(1)} m</span><span>🌬️ ${Math.round(wind)}</span><span>🎣 ${fishTimeBand(t.getHours())==='night'?'Glow/çapari':fishTimeBand(t.getHours())==='dawn'?'Şafak takımı':'Doğal renk'}</span></article>`);
 }
 scores.sort((a,b)=>b.s-a.s); const best=scores.slice(0,3).sort((a,b)=>a.i-b.i);
 $('#calmHours').textContent=best.map(x=>`${new Date(mh.time[x.i]).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})} (dalga ${x.wave.toFixed(1)} m, rüzgâr ${Math.round(x.wind)} km/sa)`).join(' • ');
}
function renderSpecies(){
 const n=$('#fishSpecies').value||Object.keys(FISH_SPECIES)[0],x=FISH_SPECIES[n];
 $('#speciesGuide').innerHTML=`<article><b>${n}</b><p><strong>Sezon:</strong> ${x.months}</p><p><strong>Saat:</strong> ${x.times}</p><p><strong>Takım:</strong> ${x.rig}</p><p><strong>Yem/sahte:</strong> ${x.bait}</p><p><strong>Su katmanı:</strong> ${x.depth}</p><p><strong>Renk:</strong> ${x.colors}</p></article>`;
}
Object.keys(FISH_SPECIES).forEach(n=>$('#fishSpecies')?.add(new Option(n,n))); if($('#fishSpecies')){renderSpecies();$('#fishSpecies').onchange=renderSpecies;}
if($('#fishZone')) $('#fishZone').onchange=()=>{fishingLoaded=false;loadFishing(true)};
if($('#fishRefresh')) $('#fishRefresh').onclick=()=>loadFishing(true);
$$('.conditionButtons button').forEach(b=>b.onclick=()=>{$$('.conditionButtons button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#colorAdvice').textContent=lureAdvice(b.dataset.water)});


// --- v6.1 Doğa & Outdoor Merkezi ---
const NATURE_POINTS=[
{name:'Uzungöl',district:'Çaykara',type:'gol',lat:40.619,lon:40.295,elev:'~1.090 m'},
{name:'Hıdırnebi Yaylası',district:'Akçaabat',type:'yayla',lat:40.961,lon:39.407,elev:'~1.600 m'},
{name:'Sultan Murat Yaylası',district:'Çaykara',type:'yayla',lat:40.674,lon:40.155,elev:'~2.000–2.100 m'},
{name:'Kadırga Yaylası',district:'Tonya/Şalpazarı çevresi',type:'yayla',lat:40.622,lon:39.145,elev:'~2.300 m'},
{name:'Sis Dağı',district:'Şalpazarı sınır bölgesi',type:'dag',lat:40.847,lon:39.083,elev:'zirve ~2.182 m'},
{name:'Erikbeli Yaylası',district:'Tonya',type:'yayla',lat:40.745,lon:39.222,elev:'~1.605–1.800 m'},
{name:'Şolma Yaylası',district:'Maçka',type:'yayla',lat:40.772,lon:39.533,elev:'~1.800 m'},
{name:'Lapazan Yaylası',district:'Maçka',type:'yayla',lat:40.679,lon:39.548,elev:'~2.200 m'},
{name:'Kiraz Yaylası',district:'Maçka',type:'yayla',lat:40.690,lon:39.500,elev:'~1.850 m'},
{name:'Mavura Yaylası',district:'Maçka',type:'yayla',lat:40.754,lon:39.535,elev:'yüksek yayla'},
{name:'Kulindağı Yaylası',district:'Maçka',type:'yayla',lat:40.775,lon:39.570,elev:'~1.650 m'},
{name:'Çakırgöl',district:'Maçka çevresi',type:'gol',lat:40.551,lon:39.679,elev:'yüksek dağ gölü'},
{name:'Altındere Vadisi / Sümela',district:'Maçka',type:'vadi',lat:40.690,lon:39.658,elev:'vadi / dağlık alan'},
{name:'Haçka Obası',district:'Düzköy',type:'yayla',lat:40.770,lon:39.390,elev:'~1.784 m'},
{name:'Kuruçam Yaylası',district:'Akçaabat',type:'yayla',lat:40.905,lon:39.355,elev:'~1.600 m'},
{name:'Karadağ Yaylası',district:'Tonya',type:'yayla',lat:40.825,lon:39.245,elev:'~1.800 m'},
{name:'Sazalan Yaylası',district:'Tonya/Şalpazarı',type:'yayla',lat:40.762,lon:39.176,elev:'~1.700 m'},
{name:'Pazarcık Yaylası',district:'Araklı',type:'yayla',lat:40.710,lon:40.105,elev:'~930 m'},
{name:'Yeşilyurt Yaylası',district:'Araklı',type:'yayla',lat:40.690,lon:40.080,elev:'~2.035 m'},
{name:'Yılantaş Yaylası',district:'Araklı',type:'yayla',lat:40.675,lon:40.055,elev:'~2.020 m'},
{name:'Aygır Gölü',district:'Çaykara • Demirkapı / Yedigöller',type:'gol',lat:40.526484,lon:40.390582,elev:'~2.700 m • Kırklar Dağı kuzey etekleri'},
{name:'Beypınarı Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Kırklar Tepesi',district:'Çaykara • Şekersu / Demirkapı',type:'dag',lat:40.515,lon:40.405,elev:'~3.200 m • Kırklar Dağı'},
{name:'Kurtdere Yaylası',district:'Trabzon yüksek kesimleri',type:'yayla',lat:40.720,lon:39.800,elev:'yüksek yayla • konum yaklaşık'}
 ,
{name:'Madur Dağı',district:'Araklı / Sürmene yüksekleri',type:'dag',lat:40.610,lon:40.120,elev:'yüksek dağ • konum yaklaşık'},
{name:'Derinoba Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Zigana Dağı / Kayak Merkezi',district:'Maçka / Zigana',type:'dag',lat:40.650,lon:39.400,elev:'~2.000 m+ • dağ/kayak alanı'},
{name:'Turnagöl Yaylası',district:'Çaykara yüksekleri • konum teyidi sınırlı',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Camiboğazı Yaylası',district:'Maçka / Çakırgöl çevresi',type:'yayla',lat:40.610,lon:39.620,elev:'yüksek yayla • Çakırgöl hattı'},
{name:'Mesoraş Yaylası',district:'Maçka / Çakırgöl çevresi',type:'yayla',lat:40.620,lon:39.610,elev:'yüksek yayla • Çakırgöl hattı'},
{name:'Çakırgöl Yaylası',district:'Maçka',type:'yayla',lat:40.551,lon:39.679,elev:'~2.500 m'},
{name:'Sırhanlı Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Taşköprü Yaylası',district:'Araklı / Dağbaşı hattı',type:'yayla',lat:40.590,lon:40.000,elev:'yüksek yayla • konum yaklaşık'},
{name:'Santa Harabeleri',district:'Arsin / Dumanlı-Santa',type:'vadi',lat:40.650,lon:39.980,elev:'tarihî dağ yerleşimi • konum yaklaşık'},
{name:'Üçpınar Yaylası',district:'Arsin • Üçpınar çevresi',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Seslikaya Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Parma Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Görnek Tabiat Parkı',district:'Trabzon',type:'vadi',lat:40.780,lon:39.700,elev:'tabiat alanı • konum yaklaşık'},
{name:'Şahinkaya',district:'Düzköy',type:'dag',lat:40.830,lon:39.420,elev:'kaya/doğa alanı • konum yaklaşık'},
{name:'Çal Mağarası',district:'Düzköy',type:'vadi',lat:40.865,lon:39.374,elev:'mağara/doğa alanı'},
{name:'Derebaşı Virajları',district:'Çaykara / Soğanlı hattı',type:'vadi',lat:40.540,lon:40.220,elev:'dağ geçidi yolu • konum yaklaşık'},
{name:'Şekersu',district:'Çaykara / Haldizen',type:'yayla',lat:40.570,lon:40.330,elev:'yüksek yayla • Haldizen hattı'},
{name:'Yaylaönü',district:'Çaykara / Haldizen',type:'yayla',lat:40.560,lon:40.340,elev:'yüksek yayla • Haldizen hattı'},
{name:'Balıklı Göl',district:'Akçaabat / Hıdırnebi hattı',type:'gol',lat:40.930,lon:39.390,elev:'~1.500 m'},
{name:'Demirkapı Yaylası',district:'Çaykara / Haldizen',type:'yayla',lat:40.500,lon:40.390,elev:'~2.700 m bölgesi • yüksek yayla'},
{name:'Haldizen Dağları',district:'Çaykara',type:'dag',lat:40.500,lon:40.360,elev:'zirveler 3.300 m+ • yüksek dağ'},
{name:'Kurtdağı Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Derindere',district:'Çaykara • Derindere',type:'vadi',lat:null,lon:null,elev:'Çaykara yüksekleri • kesin nokta doğrulanıyor'},
{name:'Çayıroba Yaylası',district:'Çaykara • Çayıroba',type:'yayla',lat:null,lon:null,elev:'Çaykara yüksekleri • kesin nokta doğrulanıyor'},
{name:'Dağönü Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Puşur Dağı',district:'Çaykara • Arpaözü çevresi',type:'dag',lat:null,lon:null,elev:'yüksek dağ • kesin nokta doğrulanıyor'},
{name:'Arpaözü',district:'Çaykara • Arpaözü',type:'yayla',lat:null,lon:null,elev:'Çaykara yüksekleri • kesin nokta doğrulanıyor'},
{name:'Aksu Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Anaborda Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Bolitliler Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Çakıroğlu Yaylası',district:'Konum doğrulanıyor',type:'yayla',lat:null,lon:null,elev:'konum doğrulanıyor'},
{name:'Mesoraş Yaylası (Of çevresi)',district:'Of yüksekleri',type:'yayla',lat:40.720,lon:40.220,elev:'yüksek yayla • konum yaklaşık'}
];
let selectedNature=null;
function renderNaturePoints(){
 const q=($('#natureSearch')?.value||'').toLocaleLowerCase('tr-TR'), f=$('#natureFilter')?.value||'all';
 const arr=NATURE_POINTS.filter(x=>(f==='all'||x.type===f)&&(`${x.name} ${x.district}`.toLocaleLowerCase('tr-TR').includes(q)));
 $('#natureGrid').innerHTML=arr.map((x,i)=>`<button class="outdoorCard" data-nature="${NATURE_POINTS.indexOf(x)}"><span>${x.type==='gol'?'💧':x.type==='dag'?'⛰️':x.type==='vadi'?'🌲':'🏕️'}</span><b>${x.name}</b><small>${x.district}</small><em>${x.elev}</em></button>`).join('');
 $('#natureStatus').className='status ok'; $('#natureStatus').textContent=`${arr.length} doğa noktası • Bir noktaya dokunarak canlı koşulları aç`;
}
async function loadNaturePoint(i){
 const x=NATURE_POINTS[i]; if(!x)return; selectedNature=x;
 if(x.lat==null||x.lon==null){
  $('#outdoorDetail').classList.remove('hidden');
  $('#outdoorName').textContent=x.name; $('#outdoorDistrict').textContent=x.district.toUpperCase(); $('#outdoorElev').textContent=x.elev;
  $('#natureStatus').className='status err'; $('#natureStatus').textContent='Bu noktanın kesin koordinatı henüz doğrulanmadı; yanlış hava/3D konumu göstermiyoruz.';
  ['oTemp','oFeels','oRain','oSnow','oWind','oGust','oVis','oFreeze','oRise','oSet'].forEach(id=>$('#'+id).textContent='—');
  $('#campScore').innerHTML='<b>🏕️ Kamp</b><strong>Koordinat doğrulanıyor</strong>';
  $('#trekScore').innerHTML='<b>🥾 Trekking</b><strong>Koordinat doğrulanıyor</strong>';
  $('#outdoorWarnings').innerHTML='<b>📍 Konum güvenliği</b><p>Bu yer için rastgele/temsili koordinat kaldırıldı. Kesin konum doğrulanana kadar canlı nokta havası ve 3D harita devre dışıdır.</p>';
  $('#outdoorHours').innerHTML=''; return;
 }
 $('#outdoorDetail').classList.remove('hidden'); $('#natureStatus').className='status';$('#natureStatus').textContent=x.name+' için canlı model verisi alınıyor…';
 $('#outdoorName').textContent=x.name;$('#outdoorDistrict').textContent=x.district.toUpperCase();$('#outdoorElev').textContent=x.elev;
 try{
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${x.lat}&longitude=${x.lon}&current=temperature_2m,apparent_temperature,precipitation,snowfall,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation,snowfall,wind_speed_10m,wind_gusts_10m,visibility,freezing_level_height,weather_code&daily=sunrise,sunset&forecast_days=2&forecast_hours=24&timezone=Europe%2FIstanbul`;
  const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error(r.status);const d=await r.json(),c=d.current,h=d.hourly,ci=codeInfo(c.weather_code);
  let k=0; $('#outdoorIcon').textContent=ci[1];$('#oTemp').textContent=Math.round(c.temperature_2m)+'°C';$('#oFeels').textContent=Math.round(c.apparent_temperature)+'°C';$('#oRain').textContent=(c.precipitation??0).toFixed(1)+' mm';$('#oSnow').textContent=(c.snowfall??0).toFixed(1)+' cm';$('#oWind').textContent=Math.round(c.wind_speed_10m)+' km/sa';$('#oGust').textContent=Math.round(c.wind_gusts_10m)+' km/sa';$('#oVis').textContent=((h.visibility?.[k]??0)/1000).toFixed(1)+' km';$('#oFreeze').textContent=Math.round(h.freezing_level_height?.[k]??0)+' m';
  const ft=t=>new Date(t).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});$('#oRise').textContent=ft(d.daily.sunrise[0]);$('#oSet').textContent=ft(d.daily.sunset[0]);
  let camp=100,trek=100,warns=[]; const wind=c.wind_speed_10m||0,gust=c.wind_gusts_10m||0,rain=c.precipitation||0,temp=c.apparent_temperature,vis=(h.visibility?.[k]??10000)/1000;
  if(gust>50){camp-=45;trek-=35;warns.push('💨 Çok kuvvetli hamle riski.')}else if(gust>35){camp-=25;trek-=20;warns.push('🌬️ Kuvvetli rüzgâr.')}
  if(rain>4){camp-=30;trek-=30;warns.push('🌧️ Kuvvetli yağış koşulu.')}else if(rain>1){camp-=15;trek-=15;warns.push('🌦️ Yağış var.')}
  if(temp<0){camp-=25;trek-=20;warns.push('🥶 Don/hipotermi riski; kış ekipmanı gerekir.')}else if(temp<5){camp-=12;trek-=10;warns.push('🧥 Soğuk koşullar.')}
  if(vis<2){camp-=20;trek-=35;warns.push('🌫️ Çok düşük görüş; rota bulma zorlaşabilir.')}else if(vis<5){trek-=15;warns.push('🌫️ Görüş düşük.')}
  const label=s=>s>=75?'🟢 Uygun görünüyor':s>=50?'🟡 Dikkat':'🔴 Zorlu koşullar';
  camp=Math.max(0,camp);trek=Math.max(0,trek);$('#campScore').innerHTML=`<b>🏕️ Kamp</b><strong>${label(camp)}</strong><span>${camp}/100</span>`;$('#trekScore').innerHTML=`<b>🥾 Trekking</b><strong>${label(trek)}</strong><span>${trek}/100</span>`;
  $('#outdoorWarnings').innerHTML=`<b>⚠️ Koşul notları</b><p>${warns.length?warns.join('<br>'):'Belirgin meteorolojik risk eşiği görünmüyor; dağ koşulları yine de yerel olarak değişebilir.'}</p>`;
  $('#outdoorHours').innerHTML=h.time.slice(0,12).map((t,j)=>`<article><b>${ft(t)}</b><span>${codeInfo(h.weather_code[j])[1]}</span><span>🌡️ ${Math.round(h.temperature_2m[j])}°</span><span>🌬️ ${Math.round(h.wind_speed_10m[j])}</span><span>👁️ ${((h.visibility[j]||0)/1000).toFixed(1)} km</span></article>`).join('');
  $('#natureStatus').className='status ok';$('#natureStatus').textContent=x.name+' • canlı model koşulları güncellendi';
 }catch(e){$('#natureStatus').className='status err';$('#natureStatus').textContent='Bu noktanın hava verisi alınamadı.'}
}
$('#natureGrid')?.addEventListener('click',e=>{const b=e.target.closest('[data-nature]');if(b)loadNaturePoint(+b.dataset.nature)});
$('#natureSearch')?.addEventListener('input',renderNaturePoints);$('#natureFilter')?.addEventListener('change',renderNaturePoints);
$('#natureRefresh')?.addEventListener('click',()=>{if(selectedNature)loadNaturePoint(NATURE_POINTS.indexOf(selectedNature))});
$('#nature3d')?.addEventListener('click',()=>{if(!selectedNature||selectedNature.lat==null||selectedNature.lon==null)return;document.querySelector('[data-view="map3d"]').click();setTimeout(()=>{if(terrainMap)terrainMap.flyTo({center:[selectedNature.lon,selectedNature.lat],zoom:12,pitch:68,bearing:-15,duration:1400})},1200)});


// --- v6.5 Radar & Erken Uyarı ---
function setupAlertDistricts(){const s=$('#alertDistrict');if(!s||s.options.length)return;Object.keys(DISTRICTS).forEach(n=>s.add(new Option(n,n)));s.value=$('#district')?.value||'Ortahisar'}
function addAlert(a,level,title,body,time){a.push({level,title,body,time})}
async function loadAlerts(){
 setupAlertDistricts();const n=$('#alertDistrict')?.value||'Ortahisar',p=DISTRICTS[n];if(!p)return;
 $('#alertBanner').className='alertBanner';$('#alertBanner').textContent=n+' için kısa vadeli riskler taranıyor…';
 try{
 const u=`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&hourly=temperature_2m,precipitation,precipitation_probability,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,visibility,cape,freezing_level_height&forecast_hours=12&timezone=Europe%2FIstanbul`;
 const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error(r.status);const d=await r.json(),h=d.hourly,A=[];
 const now=Date.now(), ix=Math.max(0,h.time.findIndex(t=>new Date(t).getTime()>=now)-1); const rng=[ix,ix+1,ix+2,ix+3].filter(i=>i<h.time.length);
 const tm=i=>new Date(h.time[i]).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
 for(const i of rng){const pr=h.precipitation[i]||0,pp=h.precipitation_probability[i]||0,sn=h.snowfall[i]||0,g=h.wind_gusts_10m[i]||0,v=(h.visibility[i]||99999)/1000,c=h.cape[i]||0,w=h.weather_code[i]||0;
  if(pr>=2||pp>=70)addAlert(A,pr>=5?'red':'orange','🌧️ Kuvvetli yağış sinyali',`${tm(i)} civarında ${pr.toFixed(1)} mm/sa model yağışı, olasılık %${Math.round(pp)}.`,tm(i));
  if(sn>0)addAlert(A,sn>=1?'red':'orange','❄️ Kar sinyali',`${tm(i)} civarında kar tahmini ${sn.toFixed(1)} cm. 0°C seviyesi yaklaşık ${Math.round(h.freezing_level_height[i]||0)} m.`,tm(i));
  if(g>=45)addAlert(A,g>=65?'red':'orange','💨 Kuvvetli rüzgâr / fırtına riski',`${tm(i)} civarında hamle ${Math.round(g)} km/sa seviyesine çıkabilir.`,tm(i));
  if(v<3)addAlert(A,v<1?'red':'orange','🌫️ Sis / düşük görüş',`${tm(i)} civarında model görüşü ${v.toFixed(1)} km.`,tm(i));
  if(c>=800||[95,96,99].includes(w))addAlert(A,c>=1500?'red':'orange','⚡ Gök gürültüsü / yıldırım riski',`${tm(i)} civarında konvektif enerji ${Math.round(c)} J/kg. Yıldırım olasılığı artabilir.`,tm(i));
  if(pr>=8)addAlert(A,'red','🌊 Ani yoğun yağış / su baskını riski',`${tm(i)} civarında yüksek yağış şiddeti sinyali var. Dere ve düşük kotlarda dikkat.`,tm(i));
 }
 if(h.temperature_2m[ix+3]!=null&&Math.abs(h.temperature_2m[ix+3]-h.temperature_2m[ix])>=5)addAlert(A,'orange','🌡️ Hızlı sıcaklık değişimi',`Yaklaşık 3 saatte ${Math.abs(h.temperature_2m[ix+3]-h.temperature_2m[ix]).toFixed(1)}°C değişim bekleniyor.`,tm(ix+3));
 const uniq=[...new Map(A.map(x=>[x.title+x.time,x])).values()].slice(0,10);
 $('#alertList').innerHTML=uniq.length?uniq.map(x=>`<article class="alertItem ${x.level}"><b>${x.title}</b><span>${x.body}</span><small>${x.time}</small></article>`).join(''):'<article class="alertItem green"><b>🟢 Belirgin kısa vadeli risk yok</b><span>Önümüzdeki birkaç saat için tanımlı eşiklerin üzerinde bir model sinyali görülmedi.</span></article>';
 const severe=uniq.some(x=>x.level==='red');$('#alertBanner').className='alertBanner '+(severe?'red':uniq.length?'orange':'green');$('#alertBanner').textContent=severe?'🔴 '+n+' için önemli meteorolojik risk sinyali':uniq.length?'🟠 '+n+' için dikkat gerektiren hava sinyalleri':'🟢 '+n+' için önemli kısa vadeli risk görünmüyor';
 }catch(e){$('#alertBanner').className='alertBanner red';$('#alertBanner').textContent='Uyarı verileri alınamadı.'}
}
async function initNotifications(){if('serviceWorker'in navigator)try{await navigator.serviceWorker.register('./sw.js?v=6.6.3')}catch(e){} const s=$('#notifyState');if(s)s.textContent=!('Notification'in window)?'Bu tarayıcı bildirim API’sini desteklemiyor.':`Bildirim izni: ${Notification.permission}`}
$('#enableNotify')?.addEventListener('click',async()=>{if(!('Notification'in window))return;const x=await Notification.requestPermission();$('#notifyState').textContent='Bildirim izni: '+x});
$('#testNotify')?.addEventListener('click',async()=>{if(Notification.permission!=='granted')return;const reg=await navigator.serviceWorker.ready;reg.showNotification('⚡ TrabzonHava test bildirimi',{body:'Erken uyarı bildirim altyapısı çalışıyor.',icon:'./icon-192.png',data:{url:'./?v=6.6.3#alerts'}})});
$('#alertRefresh')?.addEventListener('click',loadAlerts);$('#alertDistrict')?.addEventListener('change',loadAlerts);setupAlertDistricts();initNotifications();

// --- v6.6.2 Model Merkezi FINAL FIX ---
const WX_MODELS=[
{id:'ecmwf_ifs025',name:'ECMWF IFS',org:'ECMWF'},
{id:'gfs_seamless',name:'GFS',org:'NOAA'},
{id:'ukmo_seamless',name:'UKMO',org:'Met Office'},
{id:'icon_seamless',name:'ICON',org:'DWD'},
{id:'gem_seamless',name:'GEM',org:'CMC'},
{id:'jma_seamless',name:'JMA',org:'JMA'},
{id:'meteofrance_seamless',name:'ARPEGE',org:'Météo-France'}];
let selectedWXModel='ecmwf_ifs025',modelCache={},modelRun=0;
function setupModelDistrict(){const s=$('#modelDistrict');if(!s)return;if(!s.options.length)Object.keys(D).forEach(n=>s.add(new Option(n,n)));s.value=selected}
function apiSeries(hourly,base){if(!hourly)return[];if(Array.isArray(hourly[base]))return hourly[base];const k=Object.keys(hourly).find(x=>x===base||x.startsWith(base+'_'));return k?hourly[k]:[]}
function nowIndex(times){const n=Date.now();let i=(times||[]).findIndex(t=>new Date(t).getTime()>=n);return i<0?0:i}
async function getJSON(url,timeout=15000){const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok){let t='';try{t=await r.text()}catch(_){}throw Error('HTTP '+r.status+' '+t.slice(0,100))}return await r.json()}finally{clearTimeout(timer)}}
async function fetchModel(m,p){
 const hourly='temperature_2m,precipitation,pressure_msl,temperature_850hPa,temperature_500hPa,geopotential_height_500hPa';
 const q=new URLSearchParams({latitude:String(p[0]),longitude:String(p[1]),hourly,models:m.id,forecast_days:'2',timezone:'Europe/Istanbul'});
 const data=await getJSON('https://api.open-meteo.com/v1/forecast?'+q.toString());
 return {data,time:data.hourly?.time||[],t2:apiSeries(data.hourly,'temperature_2m'),pr:apiSeries(data.hourly,'precipitation'),msl:apiSeries(data.hourly,'pressure_msl'),t850:apiSeries(data.hourly,'temperature_850hPa'),t500:apiSeries(data.hourly,'temperature_500hPa'),z500:apiSeries(data.hourly,'geopotential_height_500hPa')};
}
function renderModelDetail(){
 const x=modelCache[selectedWXModel];if(!x)return;const m=WX_MODELS.find(a=>a.id===selectedWXModel),i=nowIndex(x.time);
 $('#modelDetailTitle').textContent=m.name+' • '+m.org;
 $('#m850').textContent=x.t850[i]!=null?Number(x.t850[i]).toFixed(1)+'°C':'Veri yok';
 $('#m500t').textContent=x.t500[i]!=null?Number(x.t500[i]).toFixed(1)+'°C':'Veri yok';
 $('#m500g').textContent=x.z500[i]!=null?Math.round(x.z500[i])+' m':'Veri yok';
 $('#mMsl').textContent=x.msl[i]!=null?Math.round(x.msl[i])+' hPa':'Veri yok';
 $('#modelHours').innerHTML=x.time.slice(i,i+24).map((t,j)=>{const k=i+j;return `<article><b>${new Date(t).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</b><span>🌡️ ${x.t2[k]!=null?Math.round(x.t2[k])+'°':'--'}</span><span>🌧️ ${x.pr[k]!=null?Number(x.pr[k]).toFixed(1):'--'} mm</span><span>850: ${x.t850[k]!=null?Number(x.t850[k]).toFixed(1)+'°':'--'}</span></article>`}).join('');
 document.querySelectorAll('[data-model]').forEach(b=>b.classList.toggle('active',b.dataset.model===selectedWXModel));
}
async function loadModels(){
 setupModelDistrict();const run=++modelRun,n=$('#modelDistrict')?.value||selected,p=D[n]||D.Ortahisar;
 $('#modelStatus').className='status';$('#modelStatus').textContent=n+' için 7 model kontrol ediliyor…';
 $('#modelCards').innerHTML='';modelCache={};let done=0,ok=0,rain=0;const cards={};
 await Promise.all(WX_MODELS.map(async m=>{try{
  const x=await fetchModel(m,p);if(run!==modelRun)return;
  if(!x.time.length||!x.t2.length)throw Error('Saatlik seri boş');
  modelCache[m.id]=x;ok++;const i=nowIndex(x.time),end=Math.min(i+24,x.time.length);let pr=0;for(let k=i;k<end;k++)pr+=Number(x.pr[k]||0);if(pr>=1)rain++;
  cards[m.id]=`<button class="modelCard" data-pickmodel="${m.id}"><span>${m.org}</span><b>${m.name}</b><strong>${x.t2[i]!=null?Math.round(x.t2[i])+'°C':'--'}</strong><small>24s yağış ${pr.toFixed(1)} mm</small><small>850 hPa ${x.t850[i]!=null?Number(x.t850[i]).toFixed(1)+'°C':'veri yok'}</small></button>`;
 }catch(e){cards[m.id]=`<article class="modelCard"><span>${m.org}</span><b>${m.name}</b><strong>—</strong><small>Veri alınamadı</small></article>`}
 finally{done++;if(run===modelRun){$('#modelCards').innerHTML=WX_MODELS.filter(m=>cards[m.id]).map(m=>cards[m.id]).join('');$('#modelStatus').textContent=`${n} • ${done}/7 kontrol edildi • ${ok} model hazır`}}}));
 if(run!==modelRun)return;$('#modelStatus').className=ok?'status ok':'status err';
 if(ok){$('#modelConsensus').innerHTML=`<b>Model mutabakat özeti</b><p>${rain}/${ok} çalışan model önümüzdeki 24 saatte ≥1 mm yağış gösteriyor.</p>`;if(!modelCache[selectedWXModel])selectedWXModel=Object.keys(modelCache)[0];renderModelDetail()}
 else{$('#modelConsensus').innerHTML='<b>Model verileri alınamadı.</b><p>API isteği başarısız oldu.</p>';$('#modelDetailTitle').textContent='Çalışan model bulunamadı'}
}
setupModelDistrict();
$('#modelRefresh').onclick=loadModels;
$('#modelDistrict').onchange=loadModels;
$('#modelCards').onclick=e=>{const b=e.target.closest('[data-pickmodel]');if(b){selectedWXModel=b.dataset.pickmodel;renderModelDetail()}};
document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{selectedWXModel=b.dataset.model;if(modelCache[selectedWXModel])renderModelDetail();else $('#modelDetailTitle').textContent=b.textContent+' • veri alınamadı veya henüz yüklenmedi'});
