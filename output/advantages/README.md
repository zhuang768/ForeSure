# 核心優勢插圖

使用者選定第一組玻璃質感修正版。四張素材由內建 image_gen 依 reference.png 個別製作，再用 Sharp 轉成 WebP quality 85；未裁切或拉伸原始生成圖。

| 功能 | 正式資產（相對專案根目錄） | 原檔 | 完整提示詞 | Bytes |
| --- | --- | --- | --- | --- |
| 台灣時事感測 | frontend/public/illustrations/advantages/taiwan-sensing.webp | sensing-source.png | [提示詞](sensing-prompt.md) | 138756 |
| 三方檢視 | frontend/public/illustrations/advantages/agent-review.webp | review-source.png | [提示詞](review-prompt.md) | 58726 |
| 條件觸發 | frontend/public/illustrations/advantages/parametric-trigger.webp | trigger-source.png | [提示詞](trigger-prompt.md) | 80096 |
| 鏈上存證 | frontend/public/illustrations/advantages/onchain-ledger.webp | ledger-source.png | [提示詞](ledger-prompt.md) | 92146 |

實際生成尺寸均為 1122 × 1402；提示詞請求 1024 × 1280，生成器回傳近似 4:5 的較大圖。正式 WebP 保留原尺寸，共 369724 bytes（約 361 KiB）。

使用位置：frontend/src/app/page.tsx 的 AdvantageSlider。圖片放在 public 目錄隨 Next 靜態匯出，使用 Image unoptimized 避免需要圖片最佳化伺服器。固定卡框比例避免載入跳動；四張圖接近可視區域時延遲載入，切換時以 opacity 交替。

各 desktop-light 圖為實際輪播截圖，comparison.png 為參考與實作插圖並排比對。完整驗證見 [design-qa.md](design-qa.md)。
