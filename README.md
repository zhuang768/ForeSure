# 🛡️ Atlas: 企業級 AI 智慧保險戰情室 (AI Insurance GenAI Platform)

> **FUTUREMODE x SITCON BUILDMODE GEN-AI HACKATHON 2026**
> **🏆 國泰金控 AI AGENT 賽道專屬解決方案**

Atlas 是一個專為大型金融控股公司（如國泰金控）設計的 **「金融級 Multi-Agent 自動化保險開發與風控平台」**。
本專案打破傳統保險商品開發耗時數月的瓶頸，利用 AI 代理人即時觀測全球災難與時事，自動比對現有商品缺口，並透過**多代理人辯論 (Multi-Agent Debate)** 產出極具商業價值的保險提案與精算定價。同時，具備企業級 API 安全閘道與高質感前端戰情室。

---

## ✨ 核心亮點與企業級架構 (Key Features)

### 1. 🧠 多重人格大腦：AI 內部激辯機制 (Multi-Agent Debate)
放棄單一 LLM 容易產生的幻覺與不切實際，我們的 `Strategy Agent` 內建了三層架構：
- **產品經理 (PM)**：負責吸收災難新聞，發想出極具破壞性創新的保險點子。
- **資深核保人員 (Underwriter)**：無情挑剔點子中的道德風險與理賠漏洞。
- **精算師 (Actuary)**：整合雙方意見，修補漏洞，並產出最終邏輯嚴密的正式提案。

### 2. 📊 大數據語意搜尋 (Semantic Search with ChromaDB)
拋棄傳統關鍵字比對。系統內建 `ChromaDB` 向量資料庫，將國泰現有保單庫 (`insurance_kb.json`) 向量化。當重大新聞發生時，AI 能以向量餘弦相似度瞬間抓出最相近的競品，精準打擊「市場缺口」。

### 3. 📈 動態精算與歷史回測 (Actuarial Engine & Backtesting)
- **規則引擎**：依據新聞災情等級（極端氣候、資安駭客），動態賦予基礎風險機率與預期損失。
- **量化回測**：內建 `backtester.py`，可自動抓取過去（如 2021 德州暴風雪、2023 茂宜島野火）的歷史災難進行回測，向管理層證明 AI 發明之保單的財務可行性。

### 4. 🔒 企業級 API 閘道安全 (Apigee Ready)
為完美銜接國泰 Apigee API Gateway，後端 `apigee_target.py` 實作了：
- **JWT 企業級身分認證 (HTTPBearer)**
- **基於 IP 的頻率限制 (Rate Limiting)**，防止惡意 DDoS 攻擊。

### 5. 💻 投資型高質感前端戰情室 (Next.js Glassmorphism UI)
採用 Next.js + TailwindCSS 打造。以白底/淺灰底為基調，搭配深色玻璃透視卡片 (Glass-card)，展現極致的視覺對比與專業金融科技質感。

---

## 🗺️ 系統架構圖 (Architecture)

```mermaid
graph TD
    A[🌍 全球新聞/時事 RSS] -->|Crawler| B(市場觀測雷達 Market Observer)
    B --> C{向量資料庫 ChromaDB}
    C -->|Semantic Search| D(商品缺口分析 Product Analyzer)
    D --> E((動態精算引擎 Actuarial Engine))
    
    E --> F[🤖 PM 提案]
    F --> G[🛑 核保員批評]
    G --> H[📐 精算師總結]
    
    H -->|Function Calling| I[📄 產出 Word 報告 & Audit Log]
    H -->|JSON API| J[💻 Next.js 前端戰情室]
    
    K[外部系統 / Apigee Gateway] -->|JWT + Rate Limit| L(FastAPI 後端)
    L --> B
```

---

## 🚀 快速啟動指南 (Getting Started)

### 1. 環境需求與依賴安裝
本專案包含 Python 後端與 Next.js 前端。
請先安裝 Python 依賴：
```bash
pip install -r requirements.txt
```

### 2. 設定環境變數
在根目錄建立 `.env` 檔案，填入你的 OpenAI 金鑰（驅動多代理人運算的核心）：
```env
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

### 3. 啟動後端 API 伺服器 (FastAPI)
此指令將啟動具備 JWT 防護的企業級 API 閘道器端點：
```bash
uvicorn apigee_target:app --reload --port 8080
```

### 4. 啟動前端 AI 戰情室 (Next.js)
開啟另一個終端機，進入 `frontend` 資料夾並啟動網頁：
```bash
cd frontend
npm install
npm run dev
```
打開瀏覽器進入 `http://localhost:3000` 即可觀賞高質感 UI。

### 5. (可選) 執行歷史巨災回測腳本
若要向評審展示 AI 對過去真實災難的精算反應，請執行：
```bash
python backtester.py
```

---

## 🛡️ 可信 AI 與未來發展 (Trustworthy AI - Roadmap)
針對國泰金控注重的 **「金融級 Multi-Agent 的授權與交易安全」**，本專案未來可輕易擴充：
- **內部準備金的雙重授權交易**：當 AI 提案通過，系統將強制要求 Risk Control Agent 進行數位簽章，雙重授權後方可呼叫核心系統轉移準備金，完美實現有紀律的**資金自動化管理**與 **AI 決策存證 (Audit Trail)**。
