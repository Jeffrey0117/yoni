# 生活照輪播修正方案

## 問題描述
1. 圖片沒有統一尺寸 (應該都是 1145x715)
2. 左右箭頭位置不對 (應該在最左邊和最右邊)
3. 圖片沒有置中顯示
4. 關閉按鈕不在右上角
5. 圖片模糊

## 解決方案

### HTML 結構
```html
<div id="life_photos_overlay" class="fixed inset-0 z-[2000] bg-black flex items-center justify-center">
  <!-- 關閉按鈕:固定在右上角 -->
  <button id="life_close_btn" class="fixed top-4 right-4 z-[2001]">X</button>
  
  <!-- 左箭頭:固定在最左邊中間 -->
  <button id="life_prev_btn" class="fixed left-4 top-1/2 -translate-y-1/2 z-[2001]">←</button>
  
  <!-- 圖片容器:固定尺寸 1145x715,居中 -->
  <div class="w-[1145px] h-[715px]">
    <img id="life_photos_img" class="w-full h-full object-cover" />
  </div>
  
  <!-- 右箭頭:固定在最右邊中間 -->
  <button id="life_next_btn" class="fixed right-4 top-1/2 -translate-y-1/2 z-[2001]">→</button>
</div>
```

### CSS 要點
- `object-cover`: 確保圖片填滿容器並裁切
- `fixed`: 箭頭和關閉按鈕使用 fixed 定位
- `w-[1145px] h-[715px]`: 固定圖片容器尺寸
- `flex items-center justify-center`: 容器置中對齊

### JavaScript
- 移除所有動態尺寸調整邏輯
- 直接設定圖片 src,讓 CSS 處理尺寸