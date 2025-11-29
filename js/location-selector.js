// 約會地點選擇器 JavaScript

// 約會地點資料
const locationData = {
  outdoor: {
    name: '戶外公共場所',
    items: ['夜市', '商圈', '文創市集', '遊樂園', '觀光農場', '牧場（公開區域）', '公共音樂活動場域', '公園', '景觀步道', '戶外景點', '單車道', '海邊（公共岸線）', '河岸步道', '市區觀光場', '城市地標', '戶外拍照景點', '各大戶外廣場', '開放式草皮區', '大型市集活動場所', '其他']
  },
  indoor: {
    name: '室內公共場所',
    items: ['咖啡廳', '餐廳', '速食店', '咖啡館', '茶飲店', '百貨公司', '購物中心', '書店', '便利商店', '展覽館', '活動場館', '電影院', 'KTV（大型連鎖）', '桌遊店', 'VR體驗館', '電玩店', '保齡球館', '撞球館', '飛鏢場', '密室逃脫場館', '運動中心', '社區活動中心', '其他']
  },
  private: {
    name: '私人使用空間',
    items: ['私人住所', '旅館飯店', '民宿', 'Airbnb', '私人會所', '包廂', '其他']
  },
  online: {
    name: '線上',
    items: ['視訊通話', '語音通話', '線上遊戲', '直播互動', '其他']
  }
};

// 儲存已選擇的地點
let selectedLocations = {
  outdoor: [],
  indoor: [],
  private: [],
  online: []
};

// 儲存其他選項的自訂文字
let otherLocationText = {
  outdoor: '',
  indoor: '',
  private: '',
  online: ''
};

// 當前開啟的分類
let currentCategory = null;

// 開啟選擇彈窗
function openLocationModal(category) {
  if (!category) return; // 如果沒有選擇類別則不開啟

  currentCategory = category;
  const data = locationData[category];

  // 重設下拉選單
  const selectElement = document.getElementById('date-location-select');
  if (selectElement) {
    selectElement.value = '';
  }

  // 更新標題
  document.getElementById('location-modal-title').textContent = data.name;

  // 生成選項列表
  const itemsList = document.getElementById('location-items-list');
  itemsList.innerHTML = '';

  data.items.forEach(function(item, index) {
    const isChecked = selectedLocations[category].includes(item);
    const isOther = item === '其他';

    const label = document.createElement('label');
    label.className = 'flex items-center gap-2 p-2.5 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors' + (isChecked ? ' bg-primary/10 border-primary' : '');
    label.innerHTML = '<input type="checkbox" class="kt-checkbox location-item-checkbox" value="' + item + '" ' + (isChecked ? 'checked' : '') + ' onchange="handleItemCheck(this)" data-is-other="' + isOther + '" /><span class="text-sm">' + item + '</span>';
    itemsList.appendChild(label);
  });

  // 更新全選狀態
  updateSelectAllState();

  // 處理其他選項輸入框
  const otherContainer = document.getElementById('other-input-container');
  const otherInput = document.getElementById('other-location-input');
  if (selectedLocations[category].includes('其他')) {
    otherContainer.classList.remove('hidden');
    otherInput.value = otherLocationText[category] || '';
  } else {
    otherContainer.classList.add('hidden');
    otherInput.value = '';
  }

  // 顯示彈窗
  document.getElementById('location-select-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// 關閉選擇彈窗
function closeLocationModal() {
  document.getElementById('location-select-modal').style.display = 'none';
  document.body.style.overflow = '';
  currentCategory = null;
}

// 處理選項勾選
function handleItemCheck(checkbox) {
  const item = checkbox.value;
  const isOther = checkbox.dataset.isOther === 'true';
  const label = checkbox.closest('label');

  if (checkbox.checked) {
    if (!selectedLocations[currentCategory].includes(item)) {
      selectedLocations[currentCategory].push(item);
    }
    label.classList.add('bg-primary/10', 'border-primary');
  } else {
    const index = selectedLocations[currentCategory].indexOf(item);
    if (index > -1) {
      selectedLocations[currentCategory].splice(index, 1);
    }
    label.classList.remove('bg-primary/10', 'border-primary');
  }

  // 處理其他選項
  if (isOther) {
    const otherContainer = document.getElementById('other-input-container');
    if (checkbox.checked) {
      otherContainer.classList.remove('hidden');
    } else {
      otherContainer.classList.add('hidden');
      otherLocationText[currentCategory] = '';
    }
  }

  updateSelectAllState();
}

// 全選/取消全選
function toggleSelectAll(checkbox) {
  const checkboxes = document.querySelectorAll('.location-item-checkbox');
  const data = locationData[currentCategory];

  checkboxes.forEach(function(cb) {
    cb.checked = checkbox.checked;
    const label = cb.closest('label');
    if (checkbox.checked) {
      label.classList.add('bg-primary/10', 'border-primary');
    } else {
      label.classList.remove('bg-primary/10', 'border-primary');
    }
  });

  if (checkbox.checked) {
    selectedLocations[currentCategory] = data.items.slice();
    document.getElementById('other-input-container').classList.remove('hidden');
  } else {
    selectedLocations[currentCategory] = [];
    document.getElementById('other-input-container').classList.add('hidden');
    otherLocationText[currentCategory] = '';
  }
}

// 更新全選狀態
function updateSelectAllState() {
  const checkboxes = document.querySelectorAll('.location-item-checkbox');
  const selectAllCheckbox = document.getElementById('location-select-all');
  const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; });
  const someChecked = Array.from(checkboxes).some(function(cb) { return cb.checked; });

  selectAllCheckbox.checked = allChecked;
  selectAllCheckbox.indeterminate = someChecked && !allChecked;
}

// 確認選擇
function confirmLocationSelection() {
  if (selectedLocations[currentCategory].includes('其他')) {
    otherLocationText[currentCategory] = document.getElementById('other-location-input').value;
  }
  updateCategoryButtons();
  updateSelectedDisplay();
  updateHiddenInput();
  closeLocationModal();
}

// 更新分類選擇狀態（下拉選單版本保留空函數以兼容）
function updateCategoryButtons() {
  // 下拉選單版本不需要更新按鈕樣式
}

// 更新已選擇項目顯示
function updateSelectedDisplay() {
  const displayContainer = document.getElementById('selected-locations-display');
  const tagsContainer = document.getElementById('selected-locations-tags');

  let allSelected = [];
  Object.keys(locationData).forEach(function(category) {
    selectedLocations[category].forEach(function(item) {
      let displayText = item;
      if (item === '其他' && otherLocationText[category]) {
        displayText = '其他(' + otherLocationText[category] + ')';
      }
      allSelected.push({
        category: category,
        item: item,
        displayText: displayText,
        categoryName: locationData[category].name
      });
    });
  });

  if (allSelected.length > 0) {
    displayContainer.classList.remove('hidden');
    displayContainer.classList.add('flex');
    tagsContainer.innerHTML = allSelected.map(function(loc) {
      return '<span class="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">' + loc.displayText + '<button type="button" onclick="removeLocation(\'' + loc.category + '\', \'' + loc.item.replace(/'/g, "\\'") + '\')" class="hover:text-destructive">×</button></span>';
    }).join('');
  } else {
    displayContainer.classList.add('hidden');
    displayContainer.classList.remove('flex');
    tagsContainer.innerHTML = '';
  }
}

// 移除單一選項
function removeLocation(category, item) {
  const index = selectedLocations[category].indexOf(item);
  if (index > -1) {
    selectedLocations[category].splice(index, 1);
    if (item === '其他') {
      otherLocationText[category] = '';
    }
  }
  updateCategoryButtons();
  updateSelectedDisplay();
  updateHiddenInput();
}

// 更新隱藏的 input 值
function updateHiddenInput() {
  const allData = {};
  Object.keys(locationData).forEach(function(category) {
    if (selectedLocations[category].length > 0) {
      allData[category] = {
        items: selectedLocations[category],
        other: otherLocationText[category] || null
      };
    }
  });
  document.getElementById('date-location-input').value = JSON.stringify(allData);
}

// 點擊背景關閉彈窗
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('location-select-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal || e.target.classList.contains('el-overlay-dialog')) {
        closeLocationModal();
      }
    });
  }
});
