import React, { useState, useMemo } from 'react';
import { SearchIcon, EditIcon, TrashIcon, CoffeeIcon } from './Icons';
import { Order } from './OrderSummaryDashboard';

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  editingOrderId: string | null;
}

export function OrderList({ orders = [], onEdit, onDelete, editingOrderId }: OrderListProps) {
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("time-desc"); // time-desc, price-desc, qty-desc, name-asc

  // 過濾數據
  const filteredOrders = useMemo(() => {
    return orders.filter(item => {
      const text = filterText.toLowerCase();
      return (item.name && item.name.toLowerCase().includes(text)) || 
             (item.drink && item.drink.toLowerCase().includes(text)) ||
             (item.sugar && item.sugar.toLowerCase().includes(text)) ||
             (item.ice && item.ice.toLowerCase().includes(text));
    });
  }, [orders, filterText]);

  // 排序數據
  const sortedOrders = useMemo(() => {
    const result = [...filteredOrders];
    if (sortBy === "time-desc") {
      // 預設最新在前
      return result;
    }
    if (sortBy === "price-desc") {
      return result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    }
    if (sortBy === "qty-desc") {
      return result.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
    }
    if (sortBy === "name-asc") {
      return result.sort((a, b) => (a.name || "").localeCompare(b.name || "", "zh-Hant"));
    }
    return result;
  }, [filteredOrders, sortBy]);

  // 取得名字首字，做炫酷頭像
  const getAvatarChar = (fullName: string) => {
    if (!fullName) return "茶";
    const clean = fullName.trim();
    return clean.charAt(0);
  };

  // 取得一個姓名對應的質感背景色
  const getAvatarColorClass = (name: string) => {
    const colors = [
      "bg-tea-200 text-tea-900 border-tea-300/60",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-sky-100 text-sky-800 border-sky-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200"
    ];
    if (!name) return colors[0];
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  return (
    <div className="space-y-6">
      
      {/* 清單頂部欄 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2.5 h-5 bg-tea-600 rounded-full inline-block"></span>
            下午茶點單清單 🍵
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            目前清單中累計有 <span className="text-tea-800 font-bold">{orders.length}</span> 筆點購紀錄
          </p>
        </div>

        {/* 控制區 */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 清單搜尋 */}
          <div className="relative w-full md:w-44">
            <span className="absolute left-2.5 top-2.5 text-stone-400">
              <SearchIcon className="w-3.5 h-3.5" />
            </span>
            <input 
              type="text"
              placeholder="篩選得主或茶飲..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-stone-50 text-stone-800 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-tea-400 transition"
              id="search-order-list"
            />
          </div>

          {/* 排序 dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-50 text-stone-600 text-xs py-1.5 px-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-tea-400 cursor-pointer"
            id="select-sort-order"
          >
            <option value="time-desc">時間排序</option>
            <option value="price-desc">金額高至低</option>
            <option value="qty-desc">杯數多至少</option>
            <option value="name-asc">訂購人姓名</option>
          </select>

        </div>
      </div>

      {/* 清單主區 */}
      <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order, idx) => {
            const isUnderEditing = editingOrderId === order.orderId;
            const avatarStyle = getAvatarColorClass(order.name);

            return (
              <div
                key={order.orderId || idx}
                className={`p-4 rounded-2xl border transition duration-200 relative group flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-up ${
                  isUnderEditing 
                    ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-300 shadow-sm" 
                    : "bg-white border-stone-200/80 hover:border-tea-200/90 hover:shadow-sm"
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                
                {/* 左側：人物與茶飲詳細 */}
                <div className="flex items-start gap-3.5">
                  
                  {/* 頭像徽章縮寫 */}
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-sm shadow-sm shrink-0 uppercase tracking-widest ${avatarStyle}`}>
                    {getAvatarChar(order.name)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-800">{order.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono font-light">{order.timestamp || "剛才"}</span>
                      {isUnderEditing && (
                        <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-md font-bold text-center">編輯中</span>
                      )}
                    </div>
                    
                    {/* 飲料名稱 */}
                    <div className="text-sm font-bold text-tea-900 flex items-center gap-1.5">
                      {order.drink}
                    </div>

                    {/* 特調標籤 tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF2EB] text-amber-700 border border-amber-200/40">
                        {order.sugar}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F4FB] text-sky-700 border border-sky-200/40">
                        {order.ice}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-600">
                        {order.quantity}杯
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右側：金額小計與編輯、刪除操作鈕 */}
                <div className="flex items-center justify-between md:justify-end gap-6 md:text-right border-t md:border-t-0 border-stone-100 pt-3 md:pt-0">
                  
                  <div>
                    <span className="block md:hidden text-[10px] text-stone-400 uppercase">總付款額</span>
                    <p className="font-mono text-lg font-black text-tea-900">
                      ${order.totalPrice} <span className="text-xs text-stone-400 font-normal">元</span>
                    </p>
                  </div>

                  {/* 雙核心按鍵 */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* 編輯 */}
                    <button
                      onClick={() => onEdit(order)}
                      disabled={isUnderEditing}
                      className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-100/50 rounded-xl transition-all duration-150 disabled:opacity-30"
                      title="編輯調整這筆訂單"
                      id={`btn-edit-${order.orderId}`}
                    >
                      <EditIcon className="w-4.5 h-4.5" />
                    </button>
                    
                    {/* 刪除 */}
                    <button
                      onClick={() => order.orderId && onDelete(order.orderId)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-rose-100/50 rounded-xl transition-all duration-150"
                      title="取消或刪除訂單"
                      id={`btn-delete-${order.orderId}`}
                    >
                      <TrashIcon className="w-4.5 h-4.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          // 找不到搜尋結果
          filterText ? (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <p className="text-xs text-stone-400">查無任何與「{filterText}」有關的茶會訂單 ☕️</p>
              <button 
                onClick={() => setFilterText("")} 
                className="mt-2 text-xs text-tea-750 font-bold underline"
              >
                重設過濾字詞
              </button>
            </div>
          ) : (
            // 當今日完全沒有任何人訂單時
            <div className="text-center py-12 md:py-16 bg-gradient-to-br from-tea-50/20 via-white to-tea-100/10 rounded-2xl border-2 border-dashed border-tea-100 flex flex-col items-center justify-center space-y-4">
              
              <div className="w-20 h-20 bg-tea-50 text-tea-300 rounded-full flex items-center justify-center shadow-inner relative">
                <CoffeeIcon className="w-10 h-10 text-tea-200 animate-bounce" />
                <span className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full top-2 right-2 animate-ping"></span>
              </div>

              <div className="text-center max-w-sm px-4 space-y-1">
                <h3 className="text-sm font-bold text-stone-800">☕️ 今天還沒有任何人發起點單唷！</h3>
                <p className="text-xs text-stone-400 leading-relaxed font-light">
                  辦公室咖啡、茶與珍奶大師此時無聲勝有聲。快在左側表單中填入您心儀的一杯，搶先當今天的領頭領航第一單 🥇！
                </p>
              </div>
              
              <button 
                onClick={() => {
                  const input = document.getElementById("inputorder-name");
                  if (input) {
                    input.focus();
                    const element = document.getElementById("order-form-container");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className="px-5 py-2.5 bg-tea-600 hover:bg-tea-500 text-white font-bold text-xs rounded-xl shadow transition hover:scale-[1.01]"
                id="btn-lead-order"
              >
                搶先發起今日第一杯 🥇
              </button>

            </div>
          )
        )}
      </div>

    </div>
  );
}
