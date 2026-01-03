// options.js
const extensionsList = document.getElementById("extensions-list");
const saveButton = document.getElementById("save-settings");

// 銳化圖片的函數 (與 popup.js 相同)
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
  extensions.forEach((extension) => {
    if (extension.type === "extension" && extension.id !== chrome.runtime.id) {
      const card = document.createElement("div");
      card.classList.add("setting-card");

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

      // 開關
      const switchLabel = document.createElement("label");
      switchLabel.classList.add("switch");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = extension.id;
      checkbox.checked = false;

      chrome.storage.sync.get("hiddenExtensions", (data) => {
        const hiddenExtensions = data.hiddenExtensions || [];
        checkbox.checked = hiddenExtensions.includes(extension.id);
      });

      const slider = document.createElement("span");
      slider.classList.add("slider");

      switchLabel.appendChild(checkbox);
      switchLabel.appendChild(slider);
      card.appendChild(switchLabel);

      extensionsList.appendChild(card);
    }
  });
});

saveButton.addEventListener("click", () => {
  const hiddenExtensions = Array.from(extensionsList.querySelectorAll("input:checked")).map((input) => input.id);
  chrome.storage.sync.set({ hiddenExtensions }, () => {
    alert("設定已保存！");
  });
});