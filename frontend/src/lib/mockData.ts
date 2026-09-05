/**
 * Comprehensive offline/demo mock data.
 * When the backend is unreachable, the API layer falls back to this data.
 * This makes the Cloudflare Pages deployment look identical to a local run
 * with a live backend.
 */

import type { ChainStatus, RunRecord, RunSummary } from "./types";

// ── helpers ──────────────────────────────────────────────────────────────────

function ts(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return d.toISOString();
}

function stampId(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `atlas-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${
    Math.random().toString(36).slice(2, 10)
  }`;
}

function mockTx(): string {
  return (
    "0x" +
    Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  );
}

// ── chain status ──────────────────────────────────────────────────────────────

export const MOCK_CHAIN_STATUS: ChainStatus = {
  mode: "sepolia",
  rpc_url: "https://sepolia.infura.io/v3/demo",
  contract_address: "0xAuditRegistryDemoContract00000000000000",
  submitter: "0xDemoSubmitter0000000000000000000000000000",
};

// ── run records ──────────────────────────────────────────────────────────────

const RUN_DATA: Array<{
  minutesAgo: number;
  newsTitle: string;
  newsSource: string;
  newsSummary: string;
  newsLink: string;
  productName: string;
  targetAudience: string;
  marketGap: string;
  coverageDetails: string;
  exclusions: string;
  businessLogic: string;
  probabilityPct: number;
  expectedLossUsd: number;
  premiumMin: number;
  premiumMax: number;
  pmDebate: string;
  underwriterDebate: string;
  actuaryDebate: string;
  peril: string;
  annualFrequency: number;
}> = [
  {
    minutesAgo: 1,
    newsTitle: "企業AI與雲端依賴營業中斷保險（Enterprise AI-Dependency Business Interruption）",
    newsSource: "Reuters Tech",
    newsSummary:
      "ChatGPT、Claude、Gemini down. What we know about the AI outage that crippled enterprise workflows for 6 hours across Asia-Pacific.",
    newsLink: "https://example.com/ai-outage",
    productName: "企業AI與雲端依賴營業中斷保險（Enterprise AI-Dependency Business Interruption Insurance）",
    targetAudience:
      "導入生成式AI API、SaaS服務與雲端自動化流程的中小型科技公司、數位行銷公司及跨境電商。",
    marketGap:
      "傳統資安險偏強調「駭客惡意入侵與資料外洩」，對於「高度依賴AI與雲端大模型進行日常營運之現代企業，因基礎設施全面癱瘓所成的營業中斷與生產力損失」存在完全的保障真空。",
    coverageDetails:
      "1. 承保範圍：因全球主流雲端基礎設施或基礎大模型API突發性全面中斷（非單一企業端網路問題），導致企業核心自動化營運流程停擺之業務中斷損失。\n2. 理賠門檻：需經第三方公正雲端監控平台證實主流AI服務商同時中斷4小時以上。\n3. 給付方式：採實際損失填補原則（Indemnity Basis），依據企業前一年度財報或營業額計算之日均損益之實支實付，最高理賠額度為 USD 50,000。",
    exclusions:
      "1. 被保險人自身的網路設備故障、內部斷網或資安防護不當。\n2. 違主管機關命令存放或合約引引起的系統暫停。\n3. 刻意按採納線、蓄意破壞API連接等明顯違德風險行為（須透過數位足跡與日誌稽查）。",
    businessLogic:
      "系統主動對接主要雲端監控 API（如 Datadog、AWS Health API、GCP Status），自動偵測觸發條件並在條件成立後直接以參數型方式進行理賠計算，大幅縮短理賠週期。",
    probabilityPct: 5.0,
    expectedLossUsd: 50000,
    premiumMin: 3000,
    premiumMax: 4500,
    pmDebate:
      "這波AI服務大中斷事件明確揭示了一個全新的保險缺口。我的建議是推出「企業AI依賴中斷險」，採用參數型理賠機制——只要主流AI平台同時中斷超過4小時，就自動理賠，無須複雜的損失舉證。這大幅降低核保與理賠的行政成本，也提升了客戶信任。",
    underwriterDebate:
      "我支持參數型設計，但需要嚴格定義「觸發條件」。建議採用至少兩家以上獨立第三方監控服務（如Datadog、Pingdom）同時確認中斷，以避免單點誤報。另外，保額上限設在USD 50,000並要求企業提供前一年度AI採購發票作為核保依據，可有效控管逆選擇風險。",
    actuaryDebate:
      "根據過去3年主要AI平台停機事件分析，發生機率約5%。預期單次損失USD 50,000，年化保費應落在USD 3,000-4,500區間，損失率控制在65%以下，符合核保標準。",
    peril: "AI Platform Outage",
    annualFrequency: 0.87,
  },
  {
    minutesAgo: 3,
    newsTitle: "企業資安潛伏期防護保險（Cyber-Dwell Defense Insurance）",
    newsSource: "Cybersecurity Ventures",
    newsSummary:
      "在客戶手邊平均有17天潛伏期，到底如何補救？研究顯示駭客平均潛伏197天才被發現。",
    newsLink: "https://example.com/cyber-dwell",
    productName: "企業資安潛伏期防護保險（Cyber-Dwell Defense Insurance）",
    targetAudience: "中型製造業、金融科技公司、醫療機構及持有大量客戶個資的企業。",
    marketGap:
      "傳統資安險多以「事件發現日」為理賠起點，忽略了駭客潛伏期間造成的隱性損失——如持續的資料洩露、系統慢速破壞、與競業情報竊取。",
    coverageDetails:
      "1. 承保期間：自入侵日（forensic溯源）至發現日之潛伏損失\n2. 覆蓋項目：資料洩漏造成的客戶流失損失、合規罰款、法律費用\n3. 最高理賠：USD 200,000/年",
    exclusions: "內部人員故意洩密、未達基本資安標準（如無MFA）、政治動機攻擊。",
    businessLogic:
      "與企業簽約時要求安裝EDR（Endpoint Detection & Response）監控工具，系統可自動生成入侵時間線報告作為理賠依據。",
    probabilityPct: 8.5,
    expectedLossUsd: 80000,
    premiumMin: 5000,
    premiumMax: 8000,
    pmDebate:
      "資安潛伏期是業界最被忽視的風險缺口。我建議以「潛伏期天數×日均損失」作為理賠計算基礎，讓理賠更透明、可溯源。",
    underwriterDebate:
      "必須要求投保企業提供每季SOC 2 Type II報告作為持續核保條件，潛伏期超過90天的案例應設定理賠上限，避免道德風險。",
    actuaryDebate:
      "根據Verizon DBIR 2024數據，製造業平均潛伏期197天，金融業63天。以8.5%發生率、平均損失USD 80,000計算，年化保費USD 5,000-8,000合理。",
    peril: "Cyber Intrusion",
    annualFrequency: 1.2,
  },
  {
    minutesAgo: 5,
    newsTitle: "醫療機構首長合規延誤失敗保險（附卡「智御合規」）",
    newsSource: "衛生福利部新聞稿",
    newsSummary:
      "衛生福利部新制醫院評鑑啟動，多間地區醫院因資安合規不足面臨降等處分，院長個人責任風險升高。",
    newsLink: "https://example.com/hospital-compliance",
    productName: "醫療機構首長合規延誤失敗保險（智御合規附加保障）",
    targetAudience: "中型醫院院長、醫療法人董事長、診所院長及醫療集團管理層。",
    marketGap:
      "醫院評鑑新制下，首長個人需對資安合規失敗承擔連帶責任，但現行D&O（董監事責任險）未涵蓋衛生主管機關罰款及評鑑降等損失。",
    coverageDetails:
      "1. 主動覆蓋：評鑑降等造成的收入損失（最多12個月）\n2. 法律費用：行政訴訟及抗辯費用\n3. 個人罰鍰：衛福部行政裁罰轉嫁給個人之部分\n4. 附加服務：「智御合規」平台一年訂閱（AI輔助合規進度追蹤）",
    exclusions: "故意違規、未在保單期間內完成評鑑要求之底線措施。",
    businessLogic:
      "整合衛福部醫院評鑑資料庫API，自動追蹤各院所合規進度並提前預警，作為核保與差異化定價依據。",
    probabilityPct: 12.0,
    expectedLossUsd: 120000,
    premiumMin: 8000,
    premiumMax: 15000,
    pmDebate:
      "醫療合規風險在台灣尚未有對應的保險產品。「附卡」設計（搭配合規SaaS平台）可以製造差異化並降低理賠率，因為投保機構的合規水準會被主動監控。",
    underwriterDebate:
      "需要評估各醫院過去3年評鑑記錄作為核保依據。對於曾被警告或降等的機構，應加收25%-40%保費附加。",
    actuaryDebate:
      "台灣醫院評鑑降等率約12%，但加入AI合規監控後預估可降至7%。以此計算年化保費合理範圍為USD 8,000-15,000。",
    peril: "Regulatory Non-Compliance",
    annualFrequency: 1.8,
  },
  {
    minutesAgo: 8,
    newsTitle: "「食安無虞」特定病原菌醫療保險（大腸桿菌案）",
    newsSource: "Food Safety News",
    newsSummary:
      "E.coli blueberry recall expanding to frozen mixed berry packaging — 17 states affected, 3 hospitalized.",
    newsLink: "https://example.com/ecoli-recall",
    productName: "「食安無虞」特定病原菌醫療費用補償保險",
    targetAudience: "喜好購買生鮮食品、冷凍食品及外食族的一般消費者，特別是有幼童及長者的家庭。",
    marketGap:
      "台灣食安事件頻繁，但現有健保給付不涵蓋因食安問題引發的延伸醫療費用（如住院期間的特殊飲食、長期追蹤檢查），且求償廠商的法律途徑費時費力。",
    coverageDetails:
      "1. 承保病原：沙門氏菌、大腸桿菌O157、諾羅病毒\n2. 觸發條件：衛福部發布相關食品召回公告或疫調確認\n3. 定額補償：住院每日USD 100，門診每次USD 30，最高USD 5,000\n4. 快速理賠：提供就診收據即可申請，3工作日撥款",
    exclusions: "非食品來源的腸胃道感染、慢性腸道疾病、自行購買非認證食品。",
    businessLogic:
      "對接衛福部食品藥物管理署API，自動監控食品召回公告。一旦觸發，主動通知保戶並啟動理賠流程，實現真正的「主動式保險」。",
    probabilityPct: 3.5,
    expectedLossUsd: 3000,
    premiumMin: 200,
    premiumMax: 400,
    pmDebate:
      "這是一個高頻率、低嚴重度的風險，非常適合做成低保費的附加險或嵌入式保險。可以考慮與momo購物、全聯等食品零售商合作，在結帳時嵌入投保選項。",
    underwriterDebate:
      "觸發條件必須清楚定義為「政府公告的特定批次召回」，而非一般腸胃炎。建議引入等待期設計（投保後30天內的事件不理賠）。",
    actuaryDebate:
      "台灣近5年平均每年有3.5次重大食品召回事件，單次理賠平均USD 3,000。定價USD 200-400/年，損失率約52%，財務上可行。",
    peril: "Foodborne Illness",
    annualFrequency: 3.5,
  },
  {
    minutesAgo: 13,
    newsTitle: "生醫供應鏈彈性保險：醫療物流資安中斷綜合保障方案",
    newsSource: "Medical Device Daily",
    newsSummary:
      "Boston Scientific begins to restore shipping after cyberattack; 72-hour delivery disruption affected 1,200 hospitals across 8 countries.",
    newsLink: "https://example.com/boston-scientific",
    productName: "生醫供應鏈彈性綜合保險（Medical Supply Chain Resilience）",
    targetAudience: "中型醫療耗材進口商、醫療器材經銷商及提供醫院物流服務的第三方倉儲業者。",
    marketGap:
      "現有貨物運輸險不涵蓋因供應商遭受網路攻擊導致的出貨延誤損失，而一般營業中斷險又要求「實體損毀」才能理賠。",
    coverageDetails:
      "1. 觸發條件：主要供應商因資安事件宣布停止出貨超過48小時\n2. 補償項目：緊急替代採購成本差額、空運改裝費用、醫院違約罰款\n3. 最高理賠：USD 300,000/年",
    exclusions: "已知的供應商財務問題、自然災害、海關扣押。",
    businessLogic:
      "整合Supply Chain Risk Management平台（如RiskRecon）監控供應商資安健康狀況，作為動態定價依據。",
    probabilityPct: 6.0,
    expectedLossUsd: 150000,
    premiumMin: 7000,
    premiumMax: 12000,
    pmDebate:
      "2024年醫療供應鏈攻擊事件激增，但市場上幾乎沒有針對「間接受害者（進口商/經銷商）」的保險產品。這是明確的市場空白。",
    underwriterDebate:
      "需要評估被保企業的主要供應商集中度——若單一供應商佔採購量超過60%，應提高保費或降低承保額度。",
    actuaryDebate:
      "參考Chainanalyze 2024報告，醫療供應鏈資安攻擊年均6.0次，單次影響時間平均72小時。年化保費USD 7,000-12,000合理。",
    peril: "Supply Chain Cyber Attack",
    annualFrequency: 0.9,
  },
  {
    minutesAgo: 18,
    newsTitle: "都會流域智慧防汛車隊保險（Smart Urban Flood Fleet Management）",
    newsSource: "中央社",
    newsSummary:
      "基隆淹水修繕車主受困路段，被迫緊急支援支付系統，如何結合氣象及時補償？",
    newsLink: "https://example.com/flood-fleet",
    productName: "都會流域智慧防汛車隊綜合保險",
    targetAudience: "台北、新北、基隆、高雄市區擁有5輛以上車輛的企業車隊、共享汽車業者及計程車行。",
    marketGap:
      "現有車險的水災理賠需要現場勘查，曠日廢時；車隊業者面臨「車輛受困但客戶仍需服務」的雙重損失，現無產品可一次性涵蓋。",
    coverageDetails:
      "1. 參數型觸發：氣象局發布豪大雨特報且特定測站24小時雨量超過200mm\n2. 涵蓋損失：車輛受困期間租金損失、緊急替代車輛租用費\n3. 快速理賠：觸發後48小時內自動撥付基本補償金",
    exclusions: "非暴雨期間的道路積水、車輛本身機械故障、司機駕駛疏失。",
    businessLogic:
      "與UberFleet、台灣大車隊合作嵌入式投保，結合中央氣象局Open API進行參數型理賠。",
    probabilityPct: 18.0,
    expectedLossUsd: 20000,
    premiumMin: 2800,
    premiumMax: 4200,
    pmDebate:
      "車隊業者痛點非常明確：颱風來了，車跑不了但客戶還是要服務。參數型設計可以讓理賠幾乎即時發生，非常適合B2B嵌入式保險。",
    underwriterDebate:
      "需要依據投保地點的歷史淹水頻率進行區域差異化定價。基隆、蘆洲等高風險地區應有25%附加保費。",
    actuaryDebate:
      "台灣主要都會區年均重大淹水事件2.3次，車隊業者平均單次損失USD 20,000。年化保費USD 2,800-4,200，損失率約68%，在可接受範圍內。",
    peril: "Typhoon Flood",
    annualFrequency: 2.3,
  },
  {
    minutesAgo: 24,
    newsTitle: "都會動態防汛車輛守護險（微型氣候指數附加條款）",
    newsSource: "自由時報",
    newsSummary:
      "北市多處地下停車場積水，車主求償無門，保險公司稱需提供淹水深度證明才能理賠。",
    newsLink: "https://example.com/parking-flood",
    productName: "都會動態防汛車輛守護險",
    targetAudience: "居住或停車於台北、新北低窪地區地下停車場的一般自用轎車車主。",
    marketGap:
      "地下停車場淹水理賠流程繁瑣，保戶需自行舉證淹水深度與直接因果關係，往往求償困難。",
    coverageDetails:
      "1. 觸發條件：氣象局發布的自動雨量站數據超過閾值，且保戶停車地址在官方公布的易淹水潛勢區內\n2. 直接補償：車輛受損修繕費用（最高USD 15,000）\n3. 交通補助：理賠期間提供每日USD 30替代交通補助，最長30天",
    exclusions: "停放於未列管或非法改建地下空間、颱風警報前已知風險未移車。",
    businessLogic:
      "整合地政司易淹水潛勢區圖層API與氣象局自動測站數據，實現客觀觸發，免去現場勘查爭議。",
    probabilityPct: 9.0,
    expectedLossUsd: 12000,
    premiumMin: 800,
    premiumMax: 1500,
    pmDebate:
      "這是一個C端（消費者）產品，重點在於「主動通知與無爭議理賠」。我建議在LINE Pay、街口支付的車險購買流程中嵌入附加選項。",
    underwriterDebate:
      "地下停車場的深度數據難以取得，建議改採「停車格是否位於潛勢區一級警戒範圍」作為客觀核保依據。",
    actuaryDebate:
      "台北盆地地下停車場淹水事件年均3.2次，但嚴重事件（淹水超過50cm）約0.9次。年化保費USD 800-1,500，損失率約72%。",
    peril: "Typhoon Flood",
    annualFrequency: 0.9,
  },
  {
    minutesAgo: 29,
    newsTitle: "「極速安居」都會型智慧防汛綜合保險",
    newsSource: "工商時報",
    newsSummary:
      "極端降雨頻率創新高，台灣地方政府啟動智慧防洪計劃，民間保險需求急遽上升。",
    newsLink: "https://example.com/smart-flood",
    productName: "極速安居都會型智慧防汛綜合保險",
    targetAudience: "居住於台灣都市低窪地區的住宅所有人與租屋族，特別是台北、新北、高雄市區。",
    marketGap:
      "住宅水災險傳統理賠流程平均需要14天，遠超過家庭緊急資金需求的時間點。極端降雨頻率提升，但投保率仍偏低，主要原因是過去理賠體驗差。",
    coverageDetails:
      "1. 參數觸發：氣象局豪雨特報且在地政資料顯示房屋位於易淹水潛勢區\n2. 緊急生活補助：48小時內自動撥付USD 1,000緊急金\n3. 修繕理賠：最高USD 30,000，文件齊全後5工作日到帳\n4. 附加服務：免費連接智慧水位感測器（首年免費安裝）",
    exclusions: "海嘯、地震引發之海水倒灌、主觀故意損毀。",
    businessLogic:
      "與IoT廠商合作，在投保住宅安裝低功耗水位感測器，感測器數據作為客觀理賠觸發依據，徹底解決舉證困難問題。",
    probabilityPct: 11.0,
    expectedLossUsd: 25000,
    premiumMin: 1500,
    premiumMax: 2800,
    pmDebate:
      "IoT感測器附加服務是這個產品的核心差異點。投保不只是買保險，更是獲得一個智慧防災預警系統，可以大幅提升客戶黏著度與續保率。",
    underwriterDebate:
      "需要建立感測器數據的tamper-proof機制，確保數據不被人為篡改。建議引入第三方數據驗證平台。",
    actuaryDebate:
      "台灣主要都市淹水事件年均2.8次，住宅平均損失USD 25,000。加入感測器後，預計可將損失率從82%降至65%，年化保費USD 1,500-2,800合理。",
    peril: "Typhoon Flood",
    annualFrequency: 2.8,
  },
  {
    minutesAgo: 35,
    newsTitle: "安心核：都會極端降雨車輛淹水補償保險",
    newsSource: "聯合新聞網",
    newsSummary:
      "多達3000輛車在豪雨後受困基隆河沿岸，保險公司理賠排隊人龍塞滿服務中心。",
    newsLink: "https://example.com/flood-vehicles",
    productName: "安心核：都會極端降雨車輛全面補償保險",
    targetAudience: "台灣都市地區持有1-3輛自用汽車的家庭，特別是停車於露天或地面停車場者。",
    marketGap:
      "現行車輛水災理賠需要現場勘查，旺季排期動輒3-4週，保戶面臨「車無法修、出行中斷、收入受影響」的三重困境。",
    coverageDetails:
      "1. 觸發條件：氣象局發布的特定測站雨量超過閾值\n2. 即時補償：觸發後24小時內自動撥付USD 2,000應急金\n3. 修繕費用：最高USD 20,000，憑修繕工單3日撥款\n4. 代步服務：最多30天的代步車費用，每日上限USD 50",
    exclusions: "停放於已知淹水高風險區且警報發布後未移車、車輛本身機械故障。",
    businessLogic:
      "整合中央氣象局API自動計算理賠，與台灣大車隊、格上租車合作提供即時代步服務，形成完整的生態系服務。",
    probabilityPct: 14.0,
    expectedLossUsd: 18000,
    premiumMin: 1200,
    premiumMax: 2000,
    pmDebate:
      "「24小時撥付應急金」是這個產品的殺手特點。在颱風後的第一天，保戶最需要的是現金，而不是等待勘查。這個設計完全瞄準了市場痛點。",
    underwriterDebate:
      "應要求投保時上傳停車場地址，並系統性評估停車位置的淹水風險等級，對高風險地址（如基隆河旁50m內）加收30%保費。",
    actuaryDebate:
      "台灣颱風季（6-10月）車輛淹水事件年均4.2次，平均損失USD 18,000。年化保費USD 1,200-2,000，損失率約70%，符合商業標準。",
    peril: "Typhoon Flood",
    annualFrequency: 4.2,
  },
];

// ── build run summaries and records ──────────────────────────────────────────

export const MOCK_RUN_SUMMARIES: RunSummary[] = RUN_DATA.map((d, i) => {
  const id = stampId(d.minutesAgo);
  const tx = mockTx();
  return {
    decision_id: id,
    run_id: `run-${id}`,
    timestamp: ts(d.minutesAgo),
    news_title: d.newsTitle,
    product_name: d.productName,
    is_mock_proposal: false,
    chain_is_mock: i > 2,
    tx_hash: tx,
    verification_url: i > 2 ? null : `https://sepolia.etherscan.io/tx/${tx}`,
  };
});

export const MOCK_RUN_RECORDS: RunRecord[] = RUN_DATA.map((d, i) => {
  const summary = MOCK_RUN_SUMMARIES[i];
  const tx = summary.tx_hash ?? mockTx();
  return {
    decision_id: summary.decision_id,
    run_id: summary.run_id ?? undefined,
    timestamp: summary.timestamp,
    news: {
      title: d.newsTitle,
      link: d.newsLink,
      published: ts(d.minutesAgo + 30),
      summary: d.newsSummary,
      source: d.newsSource,
      is_mock: false,
    },
    matched_products: [
      {
        id: `P-${i * 3 + 1}`,
        name: "企業財產綜合保險",
        category: "Property",
        description: "涵蓋企業資產之各類風險損失",
        distance: 0.18,
      },
      {
        id: `P-${i * 3 + 2}`,
        name: "營業中斷保險",
        category: "Business Interruption",
        description: "保障因意外事故造成的營業停頓損失",
        distance: 0.24,
      },
      {
        id: `P-${i * 3 + 3}`,
        name: "責任保險",
        category: "Liability",
        description: "涵蓋第三方損害賠償責任",
        distance: 0.31,
      },
    ],
    actuarial_data: {
      probability_pct: d.probabilityPct,
      expected_loss_usd: d.expectedLossUsd,
      premium_range_usd: [d.premiumMin, d.premiumMax],
      markup_multiplier: [1.3, 1.6],
      basis: {
        peril: d.peril,
        probability_source: "NFA historical frequency",
        probability_method: "Poisson frequency model",
        annual_frequency: d.annualFrequency,
        loss_method: "assumption",
      },
    },
    proposal_data: {
      source_news: d.newsTitle,
      news_summary: d.newsSummary,
      news_link: d.newsLink,
      actuarial_data: {
        probability_pct: d.probabilityPct,
        expected_loss_usd: d.expectedLossUsd,
        premium_range_usd: [d.premiumMin, d.premiumMax],
        markup_multiplier: [1.3, 1.6],
      },
      debate: { pm: d.pmDebate, underwriter: d.underwriterDebate },
      proposal: {
        product_name: d.productName,
        target_audience: d.targetAudience,
        market_gap: d.marketGap,
        coverage_details: d.coverageDetails,
        exclusions: d.exclusions,
        business_logic: d.businessLogic,
      },
      is_mock: false,
      model: "gemini-3.5-flash-lite",
    },
    blockchain_receipt: {
      decision_id: summary.decision_id,
      payload: {},
      data_hash: tx.slice(0, 66),
      blockchain_tx_hash: tx,
      block_number: 7800000 + i * 137,
      verification_url: summary.verification_url,
      network: i <= 2 ? "sepolia" : "mock",
      is_mock: i > 2,
      timestamp: summary.timestamp,
    },
    report_path: `reports/${summary.decision_id}.json`,
  };
});
