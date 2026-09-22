const D={
'Akçaabat':[41.019,39.571],'Araklı':[40.939,40.058],'Arsin':[40.953,39.927],'Beşikdüzü':[41.052,39.232],'Çarşıbaşı':[41.083,39.383],'Çaykara':[40.742,40.235],'Dernekpazarı':[40.801,40.244],'Düzköy':[40.874,39.427],'Hayrat':[40.888,40.369],'Köprübaşı':[40.806,40.124],'Maçka':[40.818,39.614],'Of':[40.945,40.264],'Ortahisar':[41.005,39.727],'Sürmene':[40.912,40.114],'Şalpazarı':[40.941,39.195],'Tonya':[40.886,39.293],'Vakfıkebir':[41.046,39.277],'Yomra':[40.953,39.855]};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s); let selected='Ortahisar';
const codeInfo=c=>({0:['Açık','☀️'],1:['Çoğunlukla açık','🌤️'],2:['Parçalı bulutlu','⛅'],3:['Kapalı','☁️'],45:['Sisli','🌫️'],48:['Kırağılı sis','🌫️'],51:['Hafif çisenti','🌦️'],53:['Çisenti','🌦️'],55:['Yoğun çisenti','🌧️'],61:['Hafif yağmur','🌦️'],63:['Yağmurlu','🌧️'],65:['Kuvvetli yağmur','🌧️'],71:['Hafif kar','🌨️'],73:['Karlı','❄️'],75:['Yoğun kar','❄️'],77:['Kar taneleri','🌨️'],80:['Sağanak','🌦️'],81:['Sağanak','🌧️'],82:['Kuvvetli sağanak','⛈️'],85:['Kar sağanağı','🌨️'],86:['Yoğun kar sağanağı','❄️'],95:['Gök gürültülü','⛈️'],96:['Dolu riski','⛈️'],99:['Şiddetli dolu riski','⛈️']}[c]||['Değişken','🌥️']);
const compass=d=>['K','KKD','KD','DKD','D','DGD','GD','GGD','G','GGB','GB','BGB','B','BKB','KB','KKB'][Math.round((((d||0)%360)/22.5))%16];
function tick(){$('#clock').textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})} tick();setInterval(tick,30000);
const sel=$('#district'); Object.keys(D).forEach(n=>{sel.add(new Option(n,n)); $('#districts').insertAdjacentHTML('beforeend',`<div class="district" data-name="${n}"><b>${n}</b><span>hava durumunu aç</span></div>`)}); sel.value=selected;
$$('#nav button').forEach(b=>b.onclick=()=>{ $$('#nav button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $$('.view').forEach(v=>v.classList.remove('active')); $('#'+b.dataset.view).classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); if(b.dataset.view==='sea') loadSea(); if(b.dataset.view==='map3d') init3DMap(); if(b.dataset.view==='fishing') loadFishing(); if(b.dataset.view==='snow') loadSnow(); if(b.dataset.view==='mountains') loadMountains(); if(b.dataset.view==='sun') loadSun(); if(b.dataset.view==='charts') renderCharts(); if(b.dataset.view==='nature') renderNaturePoints(); });
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
{name:'Aygır Gölü',district:'Trabzon yüksek kesimleri',type:'gol',lat:40.600,lon:39.700,elev:'yüksek dağ gölü • konum yaklaşık'},
{name:'Beypınarı Yaylası',district:'Trabzon yüksek kesimleri',type:'yayla',lat:40.650,lon:39.850,elev:'yüksek yayla • konum yaklaşık'},
{name:'Kırklar Tepesi',district:'Trabzon yüksek kesimleri',type:'dag',lat:40.620,lon:39.900,elev:'yüksek dağlık alan • konum yaklaşık'},
{name:'Kurtdere Yaylası',district:'Trabzon yüksek kesimleri',type:'yayla',lat:40.720,lon:39.800,elev:'yüksek yayla • konum yaklaşık'}
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
$('#nature3d')?.addEventListener('click',()=>{if(!selectedNature)return;document.querySelector('[data-view="map3d"]').click();setTimeout(()=>{if(terrainMap)terrainMap.flyTo({center:[selectedNature.lon,selectedNature.lat],zoom:12,pitch:68,bearing:-15,duration:1400})},1200)});
