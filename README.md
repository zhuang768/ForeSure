# AI 保險發明家 (AI Insurance Product Generator)

這是一個針對國泰金控 / B2B 金融情境設計的 AI Agent 專案。

## 系統架構

1. **排程觸發 (Scheduler)**: 使用 `apscheduler` 每日自動觸發。
2. **市場觀察 (Market Observer)**: 串接 Google News RSS 抓取全球時事。
3. **商品缺口比對 (Product Analyzer)**: 從現有保險知識庫 `insurance_kb.json` 中找出尚未覆蓋的市場缺口。
4. **精算引擎 (Actuarial Engine)**: 基於時事分析，估算風險發生機率與預期損失，並給出建議保費。
5. **AI 策略生成 (Strategy Agent)**: 透過 OpenAI Function Calling，自動撰寫完整的商業化保險提案。
6. **報告生成 (Report Generator)**: 自動產出企業級的 Word 報告檔案。
7. **企業 API 閘道 (Apigee Target)**: 透過 FastAPI 封裝，準備與 Google Cloud Apigee 串接，提供外部觸發端點與限流控制。

## 如何執行

### 1. 安裝依賴
```bash
pip install feedparser python-docx openai apscheduler python-dotenv pydantic fastapi uvicorn
```

### 2. 設定環境變數
建立 `.env` 檔案並填入你的 OpenAI API Key：
```env
OPENAI_API_KEY=sk-your-openai-api-key
```

### 3. 本地端獨立執行與排程
```bash
python main.py
```

### 4. 啟動供 Apigee 串接的 Backend API
```bash
python apigee_target.py
```
啟動後，將 Apigee 的 Target Endpoint 指向 `http://<YOUR_IP>:8080` 即可進行企業級 API 測試。
