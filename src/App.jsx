import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Cloud, Sun, CloudSnow, ChevronDown, Wind, Utensils, Camera, Train, Plane, Home, Phone, Wallet, Info, Snowflake, ArrowRight, Plus, Trash2, RefreshCw } from 'lucide-react';

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
    activities: [
      { type: "transport", time: "14:05", title: "抵達赫爾辛基 (HEL)", desc: "抵達機場，準備轉機。", location: "Helsinki Airport" },
      { type: "rest", time: "16:00", title: "Taobao Lounge 休息", desc: "HKD 130/人。休息充電，調整時差。", location: "Helsinki Airport Lounge" },
      { type: "flight", time: "19:40", title: "飛往羅瓦涅米 (HEL->RVN)", desc: "HKD 1,520 (已付)。21:05 抵達。", location: "Rovaniemi Airport" },
      { type: "hotel", time: "22:00", title: "Arctic Resort Delight", desc: "已付。3房/3晚。可在附近散步適應天氣。", location: "Arctic Resort Delight" }
    ]
  },
  {
    day: 2,
    date: "2/15 (日)",
    city: "Rovaniemi",
    title: "羅瓦涅米 (分組活動)",
    activities: [
      { type: "food", time: "08:30", title: "酒店早餐", desc: "吃飽飽準備出發！" },
      { type: "activity", time: "09:00", title: "【年輕人】冰瀑健行", desc: "Frozen Waterfall Hiking (USD 162/人)。GetYourGuide 預訂，含接送。", location: "Korouoma Canyon" },
      { type: "activity", time: "09:00", title: "【父母】博物館與市區", desc: "Arktikum 博物館 / 市中心散步 / 桑拿 (HKD 166-460)。", location: "Arktikum" },
      { type: "food", time: "18:00", title: "晚餐 & 超市採買", desc: "預算約 HKD 200。補給零食飲料。", location: "K-Citymarket Rovaniemi" },
      { type: "aurora", time: "晚上", title: "追極光 (視天氣)", desc: "免費在酒店附近觀賞，或參加 Tour。", location: "Arctic Resort Delight" }
    ]
  },
  {
    day: 3,
    date: "2/16 (一)",
    city: "Rovaniemi",
    title: "羅瓦涅米 (破冰船)",
    activities: [
      { type: "transport", time: "09:45", title: "前往遊客中心", desc: "Call Uber/Bolt。前往 Tourist Information Center。" },
      { type: "activity", time: "10:00", title: "Polar Explorer 破冰船", desc: "EUR 470/人 (+30午餐)。含冰海漂浮體驗。重要：記得帶替換衣物！", location: "Polar Explorer Icebreaker" },
      { type: "food", time: "18:35", title: "晚餐 & 超市", desc: "預算約 HKD 200。" }
    ]
  },
  {
    day: 4,
    date: "2/17 (二)",
    city: "Rovaniemi", // 行程中移動，顯示出發地或目的地皆可
    title: "羅瓦涅米 -> 伊納里",
    activities: [
      { type: "transport", time: "10:30", title: "寄放行李", desc: "K-Market Toriportti。EUR 5/件。", location: "K-Market Toriportti" },
      { type: "sight", time: "11:15", title: "聖誕老人市區辦公室", desc: "Santa Claus City Office. 免費入場。" },
      { type: "sight", time: "13:00", title: "聖誕老人村", desc: "搭車前往。跨越北極圈線！必去郵局。", location: "Santa Claus Village" },
      { type: "transport", time: "17:20", title: "巴士前往 Inari", desc: "EUR 63.2/人。約 4.5 小時車程。", location: "Rovaniemi Bus Station" },
      { type: "hotel", time: "22:00", title: "Panorama Cabin", desc: "Sauna Suite。已付，3晚。極光熱點！", location: "Panorama Cabin Inari" }
    ]
  },
  {
    day: 5,
    date: "2/18 (三)",
    city: "Inari",
    title: "伊納里 (馴鹿體驗)",
    activities: [
      { type: "rest", time: "10:00", title: "補眠 & 換房", desc: "準備午餐。" },
      { type: "activity", time: "13:30", title: "馴鹿雪橇", desc: "EUR 168/人。2人一台。", location: "Visit Inari" },
      { type: "aurora", time: "20:00", title: "極光狩獵 (Car)", desc: "EUR 169/人。4小時車程追光。", location: "Inari Aurora Spot" }
    ]
  },
  {
    day: 6,
    date: "2/19 (四)",
    city: "Inari",
    title: "伊納里 (哈士奇)",
    activities: [
      { type: "activity", time: "11:30", title: "哈士奇雪橇", desc: "EUR 198/人。3小時體驗，超刺激！", location: "Visit Inari Safaris" },
      { type: "aurora", time: "20:30", title: "雪地摩托車追極光", desc: "EUR 183/人。3小時。", location: "Inari" }
    ]
  },
  {
    day: 7,
    date: "2/20 (五)",
    city: "Kirkenes",
    title: "Inari -> 基爾肯內斯",
    activities: [
      { type: "transport", time: "08:00", title: "包車前往 Kirkenes", desc: "EUR 393/車。跨境進入挪威！", location: "Kirkenes" },
      { type: "hotel", time: "11:30", title: "Scandic Hotel", desc: "HKD 1,688/房。已付。", location: "Scandic Kirkenes" },
      { type: "activity", time: "13:00", title: "冰釣 (選購)", desc: "NOK 3100/人。Snow Hotel。", location: "Snowhotel Kirkenes" },
      { type: "food", time: "18:00", title: "帝王蟹吃到飽", desc: "NOK 2800/人。必吃行程！", location: "Kirkenes King Crab Safari" }
    ]
  },
  {
    day: 8,
    date: "2/21 (六)",
    city: "Kirkenes",
    title: "Kirkenes -> 特羅姆瑟",
    activities: [
      { type: "transport", time: "12:30", title: "搭乘 Havila Voyages", desc: "EUR 185/人。前往 Tromsø。船上包膳食。", location: "Havila Voyages Kirkenes" }
    ]
  },
  {
    day: 9,
    date: "2/22 (日)",
    city: "Tromsø",
    title: "郵輪 -> 特羅姆瑟",
    activities: [
      { type: "transport", time: "23:45", title: "抵達 Tromsø", desc: "深夜抵達。", location: "Tromsø Terminal" },
      { type: "hotel", time: "23:55", title: "Thon Hotel Polar", desc: "HKD 2,006/房。已付。", location: "Thon Hotel Polar" }
    ]
  },
  {
    day: 10,
    date: "2/23 (一)",
    city: "Tromsø",
    title: "特羅姆瑟 -> 赫爾辛基",
    activities: [
      { type: "flight", time: "18:45", title: "飛往赫爾辛基", desc: "HKD 1,620/人。已付。", location: "Tromsø Airport" },
      { type: "hotel", time: "22:30", title: "Scandic Helsinki Airport", desc: "HKD 1,015/房。", location: "Scandic Helsinki Airport" }
    ]
  },
  {
    day: 11,
    date: "2/24 (二)",
    city: "Helsinki",
    title: "赫爾辛基 -> 香港",
    activities: [
      { type: "flight", time: "16:35", title: "飛返香港 (HKG)", desc: "HKD 6,600/人。回家囉！", location: "Helsinki Airport" }
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
  
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-sm border border-white/50 ${isCold ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-orange-50'}`}>
      <div className={`p-2 rounded-full ${isCold ? 'bg-blue-200 text-blue-600' : 'bg-orange-200 text-orange-600'}`}>
        {weather?.temperature < -5 ? <Snowflake size={18} /> : (weather?.temperature > 10 ? <Sun size={18} /> : <Cloud size={18} />)}
      </div>
      <div>
        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Live Weather in {city}</div>
        <div className="font-black text-xl text-gray-800 flex items-center gap-1">
          {weather?.temperature}°C
          {weather?.windspeed > 15 && <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600 flex items-center"><Wind size={8}/> 風大</span>}
        </div>
      </div>
    </div>
  );
};

// 匯率換算器
const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR'); // EUR, NOK, USD
  const RATES = { EUR: 9.2, NOK: 0.75, USD: 7.8 }; // 根據 PDF 匯率 (NOK 估算)

  const result = amount ? (parseFloat(amount) * RATES[currency]).toFixed(1) : 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6">
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <RefreshCw size={18} className="text-pink-500"/> 匯率計算機
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
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
            className="absolute right-2 top-2 bottom-2 bg-white rounded-lg border border-gray-200 text-sm font-bold px-2 text-gray-600"
          >
            <option value="EUR">€ EUR</option>
            <option value="NOK">kr NOK</option>
            <option value="USD">$ USD</option>
          </select>
        </div>
        <ArrowRight className="text-gray-300" />
        <div className="flex-1 bg-pink-50 p-3 rounded-xl border border-pink-100 flex flex-col justify-center items-center">
           <span className="text-xs text-pink-400 font-bold">HKD</span>
           <span className="font-black text-xl text-pink-600">${result}</span>
        </div>
      </div>
      <p className="text-[10px] text-center text-gray-400">匯率：1 EUR ≈ 9.2 | 1 NOK ≈ 0.75</p>
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

const ActivityCard = ({ act }) => {
  let Icon = MapPin;
  let style = "border-l-4 border-gray-300 bg-white";
  
  if (act.type === 'flight') { Icon = Plane; style = "border-l-4 border-blue-400 bg-blue-50"; }
  if (act.type === 'food') { Icon = Utensils; style = "border-l-4 border-orange-400 bg-orange-50"; }
  if (act.type === 'hotel') { Icon = Home; style = "border-l-4 border-purple-400 bg-purple-50"; }
  if (act.type === 'aurora') { Icon = Snowflake; style = "border-l-4 border-teal-400 bg-teal-50 shadow-md shadow-teal-100/50"; }
  if (act.type === 'activity' || act.type === 'sight') { Icon = Camera; style = "border-l-4 border-pink-400 bg-pink-50"; }
  if (act.type === 'transport') { Icon = Train; style = "border-l-4 border-green-400 bg-green-50"; }

  const handleNav = () => {
    const query = act.location || act.title;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className={`p-4 mb-3 rounded-2xl shadow-sm ${style} relative transition-all active:scale-[0.98]`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="bg-white/90 px-2 py-0.5 rounded-md text-xs font-black text-gray-500 shadow-sm font-mono">{act.time}</span>
          <Icon size={16} className="text-gray-600 opacity-70" />
        </div>
        {act.location && (
          <button onClick={handleNav} className="flex items-center gap-1 bg-blue-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow hover:bg-blue-600">
            <Navigation size={10} /> GO
          </button>
        )}
      </div>
      <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{act.title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">
        <HighlightText text={act.desc} />
      </p>
    </div>
  );
};

// --- 4. 每天行程卡片 (新增組件) ---
const DayCard = ({ day }) => {
  // 1. 使用 State 追蹤卡片是否展開
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. 處理點擊事件：切換 isExpanded 的狀態
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    // 外層容器，設定圓角和陰影
    <div className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden transition-all duration-300">
      
      {/* 卡片頭部 (永遠顯示) - 點擊區域 */}
      <div 
        className={`p-5 cursor-pointer flex justify-between items-center transition-colors ${isExpanded ? 'bg-pink-100/50' : 'hover:bg-pink-50'}`}
        onClick={toggleExpand}
      >
        <div className="flex items-start gap-4">
          <div className="text-center min-w-[70px]">
            {/* 核心資訊：Day 1 */}
            <div className="text-3xl font-black text-gray-800 font-mono tracking-tighter">Day {day.day}</div>
            {/* 核心資訊：日期 */}
            <div className="text-sm font-bold text-pink-500">{day.date}</div>
          </div>
          
          <div>
            {/* 核心資訊：行程標題 */}
            <h3 className="text-lg font-black text-gray-800 leading-tight">{day.title}</h3>
            {/* 核心資訊：城市 */}
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
                <ActivityCard key={i} act={act} />
              ))}
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

  const addExpense = () => {
    if (newExpName && newExpCost) {
      setExpenses([...expenses, { id: Date.now(), name: newExpName, cost: parseFloat(newExpCost) }]);
      setNewExpName('');
      setNewExpCost('');
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFF5F7] pb-28 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md px-6 py-4 rounded-b-[2rem] shadow-sm border-b border-pink-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">北歐極光旅</h1>
          <p className="text-xs text-pink-400 font-bold tracking-wider">FINLAND & NORWAY 2026</p>
        </div>
        <div className="bg-pink-100 p-2 rounded-full text-xl animate-bounce shadow-inner">☃️</div>
      </header>

      {/* Content */}
      <main className="p-4">
        
       {/* --- TAB 1: 行程 (Trip) --- */}
        {tab === 'trip' && (
          <div className="space-y-8 animate-fadeIn">
            {/* **改變在這裡：直接使用新的 DayCard 組件** */}
            {tripData.map((day) => (
              <DayCard key={day.day} day={day} />
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
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="項目 (如: 晚餐)" 
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-gray-50 border text-sm focus:outline-green-400"
                />
                <input 
                  type="number" 
                  placeholder="$" 
                  value={newExpCost}
                  onChange={(e) => setNewExpCost(e.target.value)}
                  className="w-20 p-2 rounded-xl bg-gray-50 border text-sm focus:outline-green-400"
                />
                <button onClick={addExpense} className="bg-green-500 text-white p-2 rounded-xl shadow-md active:scale-95">
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
