import { db, storage } from './firebase';
import { doc, setDoc, onSnapshot, updateDoc, arrayRemove, arrayUnion, addDoc, deleteDoc, collection, query, orderBy } from 'firebase/firestore'; // <-- 所有函式
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Cloud, ChevronDown, Sun, CloudSnow, Wind, Utensils, Camera, Train, Plane, Home, Phone, Wallet, Info, Snowflake, ArrowRight, Plus, Trash2, RefreshCw, Pencil, FileText, Loader2 } from 'lucide-react';

// --- 1. 地點座標 (用於即時天氣 API) ---
const LOCATIONS = {
  "Helsinki": { lat: 60.1699, lon: 24.9384 },
  "Rovaniemi": { lat: 66.5039, lon: 25.7294 },
  "Inari": { lat: 68.9060, lon: 27.0275 },
  "Kirkenes": { lat: 69.7271, lon: 30.0452 },
  "Tromsø": { lat: 69.6492, lon: 18.9553 },
  "Hong Kong": { lat: 22.3193, lon: 114.1694 }
};

// --- 2. 行程資料 ---
const tripData = [
  {
    day: 1,
    date: "2/14 (六)",
    city: "Helsinki", // 用於天氣對應
    title: "香港 -> 赫爾辛基 -> 羅瓦涅米",
    events: [
      { type: "transport", time: "14:05", title: "抵達赫爾辛基 (HEL)", desc: "抵達機場，準備轉機。", nav: "Helsinki Airport" },
      { type: "rest", time: "16:00", title: "Taobao Lounge 休息", desc: "HKD 130/人。休息充電，調整時差。", nav: "Helsinki Airport Lounge" },
      { type: "flight", time: "19:40", title: "飛往羅瓦涅米 (HEL->RVN)", desc: "HKD 1,520 (已付)。21:05 抵達。", nav: "Rovaniemi Airport" },
      { type: "hotel", time: "22:00", title: "Arctic Resort Delight", desc: "已付。3房/3晚。可在附近散步適應天氣。", nav: "Arctic Resort Delight" }
    ]
  },
  {
    day: 2,
    date: "2/15 (日)",
    city: "Rovaniemi",
    title: "羅瓦涅米 (分組活動)",
    events: [
      { type: "food", time: "08:30", title: "酒店早餐", desc: "吃飽飽準備出發！" },
      { type: "activity", time: "09:00", title: "【年輕人】冰瀑健行", desc: "Frozen Waterfall Hiking (USD 162/人)。GetYourGuide 預訂，含接送。", nav: "Korouoma Canyon" },
      { type: "activity", time: "09:00", title: "【父母】博物館與市區", desc: "Arktikum 博物館 / 市中心散步 / 桑拿 (HKD 166-460)。", nav: "Arktikum" },
      { type: "food", time: "18:00", title: "晚餐 & 超市採買", desc: "預算約 HKD 200。補給零食飲料。", nav: "K-Citymarket Rovaniemi" },
      { type: "aurora", time: "晚上", title: "追極光 (視天氣)", desc: "免費在酒店附近觀賞，或參加 Tour。", nav: "Arctic Resort Delight" }
    ]
  },
  {
    day: 3,
    date: "2/16 (一)",
    city: "Rovaniemi",
    title: "羅瓦涅米 (破冰船)",
    events: [
      { type: "transport", time: "09:45", title: "前往破冰船集合地點", desc: "Call Uber/Bolt。前往 Polar Explorer Icebreaker cruise office。", nav: "Polar Explorer Icebreaker cruise office" },
      { type: "activity", time: "10:00", title: "Polar Explorer 破冰船", desc: "EUR 470/人 (+30午餐)。含冰海漂浮體驗。重要：記得帶替換衣物！", nav: "Polar Explorer Icebreaker" },
      { type: "food", time: "18:35", title: "晚餐 & 超市", desc: "預算約 HKD 200。" },
      { type: "aurora", time: "晚上", title: "追極光 (視天氣)", desc: "免費在酒店附近觀賞，或參加 Tour。", nav: "Arctic Resort Delight" }
    ]
  },
  {
    day: 4,
    date: "2/17 (二)",
    city: "Rovaniemi", // 行程中移動，顯示出發地或目的地皆可
    title: "羅瓦涅米 -> 伊納里",
    events: [
      { type: "transport", time: "10:30", title: "寄放行李", desc: "K-Market Toriportti；EUR 5/件。", nav: "K-Market Toriportti" },
      { type: "sight", time: "11:15", title: "聖誕老人市區辦公室", desc: "Santa Claus City Office. 免費入場。", nav: "Santa Claus City Office" },
      { type: "sight", time: "13:00", title: "聖誕老人村", desc: "搭車前往。跨越北極圈線！必去郵局。", nav: "Santa Claus Village" },
      { type: "transport", time: "17:20", title: "巴士前往 Inari", desc: "EUR 63.2/人。約 4.5 小時車程。", nav: "Rovaniemi Bus Station" },
      { type: "hotel", time: "22:00", title: "Panorama Cabin", desc: "Sauna Suite。已付，3晚。極光熱點！", nav: "Panorama Cabin Inari" }
    ]
  },
  {
    day: 5,
    date: "2/18 (三)",
    city: "Inari",
    title: "伊納里 (鹿鹿！)",
    events: [
      { type: "rest", time: "10:00", title: "補眠 & 換房", desc: "準備午餐。", nav: "Panorama Cabin Inari" },
      { type: "activity", time: "13:30", title: "馴鹿雪橇", desc: "EUR 168/人。2人一台。", nav: "Visit Inari" },
      { type: "aurora", time: "20:00", title: "極光狩獵 (Car)", desc: "EUR 169/人。4小時車程追光。", nav: "Inari Aurora Spot" }
    ]
  },
  {
    day: 6,
    date: "2/19 (四)",
    city: "Inari",
    title: "伊納里 (哈士奇！)",
    events: [
      { type: "activity", time: "11:30", title: "哈士奇雪橇", desc: "EUR 198/人。3小時體驗，超刺激！", nav: "Visit Inari Safaris" },
      { type: "aurora", time: "20:30", title: "雪地摩托車追極光", desc: "EUR 183/人。3小時。", nav: "Visit Inari" }
    ]
  },
  {
    day: 7,
    date: "2/20 (五)",
    city: "Kirkenes",
    title: "伊納里 -> 基爾肯內斯",
    events: [
      { type: "transport", time: "08:00", title: "包車前往 Kirkenes", desc: "EUR 393/車。跨境進入挪威！", nav: "Kirkenes" },
      { type: "hotel", time: "11:30", title: "Scandic Hotel", desc: "HKD 1,688/房；已付。", nav: "Scandic Kirkenes" },
      { type: "activity", time: "13:00", title: "冰釣 (選購)", desc: "NOK 3100/人；Snow Hotel。", nav: "Snowhotel Kirkenes" },
      { type: "food", time: "18:00", title: "帝王蟹吃到飽", desc: "NOK 2800/人。必吃行程！", nav: "Kirkenes King Crab Safari" }
    ]
  },
  {
    day: 8,
    date: "2/21 (六)",
    city: "Kirkenes",
    title: "基爾肯內斯 -> 郵輪",
    events: [
      { type: "transport", time: "12:30", title: "搭乘 Havila Voyages", desc: "EUR 185/人。前往 Tromsø。船上包膳食。", nav: "Havila Voyages Kirkenes" }
    ]
  },
  {
    day: 9,
    date: "2/22 (日)",
    city: "Tromsø",
    title: "郵輪 -> 特羅姆瑟",
    events: [
      { type: "transport", time: "23:45", title: "抵達 Tromsø", desc: "深夜抵達。", nav: "Tromsø Terminal" },
      { type: "hotel", time: "23:55", title: "Thon Hotel Polar", desc: "HKD 2,006/房。已付。", nav: "Thon Hotel Polar" }
    ]
  },
  {
    day: 10,
    date: "2/23 (一)",
    city: "Tromsø",
    title: "特羅姆瑟 -> 赫爾辛基",
    events: [
      { type: "flight", time: "18:45", title: "飛往赫爾辛基", desc: "HKD 1,620/人。已付。", nav: "Tromsø Airport" },
      { type: "hotel", time: "22:30", title: "Scandic Helsinki Airport", desc: "HKD 1,015/房。", nav: "Scandic Helsinki Airport" }
    ]
  },
  {
    day: 11,
    date: "2/24 (二)",
    city: "Helsinki",
    title: "赫爾辛基 -> 香港",
    events: [
      { type: "flight", time: "16:35", title: "飛返香港 (HKG)", desc: "HKD 6,600/人。回家囉！", nav: "Helsinki Airport" }
    ]
  }
];

const infoData = {
  flights: [
    { date: "2/14", route: "HKG -> HEL", no: "AY100", time: "14:05 抵達" },
    { date: "2/14", route: "HEL -> RVN", no: "AY537", time: "19:40 起飛" },
    { date: "2/23", route: "TOS -> HEL", no: "AY442", time: "18:45 起飛" },
    { date: "2/24", route: "HEL -> HKG", no: "AY099", time: "16:35 起飛" }
  ],
  hotels: [
    { name: "Arctic Resort Delight", city: "Rovaniemi", nights: "3晚", note: "3房, 已付" },
    { name: "Panorama Cabin", city: "Inari", nights: "3晚", note: "Sauna Suite, 已付" },
    { name: "Scandic Hotel", city: "Kirkenes", nights: "1晚", note: "已付" },
    { name: "Havila Voyages", city: "Cruise", nights: "1晚", note: "郵輪過夜" },
    { name: "Thon Hotel Polar", city: "Tromsø", nights: "1晚", note: "已付" },
    { name: "Scandic Airport", city: "Helsinki", nights: "1晚", note: "機場旁" }
  ]
};

// --- 3. 小工具組件 ---

// 天氣元件 (使用 Open-Meteo API)
const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const loc = LOCATIONS[city] || LOCATIONS["Helsinki"];
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (e) {
        console.error("Weather fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city]);

  if (loading) return <div className="text-xs text-gray-400 animate-pulse">載入天氣...</div>;

  const isCold = weather?.temperature < 0;
  
    // --- 新版 WeatherWidget ---
  return (
    // 1. 外框：改用 flex-col (直排模式)，因為要分上下層
    <div className={`flex flex-col justify-between p-2 rounded-xl shadow-sm border border-white/50 w-[120px] h-[90px] flex-shrink-0 ${isCold ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-orange-50'}`}>
      
      {/* 2. 上層：城市名稱 (置中) */}
      <div className="w-full text-center border-b border-black/5 pb-1 mb-1">
        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider line-clamp-2">{city}即時天氣
        </div>
      </div>

      {/* 3. 下層：左右分開 (左公仔、右溫度) */}
      <div className="flex items-center justify-between px-1 flex-1">
        
        {/* 左下：天氣公仔 */}
        <div className={`p-1.5 rounded-full flex-shrink-0 ${isCold ? 'bg-blue-200 text-blue-600' : 'bg-orange-200 text-orange-600'}`}>
          {weather?.temperature < -5 ? <Snowflake size={20} /> : (weather?.temperature > 10 ? <Sun size={20} /> : <Cloud size={20} />)}
        </div>

        {/* 右下：溫度 + 風速 */}
        <div className="flex flex-col items-end"> {/* items-end 令佢靠右對齊 */}
          
          {/* 溫度：用 Math.round() 取整數 */}
          <div className="font-black text-2xl text-gray-800 leading-none">
            {weather?.temperature ? Math.round(weather.temperature) : '--'}°C
          </div>

          {/* 風速提示 */}
          {weather?.windspeed > 15 && (
             <span className="text-[9px] bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-600 flex items-center gap-1 mt-1">
               <Wind size={8}/> 風大
             </span>
          )}
        </div>

      </div>
    </div>
  );
};

// 匯率換算器 (實時版)
const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR'); // 預設歐元
  const [rates, setRates] = useState({ EUR: 9.2, NOK: 0.8, USD: 7.8 }); // 預設值，以防 API 失敗
  const [loading, setLoading] = useState(true);

  // 自動抓取最新匯率
    useEffect(() => {
    const fetchRates = async () => {
      try {
        // 1. 用歐元做基準查港幣 (因為 EUR 數據最全)
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=HKD,NOK,USD');
        const data = await res.json();
        
        if (data && data.rates) {
          const eurToHkd = data.rates.HKD; // 1 EUR = ? HKD (e.g. 8.2)
          const eurToNok = data.rates.NOK; // 1 EUR = ? NOK
          const eurToUsd = data.rates.USD; // 1 EUR = ? USD

          // 2. 數學換算：計返每一種幣值幾多港紙
          setRates({
            EUR: eurToHkd.toFixed(2),
            NOK: (eurToHkd / eurToNok).toFixed(2),
            USD: (eurToHkd / eurToUsd).toFixed(2)
          });
        }
      } catch (e) {
        console.log("用預設匯率");
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  // 計算結果
  const rate = rates[currency];
  const result = amount ? (parseFloat(amount) * rate).toFixed(1) : 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6">
      <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2"><RefreshCw size={18} className="text-pink-500"/> 匯率計算機</span>
        {loading ? <span className="text-[10px] text-gray-400 animate-pulse">更新中...</span> : <span className="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full">● 即時匯率</span>}
      </h3>
      
      <div className="flex items-center gap-3 mb-3">
        {/* 左邊：輸入與選擇 (上下排) */}
        <div className="flex-1 flex flex-col gap-2">
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="輸入金額"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-pink-400 font-bold text-lg"
          />
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-600"
          >
            <option value="EUR">🇪🇺 歐元 (EUR)</option>
            <option value="NOK">🇳🇴 挪威克朗 (NOK)</option>
            <option value="USD">🇺🇸 美金 (USD)</option>
          </select>
        </div>

        <ArrowRight className="text-gray-300" />

        {/* 右邊：結果顯示 */}
        <div className="flex-1 bg-pink-50 p-3 rounded-xl border border-pink-100 flex flex-col justify-center items-center self-stretch">
           <span className="text-xs text-pink-400 font-bold">HKD</span>
           <span className="font-black text-2xl text-pink-600">${result}</span>
        </div>
      </div>
      
      <p className="text-[10px] text-center text-gray-400">
        當前匯率：1 {currency} ≈ {rate|| '-'} HKD
      </p>
    </div>
  );
};

// 關鍵字標記元件
const HighlightText = ({ text }) => {
  if (!text) return null;
  const regex = /(HKD [\d,]+|EUR [\d,]+|NOK [\d,]+|USD [\d,]+|已付|免費|Call uber|必吃|必去|需預約)/gi;
  
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.match(regex)) {
          const isMoney = part.match(/(HKD|EUR|NOK|USD)/);
          const isPaid = part.match(/已付|免費/);
          const isImportant = part.match(/Call uber|必吃|必去|需預約/);
          
          let color = "bg-gray-100";
          if (isPaid) color = "bg-green-100 text-green-700 border border-green-200";
          else if (isMoney) color = "bg-yellow-50 text-yellow-700 border border-yellow-200";
          else if (isImportant) color = "bg-red-50 text-red-600 border border-red-200";

          return <span key={i} className={`font-bold px-1.5 py-0.5 rounded text-xs mx-0.5 inline-block my-0.5 ${color}`}>{part}</span>;
        }
        return part;
      })}
    </span>
  );
};

// ✅ 終極版 ActivityCard (請完整替換)
const ActivityCard = ({ act, dayIndex, eventIndex, fullData }) => {
  // 狀態管理
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editData, setEditData] = useState({ ...act });

  // 1. 處理儲存文字修改
  const handleSave = async () => {
    try {
      const newDays = JSON.parse(JSON.stringify(fullData));
      newDays[dayIndex].events[eventIndex] = editData;
      await updateDoc(doc(db, "trips", "main_trip"), { days: newDays });
      setIsEditing(false); // 關閉編輯模式
    } catch (e) {
      alert("儲存失敗: " + e.message);
    }
  };

  // 2. 處理檔案上傳
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `files/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditData(prev => ({ ...prev, doc: url }));
    } catch (error) {
      alert("上傳失敗");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. 處理移動順序
  const handleMove = async (direction) => {
    // 1. 先用 Firebase 最新的資料 (Snapshot) 確保資料是最新的
    // 這裡我們無法直接調用 Firebase 獲取最新，只能依賴 props 傳進來的 fullData
    // 但為了解決閉包問題，我們用 JSON parse/stringify 確保切斷引用
    
    const newIndex = eventIndex + direction;
    const currentDayEvents = fullData[dayIndex].events;

    if (newIndex < 0 || newIndex >= currentDayEvents.length) return;

    try {
      // ✅ 1. 深層複製
      const newDays = JSON.parse(JSON.stringify(fullData));
      
      const dayEvents = newDays[dayIndex].events;

      // ✅ 2. 打印出來檢查 (Debug)
      console.log("交換前:", dayEvents[eventIndex].title, "<->", dayEvents[newIndex].title);

      // ✅ 3. 交換 (Swap) - 使用解構賦值，更安全
      [dayEvents[eventIndex], dayEvents[newIndex]] = [dayEvents[newIndex], dayEvents[eventIndex]];

      // ✅ 4. 打印出來檢查
      console.log("交換後:", dayEvents[eventIndex].title, "<->", dayEvents[newIndex].title);

      // ✅ 5. 寫入 Firebase
      await updateDoc(doc(db, "trips", "main_trip"), {
        days: newDays
      });
      
      // ✨ 關鍵修復：這裡我們不手動修改 React State，
      // 而是讓 Firebase 的 onSnapshot 自動觸發重新渲染。
      
    } catch (e) {
      console.error("移動失敗", e);
      alert("移動失敗: " + e.message);
    }
  };

  // 4. 刪除活動功能
  const handleDelete = async () => {
    if (!window.confirm("確定要永久刪除呢個活動嗎？")) return;
    try {
      const newDays = JSON.parse(JSON.stringify(fullData));
      newDays[dayIndex].events.splice(eventIndex, 1);
      await updateDoc(doc(db, "trips", "main_trip"), { days: newDays });
      alert("活動已刪除");
    } catch (e) {
      console.error("刪除失敗", e);
    }
  };

  // --- 樣式設定 (不變) ---
  let Icon = MapPin;
  let style = "border-l-4 border-gray-300 bg-white"; // 預設灰色

  if (act.type === 'flight') { Icon = Plane; style = "border-l-4 border-blue-400 bg-blue-50"; }
  if (act.type === 'food') { Icon = Utensils; style = "border-l-4 border-orange-400 bg-orange-50"; }
  if (act.type === 'stay') { Icon = Home; style = "border-l-4 border-purple-400 bg-purple-50"; }
  if (act.type === 'transport') { Icon = Train; style = "border-l-4 border-green-400 bg-green-50"; }
  if (act.type === 'activity' || act.type === 'sight' || act.type === 'shop') { Icon = Camera; style = "border-l-4 border-pink-400 bg-pink-50"; }
  if (act.type === 'aurora') { Icon = Snowflake; style = "border-l-4 border-teal-400 bg-teal-50 shadow-md shadow-teal-100/50"; }

  return (
    <div className={`p-4 mb-3 rounded-2xl shadow-sm ${style} relative`}>
      {/* 編輯按鈕 (右上角) */}
      <button onClick={() => setIsEditing(!isEditing)} className="absolute top-2 right-2 text-gray-400 hover:text-pink-500">
        <Pencil size={14} />
      </button>

      {isEditing ? (
        // === ✨ 全功能編輯模式 (更新版) ✨ ===
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold text-gray-400 flex justify-between items-center">
            <span>編輯活動</span>
            <span className="text-[10px] bg-gray-100 px-1 rounded">Mode: Editing</span>
          </div>

          {/* 第一行：時間、類型、標題 */}
          <div className="flex gap-2">
            <input 
              className="w-1/3 p-2 rounded border text-sm focus:outline-pink-400 transition-colors" 
              value={editData.time} 
              onChange={e => setEditData({...editData, time: e.target.value})} 
              placeholder="時間"
            />
            <select 
              className="w-2/3 p-2 rounded border text-sm bg-white focus:outline-pink-400" 
              value={editData.type} 
              onChange={e => setEditData({...editData, type: e.target.value})}
            >
              <option value="sight">📸 景點</option>
              <option value="food">🍴 餐廳</option>
              <option value="shop">🛍️ 購物</option>
              <option value="transport">🚆 交通</option>
              <option value="stay">🏨 住宿</option>
              <option value="activity">🎢 活動</option>
            </select>
          </div>
          
          <input 
            placeholder="活動標題" 
            className="w-full p-2 rounded border text-sm font-bold focus:outline-pink-400" 
            value={editData.title} 
            onChange={e => setEditData({...editData, title: e.target.value})} 
          />
          
          {/* --- ✨ 新增：Highlight (亮點/提示) --- */}
          <input 
            placeholder="✨ 亮點 / 提示 (例如: 必食 / 需預約)" 
            className="w-full p-2 rounded border text-sm text-red-500 placeholder-red-200 focus:outline-red-300 bg-red-50/30" 
            value={editData.highlight || ''} // 防止 undefined
            onChange={e => setEditData({...editData, highlight: e.target.value})} 
          />

          {/* 描述 */}
          <textarea 
            placeholder="詳細描述" 
            className="w-full p-2 rounded border text-sm h-20 focus:outline-pink-400" 
            value={editData.desc} 
            onChange={e => setEditData({...editData, desc: e.target.value})} 
          />

          {/* --- ✨ 更新：導航地址 (加 Icon) --- */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <MapPin size={14} />
            </div>
            <input 
              placeholder="Google Map 地址 / 座標" 
              className="w-full p-2 pl-9 rounded border text-sm bg-blue-50 focus:outline-blue-400 text-blue-800 placeholder-blue-300" 
              value={editData.nav || ''} 
              onChange={e => setEditData({...editData, nav: e.target.value})} 
            />
          </div>

          {/* 檔案上傳 */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-dashed">
            <label className="bg-white border px-2 py-1 rounded cursor-pointer text-xs font-bold flex items-center gap-1">
              {isUploading ? <Loader2 className="animate-spin" size={12}/> : <Plus size={12}/>} 上傳文件
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
            </label>
            {editData.doc && <span className="text-[10px] text-green-600 truncate max-w-[150px]">已連結文件</span>}
          </div>

          {/* 移動順序按鈕 */}
          <div className="flex gap-2">
             <button onClick={() => handleMove(-1)} disabled={eventIndex === 0} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 disabled:opacity-50">⬆️ 上移</button>
             <button onClick={() => handleMove(1)} disabled={eventIndex === fullData[dayIndex].events.length - 1} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 disabled:opacity-50">⬇️ 下移</button>
          </div>

          {/* 儲存 & 刪除按鈕 */}
          <div className="flex gap-2 pt-2">
            <button onClick={handleDelete} className="w-1/3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold">刪除</button>
            <button onClick={handleSave} className="w-2/3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-bold shadow-md">儲存變更</button>
          </div>
        </div>
      ) : (
        // === 顯示模式 (不變) ===
        <>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/90 px-2 py-0.5 rounded-md text-xs font-black text-gray-500 font-mono">{act.time}</span>
              <Icon size={16} className="text-gray-600 opacity-70" />
            </div>
            <div className="flex gap-1 mr-6">
               {act.doc && <a href={act.doc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-[10px] font-bold shadow">📄 文件</a>}
               {act.nav && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.nav)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-blue-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow">🚀 GO</a>}
            </div>
          </div>
          <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{act.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed"><HighlightText text={act.desc} /></p>
          {(act.highlight || act.tips) && <div className="mt-2 text-[11px] text-gray-500 bg-white/70 p-1.5 rounded-lg border"> {act.highlight && <span className="mr-2 text-red-500 font-bold">★ {act.highlight}</span>} {act.tips && <span>💡 {act.tips}</span>}</div>}
        </>
      )}
    </div>
  );
};

// --- 4. 每天行程卡片 (新增組件) ---
const DayCard = ({ day, dayIndex, fullData }) => {
  // 1. 使用 State 追蹤卡片是否展開
  const [isExpanded, setIsExpanded] = useState(false);

 // --- ✨ 新增：新增活動表單的狀態 ---
  const [isAdding, setIsAdding] = useState(false); // 控制表單開關
  const [newEvent, setNewEvent] = useState({
    time: "",
    title: "",
    type: "sight", // 預設類型
    desc: "",
    nav: ""
  });

  const toggleExpand = () => setIsExpanded(!isExpanded);

// *** 新增：行程刪除/修改功能 ***
    const deleteEvent = async (eventIndexToDelete) => {
        if (!window.confirm("確定要刪除這項行程嗎？此操作不可逆！")) return;

        // 1. 複製目前的完整行程資料
        const newDays = [...fullData];

        // 2. 在記憶體中，從這一天 (dayIndex) 的 events 陣列中刪除指定的活動 (eventIndexToDelete)
        newDays[dayIndex].events.splice(eventIndexToDelete, 1);

        // 3. 將整個新的行程陣列寫回 Firebase (使用 setDoc，因為它是最簡單和安全的)
        try {
            // trips 是集合名稱，main_trip 是文件名稱
            await setDoc(doc(db, "trips", "main_trip"), {
                days: newDays
            });
            alert("行程刪除成功！");
        } catch (error) {
            console.error("刪除失敗", error);
            alert("刪除失敗。");
        }
    };

 // --- ✨ 新增：處理新增活動 ---
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.time) {
      alert("請最少填寫時間和標題！");
      return;
    }

    try {
      // 1. 複製現有的行程資料
      const newDays = [...fullData];
      
      // 2. 將新活動加到當天 (dayIndex) 的 events 陣列最後面
      newDays[dayIndex].events.push(newEvent);

      // 3. 寫入 Firebase
      await updateDoc(doc(db, "trips", "main_trip"), {
        days: newDays
      });

      // 4. 重置表單
      setIsAdding(false);
      setNewEvent({ time: "", title: "", type: "sight", desc: "", nav: "" });
      alert("活動新增成功！");
      
    } catch (e) {
      console.error("新增失敗", e);
      alert("新增失敗: " + e.message);
    }
  };

  return (
    // 外層容器，設定圓角和陰影
    <div className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden transition-all duration-300">
      
      {/* 卡片頭部 (永遠顯示) - 點擊區域 */}
      <div 
        className={`p-3 min-h-[120px] cursor-pointer flex justify-between items-center transition-colors ${isExpanded ? 'bg-pink-100/50' : 'hover:bg-pink-50'}`}
        onClick={toggleExpand}
      >
        <div className="flex items-start gap-4 flex-grow min-w-0">
          <div className="text-center min-w-[70px] flex-shrink-0">
            {/* 核心資訊：Day 1 */}
            <div className="text-3xl font-black text-gray-800 font-mono tracking-tighter">Day {day.day}</div>
            {/* 核心資訊：日期 */}
            <div className="text-sm font-bold text-pink-500">{day.date}</div>
          </div>
          
          <div className="w-[140px]"> {/* 鎖死闊度 */}
            {/* 核心資訊：行程標題 - 加入 line-clamp-3 以限制夾住 3 行 */}
            <h3 className="text-lg font-black text-gray-800 leading-tight line-clamp-3">{day.title}</h3>
            {/* ... 城市資訊 ... */}
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-pink-400"/>
                {day.city}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
            {/* 天氣小工具 */}
            <WeatherWidget city={day.city} />

            {/* 展開/收起圖標 */}
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'transform rotate-180 text-pink-500' : ''}`}
            />
        </div>
      </div>

      {/* 卡片內容 (根據 isExpanded 狀態顯示/隱藏) */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100 p-4' : 'max-h-0 opacity-0 overflow-hidden p-0'}`}>
        {/* 只有展開時才顯示內容和 padding */}
        {isExpanded && (
          <div className="pt-4 border-t border-pink-100">
            <h4 className="text-md font-bold text-gray-700 mb-3 ml-2">今日行程 ({day.events.length} 項活動)</h4>
            <div className="space-y-3">
             {day.events.map((act, i) => (
             <ActivityCard 
             key={`${i}-${act.title}`}  
             act={act} 
             dayIndex={dayIndex}        // 傳入：這是第幾天
             eventIndex={i}             // 傳入：這是當天的第幾個活動 (i 就是 eventIndex)
             fullData={fullData}        // 傳入：完整的行程資料 (用於儲存時更新)
             />
            ))}
           </div>

       {/* --- ✨ 新增：新增活動按鈕與表單 --- */}
        <div className="mt-4 border-t border-dashed border-pink-200 pt-4">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-2 bg-pink-50 text-pink-500 rounded-xl border border-pink-200 font-bold text-sm hover:bg-pink-100 flex justify-center items-center gap-2 transition-all"
            >
              <Plus size={16} /> 新增行程
            </button>
          ) : (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 animate-fadeIn">
              <h5 className="font-bold text-gray-500 mb-2 text-xs">填寫新活動資料</h5>
              
              <div className="space-y-2">
                {/* 第一行：時間 + 類型 */}
                <div className="flex gap-2">
                  <input 
                    placeholder="時間 (e.g. 14:00)" 
                    className="w-1/3 p-2 rounded border text-sm"
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  />
                  <select 
                    className="w-2/3 p-2 rounded border text-sm bg-white"
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    <option value="sight">📸 景點 (Sight)</option>
                    <option value="food">🍴 餐廳 (Food)</option>
                    <option value="shop">🛍️ 購物 (Shop)</option>
                    <option value="transport">🚆 交通 (Transport)</option>
                    <option value="stay">🏨 住宿 (Stay)</option>
                  </select>
                </div>

                {/* 第二行：標題 */}
                <input 
                  placeholder="活動標題 (e.g. 食海鮮)" 
                  className="w-full p-2 rounded border text-sm font-bold"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />

                {/* 第三行：描述 */}
                <textarea 
                  placeholder="詳細描述 / 備註 / 價錢..." 
                  className="w-full p-2 rounded border text-sm h-16"
                  value={newEvent.desc}
                  onChange={e => setNewEvent({...newEvent, desc: e.target.value})}
                />

                 {/* 第四行：導航地址 (Google Maps) */}
                 <input 
                  placeholder="導航地址 (選填)" 
                  className="w-full p-2 rounded border text-sm bg-blue-50"
                  value={newEvent.nav}
                  onChange={e => setNewEvent({...newEvent, nav: e.target.value})}
                />

                {/* 按鈕區 */}
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleAddEvent}
                    className="flex-1 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold shadow-md"
                  >
                    確認新增
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>            
          </div>
        )}
      </div>
    </div>
  );
};

// --- 5. 主程式 ---
export default function App() {
  const [tab, setTab] = useState('trip'); // trip, info, budget
  const [expenses, setExpenses] = useState([]);
  const [newExpName, setNewExpName] = useState('');
  const [newExpCost, setNewExpCost] = useState('');
  const [firebaseTripData, setFirebaseTripData] = useState([]);
  const [loading, setLoading] = useState(true);

      // *** 2. 新增：App 啟動時開始監聽 Firebase (Trips) ***
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "trips", "main_trip"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setFirebaseTripData(docSnapshot.data().days);
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  // *** 3. 新增：監聽 Firebase (Expenses) ***
  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newExpenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(newExpenses);
    });

    return () => unsubscribe();
  }, []);
  
  // *** 新增：Loading 畫面處理 (防止資料未到就運行) ***
  if (loading) return <div className="p-10 text-center text-gray-500 font-bold">載入行程中，請稍候...</div>;

  const addExpense = async () => {
  if (newExpName && newExpCost) {
    try {
      // 🔥 寫入 Firebase
      await addDoc(collection(db, "expenses"), {
        name: newExpName,
        cost: parseFloat(newExpCost),
        createdAt: Date.now() // 加個時間印，方便排序
      });
      
      // 清空輸入框
      setNewExpName('');
      setNewExpCost('');
    } catch (e) {
      alert("記帳失敗: " + e.message);
    }
  }
};

  // 用於將原本的 tripData 上傳到 Firebase (只需按一次)
   const uploadDataToFirebase = async () => {
     try {
       await setDoc(doc(db, "trips", "main_trip"), {
         days: tripData // 這裡用你原本那個好長的 tripData 變數
       });
       alert("上傳成功！現在可以刪除這個按鈕了");
     } catch (error) {
       console.error("上傳失敗", error);
       alert("上傳失敗");
  }
};
  
  const deleteExpense = async (id) => {
  if(!window.confirm("確定刪除這筆數？")) return; // 加個確認，費事手殘
  
  try {
    // 🔥 通知 Firebase 刪除該 ID 的文件
    await deleteDoc(doc(db, "expenses", id));
  } catch (e) {
    alert("刪除失敗: " + e.message);
  }
};

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFF5F7] pb-28 font-sans">

     {/* 刪除或註解以下三行，因為資料庫已初始化成功 */}
      {/* <button onClick={uploadDataToFirebase} className="bg-red-500 text-white p-2">
        初始化資料庫 (只按一次)
      </button> */}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md px-6 py-4 rounded-b-[2rem] shadow-sm border-b border-pink-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">北歐極光之旅</h1>
          <p className="text-xs text-pink-400 font-bold tracking-wider">FINLAND & NORWAY 2026</p>
        </div>
        <div className="bg-pink-100 p-2 rounded-full text-xl animate-bounce shadow-inner">☃️</div>
      </header>

      {/* Content */}
      <main className="p-4">
        
       {/* --- TAB 1: 行程 (Trip) --- */}
        {tab === 'trip' && (
          <div className="space-y-8 animate-fadeIn">
            {/* *** 替換資料來源並傳遞編輯用參數 *** */}
            {firebaseTripData.map((day, dayIndex) => (
              <DayCard 
                 key={day.day} 
                 day={day} 
                 dayIndex={dayIndex}        // 新增：傳遞當前是第幾天 (從 0 開始)
                 fullData={firebaseTripData} // 新增：傳遞完整的行程資料
              />
            ))}
          </div>
        )}

        {/* --- TAB 2: 資訊 (Info) --- */}
        {tab === 'info' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 航班資訊 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-100">
              <h3 className="font-bold text-lg text-blue-600 mb-4 flex items-center gap-2 border-b border-blue-50 pb-2">
                <Plane size={20} /> 航班資訊
              </h3>
              <div className="space-y-4">
                {infoData.flights.map((f, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <div className="font-black text-gray-700">{f.route}</div>
                      <div className="text-xs text-gray-400">{f.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded">{f.no}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{f.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 住宿資訊 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-purple-100">
              <h3 className="font-bold text-lg text-purple-600 mb-4 flex items-center gap-2 border-b border-purple-50 pb-2">
                <Home size={20} /> 住宿列表
              </h3>
              <div className="space-y-4">
                {infoData.hotels.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-400">
                       <span className="font-bold text-xs block text-center">{h.nights}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{h.name}</div>
                      <div className="text-xs text-gray-500">{h.city} · {h.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

             {/* 緊急聯絡 */}
             <div className="bg-red-50 p-5 rounded-3xl shadow-sm border border-red-100">
              <h3 className="font-bold text-lg text-red-600 mb-3 flex items-center gap-2">
                <Phone size={20} /> 緊急聯絡
              </h3>
              <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">芬蘭/挪威緊急電話</span>
                  <a href="tel:112" className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-red-600">Call 112</a>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">外交部緊急聯絡</span>
                  <a href="tel:+886800085095" className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-red-600">Call</a>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: 記帳 (Budget) --- */}
        {tab === 'budget' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 匯率計算機 */}
            <CurrencyConverter />

            {/* 記帳本 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Wallet className="text-green-500" /> 即時記帳 (HKD)
              </h3>

              {/* 總金額 */}
              <div className="bg-gray-800 text-white p-4 rounded-2xl mb-6 flex justify-between items-center shadow-lg shadow-gray-200">
                <span className="text-sm text-gray-400">目前總花費</span>
                <span className="text-2xl font-mono font-bold">${totalExpense}</span>
              </div>

               {/* 新增輸入框 */}
              <div className="flex items-end gap-2 mb-4 w-full"> {/* 加了 items-end (底部對齊) 和 w-full (不爆棚) */}
  
               {/* 項目名輸入框：改成 textarea 自動增高 */}
               <div className="flex-1 min-w-0 relative"> {/* 加 min-w-0 這是關鍵！防止 flex 爆出去 */}
                <textarea 
                rows={1} // 預設 1 行高
                placeholder="項目 (如: 晚餐)" 
                value={newExpName}
                onChange={(e) => {
                setNewExpName(e.target.value);
                // 自動調整高度的小魔法
                e.target.style.height = 'auto'; 
                e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="w-full p-2 rounded-xl bg-gray-50 border text-sm focus:outline-green-400 resize-none overflow-hidden block leading-normal" 
               // resize-none: 不顯示手動拉大角; overflow-hidden: 隱藏捲軸; block: 消除奇怪間距
               style={{ minHeight: '38px' }} // 設定一個最小高度，跟隔壁 input 一樣高
              />
            </div>

              {/* 金額輸入框：保持不變，但加了 flex-shrink-0 */}
              <input 
              type="number" 
              placeholder="$" 
              value={newExpCost}
              onChange={(e) => setNewExpCost(e.target.value)}
              className="w-20 p-2 h-[38px] rounded-xl bg-gray-50 border text-sm focus:outline-green-400 flex-shrink-0" // 加 h-[38px] 固定高度
              />

              {/* 加號按鈕：保持不變，加 flex-shrink-0 */}
              <button onClick={addExpense} className="bg-green-500 text-white w-[38px] h-[38px] rounded-xl shadow-md active:scale-95 flex justify-center items-center flex-shrink-0">
              <Plus size={20} />
              </button>
            </div>

              {/* 列表 */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {expenses.length === 0 && <div className="text-center text-gray-300 text-sm py-4">還沒有記帳喔 ~</div>}
                {expenses.map((e) => (
                  <div key={e.id} className="flex justify-between items-center p-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{e.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gray-800">${e.cost}</span>
                      <button onClick={() => deleteExpense(e.id)} className="text-red-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white p-1 flex justify-between items-center z-50 px-2">
        <button onClick={() => setTab('trip')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${tab === 'trip' ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Calendar size={22} strokeWidth={tab === 'trip' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">行程</span>
        </button>
        <button onClick={() => setTab('info')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${tab === 'info' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Plane size={22} strokeWidth={tab === 'info' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">資訊</span>
        </button>
        <button onClick={() => setTab('budget')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${tab === 'budget' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Wallet size={22} strokeWidth={tab === 'budget' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">記帳</span>
        </button>
      </nav>
    </div>
  );
}






















