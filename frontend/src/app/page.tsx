"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 模擬載入動畫與假資料 (實務上這裡會 fetch apigee_target.py)
  useEffect(() => {
    setTimeout(() => {
      setNews([
        { title: "2023 夏威夷茂宜島野火", summary: "強風與乾旱引發毀滅性野火，數千棟建築燒毀，當地旅遊業全面停擺..." },
        { title: "全球最大雲端服務供應商 12 小時中斷", summary: "電子商務與金融交易全面停擺，預估經濟損失高達數十億美元..." }
      ]);
      setProposals([
        {
          name: "氣候巨災參數型保證險",
          target: "容易受極端氣候影響之農漁業及運輸業。",
          gap: "現有保險需人工勘損，耗時數月。此商品結合大數據，觸發參數即刻理賠。",
          probability: "15.4%",
          loss: "USD 500,000",
          premium: "USD 9,000 ~ 15,000",
          blockchain_tx: "0x8f2a9b4e3c1d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a"
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <main className="min-h-screen p-8 lg:p-24 relative overflow-hidden">
      {/* 裝飾性背景漸層 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
            AI 智慧保險戰情室
          </h1>
          <p className="text-slate-500 text-lg font-medium">企業級自動化市場缺口分析與精算提案系統</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 左側：市場觀察 (白底/灰底風格) */}
            <div className="lg:col-span-4 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full inline-block" />
                市場觀測雷達
              </h2>
              {news.map((n, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">{n.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{n.summary}</p>
                </div>
              ))}
            </div>

            {/* 右側：AI 提案生成結果 (深色玻璃卡片) */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block" />
                多代理人決策與精算提案
              </h2>
              
              {proposals.map((p, idx) => (
                <div key={idx} className="glass-card p-8 relative overflow-hidden">
                  
                  {/* 區塊鏈存證浮水印/徽章 */}
                  {p.blockchain_tx && (
                    <a href={`https://sepolia.etherscan.io/tx/${p.blockchain_tx}`} target="_blank" rel="noreferrer" 
                       className="absolute top-6 right-6 flex flex-col items-end group cursor-pointer z-10">
                      <div className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm group-hover:bg-indigo-500/30 transition-all">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Verified on Sepolia
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Tx: {p.blockchain_tx.substring(0, 10)}...{p.blockchain_tx.substring(p.blockchain_tx.length - 8)}
                      </div>
                    </a>
                  )}

                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium mb-3 inline-block">
                        AI 提案通過
                      </span>
                      <h3 className="text-3xl font-bold text-white max-w-md">{p.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400 mb-1">風險發生機率</div>
                      <div className="text-2xl font-mono text-emerald-400">{p.probability}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-slate-400 text-sm font-semibold mb-2">目標客群</h4>
                      <p className="text-slate-200">{p.target}</p>
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-sm font-semibold mb-2">市場缺口</h4>
                      <p className="text-slate-200">{p.gap}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-700/50 pt-6 mt-6 flex justify-between items-center bg-slate-800/30 -mx-8 -mb-8 p-8 rounded-b-2xl">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">預估事故損失</div>
                      <div className="text-xl font-mono text-white">{p.loss}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400 mb-1">建議保費區間 (Markup 1.8x - 3.0x)</div>
                      <div className="text-2xl font-mono text-emerald-400 font-bold">{p.premium}</div>
                    </div>
                  </div>
                </div>
              ))}
              
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
