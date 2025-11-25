import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, Utensils, Camera, Train, Plane, Home, Phone, Wallet, Info, Snowflake, Tent, Users } from 'lucide-react';

// --- 1. 根據 PDF 提取的完整資料 ---
const tripData = [
  {
    day: 1,
    date: "2/14 (六)",
    location: "香港 -> 赫爾辛基 -> 羅瓦涅米",
    weather: "snow",
    temp: "-15°C",
    activities: [
      { type: "transport", time: "14:05", title: "抵達赫爾辛基 (HEL)", desc: "抵達機場，準備轉機。", location: "Helsinki Airport" },
      { type: "rest", time: "16:00", title: "Taobao Lounge 休息", desc: "費用：HKD 130/人。休息充電，調整時差。", location: "Helsinki Airport Lounge" },
      { type: "flight", time: "19:40", title: "飛往羅瓦涅米 (HEL->RVN)", desc: "費用 HKD 1,520 (已付)。21:05 抵達。", location: "Rovaniemi Airport" },
      { type: "hotel", time: "22:00", title: "入住 Arctic Resort Delight", desc: "已付。3房/3晚。這幾天住這裡！可在附近散步適應天氣。", location: "Arctic Resort Delight" }
    ]
  },
  {
    day: 2,
    date: "2/15 (日)",
    location: "羅瓦涅米 (分組活動)",
    weather: "cloud",
    temp: "-12°C",
    activities: [
      { type: "food", time: "08:30", title: "酒店早餐", desc: "吃飽飽準備出發！" },
      { type: "activity", time: "09:00", title: "【年輕人】冰瀑健行", desc: "Frozen Waterfall Hiking (USD 162/人)。GetYourGuide 預訂，含接送。", location: "Korouoma Canyon" },
      { type: "activity", time: "09:00", title: "【父母】博物館與市區", desc: "Arktikum 博物館 / 市中心散步 / 桑拿 (HKD 166-460)。", location: "Arktikum" },
      { type: "rest", time: "16:00", title: "回酒店休息 / 桑拿", desc: "享受芬蘭浴放鬆一下。" },
      { type: "food", time: "18:00", title: "晚餐 & 超市採買", desc: "預算約 HKD 200。補給零食飲料。", location: "K-Citymarket Rovaniemi" },
      { type: "aurora", time: "晚上", title: "追極光 (視天氣)", desc: "免費在酒店附近觀賞，或參加 Tour。", location: "Arctic Resort Delight" }
    ]
  },
  {
    day: 3,
    date: "2/16 (一)",
    location: "羅瓦涅米 (破冰船)",
    weather: "sun",
    temp: "-15°C",
    activities: [
      { type: "transport", time: "09:45", title: "前往遊客中心", desc: "Call Uber/Bolt 或請房東叫車。前往 Tourist Information Center。" },
      { type: "activity", time: "10:00", title: "Polar Explorer 破冰船", desc: "EUR 470/人 (+30午餐)。含冰海漂浮體驗 (瑞典側)。重要：記得帶替換衣物！", location: "Polar Explorer Icebreaker" },
      { type: "food", time: "18:35", title: "晚餐 & 超市", desc: "預算約 HKD 200。" },
      { type: "aurora", time: "晚上", title: "追極光", desc: "期待極光女神出現！" }
    ]
  },
  {
    day: 4,
    date: "2/17 (二)",
    location: "羅瓦涅米 -> 伊納里 (Inari)",
    weather: "snow",
    temp: "-18°C",
    activities: [
      { type: "transport", time: "10:30", title: "前往 K-Market 寄放行李", desc: "Call Uber/Bolt。行李寄放 EUR 5/件。", location: "K-Market Toriportti" },
      { type: "sight", time: "11:15", title: "聖誕老人市區辦公室", desc: "Santa Claus City Office. 免費入場。合照 €35 (一張) / €25 (兩張以上)。" },
      { type: "sight", time: "13:00", title: "聖誕老人村 (Santa Claus Village)", desc: "搭車前往 (13mins)。跨越北極圈線！必去郵局寄明信片。", location: "Santa Claus Village" },
      { type: "transport", time: "17:20", title: "巴士前往 Inari", desc: "EUR 63.2/人。約 4.5 小時車程。記得在超市先買好晚餐和隔天早餐！", location: "Rovaniemi Bus Station" },
      { type: "hotel", time: "22:00", title: "入住 Panorama Cabin", desc: "Sauna Suite。已付，3晚。這裡極光機會高！", location: "Panorama Cabin Inari" }
    ]
  },
  {
    day: 5,
    date: "2/18 (三)",
    location: "伊納里 (Inari)",
    weather: "snow",
    temp: "-20°C",
    activities: [
      { type: "rest", time: "10:00", title: "補眠 & 換房/Check-in", desc: "Mon and KH check out/in. 準備午餐。" },
      { type: "activity", time: "13:30", title: "馴鹿雪橇 (Reindeer Ride)", desc: "EUR 168/人。2人一台。體驗當地薩米文化。", location: "Visit Inari" },
      { type: "food", time: "18:00", title: "晚餐", desc: "約 HKD 200。" },
      { type: "aurora", time: "20:00", title: "極光狩獵 (Aurora Hunting by Car)", desc: "EUR 169/人。4小時車程追光。視天氣決定參加。", location: "Inari Aurora Spot" }
    ]
  },
  {
    day: 6,
    date: "2/19 (四)",
    location: "伊納里 (Inari)",
    weather: "snow",
    temp: "-18°C",
    activities: [
      { type: "activity", time: "11:30", title: "哈士奇雪橇 (Husky Safari)", desc: "EUR 198/人。3小時體驗，2人一台。超刺激！", location: "Visit Inari Safaris" },
      { type: "rest", time: "14:30", title: "酒店休息 / 午餐", desc: "好好休息，恢復體力。" },
      { type: "aurora", time: "20:30", title: "雪地摩托車追極光", desc: "Aurora camp by snowmobile. EUR 183/人。3小時。", location: "Inari" }
    ]
  },
  {
    day: 7,
    date: "2/20 (五)",
    location: "Inari -> 基爾肯內斯 (Kirkenes)",
    weather: "cloud",
    temp: "-10°C",
    activities: [
      { type: "transport", time: "08:00", title: "包車前往 Kirkenes", desc: "EUR 393/車 (4人)。跨境進入挪威！", location: "Kirkenes" },
      { type: "hotel", time: "11:30", title: "入住 Scandic Hotel", desc: "HKD 1,688/房。已付，1晚。", location: "Scandic Kirkenes" },
      { type: "activity", time: "13:00", title: "冰釣 (Ice Fishing) - 選購", desc: "NOK 3100/人。Snow Hotel (3.5hrs, 含接送)。", location: "Snowhotel Kirkenes" },
      { type: "food", time: "18:00", title: "帝王蟹吃到飽 (King Crab Safari)", desc: "NOK 2800/人。雪地摩托車+抓蟹+吃到飽大餐！必吃行程。", location: "Kirkenes King Crab Safari" }
    ]
  },
  {
    day: 8,
    date: "2/21 (六)",
    location: "Kirkenes -> 特羅姆瑟 (Tromsø)",
    weather: "sun",
    temp: "-5°C",
    activities: [
      { type: "sight", time: "10:00", title: "市內自由活動", desc: "享受最後的 Kirkenes 時光。" },
      { type: "transport", time: "11:45", title: "前往碼頭", desc: "搭 Bus (10mins) 或 Taxi (5mins)。" },
      { type: "transport", time: "12:30", title: "搭乘 Havila Voyages 郵輪", desc: "EUR 185 或 222/人。前往 Tromsø。船上包膳食，欣賞峽灣風光。", location: "Havila Voyages Kirkenes" }
    ]
  },
  {
    day: 9,
    date: "2/22 (日)",
    location: "郵輪 -> 特羅姆瑟",
    weather: "cloud",
    temp: "-3°C",
    activities: [
      { type: "transport", time: "23:45", title: "抵達 Tromsø", desc: "深夜抵達。", location: "Tromsø Terminal" },
      { type: "hotel", time: "23:55", title: "入住 Thon Hotel Polar", desc: "HKD 2,006/房。已付，1晚。", location: "Thon Hotel Polar" }
    ]
  },
  {
    day: 10,
    date: "2/23 (一)",
    location: "特羅姆瑟 -> 赫爾辛基",
    weather: "snow",
    temp: "0°C",
    activities: [
      { type: "flight", time: "18:45", title: "飛往赫爾辛基", desc: "HKD 1,620/人。已付。21:35 抵達 HEL。", location: "Tromsø Airport" },
      { type: "hotel", time: "22:30", title: "入住 Scandic Helsinki Airport", desc: "HKD 1,015/房。就在機場旁，方便明天搭機。", location: "Scandic Helsinki Airport" }
    ]
  },
  {
    day: 11,
    date: "2/24 (二)",
    location: "赫爾辛基 -> 香港",
    weather: "sun",
    temp: "2°C",
    activities: [
      { type: "flight", time: "16:35", title: "飛返香港 (HKG)", desc: "HKD 6,600/人。結束美好旅程！", location: "Helsinki Airport" }
    ]
  }
];

const infoData = {
  tips: [
    "每日只安排 1-2 個重點活動，保留體力。",
    "下載翻譯 App 方便父母溝通。",
    "隨身攜帶暖暖包。",
    "洋蔥式穿搭：發熱衣 + 輕羽絨 + 保暖層 + 防風防水外層。",
    "鞋子：Gore-tex 長筒 + 防滑底。"
  ],
  photo: [
    "相機保暖：用舊襪子包住機身，只露鏡頭。",
    "多帶備用電池 (低溫耗電快)。",
    "極光較暗/流水般：ISO 320-640 + 慢快門 20秒。",
    "極光較亮/跳動：ISO 1600-3200 + 快門 4-8秒。",
    "鏡頭：廣角 (11-24mm) 拍大景，魚眼更有趣。"
  ],
  emergency: [
    { name: "芬蘭緊急電話", no: "112" },
    { name: "外交部緊急聯絡", no: "+886-800-085-095" }
  ]
};

// --- 2. 元件設計 ---

const HighlightText = ({ text }) => {
  if (!text) return null;
  // 針對費用、重要提示進行亮顯
  const regex = /(HKD [\d,]+|EUR [\d,]+|NOK [\d,]+|USD [\d,]+|已付|免費|Call uber|Optional|必去|必吃)/gi;
  
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.match(regex)) {
          const isMoney = part.match(/(HKD|EUR|NOK|USD)/);
          const isPaid = part.match(/已付|免費/);
          const color = isPaid ? "bg-green-100 text-green-700" : (isMoney ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600");
          return <span key={i} className={`font-bold px-1 rounded mx-0.5 text-xs ${color}`}>{part}</span>;
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
  if (act.type === 'aurora') { Icon = Snowflake; style = "border-l-4 border-teal-400 bg-teal-50 shadow-lg shadow-teal-100/50"; }
  if (act.type === 'activity' || act.type === 'sight') { Icon = Camera; style = "border-l-4 border-pink-400 bg-pink-50"; }
  if (act.type === 'transport') { Icon = Train; style = "border-l-4 border-green-400 bg-green-50"; }

  const handleNav = () => {
    const query = act.location || act.title;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className={`p-4 mb-3 rounded-xl shadow-sm ${style} relative group transition-all active:scale-[0.98]`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="bg-white/90 px-2 py-0.5 rounded-md text-xs font-black text-gray-500 shadow-sm font-mono">{act.time}</span>
          <Icon size={16} className="text-gray-600 opacity-70" />
        </div>
        {act.location && (
          <button onClick={handleNav} className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow hover:bg-blue-600">
            <Navigation size={10} /> 導航
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

// --- 3. 主介面 ---
export default function App() {
  const [tab, setTab] = useState('trip'); // trip, info, budget
  
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFF5F7] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 rounded-b-3xl shadow-sm border-b border-pink-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">北歐極光旅</h1>
          <p className="text-xs text-pink-400 font-bold tracking-wider">FINLAND & NORWAY 2026</p>
        </div>
        <div className="text-3xl animate-bounce">🦌</div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {tab === 'trip' && (
          <div className="space-y-8 animate-fadeIn">
            {tripData.map((day) => (
              <div key={day.day}>
                <div className="flex items-baseline gap-2 mb-3 pl-1">
                  <span className="text-3xl font-black text-gray-800 font-mono">Day {day.day}</span>
                  <span className="text-sm font-bold text-pink-500">{day.date}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-auto">{day.location.split(" ")[0]}</span>
                </div>
                
                <div className="space-y-3">
                  {day.activities.map((act, i) => (
                    <ActivityCard key={i} act={act} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'info' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Tips Card */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-yellow-100">
              <h3 className="font-bold text-lg text-yellow-600 mb-3 flex items-center gap-2">
                <Info size={20} /> 貼心建議
              </h3>
              <ul className="space-y-2">
                {infoData.tips.map((t, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-400">●</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Photography Card */}
            <div className="bg-slate-800 p-5 rounded-3xl shadow-sm text-white">
              <h3 className="font-bold text-lg text-teal-300 mb-3 flex items-center gap-2">
                <Camera size={20} /> 追蹤極光小錦囊
              </h3>
              <ul className="space-y-3">
                {infoData.photo.map((p, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2 border-b border-gray-700 pb-2 last:border-0">
                    <span>📷</span> {p}
                  </li>
                ))}
              </ul>
            </div>

             {/* Emergency */}
             <div className="bg-red-50 p-5 rounded-3xl shadow-sm border border-red-100">
              <h3 className="font-bold text-lg text-red-600 mb-3 flex items-center gap-2">
                <Phone size={20} /> 緊急聯絡
              </h3>
              {infoData.emergency.map((em, i) => (
                <div key={i} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">{em.name}</span>
                  <a href={`tel:${em.no}`} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Call</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'budget' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 text-center">
              <Wallet className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-gray-800">總預算概覽</h2>
              <p className="text-xs text-gray-400 mb-4">(不含已付項目)</p>
              <div className="text-4xl font-black text-green-600 font-mono">HKD 45k</div>
              <p className="text-xs text-gray-500 mt-2">每人預估上限</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-3 text-gray-700">開支明細 (參考)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>交通總開支</span>
                  <span className="font-bold">HKD 12,730</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>住宿總開支</span>
                  <span className="font-bold">HKD 5,504</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>活動預算</span>
                  <span className="font-bold">HKD 18,000</span>
                </div>
                 <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span>膳食 (每日500)</span>
                  <span className="font-bold">~HKD 5,000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-white p-2 flex justify-between items-center z-50 px-6">
        <button onClick={() => setTab('trip')} className={`flex flex-col items-center gap-1 transition-all ${tab === 'trip' ? 'text-pink-500 scale-110' : 'text-gray-300'}`}>
          <Calendar size={24} fill={tab === 'trip' ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">行程</span>
        </button>
        <button onClick={() => setTab('info')} className={`flex flex-col items-center gap-1 transition-all ${tab === 'info' ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
          <Info size={24} fill={tab === 'info' ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">攻略</span>
        </button>
        <button onClick={() => setTab('budget')} className={`flex flex-col items-center gap-1 transition-all ${tab === 'budget' ? 'text-green-500 scale-110' : 'text-gray-300'}`}>
          <Wallet size={24} fill={tab === 'budget' ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">預算</span>
        </button>
      </nav>
    </div>
  );
}