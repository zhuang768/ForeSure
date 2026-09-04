"use client";

import { useState } from 'react';
import Link from 'next/link';
import OnChainBadge from '@/components/OnChainBadge';

export default function GeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("");

  const triggerAgent = async () => {
    setLoading(true);
    setReport(null);
    setError("");
    
    // 模擬 AI 處理過程的狀態文字更新
    const statuses = [
      "啟動多代理人辯論引擎...",
      "正在爬取全球最新重大新聞...",
      "Strategy Agent 正在發想產品雛形...",
      "Actuary Agent 正在計算預期損失與保費...",
      "正在進行智能合約數位指紋上鏈..."
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      if (step < statuses.length) {
        setStatusText(statuses[step]);
        step++;
      }
    }, 2500);

    try {
      const res = await fetch("http://localhost:8080/api/v1/run_agent", {
        method: "POST"
      });
      const data = await res.json();
      
      clearInterval(interval);
      
      if (data.error) {
        setError(data.error);
      } else {
        setStatusText("決策與上鏈已完成！");
        setReport(data);
      }
    } catch (err: any) {
      clearInterval(interval);
      setError("無法連線到後端 FastAPI 伺服器，請確認伺服器已啟動於 port 8080");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 lg:p-24 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end border-b border-slate-700/50 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI 發電機 (Agent 控制台)
            </h1>
            <p className="text-slate-400">一鍵調度 Multi-Agent 自動產出保單與精算報告</p>
          </div>
          <Link href="/" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-600">
            返回戰情室首頁
          </Link>
        </header>

        <div className="flex flex-col items-center justify-center py-12">
          {!loading && !report && (
            <button 
              onClick={triggerAgent}
              className="group relative px-8 py-4 bg-slate-900 rounded-2xl shadow-2xl border border-purple-500/30 hover:border-purple-400 transition-all hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 group-hover:opacity-100 opacity-50 transition-opacity"></div>
              <span className="relative text-2xl font-bold text-white flex items-center gap-3">
                🚀 啟動 AI 代理人
              </span>
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-6 glass-card p-12 w-full max-w-2xl">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-xl font-mono text-purple-300 animate-pulse text-center h-8">
                {statusText || "連接大腦中..."}
              </div>
            </div>
          )}

          {error && (
            <div className="glass-card p-8 border-red-500/50 text-red-400 max-w-2xl text-center w-full">
              ⚠️ {error}
            </div>
          )}

          {report && !loading && (
            <div className="glass-card p-8 relative overflow-hidden w-full max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {report.blockchain_tx_hash && (
                <OnChainBadge decisionId={report.decision_id || "atlas-new"} txHash={report.blockchain_tx_hash} />
              )}
              
              <div className="mb-8">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium mb-3 inline-block">
                  熱騰騰的 AI 產出
                </span>
                <h3 className="text-3xl font-bold text-white">
                  {report.proposal?.product_name || "新世代參數型保險"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-slate-400 text-sm font-semibold mb-2">觸發新聞來源</h4>
                  <p className="text-slate-200">{report.source_news || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 text-sm font-semibold mb-2">市場缺口分析</h4>
                  <p className="text-slate-200 text-sm leading-relaxed">{report.proposal?.market_gap || "N/A"}</p>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-6 mt-6 bg-slate-800/30 -mx-8 -mb-8 p-8 rounded-b-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">預估事故損失</div>
                    <div className="text-xl font-mono text-white">
                      USD {report.actuarial_data?.expected_loss_usd?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400 mb-1">風險機率</div>
                    <div className="text-2xl font-mono text-emerald-400 font-bold">
                      {(report.actuarial_data?.probability * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
