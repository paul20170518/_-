import React, { useState, useEffect, useMemo } from 'react';
import { CoffeeIcon, UserIcon, SearchIcon, MinusIcon, PlusIcon, CheckIcon } from './Icons';
import { Order } from './OrderSummaryDashboard';

export interface MenuItem {
  name: string;
  price: number;
  category: string;
  description?: string;
}

// 甜度與冰塊選項
export const SUGAR_OPTIONS = [
  { label: "無糖 (0%)", value: "無糖" },
  { label: "微糖 (30%)", value: "微糖" },
  { label: "半糖 (50%)", value: "半糖" },
  { label: "八分糖 (80%)", value: "七分糖" },
  { label: "正常糖 (100%)", value: "正常糖" }
];

export const ICE_OPTIONS = [
  { label: "去冰 (0%)", value: "去冰" },
  { label: "微冰 (30%)", value: "微冰" },
  { label: "少冰 (70%)", value: "少冰" },
  { label: "正常冰", value: "正常冰" },
  { label: "溫熱", value: "溫熱" }
];

interface OrderFormProps {
  onSubmit: (formData: Omit<Order, 'timestamp'> & { orderId?: string }) => void;
  initialData: Order | null;
  menu: MenuItem[];
  showToastMessage: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export function OrderForm({ onSubmit, initialData, menu = [], showToastMessage }: OrderFormProps) {
  const [name, setName] = useState("");
  const [selectedDrink, setSelectedDrink] = useState("");
  const [sugar, setSugar] = useState("半糖");
  const [ice, setIce] = useState("少冰");
  const [quantity, setQuantity] = useState(1);
  const [rememberName, setRememberName] = useState(true);

  // 選單搜尋與類別分類過濾
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("熱選 ⭐️");

  // 列出所有不重複類別
  const categories = useMemo(() => {
    const list = ["熱選 ⭐️"];
    menu.forEach(item => {
      if (item.category && !list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [menu]);

  // 當切換到編輯模式或取回初始資料時
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSelectedDrink(initialData.drink || "");
      setSugar(initialData.sugar || "半糖");
      setIce(initialData.ice || "少冰");
      setQuantity(initialData.quantity || 1);
    } else {
      // 預設模式：若記住姓名, 自動載入先前輸入姓名
      const cachedName = localStorage.getItem("last_ordered_user_name");
      if (cachedName) {
        setName(cachedName);
      }
      // 預設選取經典的第一項
      if (menu.length > 0) {
        // 預選最熱門茶
        setSelectedDrink(menu[0].name);
      }
      setSugar("半糖");
      setIce("少冰");
      setQuantity(1);
    }
  }, [initialData, menu]);

  // 取得當前選定飲料的單價與描述
  const currentDrinkInfo = useMemo(() => {
    return menu.find(item => item.name === selectedDrink) || { price: 40, description: "精心調配特色茶飲。" };
  }, [selectedDrink, menu]);

  // 計算總計金額
  const liveTotalPrice = useMemo(() => {
    return currentDrinkInfo.price * quantity;
  }, [currentDrinkInfo, quantity]);

  // 過濾後的飲品卡片展示
  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (selectedCategory === "熱選 ⭐️") {
        // 預設第一項和一些珍珠鮮奶茶百香雙Q珍珠鮮鮮果類作為精選熱賣
        return matchSearch && (item.name.includes("珍珠") || item.name.includes("茉莉") || item.name.includes("金萱") || item.name.includes("葡萄柚"));
      }
      return matchSearch && item.category === selectedCategory;
    });
  }, [menu, searchTerm, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToastMessage("請填入『訂購人姓名』以方便找你付款和發茶喔！", "warning");
      return;
    }
    if (!selectedDrink) {
      showToastMessage("請在下方茶單中選擇想要點購的飲料種類！", "warning");
      return;
    }
    if (quantity < 1) {
      showToastMessage("訂購數量不可小於 1 杯！", "warning");
      return;
    }

    // 儲存常用人名
    if (rememberName) {
      localStorage.setItem("last_ordered_user_name", name.trim());
    }

    const dataPayload: Omit<Order, 'timestamp'> & { orderId?: string } = {
      name: name.trim(),
      drink: selectedDrink,
      sugar: sugar,
      ice: ice,
      quantity: quantity,
      totalPrice: liveTotalPrice
    };

    if (initialData && initialData.orderId) {
      dataPayload.orderId = initialData.orderId;
    }

    onSubmit(dataPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 訂購人姓名欄位 */}
      <div className="space-y-2">
        <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase flex items-center justify-between">
          <span>訂購人姓名 <span className="text-tea-600">*</span></span>
          <span className="text-[10px] text-stone-400 font-light">同名請加部門，如: 開發-王小明</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-stone-400">
            <UserIcon className="w-4 h-4 mt-0.5" />
          </span>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入您的姓名..."
            className="w-full pl-10 pr-4 py-2.5 bg-tea-50/50 hover:bg-tea-50 focus:bg-white text-stone-800 text-sm font-semibold rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-tea-400 focus:border-transparent transition-all duration-200"
            maxLength={30}
            required
            id="inputorder-name"
          />
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer pt-0.5 select-none w-fit">
          <input 
            type="checkbox"
            checked={rememberName}
            onChange={(e) => setRememberName(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-tea-600 focus:ring-tea-500 border-stone-300 accent-tea-600"
          />
          <span className="text-[11px] text-stone-400">在此瀏覽器記住我的名字（下次自動填寫）</span>
        </label>
      </div>

      {/* 飲品點購器：優雅瓦片卡選，擺脫傳統下拉選單 */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase">
            選擇手調茶飲 <span className="text-tea-600">*</span>
          </label>
          
          {/* 快速搜尋欄 */}
          <div className="relative w-full md:w-48">
            <span className="absolute left-2.5 top-2 text-stone-400">
              <SearchIcon className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text"
              placeholder="搜尋茶飲名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-stone-50 text-stone-800 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-tea-400 transition"
            />
          </div>
        </div>

        {/* 茶飲類別滾動導覽 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition duration-150 shrink-0 ${
                selectedCategory === cat 
                  ? "bg-tea-600 text-white shadow-sm" 
                  : "bg-tea-50 text-stone-500 hover:bg-tea-100 hover:text-stone-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 飲品瓦片網格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[195px] overflow-y-auto pr-1 pb-1 border border-stone-100 p-1.5 rounded-2xl bg-stone-50/50">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((drinkItem) => {
              const isSelected = selectedDrink === drinkItem.name;
              return (
                <div
                  key={drinkItem.name}
                  onClick={() => setSelectedDrink(drinkItem.name)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition duration-150 flex flex-col justify-between h-[82px] relative overflow-hidden group hover:scale-[1.01] ${
                    isSelected 
                      ? "bg-tea-100/60 border-tea-500 ring-1 ring-tea-400" 
                      : "bg-white border-stone-200/80 hover:border-tea-200"
                  }`}
                >
                  {/* 選取打勾圈印 */}
                  {isSelected && (
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-tea-600 text-white flex items-center justify-center text-[10px] shadow">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-stone-800 group-hover:text-tea-800 line-clamp-1 truncate max-w-[85%]">
                      {drinkItem.name}
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-2 leading-tight mt-0.5">
                      {drinkItem.description || "經典推薦現泡。"}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-tea-705 mt-1">
                    ${drinkItem.price} <span className="text-[10px] text-stone-400 font-normal">/ 杯</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-8 text-center text-xs text-stone-400">
              查無此茶飲，請調整篩選字詞 🔎
            </div>
          )}
        </div>
        
        {/* 顯示目前選定茶飲特寫 */}
        <div className="bg-tea-50/50 rounded-xl p-3 border border-tea-100 flex items-start gap-2.5">
          <span className="p-1.5 bg-tea-100 text-tea-700 rounded-lg mt-0.5 inline-block">
            <CoffeeIcon className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-stone-700">目前選擇：<span className="text-tea-800 text-sm font-black">{selectedDrink || "請選取您想喝的茶飲"}</span></p>
            <p className="text-[10px] text-stone-400 font-light leading-tight mt-0.5">{currentDrinkInfo.description}</p>
          </div>
          <div className="ml-auto text-right text-xs font-mono font-bold text-tea-900 self-center shrink-0">
            單杯 ${currentDrinkInfo.price} 元
          </div>
        </div>
      </div>

      {/* 甜度選項按鈕群組 */}
      <div className="space-y-2">
        <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase">
          甜度設定 <span className="text-tea-600">*</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {SUGAR_OPTIONS.map((opt) => {
            const isActive = sugar === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSugar(opt.value)}
                className={`py-2 text-[11px] font-bold rounded-xl transition duration-150 border uppercase ${
                  isActive 
                    ? "bg-amber-600 text-white border-amber-500 shadow-sm font-black scale-105" 
                    : "bg-white text-stone-600 border-stone-200 hover:border-amber-200 hover:bg-stone-50"
                }`}
              >
                {opt.value}
              </button>
            );
          })}
        </div>
      </div>

      {/* 冰量選項按鈕群組 */}
      <div className="space-y-2">
        <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase">
          水分與冷暖 <span className="text-tea-600">*</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {ICE_OPTIONS.map((opt) => {
            const isActive = ice === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIce(opt.value)}
                className={`py-2 text-[11px] font-bold rounded-xl transition duration-150 border ${
                  isActive 
                    ? "bg-sky-600 text-white border-sky-500 shadow-sm font-black scale-105" 
                    : "bg-white text-stone-600 border-stone-200 hover:border-sky-200 hover:bg-stone-50"
                }`}
              >
                {opt.value}
              </button>
            );
          })}
        </div>
      </div>

      {/* 數量調整器與金額加總統計 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
        <div>
          <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">
            訂購數量
          </label>
          
          <div className="inline-flex items-center rounded-xl bg-stone-50 border border-stone-200 p-1">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-800 transition"
              id="btn-qty-minus"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono font-bold text-sm text-stone-800">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:bg-white hover:text-stone-800 transition"
              id="btn-qty-plus"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-[10px] text-stone-400 font-light uppercase">
            實時計價小計
          </span>
          <div className="text-xs text-stone-500 mt-1">
            ${currentDrinkInfo.price} × {quantity}杯
          </div>
          <div className="text-xl font-mono font-black text-tea-900 mt-0.5">
            ${liveTotalPrice} <span className="text-xs text-stone-400 font-normal">元</span>
          </div>
        </div>
      </div>

      {/* 送出與更正大鈕 */}
      <button
        type="submit"
        disabled={!selectedDrink}
        className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-tea-700 to-tea-900 hover:from-tea-800 hover:to-stone-900 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] transition-all transform duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
        id="btn-submit-order"
      >
        <CoffeeIcon className="w-4 h-4 text-tea-200" />
        {initialData ? "確定修改下午茶 ✧" : "好，送出下午茶訂單 ✧"}
      </button>

    </form>
  );
}
