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
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              ATLAS
            </h1>
            <span className="text-sm text-slate-500 border-l border-slate-200 pl-4">
              Agent Control Console
            </span>
          </div>
          <Link href="/" className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded font-medium text-sm transition-colors">
            返回戰情室總覽
          </Link>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto mt-16 px-6">
        <div className="bg-white border border-slate-200 rounded-lg p-10 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          
          {!loading && !report && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">手動調度代理人</h2>
              <p className="text-slate-500 mb-8 text-sm">此操作將同步觸發新聞分析、產品發想、精算驗證與區塊鏈上鏈流程。</p>
              <button 
                onClick={triggerAgent}
                className="px-8 py-4 bg-slate-900 text-white rounded font-bold text-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                [START] 執行自動化流程
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-sm font-mono text-slate-600 animate-pulse text-center h-8">
                {statusText || "INITIALIZING..."}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded text-sm font-mono text-center w-full">
              [ERROR] {error}
            </div>
          )}

          {report && !loading && (
            <div className="w-full text-left">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-mono mb-3 inline-block">
                    STATUS: VERIFIED
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {report.proposal?.product_name || "新世代參數型保險"}
                  </h3>
                </div>
                {report.blockchain_tx_hash && (
                  <OnChainBadge decisionId={report.decision_id || "atlas-new"} txHash={report.blockchain_tx_hash} />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-slate-500 text-[10px] font-bold tracking-wider mb-2 uppercase">[SOURCE] 觸發新聞</h4>
                  <p className="text-slate-700 text-sm bg-slate-50 border border-slate-100 p-3 rounded">{report.source_news || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-slate-500 text-[10px] font-bold tracking-wider mb-2 uppercase">[GAP] 市場缺口分析</h4>
                  <p className="text-slate-700 text-sm bg-slate-50 border border-slate-100 p-3 rounded">{report.proposal?.market_gap || "N/A"}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wider">Est. Loss (USD)</div>
                  <div className="text-xl font-mono text-slate-900">
                    {report.actuarial_data?.expected_loss_usd?.toLocaleString() || "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wider">Probability</div>
                  <div className="text-xl font-mono text-slate-900 font-bold">
                    {(report.actuarial_data?.probability * 100).toFixed(2)}%
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
