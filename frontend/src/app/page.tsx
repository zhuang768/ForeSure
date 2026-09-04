"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OnChainBadge from '@/components/OnChainBadge';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/all_reports");
        const realData = await res.json();
        
        if (Array.isArray(realData) && realData.length > 0) {
          setNews([
            { title: realData[realData.length-1]?.source_news || "即時新聞觀測", summary: "AI Agent 即時爬取與過濾的核心情報。" },
            { title: "全球供應鏈重組壓力測試", summary: "系統監測到異常的供應鏈物流延遲，可能引發連鎖經濟損失。" },
            { title: "AI 生成內容版權爭議升級", summary: "跨國科技巨頭面臨史無前例的集體訴訟，可能波及上下游產業。" },
            { title: "極端氣候導致多國農作歉收", summary: "小麥與玉米期貨大漲，食品通膨風險急遽攀升。" }
          ]);
          
          const formattedProposals = realData.map((item: any, idx: number) => ({
            id: item.decision_id || `atlas-real-${idx}`,
            name: item.proposal?.product_name || "新世代自動化保險",
            target: item.proposal?.target_audience || "受特定風險影響之高風險群體",
            gap: item.proposal?.market_gap || "針對現有市場缺口進行精準打擊",
            probability: ((item.actuarial_data?.probability || 0.05) * 100).toFixed(2) + "%",
            loss: "USD " + (item.actuarial_data?.expected_loss_usd?.toLocaleString() || "100,000"),
            premium: "USD " + Math.round((item.actuarial_data?.expected_loss_usd || 100000) * 1.8).toLocaleString() + " ~ " + Math.round((item.actuarial_data?.expected_loss_usd || 100000) * 3).toLocaleString(),
            blockchain_tx: item.blockchain_tx_hash
          })).reverse();
          
          setProposals(formattedProposals);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("使用 Mock 資料");
      }
      
      setTimeout(() => {
        setNews([
          { title: "2026 台灣東部外海 7.2 級強震", summary: "科學園區機台受損，半導體供應鏈可能面臨長達一個月的斷鏈風險..." },
          { title: "2023 夏威夷茂宜島野火", summary: "強風與乾旱引發毀滅性野火，數千棟建築燒毀，當地旅遊業全面停擺..." },
          { title: "全球最大雲端服務供應商 12 小時中斷", summary: "電子商務與金融交易全面停擺，預估經濟損失高達數十億美元..." },
          { title: "AI 生成內容版權爭議升級", summary: "跨國科技巨頭面臨史無前例的集體訴訟，可能波及上下游產業。" },
          { title: "跨國航運巨頭遭勒索軟體攻擊", summary: "全球三大港口物流停滯，數十萬個貨櫃卡關，供應鏈面臨嚴峻挑戰。" }
        ]);
        setProposals([
          {
            id: "atlas-2026-mock-1",
            name: "半導體供應鏈中斷參數險",
            target: "依賴台灣半導體出口之全球電子代工廠 (EMS)。",
            gap: "傳統營業中斷險需冗長理賠鑑定。本系統監測地牛參數，達標即刻支付供應鏈移轉成本。",
            probability: "8.2%",
            loss: "USD 2,500,000",
            premium: "USD 45,000 ~ 75,000",
            blockchain_tx: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b"
          },
          {
            id: "atlas-2026-mock-2",
            name: "氣候巨災參數型保證險",
            target: "容易受極端氣候影響之農漁業及運輸業。",
            gap: "現有保險需人工勘損，耗時數月。此商品結合大數據，觸發參數即刻理賠。",
            probability: "15.4%",
            loss: "USD 500,000",
            premium: "USD 9,000 ~ 15,000",
            blockchain_tx: "0x8f2a9b4e3c1d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a"
          },
          {
            id: "atlas-2026-mock-3",
            name: "雲端服務中斷 SaaS 補償險",
            target: "高度依賴 AWS/GCP/Azure 等公有雲之軟體服務商。",
            gap: "公有雲 SLA 理賠往往不足以彌補企業對使用者的違約金，本商品自動監測 Downdetector 進行賠付。",
            probability: "22.1%",
            loss: "USD 120,000",
            premium: "USD 2,160 ~ 3,600",
            blockchain_tx: "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c"
          }
        ]);
        setLoading(false);
      }, 800);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const logSequence = [
      "[SYSTEM] 啟動 Atlas 企業保險開發 Agent...",
      "[Market_Observer] 發現新興風險：2026 台灣東部外海強震",
      "[PM_Agent] 提議：開發『半導體供應鏈中斷參數險』",
      "[Underwriter_Agent] ⚠️ 警告：需防範供應鏈轉移的道德風險，建議加入嚴格的震度參數閾值。",
      "[Actuary_Agent] 計算預期損失為 USD 2,500,000，風險發生機率估算為 8.2%。",
      "[Actuary_Agent] 設定保費區間：USD 45,000 ~ 75,000 (Markup 1.8x)",
      "[PM_Agent] 提案已修正，結合大數據參數觸發，填補傳統營業中斷險缺口。",
      "[Blockchain_Node] 正在將決策數位指紋進行 SHA-256 雜湊...",
      "[Blockchain_Node] 成功發送至 Sepolia 測試鏈。TxHash 取得成功。"
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logSequence.length) {
        setTerminalLogs(prev => [...prev, logSequence[i]]);
        i++;
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const scrollToDashboard = () => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
        <div className="text-emerald-500 font-mono tracking-widest animate-pulse text-xl">INITIALIZING ATLAS SYSTEM...</div>
      </div>
    );
  }

  return (
    <main className="bg-slate-950 font-sans text-slate-200">
      
      {/* ================= HERO SECTION (第一屏) ================= */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* 背景星空與漸層 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>
        <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="z-10 text-center px-4 max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-sm animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SYSTEM ONLINE: ALL AGENTS ACTIVE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 bg-gradient-to-br from-white via-slate-300 to-slate-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-8 duration-1000">
            ATLAS 戰情室
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-400 font-light mb-12 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-10 duration-1000 delay-150">
            企業級 Multi-Agent 自動化保險開發與風控平台。<br/>讓 AI 為你計算未來的風險。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
            <button 
              onClick={scrollToDashboard}
              className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              進入戰情系統 ↓
            </button>
            <Link 
              href="/generator" 
              className="px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-emerald-500 text-white rounded-full font-bold text-lg transition-all hover:bg-emerald-500/10 flex items-center gap-2 group"
            >
              <span className="group-hover:translate-x-1 transition-transform">🚀</span> 手動觸發 AI
            </Link>
          </div>
        </div>

        {/* 底部指示箭頭 */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={scrollToDashboard}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* ================= DASHBOARD SECTION (第二屏起) ================= */}
      <section id="dashboard" className="min-h-screen relative py-24 px-6 lg:px-12 bg-slate-950">
        
        <div className="max-w-[1600px] mx-auto">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-800 pb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">全景分析視圖</h2>
              <p className="text-slate-500">Panoptic Market & Agent Analysis</p>
            </div>
            
            {/* 系統燈號 */}
            <div className="flex flex-wrap gap-4 text-xs font-mono bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 mt-6 md:mt-0 shadow-2xl">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>Market Intel</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>Multi-Agent</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>Actuarial Core</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>Web3 Node</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ================= 左側：情報流與終端機 ================= */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Agent 內部激辯終端機 */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-80 flex flex-col">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">atlas-multi-agent-debate ~ /bin/bash</span>
                </div>
                <div className="p-5 font-mono text-[13px] leading-relaxed text-emerald-400 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="mb-2 opacity-90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                      <span className="text-slate-600 mr-2">{'>'}</span>
                      <span className={log.includes('警告') ? 'text-yellow-400 font-bold' : log.includes('Blockchain') ? 'text-indigo-400 font-bold' : ''}>
                        {log}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>

              {/* 市場情報流 (可垂直捲動) */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex-1">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                  市場情報流 (Live Feed)
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {news.map((n, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 hover:border-blue-500/50 transition-all cursor-default group">
                      <div className="text-[10px] text-blue-400 font-mono mb-2 tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-ping"></span> ALERT
                      </div>
                      <h4 className="font-bold text-sm mb-2 text-slate-100 group-hover:text-blue-300 transition-colors">{n.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{n.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= 右側：水平滑動金庫 ================= */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold flex items-center gap-3 text-white">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                  決策金庫
                </h3>
                <span className="text-sm font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  ← Swipe to explore →
                </span>
              </div>
              
              {/* 橫向滑動區塊 (Swipe Container) */}
              <div className="flex gap-6 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                {proposals.map((p, idx) => (
                  <div key={idx} className="snap-center shrink-0 w-[85vw] md:w-[600px] bg-slate-900/60 backdrop-blur-xl p-8 relative border border-slate-700/50 rounded-3xl shadow-2xl hover:-translate-y-2 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col justify-between">
                    
                    {/* Web3 徽章 */}
                    {p.blockchain_tx && (
                      <div className="absolute top-6 right-6 z-10">
                        <OnChainBadge decisionId={p.id} txHash={p.blockchain_tx} />
                      </div>
                    )}

                    <div>
                      <div className="mb-8 mt-2">
                        <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono mb-4 inline-block">
                          ID: {p.id.toUpperCase()}
                        </span>
                        <h4 className="text-3xl font-bold text-white mb-2 pr-32 leading-tight group-hover:text-emerald-300 transition-colors">{p.name}</h4>
                      </div>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h5 className="text-slate-500 text-xs font-bold tracking-wider mb-2 uppercase flex items-center gap-2">
                            <span className="text-emerald-500">🎯</span> 目標客群
                          </h5>
                          <p className="text-slate-300 text-[15px] leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">{p.target}</p>
                        </div>
                        <div>
                          <h5 className="text-slate-500 text-xs font-bold tracking-wider mb-2 uppercase flex items-center gap-2">
                            <span className="text-blue-500">💡</span> 市場缺口
                          </h5>
                          <p className="text-slate-300 text-[15px] leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">{p.gap}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6 flex justify-between items-end bg-slate-950/30 -mx-8 -mb-8 p-8 rounded-b-3xl">
                      <div>
                        <div className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">預估損失 / 機率</div>
                        <div className="text-xl font-mono text-white flex items-center gap-3">
                          {p.loss} 
                          <span className="text-sm bg-emerald-500/20 px-2.5 py-1 rounded-md text-emerald-400 font-bold border border-emerald-500/30">{p.probability}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">建議保費 (Markup)</div>
                        <div className="text-2xl font-mono text-emerald-400 font-extrabold">{p.premium}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 預留一點右邊距確保最後一張卡片能置中 */}
                <div className="shrink-0 w-4 md:w-[10vw]"></div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
