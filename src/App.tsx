import React, { useState, useEffect } from 'react';
import { CoffeeIcon, CalendarIcon, SettingsIcon, InfoIcon, CheckIcon } from './components/Icons';
import { OrderForm, MenuItem } from './components/OrderForm';
import { OrderSummaryDashboard, Order } from './components/OrderSummaryDashboard';
import { OrderList } from './components/OrderList';

// --- 預設精挑細選的豐盛菜單（當 GAS 無回應或處於示範模式時使用） ---
export const DEFAULT_MENU: MenuItem[] = [
  { name: "小葉茉莉綠茶", price: 35, category: "經典原茶", description: "新鮮茉莉花與翠綠茶葉反覆窨製，香氣清醇，久泡不落俗。" },
  { name: "手採阿里山金萱", price: 40, category: "經典原茶", description: "手採高山金萱，天然淡淡奶香與微桂花蜜香，滑順細柔。" },
  { name: "慢焙凍頂鐵觀音", price: 35, category: "經典原茶", description: "遵古法重火烘焙，茶湯呈琥珀色，醇厚飽滿且帶熟果香。" },
  { name: "英倫莊園極品紅茶", price: 40, category: "經典原茶", description: "嚴選阿薩姆莊園大葉紅茶，茶湯紅艷鮮朗，麥牙香氣十足。" },
  { name: "島嶼白桃鮮烏龍", price: 45, category: "經典原茶", description: "完熟蜜桃果香揉合清香型烏龍茶，果甜與茶香在舌尖曼舞。" },

  { name: "黑糖厚珍鮮奶茶", price: 65, category: "醇厚鮮奶", description: "慢火柴熬香濃珍珠，佐優質鮮乳與斯里蘭卡紅茶，完美琥珀紋。" },
  { name: "炭焙鐵觀音厚拿鐵", price: 60, category: "醇厚鮮奶", description: "炭焙觀音烏龍的鐵骨柔情，遇上溫潤小農鮮乳，乳香茶香融洽。" },
  { name: "極品小芋圓奶茶", price: 55, category: "醇厚鮮奶", description: "細緻Q彈地瓜圓與芋圓，搭配大眾最愛香濃英式奶茶，口感極佳。" },
  { name: "日式宇治濃抹茶拿鐵", price: 65, category: "醇厚鮮奶", description: "正宗日本宇治抹茶粉手刷，微苦回甘茶韻與厚實奶泡，層次感突出。" },

  { name: "南島埔里百香雙Q", price: 55, category: "極品鮮果", description: "新鮮埔里現挖百香果汁，搭配脆口椰果及椰香珍珠，酸甜解膩雙重足。" },
  { name: "鮮榨紅鑽葡萄柚綠", price: 65, category: "極品鮮果", description: "爆量新鮮紅葡萄柚果肉，搭配翡翠綠茶與話梅，完美酸甜黃金比例。" },
  { name: "香橙爆汁金萱", price: 60, category: "極品鮮果", description: "現榨陽光香橙原汁，中和金萱茶澀味，滿滿維他命C與花蜜甜香。" },
  { name: "手搗屏東綠檸翠茶", price: 50, category: "極品鮮果", description: "手搗屏東綠檸檬釋放皮脂香氣，融合清香綠茶，清新爽快首選。" },

  { name: "乾柴雙福紅棗桂圓茶", price: 55, category: "溫潤暖冬", description: "柴燒龍眼乾肉與大紅棗低溫慢燉，甘美滋潤，手腳冰冷救星。" },
  { name: "手炒手搗黑芝麻燕麥拿鐵", price: 65, category: "溫潤暖冬", description: "高鈣研磨黑芝麻與厚實燕麥奶，醇郁穀物堅果香氣，香濃溫飽。" },
  { name: "老薑母黑糖燕麥奶", price: 60, category: "溫潤暖冬", description: "辛香老薑現榨融合手炒黑糖、穀物燕麥奶，香辣回甘極致祛寒。" }
];

// --- 預設展示訂單 ---
const DEFAULT_DEMO_ORDERS: Order[] = [
  { orderId: "demo-1", timestamp: "10:15", name: "王大明", drink: "黑糖厚珍鮮奶茶", sugar: "半糖", ice: "少冰", quantity: 2, totalPrice: 130 },
  { orderId: "demo-2", timestamp: "10:32", name: "張愛莉", drink: "鮮榨紅鑽葡萄柚綠", sugar: "微糖", ice: "去冰", quantity: 1, totalPrice: 65 },
  { orderId: "demo-3", timestamp: "10:48", name: "李科長", drink: "手採阿里山金萱", sugar: "無糖", ice: "溫熱", quantity: 1, totalPrice: 40 },
  { orderId: "demo-4", timestamp: "11:15", name: "陳珊珊", drink: "南島埔里百香雙Q", sugar: "七分糖", ice: "微冰", quantity: 3, totalPrice: 165 },
];

const MODE_LOCAL = "LOCAL";
const MODE_GAS = "GAS";

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function App() {
  const [appMode, setAppMode] = useState(MODE_LOCAL);
  const [gasUrl, setGasUrl] = useState(() => {
    return localStorage.getItem("gas_drink_api_url") || "https://script.google.com/macros/s/AKfycby6-4ewTd4b-9BqYnTOPWt4vgqIKo7hR-VFrvYVhJ99FUk_OQ4uCSQDNuNtJNoWTN_8/exec";
  });
  const [showSettings, setShowSettings] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // 臨時 GAS 輸入框狀態
  const [tempUrlInput, setTempUrlInput] = useState(gasUrl);

  // 彈出 Toast 提示
  const showToastMessage = (message: string, type: 'success' | 'warning' | 'error' | 'info' = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  // 清除 Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 初始化載入：如果 localStorage 內有 GAS 網址，自動設置為 GAS 模式並嘗試抓取
  useEffect(() => {
    const storedUrl = localStorage.getItem("gas_drink_api_url") || "https://script.google.com/macros/s/AKfycby6-4ewTd4b-9BqYnTOPWt4vgqIKo7hR-VFrvYVhJ99FUk_OQ4uCSQDNuNtJNoWTN_8/exec";
    if (storedUrl && storedUrl.trim().startsWith("http")) {
      setAppMode(MODE_GAS);
      fetchDataFromSource(storedUrl);
    } else {
      // 首次載入使用 LocalStorage 資料或預設訂單
      setAppMode(MODE_LOCAL);
      const cachedOrders = localStorage.getItem("local_drink_orders");
      if (cachedOrders) {
        setOrders(JSON.parse(cachedOrders));
      } else {
        setOrders(DEFAULT_DEMO_ORDERS);
        localStorage.setItem("local_drink_orders", JSON.stringify(DEFAULT_DEMO_ORDERS));
      }
      showToastMessage("已載入本機示範資料，隨時可以使用！", "info");
    }
  }, []);

  // 核心資料拉取常式
  const fetchDataFromSource = async (targetUrl = gasUrl) => {
    if (!targetUrl || !targetUrl.trim().startsWith("http")) {
      showToastMessage("請先設定有效的 GAS API 網址！", "error");
      setAppMode(MODE_LOCAL);
      return;
    }

    setLoading(true);
    try {
      // 發送 GET 請求
      const response = await fetch(targetUrl, {
        method: "GET",
        mode: "cors"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.menu && result.menu.length > 0) {
        setMenu(result.menu);
      }
      
      if (result.orders) {
        setOrders(result.orders);
        showToastMessage("成功同步線上 Google 試算表訂單！", "success");
      } else {
        setOrders([]);
        showToastMessage("取得資料，今天目前尚無訂單。", "info");
      }
      setAppMode(MODE_GAS);
    } catch (error) {
      console.error("Fetch API error:", error);
      showToastMessage("無法連線至您的 GAS：將自動切換至離線示範模式。", "error");
      
      // 回歸 Local
      setAppMode(MODE_LOCAL);
      const cachedOrders = localStorage.getItem("local_drink_orders");
      if (cachedOrders) {
        setOrders(JSON.parse(cachedOrders));
      } else {
        setOrders(DEFAULT_DEMO_ORDERS);
      }
    } finally {
      setLoading(false);
    }
  };

  // 儲存 GAS 設定
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempUrlInput.trim();
    if (trimmed === "") {
      localStorage.removeItem("gas_drink_api_url");
      setGasUrl("");
      setAppMode(MODE_LOCAL);
      // 載入快取 Local
      const cachedOrders = localStorage.getItem("local_drink_orders") || JSON.stringify(DEFAULT_DEMO_ORDERS);
      setOrders(JSON.parse(cachedOrders));
      showToastMessage("已清除設定，切換回本機示範模式", "info");
      setShowSettings(false);
    } else if (trimmed.startsWith("http")) {
      localStorage.setItem("gas_drink_api_url", trimmed);
      setGasUrl(trimmed);
      setAppMode(MODE_GAS);
      showToastMessage("設定已儲存！正在連接後端...", "info");
      setShowSettings(false);
      fetchDataFromSource(trimmed);
    } else {
      showToastMessage("連結格式不正確，必須以 http:// 或 https:// 開頭！", "error");
    }
  };

  // 測試連線
  const handleTestConnection = async () => {
    if (!tempUrlInput.trim().startsWith("http")) {
      showToastMessage("請輸入正確的 HTTP / HTTPS 網址！", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(tempUrlInput, { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (data.menu) {
          showToastMessage("連線測試成功！後端通訊精準無誤！", "success");
        } else {
          showToastMessage("已成功連上網址，但似乎非正確的飲料系統資料結構。", "warning");
        }
      } else {
        showToastMessage(`連線被拒：HTTP 狀態碼 ${res.status}`, "error");
      }
    } catch (err) {
      showToastMessage("連線失敗，請檢查網路、網址或 CORS 設定！", "error");
    } finally {
      setLoading(false);
    }
  };

  // 遞交或更新訂單之處理邏輯
  const handleOrderSubmit = async (formData: Omit<Order, 'timestamp'> & { orderId?: string }) => {
    setLoading(true);
    const actionType = formData.orderId ? "update" : "create";
    
    const payload = {
      action: actionType,
      data: formData
    };

    if (appMode === MODE_GAS && gasUrl) {
      try {
        const res = await fetch(gasUrl, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });

        const resJson = await res.json();
        if (resJson.status === "success" || resJson.success) {
          showToastMessage(formData.orderId ? "今日訂單已修改成功！" : "恭喜點單完成！下午茶已在路上 ☕️", "success");
          // 成功後，重新拉取最新資料同步
          await fetchDataFromSource();
          setEditingOrder(null);
        } else {
          throw new Error(resJson.message || "GAS 伺服器回傳未明錯誤");
        }
      } catch (err) {
        console.error(err);
        showToastMessage("傳送失敗：將為您暫時保存在本機快取中。", "warning");
        saveToLocalFallback(formData, actionType);
      } finally {
        setLoading(false);
      }
    } else {
      // 本機 Local Fallback 
      setTimeout(() => {
        saveToLocalFallback(formData, actionType);
        setLoading(false);
      }, 350);
    }
  };

  // 本機快取修改與存檔
  const saveToLocalFallback = (formData: Omit<Order, 'timestamp'> & { orderId?: string }, actionType: string) => {
    let updatedOrders = [...orders];
    if (actionType === "create") {
      const newOrder: Order = {
        ...formData,
        orderId: "local-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
      };
      updatedOrders.unshift(newOrder);
      showToastMessage("本機新增成功！(離線示範模式)", "success");
    } else {
      updatedOrders = updatedOrders.map(o => o.orderId === formData.orderId ? { ...o, ...formData } : o);
      showToastMessage("本機修改成功！(離線示範模式)", "success");
    }
    setOrders(updatedOrders);
    localStorage.setItem("local_drink_orders", JSON.stringify(updatedOrders));
    setEditingOrder(null);
  };

  // 刪除訂單
  const handleOrderDelete = async (orderId: string) => {
    if (!confirm("確定要取消/刪除這筆美味的訂單嗎？")) return;
    setLoading(true);

    const payload = {
      action: "delete",
      data: { orderId }
    };

    if (appMode === MODE_GAS && gasUrl) {
      try {
        const res = await fetch(gasUrl, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });
        const resJson = await res.json();
        if (resJson.status === "success" || resJson.success) {
          showToastMessage("已成功刪除該筆訂單！", "success");
          await fetchDataFromSource();
          if (editingOrder && editingOrder.orderId === orderId) {
            setEditingOrder(null);
          }
        } else {
          throw new Error(resJson.message || "刪除失敗");
        }
      } catch (err) {
        console.error(err);
        showToastMessage("透過 API 刪除失敗，改於本機中移除其記錄。", "warning");
        deleteFromLocal(orderId);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        deleteFromLocal(orderId);
        setLoading(false);
      }, 200);
    }
  };

  const deleteFromLocal = (orderId: string) => {
    const updated = orders.filter(o => o.orderId !== orderId);
    setOrders(updated);
    localStorage.setItem("local_drink_orders", JSON.stringify(updated));
    showToastMessage("已從快取移除該筆訂單", "success");
    if (editingOrder && editingOrder.orderId === orderId) {
      setEditingOrder(null);
    }
  };

  // 點擊編輯
  const handleEditRequest = (order: Order) => {
    setEditingOrder(order);
    const element = document.getElementById("order-form-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Header 橫幅 */}
      <header className="bg-gradient-to-r from-tea-900 via-[#5F4324] to-tea-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <div className="absolute w-[300px] h-[300px] bg-tea-300 rounded-full blur-[70px] -top-20 -left-10 animate-pulse"></div>
          <div className="absolute w-[400px] h-[400px] bg-tea-400 rounded-full blur-[100px] -bottom-40 -right-20 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-tea-100 to-tea-200 text-tea-900 rounded-2xl flex items-center justify-center shadow-lg border-2 border-tea-100/30 shrink-0 transform hover:scale-110 transition-transform duration-300">
              <CoffeeIcon className="w-8 h-8 text-tea-800" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight font-sans text-[#FFF8F0] flex items-center gap-2">
                茶巡 <span className="text-xs md:text-sm bg-tea-500/80 text-tea-50 px-2 py-0.5 rounded-full font-normal tracking-wider">下午茶點購系統</span>
              </h1>
              <p className="text-stone-300 text-xs md:text-sm mt-1 flex items-center gap-1.5 font-light">
                <CalendarIcon className="w-3.5 h-3.5 text-tea-300 inline" />
                今日點單統計與即時點單記錄
              </p>
            </div>
          </div>

          {/* 右側操作與狀態列 */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* 狀態標籤 */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm transition-all duration-300 ${
              appMode === MODE_GAS 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${appMode === MODE_GAS ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              {appMode === MODE_GAS ? "GAS 試算表同步中" : "離線示範/本機快取"}
            </div>

            {/* 重新整理 */}
            {appMode === MODE_GAS && (
              <button 
                onClick={() => fetchDataFromSource()}
                disabled={loading}
                className="p-2 bg-[#FAF8F5]/10 hover:bg-[#FAF8F5]/20 text-tea-50 disabled:text-tea-300 rounded-xl transition duration-200 border border-white/10"
                title="重新整理訂單隨時同步"
                id="btn-refresh"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            )}

            {/* 設定 API 齒輪鈕 */}
            <button 
              onClick={() => {
                setTempUrlInput(gasUrl);
                setShowSettings(!showSettings);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition duration-300 border shadow ${
                showSettings 
                  ? "bg-tea-200 text-tea-900 border-tea-100" 
                  : "bg-[#FAF8F5]/15 hover:bg-[#FAF8F5]/25 text-tea-50 hover:text-white border-white/20"
              }`}
              id="btn-toggle-settings"
            >
              <SettingsIcon className={`w-4 h-4 ${showSettings ? 'rotate-45' : ''} transition-transform duration-300`} />
              設定後端
            </button>
          </div>
        </div>

        {/* 下拉式設定面板 */}
        {showSettings && (
          <div className="border-t border-tea-800/65 bg-[#4F361C]/95 text-[#FFF8F0] px-4 py-5 md:py-6 transition-all duration-300 shadow-inner">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-bold tracking-wider text-tea-200 uppercase mb-3 flex items-center gap-2">
                <InfoIcon className="w-4 h-4 text-tea-300" />
                【系統說明與 Google Apps Script API 串接】
              </h3>
              
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                本系統支援透過 Google Apps Script (GAS) 將點單資料寫入特定的 Google 試算表中，達到跨設備多人共同即時統計的效果。
                若未設定 GAS 網址，系統亦會自動啟動<strong>「本機離線示範模式」</strong>（利用瀏覽器 LocalStorage 儲存），不論填寫、移除皆可流暢執行。若您雙擊此檔案開啟，填妥網址後即刻暢連。
              </p>

              <form onSubmit={handleSaveSettings} className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="flex-1 relative">
                  <input 
                    type="url"
                    value={tempUrlInput}
                    onChange={(e) => setTempUrlInput(e.target.value)}
                    placeholder="請貼入您的 Google Apps Script 部署 URL (https://script.google.com/macros/s/.../exec)"
                    className="w-full bg-[#36210F] text-stone-100 placeholder-stone-500 px-4 py-2.5 rounded-xl text-xs font-mono border border-tea-800/40 focus:outline-none focus:ring-2 focus:ring-tea-400 focus:border-transparent"
                    id="input-gas-url"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    type="button" 
                    onClick={handleTestConnection}
                    disabled={loading}
                    className="px-3.5 py-2.5 bg-stone-700 hover:bg-stone-600 active:bg-stone-800 disabled:opacity-50 text-xs font-bold rounded-xl transition duration-150 border border-stone-600"
                    id="btn-test-conn"
                  >
                    測試連線
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-tea-500 hover:bg-tea-400 text-white text-xs font-bold rounded-xl shadow-md transition duration-150"
                    id="btn-save-settings"
                  >
                    確認儲存
                  </button>
                </div>
              </form>
              
              {gasUrl && (
                <div className="mt-3 text-[11px] text-[#E5DCD0]/80 font-mono tracking-tight flex items-center justify-between">
                  <span className="truncate block max-w-[85%]">目前已啟用 API 聯結：<span className="text-tea-200">{gasUrl}</span></span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setTempUrlInput("");
                      localStorage.removeItem("gas_drink_api_url");
                      setGasUrl("");
                      setAppMode(MODE_LOCAL);
                      const cachedOrders = localStorage.getItem("local_drink_orders") || JSON.stringify(DEFAULT_DEMO_ORDERS);
                      setOrders(JSON.parse(cachedOrders));
                      showToastMessage("已重設為本機示範資料", "info");
                      setShowSettings(false);
                    }}
                    className="text-red-355 text-red-400 font-bold underline"
                  >
                    清空設定
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 全域 Loading Bar / 轉圈遮罩 */}
      {loading && (
        <div className="bg-tea-150/40 h-1.5 w-full relative overflow-hidden">
          <div className="h-full bg-tea-600 rounded animate-pulse w-1/3 absolute left-0 top-0" style={{ animation: 'shimmer 1.5s infinite linear' }}></div>
          <style>{`
            @keyframes shimmer {
              0% { left: -30%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      )}

      {/* Toast 通知小卡 */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm pointer-events-auto transform translate-y-0 transition-transform duration-300">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border ${
            toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
            toast.type === "warning" ? "bg-amber-50 text-amber-800 border-amber-200" :
            toast.type === "error" ? "bg-rose-50 text-rose-800 border-rose-200" :
            "bg-sky-50 text-stone-800 border-sky-100"
          }`}>
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && <div className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]"><CheckIcon className="w-2.5 h-2.5" /></div>}
              {toast.type === "error" && <div className="w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">!</div>}
              {toast.type === "warning" && <div className="w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">!</div>}
              {toast.type === "info" && <div className="w-4 h-4 bg-sky-500 text-white rounded-full flex items-center justify-center text-[10px]"><InfoIcon className="w-3 h-3" /></div>}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 主要排版區 */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* 左半邊：OrderForm 元件容器 (佔 5 Column) */}
        <section id="order-form-container" className="xl:col-span-5 h-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-tea-100/70 hover:shadow-md transition duration-300 space-y-6">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h2 className="text-lg md:text-xl font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2.5 h-5 bg-tea-600 rounded-full inline-block"></span>
                {editingOrder ? "修改今日點單 🧋" : "填寫下午茶訂單 ✨"}
              </h2>
              {editingOrder && (
                <button 
                  onClick={() => {
                    setEditingOrder(null);
                    showToastMessage("已取消編輯狀態", "info");
                  }}
                  className="text-xs text-stone-400 hover:text-stone-600 underline font-medium"
                  id="btn-cancel-edit"
                >
                  取消修改
                </button>
              )}
            </div>

            <OrderForm 
              onSubmit={handleOrderSubmit} 
              initialData={editingOrder} 
              menu={menu}
              showToastMessage={showToastMessage}
            />

          </div>
        </section>

        {/* 右半邊：今日點單統計 / 今日訂單列表 (佔 7 Column) */}
        <section className="xl:col-span-7 space-y-8">
          
          {/* 群組統計分析看板 */}
          <OrderSummaryDashboard orders={orders} />

          {/* 訂單明細清單 (OrderList) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-tea-100/70 hover:shadow-md transition duration-300">
            <OrderList 
              orders={orders} 
              onEdit={handleEditRequest} 
              onDelete={handleOrderDelete} 
              editingOrderId={editingOrder ? (editingOrder.orderId || null) : null} 
            />
          </div>
        </section>
      </main>

      {/* 頁尾 */}
      <footer className="bg-stone-950 text-stone-500 text-xs py-8 border-t border-stone-900 text-center mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans font-medium tracking-wider text-stone-400">茶巡・OFFICE TEA-TIME COMPANION</p>
          <p className="text-[11px] font-light">
            本網頁已升級為正式 React + Vite + TypeScript 專案架構，完全支援高效率靜態編譯打包與靈活的 GAS API 線上同步。
          </p>
          <p className="text-[10px] text-stone-600 mt-2">© 2026 茶巡飲料訂購系統. 採用 React + Tailwind 設計</p>
        </div>
      </footer>

    </div>
  );
}
