# 🔔 YONI 瀏覽器推播通知 - 實施指南

## 📋 功能概述

已實現完整的 Firebase Cloud Messaging (FCM) 瀏覽器推播通知系統，包括：

- ✅ Firebase 配置和初始化
- ✅ Service Worker 後台推播處理
- ✅ 推播訂閱/取消訂閱管理
- ✅ 前景/背景推播消息處理
- ✅ 註冊頁面推播開關 UI
- ✅ 測試頁面

## 📁 新增檔案

```
yoni約你/
├── firebase-config.js              # Firebase 配置文件
├── firebase-messaging-sw.js        # Service Worker（處理背景推播）
├── push-notification.js            # 推播管理器類別
├── test-push-notification.html     # 測試頁面
├── PUSH_NOTIFICATION_GUIDE.md      # 本說明文件
└── sign-up.html                    # 已更新：添加推播開關選項
```

## 🚀 快速開始

### 1. 測試推播功能

開啟測試頁面：
```
https://jeffrey0117.github.io/yoni/test-push-notification.html
```

或本地測試：
```bash
# 使用任何 HTTP 伺服器（Service Worker 需要 HTTPS 或 localhost）
python -m http.server 8000
# 開啟 http://localhost:8000/test-push-notification.html
```

### 2. 測試步驟

1. **請求通知權限**
   - 點擊「請求通知權限」按鈕
   - 瀏覽器會彈出權限請求，點擊「允許」

2. **訂閱推播**
   - 點擊「訂閱推播」按鈕
   - 系統會生成 FCM Token（顯示在頁面上）

3. **測試本地通知**
   - 點擊「測試本地通知」按鈕
   - 應該看到瀏覽器通知彈出

4. **複製 Token**
   - 點擊「複製 Token」按鈕
   - Token 會複製到剪貼簿，用於後端測試

### 3. 註冊頁面測試

開啟註冊頁面：
```
https://jeffrey0117.github.io/yoni/sign-up.html
```

在「第三方註冊 - 訂閱通知」區域：
- 切換「瀏覽器推播」開關
- 切換「LINE 推播」開關（目前僅儲存設定）
- 點擊「確定」按鈕確認設定

## 🔧 Firebase 配置

### 當前配置

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyByTa7qJ7B_81AWbxLBLn1G2I-btOyISJ0",
  authDomain: "yoni-a0268.firebaseapp.com",
  projectId: "yoni-a0268",
  storageBucket: "yoni-a0268.firebasestorage.app",
  messagingSenderId: "1089722207217",
  appId: "1:1089722207217-web-531dc0dd3f6e9a11ec9250",
  measurementId: "G-70EZ0JG7C1"
};

const vapidKey = "BA5gu0oaXyjTuJQGNyw2-LGETUvY12BGAit6AnztemXwqT8ebUlDNFrWhlc-d20ZggDsXRk9-RoUrpU2Bmb2W7U";
```

### Firebase Console 設定

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案：`yoni-a0268`
3. 進入 **Cloud Messaging**
4. 確認 Web Push certificates 已設定

## 📡 後端整合

### 儲存 FCM Token

前端訂閱成功後會取得 FCM Token，需要發送到後端儲存：

```javascript
// 在 push-notification.js 的 sendTokenToServer() 方法中實現
async sendTokenToServer(token) {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: token,
      userId: getCurrentUserId(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    })
  });

  return await response.json();
}
```

### 後端 API 端點

需要實現以下 API：

1. **訂閱 API**
   ```
   POST /api/push/subscribe
   Body: { token, userId, deviceInfo }
   ```

2. **取消訂閱 API**
   ```
   POST /api/push/unsubscribe
   Body: { token, userId }
   ```

3. **發送推播 API**（管理端使用）
   ```
   POST /api/push/send
   Body: { userId, title, body, data, url }
   ```

### 使用 Firebase Admin SDK 發送推播

**Node.js 範例：**

```javascript
const admin = require('firebase-admin');

// 初始化（需要 service account key）
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 發送推播
async function sendPushNotification(token, title, body, data = {}) {
  const message = {
    notification: {
      title: title,
      body: body
    },
    data: data,
    webpush: {
      fcmOptions: {
        link: 'https://jeffrey0117.github.io/yoni/'
      }
    },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ 推播發送成功:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ 推播發送失敗:', error);
    return { success: false, error: error.message };
  }
}

// 使用範例
sendPushNotification(
  'FCM_TOKEN_HERE',
  'YONI 約你',
  '您有新的約會邀請！',
  { type: 'date_invitation', dateId: '12345' }
);
```

### 使用 REST API 發送推播

```bash
# 取得 Access Token（需要 service account key）
# 參考：https://firebase.google.com/docs/cloud-messaging/auth-server

# 發送推播
curl -X POST \
  https://fcm.googleapis.com/v1/projects/yoni-a0268/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "FCM_TOKEN_HERE",
      "notification": {
        "title": "YONI 約你",
        "body": "您有新的約會邀請！"
      },
      "webpush": {
        "fcmOptions": {
          "link": "https://jeffrey0117.github.io/yoni/"
        }
      },
      "data": {
        "type": "date_invitation",
        "dateId": "12345"
      }
    }
  }'
```

## 🎯 使用情境

### 1. 會員註冊後訂閱推播

```javascript
// 在 sign-up.html 的註冊成功後
async function onSignupSuccess() {
  // 提示用戶訂閱推播
  const browserEnabled = document.getElementById('browser-notification').checked;

  if (browserEnabled) {
    await subscribeToBrowserNotifications();
  }
}
```

### 2. 發送約會邀請通知

```javascript
// 後端：當有新的約會邀請時
async function notifyUser(userId, invitationData) {
  // 1. 從資料庫取得用戶的 FCM tokens
  const tokens = await getUserFCMTokens(userId);

  // 2. 檢查是否有 LINE token（優先使用）
  const hasLineToken = await checkUserLineToken(userId);

  // 3. 如果沒有 LINE token 或 LINE 未開啟，使用瀏覽器推播
  if (!hasLineToken && tokens.length > 0) {
    for (const token of tokens) {
      await sendPushNotification(
        token,
        '新的約會邀請',
        `${invitationData.senderName} 邀請您一起約會`,
        {
          type: 'date_invitation',
          invitationId: invitationData.id,
          url: `/invitation/${invitationData.id}`
        }
      );
    }
  }
}
```

### 3. 發送訂單狀態通知

```javascript
// 後端：訂單狀態改變時
async function notifyOrderStatus(userId, order) {
  const statusMessages = {
    'confirmed': '您的訂單已確認',
    'in_progress': '服務商已接單',
    'completed': '訂單已完成，請給予評價',
    'cancelled': '訂單已取消'
  };

  const tokens = await getUserFCMTokens(userId);
  const message = statusMessages[order.status];

  for (const token of tokens) {
    await sendPushNotification(
      token,
      'YONI 訂單通知',
      message,
      {
        type: 'order_status',
        orderId: order.id,
        status: order.status,
        url: `/order/${order.id}`
      }
    );
  }
}
```

## 🔐 安全性考量

### 1. Token 安全

- ✅ FCM Token 儲存在 localStorage（僅限前端使用）
- ✅ 後端儲存時應與用戶 ID 關聯
- ✅ 定期檢查並清理過期 token

### 2. 權限管理

- ✅ 用戶可隨時取消訂閱
- ✅ 尊重用戶的通知偏好設定
- ✅ 不要過度發送通知（避免被標記為垃圾訊息）

### 3. HTTPS 要求

- ⚠️ Service Worker 必須在 HTTPS 環境下運作
- ✅ localhost 可用於開發測試
- ✅ GitHub Pages 預設使用 HTTPS

## 📱 瀏覽器支援

### 支援的瀏覽器

| 瀏覽器 | 版本 | 支援狀態 |
|--------|------|----------|
| Chrome | 50+ | ✅ 完全支援 |
| Firefox | 44+ | ✅ 完全支援 |
| Edge | 17+ | ✅ 完全支援 |
| Safari | 16+ | ✅ 支援（macOS 13+, iOS 16.4+） |
| Opera | 37+ | ✅ 完全支援 |

### 不支援的瀏覽器

- ❌ Internet Explorer（任何版本）
- ❌ Safari < 16（macOS < 13, iOS < 16.4）
- ❌ 部分中國製瀏覽器（如 UC、QQ 瀏覽器）

## 🐛 常見問題

### Q1: 點擊「訂閱推播」沒反應？

**A:** 檢查以下項目：
1. 是否允許通知權限？
2. 是否在 HTTPS 環境或 localhost？
3. 開啟瀏覽器 Console 查看錯誤訊息
4. Service Worker 是否成功註冊？

### Q2: 收不到推播通知？

**A:** 可能原因：
1. Token 是否正確儲存？
2. 後端是否成功發送？
3. 瀏覽器是否在背景執行？
4. 通知權限是否被撤銷？
5. Service Worker 是否正常運作？

### Q3: iOS Safari 推播問題？

**A:** iOS Safari 推播支援限制：
- 需要 iOS 16.4+ 和 macOS 13+
- 必須將網站「加入主畫面」（PWA 模式）
- 不支援在普通瀏覽器分頁中接收推播

### Q4: 如何測試背景推播？

**A:** 步驟：
1. 訂閱推播並取得 FCM Token
2. 將頁面切換到背景或關閉分頁
3. 使用後端 API 或 Firebase Console 發送測試推播
4. 應該會看到系統通知彈出

## 📊 後續待辦事項

### 高優先級

- [ ] **實現後端 API**
  - [ ] `/api/push/subscribe` - 儲存 FCM token
  - [ ] `/api/push/unsubscribe` - 刪除 FCM token
  - [ ] `/api/push/send` - 發送推播

- [ ] **整合到現有通知系統**
  - [ ] 約會邀請通知
  - [ ] 訂單狀態通知
  - [ ] 聊天訊息通知
  - [ ] 系統公告通知

- [ ] **LINE 推播整合**
  - [ ] LINE Login 綁定
  - [ ] LINE Messaging API 整合
  - [ ] 優先順序：LINE > 瀏覽器推播

### 中優先級

- [ ] **用戶設定頁面**
  - [ ] 通知偏好設定
  - [ ] 推播類型開關（約會/訂單/聊天/系統）
  - [ ] 勿擾時段設定

- [ ] **推播統計**
  - [ ] 發送成功率
  - [ ] 點擊率
  - [ ] 用戶訂閱數

- [ ] **進階功能**
  - [ ] 推播分組（針對不同用戶群）
  - [ ] 排程推播
  - [ ] A/B 測試

### 低優先級

- [ ] **最佳化**
  - [ ] Token 定期刷新機制
  - [ ] 過期 token 清理
  - [ ] 推播重試機制

- [ ] **監控與日誌**
  - [ ] 推播發送日誌
  - [ ] 錯誤追蹤
  - [ ] 效能監控

## 📚 參考資源

- [Firebase Cloud Messaging 官方文檔](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications 指南](https://web.dev/push-notifications-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

## 💡 技術支援

如有問題或需要協助，請查看：
1. 測試頁面的系統日誌
2. 瀏覽器 Console 錯誤訊息
3. Firebase Console 的 Cloud Messaging 狀態
4. 參考上述文檔和資源

---

**建立日期:** 2026-01-28
**版本:** 1.0.0
**作者:** Claude Code
