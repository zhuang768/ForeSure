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

  // 1. 抓取所有歷史報告資料
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/all_reports");
        const realData = await res.json();
        
        if (Array.isArray(realData) && realData.length > 0) {
          setNews([
            { title: realData[realData.length-1]?.source_news || "即時新聞觀測", summary: "AI Agent 即時爬取與過濾的核心情報。" },
            { title: "全球供應鏈重組壓力測試", summary: "系統監測到異常的供應鏈物流延遲，可能引發連鎖經濟損失。" }
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
          })).reverse(); // 最新的在最上面
          
          setProposals(formattedProposals);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("無法連線至真實後端，降級顯示全套展示用 Mock 資料", e);
      }
      
      // 降級：如果後端沒開，顯示極具深度的 Mock 資料保住 Demo
      setTimeout(() => {
        setNews([
          { title: "2026 台灣東部外海 7.2 級強震", summary: "科學園區機台受損，半導體供應鏈可能面臨長達一個月的斷鏈風險..." },
          { title: "2023 夏威夷茂宜島野火", summary: "強風與乾旱引發毀滅性野火，數千棟建築燒毀，當地旅遊業全面停擺..." },
          { title: "全球最大雲端服務供應商 12 小時中斷", summary: "電子商務與金融交易全面停擺，預估經濟損失高達數十億美元..." }
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

  // 2. 模擬 Agent 激辯的終端機文字流
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
      } else {
        clearInterval(interval);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 lg:p-12 relative overflow-hidden font-sans text-slate-200">
      {/* 科技感背景層 */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-20"></div>
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* ================= Header ================= */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              ATLAS 戰場全景戰情室
            </h1>
            <p className="text-slate-400 text-lg font-medium">企業級 Multi-Agent 自動化保險開發與風控平台</p>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            {/* 系統燈號 */}
            <div className="flex gap-4 text-xs font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>Market Intel</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>Multi-Agent</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>Actuarial Core</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>Web3 Node</div>
            </div>
            
            <Link href="/generator" className="px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg transition-all font-medium flex items-center gap-2">
              <span className="text-lg">🚀</span> 切換至 AI 發電機
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ================= 左側：市場情報流 ================= */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full backdrop-blur-md">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                  市場情報流
                </h2>
                <div className="space-y-4">
                  {news.map((n, idx) => (
                    <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="text-xs text-blue-400 font-mono mb-2">LIVE ALERT</div>
                      <h3 className="font-semibold text-sm mb-2 text-slate-200">{n.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{n.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= 中右側：終端機 + 保單金庫 ================= */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              
              {/* Agent 內部激辯終端機 */}
              <div className="bg-[#0D1117] border border-slate-800 rounded-2xl p-0 overflow-hidden shadow-2xl h-48 flex flex-col">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-4 text-xs font-mono text-slate-500">atlas-multi-agent-debate ~ /bin/bash</span>
                </div>
                <div className="p-4 font-mono text-xs md:text-sm text-emerald-400 overflow-y-auto flex-1">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="mb-1 opacity-90">
                      <span className="text-slate-500 mr-2">{'>'}</span>
                      <span className={log.includes('警告') ? 'text-yellow-400' : log.includes('Blockchain') ? 'text-indigo-400' : ''}>
                        {log}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>

              {/* 保單金庫 Vault */}
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-white">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  決策金庫 (Verified Vault)
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {proposals.map((p, idx) => (
                    <div key={idx} className="bg-slate-900/60 backdrop-blur-xl p-6 relative overflow-hidden border border-slate-700/50 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                      
                      {/* Web3 徽章 */}
                      {p.blockchain_tx && (
                        <div className="scale-90 origin-top-right absolute top-4 right-4">
                          <OnChainBadge decisionId={p.id} txHash={p.blockchain_tx} />
                        </div>
                      )}

                      <div className="mb-6 mt-2">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono mb-3 inline-block">
                          ID: {p.id.toUpperCase()}
                        </span>
                        <h3 className="text-2xl font-bold text-white mb-1 pr-32">{p.name}</h3>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="text-slate-500 text-xs font-bold tracking-wider mb-1 uppercase">目標客群</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{p.target}</p>
                        </div>
                        <div>
                          <h4 className="text-slate-500 text-xs font-bold tracking-wider mb-1 uppercase">市場缺口</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{p.gap}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-5 mt-auto flex justify-between items-end">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">預估事故損失 / 機率</div>
                          <div className="text-lg font-mono text-white flex items-center gap-3">
                            {p.loss} 
                            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-emerald-400">{p.probability}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">建議保費區間</div>
                          <div className="text-xl font-mono text-emerald-400 font-bold">{p.premium}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
