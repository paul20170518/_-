import React, { useMemo } from 'react';
import { DollarIcon, UserIcon, FlameIcon } from './Icons';

export interface Order {
  orderId?: string;
  name: string;
  drink: string;
  sugar: string;
  ice: string;
  quantity: number;
  totalPrice: number;
  timestamp?: string;
}

interface OrderSummaryDashboardProps {
  orders: Order[];
}

export function OrderSummaryDashboard({ orders = [] }: OrderSummaryDashboardProps) {
  const stats = useMemo(() => {
    let totalCups = 0;
    let totalPrice = 0;
    const peopleMap = new Set<string>();
    const countsMap: Record<string, number> = {};

    orders.forEach(o => {
      totalCups += (o.quantity || 0);
      totalPrice += (o.totalPrice || 0);
      if (o.name) peopleMap.add(o.name);
      if (o.drink) {
        countsMap[o.drink] = (countsMap[o.drink] || 0) + (o.quantity || 0);
      }
    });

    // 取排序前三名飲料
    const sortedD = Object.entries(countsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalCups,
      totalPrice,
      totalPeeps: peopleMap.size,
      populars: sortedD
    };
  }, [orders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Cups ordered */}
      <div className="bg-gradient-to-br from-white to-tea-50/20 p-5 rounded-2xl border border-tea-150/45 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-tea-100 text-tea-800 rounded-xl flex items-center justify-center shadow-inner scale-95 uppercase">
          <span className="font-mono text-xl font-black">杯</span>
        </div>
        <div>
          <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">今日累計杯數</p>
          <h3 className="font-mono text-2xl font-black text-tea-900">
            {stats.totalCups} <span className="text-xs text-stone-500 font-normal">杯</span>
          </h3>
        </div>
      </div>

      {/* Sum Price */}
      <div className="bg-gradient-to-br from-white to-tea-50/20 p-5 rounded-2xl border border-tea-150/45 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shadow-inner">
          <DollarIcon className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">今日統計總金額</p>
          <h3 className="font-mono text-2xl font-black text-stone-800">
            ${stats.totalPrice} <span className="text-xs text-stone-500 font-normal">元</span>
          </h3>
        </div>
      </div>

      {/* People Count */}
      <div className="bg-gradient-to-br from-white to-tea-50/20 p-5 rounded-2xl border border-tea-150/45 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-sky-100 text-sky-800 rounded-xl flex items-center justify-center shadow-inner">
          <UserIcon className="w-5 h-5 text-sky-700" />
        </div>
        <div>
          <p className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">參合訂單總人數</p>
          <h3 className="font-mono text-2xl font-black text-stone-800">
            {stats.totalPeeps} <span className="text-xs text-stone-500 font-normal">人</span>
          </h3>
        </div>
      </div>

      {/* 最受歡迎飲料統計條 */}
      {orders.length > 0 && stats.populars.length > 0 && (
        <div className="md:col-span-3 bg-[#FAF8F5] md:bg-stone-50/50 rounded-2xl px-4 py-3.5 border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span className="text-xs font-bold text-stone-500 flex items-center gap-1 shrink-0">
            <FlameIcon className="w-3.5 h-3.5 text-orange-500 inline fill-orange-500" />
            今日人氣最旺：
          </span>
          <div className="flex flex-wrap gap-2 md:gap-4 items-center flex-1 md:justify-start">
            {stats.populars.map(([drink, cups], idx) => (
              <div key={drink} className="flex items-center gap-1.5 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-stone-300 text-stone-800' : 'bg-[#E3DCD2] text-stone-700'
                }`}>
                  {idx + 1}
                </span>
                <span className="font-semibold text-stone-700 text-[11px] max-w-[120px] truncate">{drink}</span>
                <span className="font-mono text-[11px] font-bold text-tea-800">({cups}杯)</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
