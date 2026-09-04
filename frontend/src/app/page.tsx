"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OnChainBadge from '@/components/OnChainBadge';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

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
          { title: "2026 台灣東部外海 7.2 級強震", summary: "科學園區機台受損，半導體供應鏈可能面臨長達一個月的斷鏈風險。" },
          { title: "2023 夏威夷茂宜島野火", summary: "強風與乾旱引發毀滅性野火，數千棟建築燒毀，當地旅遊業全面停擺。" },
          { title: "全球最大雲端服務供應商 12 小時中斷", summary: "電子商務與金融交易全面停擺，預估經濟損失高達數十億美元。" },
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
      "[SYSTEM] 啟動 Atlas 企業保險開發 Agent",
      "[Market_Observer] 發現新興風險：2026 台灣東部外海強震",
      "[PM_Agent] 提議：開發『半導體供應鏈中斷參數險』",
      "[Underwriter_Agent] [WARNING] 需防範供應鏈轉移的道德風險，建議加入嚴格的震度參數閾值",
      "[Actuary_Agent] 計算預期損失為 USD 2,500,000，風險發生機率估算為 8.2%",
      "[Actuary_Agent] 設定保費區間：USD 45,000 ~ 75,000 (Markup 1.8x)",
      "[PM_Agent] 提案已修正，結合大數據參數觸發，填補傳統營業中斷險缺口",
      "[Blockchain_Node] 正在將決策數位指紋進行 SHA-256 雜湊",
      "[Blockchain_Node] 成功發送至 Sepolia 測試鏈。TxHash 取得成功"
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
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-8"></div>
        <div className="text-slate-500 font-mono tracking-widest text-sm">INITIALIZING SYSTEM</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* ================= 頂部導覽列 (Top Nav) ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              ATLAS
            </h1>
            <span className="text-sm text-slate-500 border-l border-slate-200 pl-4 hidden sm:block">
              Multi-Agent Automated Insurance Platform
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/generator" 
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-sm transition-colors"
            >
              [ACTION] Manual Override
            </Link>
          </div>
        </div>
      </header>

      {/* ================= 主體三欄式看板 (3-Column Layout) ================= */}
      <div className="max-w-[1800px] mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 左欄：市場情報流 (25%) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">Market Intelligence</h2>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
                {news.map((n, idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="text-[10px] text-blue-600 font-mono mb-1.5 tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> 
                      LIVE FEED
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800 mb-1 leading-snug">{n.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{n.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 中欄：決策金庫 (50%) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Verified Proposals Vault</h2>
              <div className="text-xs font-mono text-slate-400">Total: {proposals.length}</div>
            </div>
            
            <div className="flex flex-col gap-6">
              {proposals.map((p, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-mono mb-3 inline-block">
                        ID: {p.id.toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">{p.name}</h3>
                    </div>
                    {p.blockchain_tx && (
                      <div className="shrink-0">
                        <OnChainBadge decisionId={p.id} txHash={p.blockchain_tx} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold tracking-wider mb-1.5 uppercase">[TARGET]</h4>
                      <p className="text-slate-700 text-sm leading-relaxed">{p.target}</p>
                    </div>
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold tracking-wider mb-1.5 uppercase">[GAP]</h4>
                      <p className="text-slate-700 text-sm leading-relaxed">{p.gap}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-md p-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wider">Est. Loss / Probability</div>
                      <div className="text-base font-mono text-slate-900 flex items-center gap-2">
                        {p.loss} 
                        <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">{p.probability}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wider">Premium (Markup)</div>
                      <div className="text-lg font-mono text-emerald-700 font-bold">{p.premium}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右欄：終端機與系統狀態 (25%) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* 系統燈號 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-2">
              <h2 className="text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">System Status</h2>
              <div className="space-y-3 text-xs font-mono text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Market Observer</span>
                  <div className="flex items-center gap-2"><span className="text-emerald-600">Active</span><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Multi-Agent Engine</span>
                  <div className="flex items-center gap-2"><span className="text-emerald-600">Active</span><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Actuarial Core</span>
                  <div className="flex items-center gap-2"><span className="text-emerald-600">Active</span><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Web3 Audit Node</span>
                  <div className="flex items-center gap-2"><span className="text-emerald-600">Active</span><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div></div>
                </div>
              </div>
            </div>

            {/* Agent 日誌 */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-[500px]">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Agent Event Log</span>
              </div>
              <div ref={terminalContainerRef} className="p-4 font-mono text-[11px] leading-relaxed text-slate-600 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="mb-2 pb-2 border-b border-slate-50 last:border-0 opacity-90 transition-all duration-300">
                    <span className="text-slate-400 mr-1.5">{'>'}</span>
                    <span className={log.includes('WARNING') ? 'text-amber-600 font-bold' : log.includes('Blockchain') ? 'text-blue-600 font-bold' : 'text-slate-700'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
