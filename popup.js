// popup.js
const extensionsContainer = document.getElementById("extensions-container");
const searchBar = document.getElementById("search-bar");

// 銳化圖片的函數
function sharpenCanvas(ctx) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const newData = new Uint8ClampedArray(data);
  const width = imageData.width;
  const height = imageData.height;

  // 定義銳化濾鏡 kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      // 應用 kernel
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const neighborPixelIndex = ((y + ky) * width + (x + kx)) * 4;
          const kernelValue = kernel[(ky + 1) * 3 + (kx + 1)];
          r += data[neighborPixelIndex + 0] * kernelValue;
          g += data[neighborPixelIndex + 1] * kernelValue;
          b += data[neighborPixelIndex + 2] * kernelValue;
        }
      }

      newData[pixelIndex + 0] = Math.min(255, Math.max(0, r));
      newData[pixelIndex + 1] = Math.min(255, Math.max(0, g));
      newData[pixelIndex + 2] = Math.min(255, Math.max(0, b));
      newData[pixelIndex + 3] = data[pixelIndex + 3]; // alpha 值保持不變
    }
  }

  imageData.data.set(newData);
  ctx.putImageData(imageData, 0, 0);
}


chrome.management.getAll((extensions) => {
  // 讀取隱藏擴充功能設定
  chrome.storage.sync.get("hiddenExtensions", (data) => {
    const hiddenExtensions = data.hiddenExtensions || [];

    // 只篩選出擴充功能，並按名稱排序（不分大小寫）
    const sortedExtensions = extensions
      .filter(extension => extension.type === "extension" && extension.id !== chrome.runtime.id)
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    sortedExtensions.forEach((extension) => {
      // 如果該擴充功能在隱藏清單中，則跳過顯示
      if (hiddenExtensions.includes(extension.id)) {
        return; // 不顯示這個擴充功能
      }

      const card = document.createElement("div");
      card.classList.add("extension-card");

      // 圖標 - 優先使用最高解析度圖示，若無則使用本地 puzzle.png
      let iconSrc = "puzzle_rmbg.png"; // 預設圖示
      if (extension.icons && extension.icons.length > 0) {
        let bestIcon = extension.icons[0]; // 預設為第一個圖示
        let maxSize = 0;
        extension.icons.forEach(iconInfo => {
          const size = iconInfo.size || 0; // 某些圖示可能沒有 size 屬性
          if (size > maxSize) {
            maxSize = size;
            bestIcon = iconInfo;
          }
        });
        iconSrc = bestIcon.url;
      }
      const icon = document.createElement("img");

      // 首先嘗試從 local storage 載入緩存的圖片
      chrome.storage.local.get(`icon_cache_${extension.id}`, (cache) => {
        if (cache[`icon_cache_${extension.id}`]) {
          icon.src = cache[`icon_cache_${extension.id}`]; // 顯示緩存的圖片
        } else {
          icon.src = "loading_60fps.png"; // 如果沒有緩存，先顯示 loading_60fps.png
        }

        // 然後在背景載入原始圖片並銳化
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
          ctx.drawImage(img, 0, 0, 512, 512);
          sharpenCanvas(ctx); // 銳化處理
          const sharpenedDataUrl = canvas.toDataURL();
          icon.src = sharpenedDataUrl; // 將 canvas 內容設為 img 的 src

          // 儲存銳化後的圖片到 local storage
          chrome.storage.local.set({ [`icon_cache_${extension.id}`]: sharpenedDataUrl });
        };
        img.onerror = function() {
          icon.src = "puzzle_rmbg.png"; // 錯誤處理，載入預設 puzzle.png
        };
        img.src = iconSrc; // 載入原始圖示
      });


      card.appendChild(icon);

      // 名稱
      const name = document.createElement("p");
      name.textContent = extension.name;
      card.appendChild(name);

      // 根據啟用狀態設置樣式
      if (!extension.enabled) {
        card.classList.add("disabled");
      }

      card.addEventListener("click", () => {
        const newState = !extension.enabled; // 判斷新的啟用狀態

        // 步驟 1: 即時樂觀更新 UI 樣式
        if (newState) { // 如果將要啟用 (原本是停用)
          card.classList.remove("disabled");
        } else { // 如果將要停用 (原本是啟用)
          card.classList.add("disabled");
        }
        extension.enabled = newState; // 同步更新本地的 extension 物件狀態

        // 步驟 2: 在背景執行實際的擴充功能狀態改變
        chrome.management.setEnabled(extension.id, newState, () => {
          // 這裡的回調函數會在實際操作完成後執行
          // 可以在這裡處理錯誤或做其他後續邏輯，但 UI 已經更新了
        });
      });

      extensionsContainer.appendChild(card);
    });
  });
});

searchBar.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
  document.querySelectorAll(".extension-card").forEach((card) => {
    const name = card.querySelector("p").textContent.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
});