# Atlas 後端 API 契約（給前端）

後端：`./venv/bin/uvicorn apigee_target:app --port 8080`
前端讀 `NEXT_PUBLIC_API_BASE`（預設 `http://localhost:8080`），CORS 已允許 `localhost:3000`。

## 授權

所有 **POST** 端點都要帶 `Authorization: Bearer MOCK_APIGEE_TOKEN`（Demo 用萬用 token；正式環境由 Apigee 簽發 JWT）。
**GET** 端點（列表、單筆、SSE）不需要，因為瀏覽器的 `EventSource` 無法自訂標頭。
POST 端點每個 IP 每分鐘限 30 次。

## 啟動一次執行

`POST /api/v1/runs`（需 token）→ `{"run_id": "9a123da108b4", "status": "running"}`

## 即時進度（Server-Sent Events）

`GET /api/v1/runs/{run_id}/events`，`Content-Type: text/event-stream`。
前端用 `new EventSource(url)`，對每個事件名稱 `addEventListener`。事件依序如下，`data` 皆為 JSON：

| 順序 | event | data | 畫面用途 |
|---|---|---|---|
| 1 | `news_fetched` | 新聞陣列 `[{title, link, published, summary, source, is_mock}]` | 左欄新聞列表 |
| 2 | `news_selected` | 單則新聞物件 | 高亮被選中的新聞 |
| 3 | `kb_matched` | `[{id, name, category, description, distance}]` 最相關 5 項既有商品 | 左欄「比對到的既有商品」 |
| 4 | `actuarial` | `{probability_pct, expected_loss_usd, premium_range_usd:[min,max], markup_multiplier:[min,max]}` | 右欄數字 |
| 5 | `pm` | 字串，PM 提案全文 | 中欄第一段 |
| 6 | `underwriter` | 字串，核保批評全文 | 中欄第二段 |
| 7 | `actuary` | 字串，精算師的 business_logic | 中欄第三段 |
| 8 | `report` | `{report_path}` | 顯示已產出 docx |
| 9 | `chain_pending` | `{network}` | 徽章轉成「上鏈中…」 |
| 10 | `chain_done` | 鏈上收據，見下 | 徽章轉成「已上鏈」或「模擬」 |
| 11 | `done` | 完整紀錄（與 `GET /api/v1/runs/{decision_id}` 相同） | 收尾、加入歷史列表 |
| 例外 | `error` | 字串 | 顯示錯誤 |

`chain_done` 的收據：

```json
{
  "decision_id": "atlas-20260905-9f9ef0de",
  "payload": { "...被雜湊的決策欄位..." },
  "data_hash": "d2bc58…",
  "blockchain_tx_hash": "0x0894…",
  "block_number": 11635110,
  "verification_url": "https://sepolia.etherscan.io/tx/0x0894…",
  "network": "Ethereum Sepolia Testnet",
  "is_mock": false,
  "timestamp": "2026-09-05T02:18:24Z"
}
```

**徽章規則**：`is_mock === false` 才顯示綠色「已上鏈 Sepolia」並連到 `verification_url`；`is_mock === true` 顯示灰色「模擬模式」且不放任何連結。`tx_hash` 為 `null` 時同樣視為模擬。

## 歷史紀錄

- `GET /api/v1/runs?limit=50` → 摘要陣列，最新在前：
  `{decision_id, run_id, timestamp, news_title, product_name, is_mock_proposal, chain_is_mock, tx_hash, verification_url}`
- `GET /api/v1/runs/{decision_id}` → 完整紀錄：
  `{decision_id, timestamp, news, matched_products, actuarial_data, proposal_data:{proposal, debate:{pm, underwriter}, is_mock, model}, blockchain_receipt, report_path}`

重播：用完整紀錄的欄位，依上表順序自己排時間差播放即可，不需要後端。

## 鏈上驗證（Demo 的關鍵互動）

`POST /api/v1/runs/{decision_id}/verify`（需 token），body 可省略或 `{"tampered": {"probability_pct": 9.99}}`。

回傳：

```json
{
  "decision_id": "atlas-20260905-9f9ef0de",
  "local_hash_hex": "…重新計算的雜湊…",
  "matched": true,
  "onchain_timestamp": 1788545904,
  "submitter": "0xDEd8…EDa0",
  "is_mock": false,
  "tampered_fields": [],
  "payload": { "...實際拿去雜湊的內容..." },
  "stored_hash": "…",
  "tx_hash": "0x…",
  "verification_url": "https://sepolia.etherscan.io/tx/0x…"
}
```

建議畫面：「驗證」按鈕呼叫不帶 body → 顯示 matched 與鏈上時間戳；「竄改測試」把 `probability_pct` 改成任意值再呼叫 → `matched: false`，把 `tampered_fields` 標紅。

## 攤平格式端點（首頁與 /generator 頁目前在用）

資料來源與上面相同，只是把 `proposal`、`actuarial_data`、`blockchain_tx_hash`、`source_news` 攤到頂層，
且 `actuarial_data.probability` 是 0 到 1 的小數（`probability_pct` 也保留）。

- `GET /api/v1/all_reports` → 全部報告，**舊到新**（前端自行 reverse）
- `GET /api/v1/latest_report` → 最新一份，沒有時回 `{"error": "..."}`
- `POST /api/v1/run_agent`（需 token）→ 同步跑完整 pipeline 再回傳報告，約 60 到 100 秒；失敗回 `{"error": "..."}`

## 其他

- `GET /api/v1/chain/status` → `{mode: "sepolia" | "mock", rpc_url, contract_address, submitter}`
- `GET /api/v1/health`
- `GET /api/v1/knowledge_base` → 30 項既有商品

## 執行時間參考

一次完整執行約 60 到 100 秒：抓新聞 3 秒、挑新聞 5 秒、比對 1 秒、三段辯論 40 到 60 秒、上鏈確認 10 到 15 秒。
