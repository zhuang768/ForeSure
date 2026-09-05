# 三方 AI 角色說明驗證

final result: passed

日期：2026-09-06。使用者選定第三張圖，範圍是首頁三方角色說明的精簡與展開互動。

## 視覺來源與實作

- 指定來源：`/Users/ritali/.codex/generated_images/01a072cd-c53c-7ac1-8277-4ff9a21698ed/exec-e61b71c7-36b3-4efa-b08c-c87375a1b266.png`。
- 專案內參考副本：`output/agents-accordion/reference.png`。
- 實作：<http://localhost:3000/#agents>。
- 同圖比對：`output/agents-accordion/comparison.png`，左側為選定圖，右側為瀏覽器畫面。
- 桌面證據：`desktop-light-viewport.png`、`desktop-dark-viewport.png`，以及裁出的 `desktop-light.png`、`desktop-dark.png`（皆位於 `output/agents-accordion/`）。
- 手機證據：同目錄 `mobile-light.png`、`mobile-english.png`。

來源為 1881 × 836，等比例縮成 1440 × 640 供比較；桌面瀏覽器 viewport 是 1440 × 900，PNG 同尺寸，截圖密度為每 CSS px 對應一個 PNG px。區塊從 y=66 起，實測高 659.8px，裁圖為 1440 × 660。沒有拉伸實作截圖。比較時保留來源與實作約 20px 的高度差。

比對狀態為中文、淺色、產品經理展開，另外兩位角色收合。來源是獨立區塊，實作裁圖排除既有導覽及下一區段。全景比對中角色文字、分隔線與展開符號均清楚可讀；這一區沒有插圖、細密表格或其他需要另行放大的視覺資產，因此不另製局部比對圖。

## 發現

- 沒有未解決的 P0／P1／P2 問題。
- P3：實作沿用專案字體，與生成稿的字形及細部分隔線深淺略有差異；保留既有字體與深淺色 tokens。實作高度約多 20px，角色與摘要的對齊及整體比例維持一致。
- 首次有效的同尺寸視覺比對通過，沒有比對後再修改樣式。截圖工具的直接 clip 輸出比例異常，已排除；最終證據使用完整 viewport 截圖按實際區塊座標裁切，不把工具截圖問題計為介面缺陷。

## 五項視覺檢查

| 項目 | 結果 |
| --- | --- |
| 字體與層級 | 短標題、角色名稱、綠色摘要、展開說明分級清楚；保留選定稿的 THREE PERSPECTIVES 小標。 |
| 間距與構圖 | 三列共用一組分隔線，取消大編號卡片。相同 1440px 寬度下，區塊由先前約 944.5px 縮到 659.8px，約減少 30%。 |
| 色彩 | 使用專案的背景、正文、次要文字、品牌綠與邊線 tokens；中文桌面深淺色均實際檢查。 |
| 圖示與資產 | 展開／收合使用 Lucide Plus／Minus；沒有新增插圖或使用示意圖取代互動介面。 |
| 文案與響應式 | 中文採選定稿短文案；補齊對應英文。390px 手機將摘要移到角色名稱下，所有角色均可讀，document 寬度保持 390px。 |

## 互動與技術驗證

- 預設展開產品經理；點整列核保專家會自動關閉產品經理，且 DOM 的 aria-expanded／hidden 狀態一致。
- Space 可收合目前角色；Enter 可展開精算師；支持全部收合。
- 每個按鈕提供 aria-controls、aria-expanded，說明區以 aria-labelledby 對應按鈕；圖示與角色縮寫不重複朗讀。
- 中英文與深淺色切換後保留展開中的角色。手機選單、原有導覽與首頁 CTA 沿用既有功能。
- 全套 55 個單元測試通過，變更檔案 ESLint 通過，`npm run build -- --webpack`（包含 TypeScript）通過。
- 瀏覽器最終驗證未出現新增 error／warn，檢查範圍為晚於 2026-09-05T19:58:00Z 的紀錄。
- Impeccable 機械檢查輸出 `[]`。其工具另回報沒有 build state 的舊 comp 提示；本次依使用者明確選定的第三張圖和上述實際瀏覽器證據驗證，沒有變更其他設計流程狀態。
- 已恢復使用者原本的 viewport，保持中文、淺色、產品經理展開，預覽停在角色區塊。

## 完成清單

- [x] 套用第三版的版面與精簡文案。
- [x] 實作角色展開、切換、收合與鍵盤操作。
- [x] 完成桌面深淺色及手機中英文檢查。
- [x] 通過測試、lint、型別與正式建置。
- [x] 保存來源與同尺寸比對證據。

先前葉片動畫驗證保存在 `output/leaf-animation/design-qa.md`。
