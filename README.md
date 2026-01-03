# Extension Manager (擴充功能管理器)

一個簡潔、高效的 Chrome 瀏覽器擴充功能管理器。旨在提供比原生管理頁面更快速的開關切換體驗，並包含圖示優化與自定義顯示功能。

![Version](https://img.shields.io/badge/version-1.1-blue)
![Manifest](https://img.shields.io/badge/manifest-V3-green)
![License](https://img.shields.io/badge/license-MIT-orange)

<!-- 在此處放一張擴充功能的截圖 -->
<!-- ![Extension Manager Screenshot](./screenshot.png) -->

## ✨ 主要功能

*   **快速切換開關**：在彈出視窗中直接點擊卡片即可啟用或停用擴充功能，支援「樂觀 UI (Optimistic UI)」更新，點擊即時反應，操作無延遲。
*   **即時搜尋**：透過搜尋列快速篩選並找到您需要的擴充功能。
*   **隱藏特定項目**：在選項頁面 (Options Page) 中，您可以設定不想顯示在管理列表中的擴充功能（例如那些您永遠不會關閉的核心插件）。
*   **圖示優化技術**：
    *   **智慧銳化**：內建 Canvas 圖像處理演算法，自動銳化擴充功能圖示，使其在介面上更清晰。
    *   **本地緩存**：使用 `chrome.storage.local` 緩存處理過的圖示，大幅提升二次開啟時的載入速度。
*   **狀態視覺化**：停用的擴充功能會自動變灰，狀態一目了然。

## 🛠️ 安裝方式

由於本專案尚未上架至 Chrome 線上應用程式商店（或是您想要自行修改程式碼），請依照以下步驟安裝：

1.  **下載程式碼**：
    將本專案 Clone 到本地，或是下載 ZIP 壓縮檔並解壓縮。
    ```bash
    git clone https://github.com/your-username/extension-manager.git
    ```

2.  **開啟擴充功能管理頁面**：
    在 Chrome 瀏覽器網址列輸入 `chrome://extensions/` 並按下 Enter。

3.  **開啟開發者模式**：
    開啟右上角的「開發者模式 (Developer mode)」開關。

4.  **載入未封裝項目**：
    點擊左上角的「載入未封裝項目 (Load unpacked)」，選擇本專案的資料夾。

## 📂 專案結構

*   `manifest.json`: 擴充功能的設定檔 (Manifest V3)。
*   `popup.html` / `popup.js` / `popup.css`: 點擊擴充功能圖示時彈出的主介面邏輯與樣式。
*   `options.html` / `options.js` / `options.css`: 設定頁面，用於管理隱藏清單。
*   `icon_cache`: 透過 Local Storage 實作，非實體資料夾。

## 🔐 權限說明

本擴充功能需要以下權限以正常運作，所有資料皆儲存於本地，不會上傳至任何伺服器：

*   `management`: 用於讀取已安裝的擴充功能列表，以及執行啟用/停用操作。
*   `storage`:
    *   `sync`: 用於儲存您的偏好設定（隱藏列表）。
    *   `local`: 用於緩存處理過的圖示圖片，加快載入速度。

## 🤝 貢獻 (Contributing)

歡迎任何形式的貢獻！如果您發現 Bug 或有新功能建議：

1.  Fork 本專案。
2.  建立您的 Feature Branch (`git checkout -b feature/AmazingFeature`)。
3.  提交您的修改 (`git commit -m 'Add some AmazingFeature'`)。
4.  推送到分支 (`git push origin feature/AmazingFeature`)。
5.  開啟一個 Pull Request。

## 📝 授權 (License)

本專案採用 [MIT License](LICENSE) 授權。

---

**注意**：本專案依賴 `extension_rmbg.png`, `puzzle_rmbg.png`, `loading_60fps.png` 等圖片資源，請確保目錄中包含這些檔案以正常顯示預設圖示。
