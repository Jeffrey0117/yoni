/**
 * YONI Push Notification Manager
 * 管理瀏覽器推播通知的訂閱、取消和接收
 */

class PushNotificationManager {
  constructor() {
    this.messaging = null;
    this.currentToken = null;
    this.isSupported = this.checkSupport();
  }

  /**
   * 檢查瀏覽器是否支援推播
   */
  checkSupport() {
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker not supported');
      return false;
    }
    if (!('PushManager' in window)) {
      console.warn('⚠️ Push API not supported');
      return false;
    }
    if (!('Notification' in window)) {
      console.warn('⚠️ Notification API not supported');
      return false;
    }
    return true;
  }

  /**
   * 初始化 Firebase Messaging
   */
  async initialize() {
    if (!this.isSupported) {
      console.error('❌ Browser does not support push notifications');
      return false;
    }

    try {
      // Initialize Firebase
      const { messaging } = window.initializeFirebase();
      this.messaging = messaging;

      if (!this.messaging) {
        throw new Error('Failed to initialize Firebase Messaging');
      }

      // Register service worker
      await this.registerServiceWorker();

      console.log('✅ Push Notification Manager initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Push Notification Manager:', error);
      return false;
    }
  }

  /**
   * 註冊 Service Worker
   */
  async registerServiceWorker() {
    try {
      // 使用相對路徑，支援任何部署環境（包括 GitHub Pages）
      const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js', {
        scope: './'
      });
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * 請求推播權限
   */
  async requestPermission() {
    if (!this.isSupported) {
      return { success: false, error: 'Browser not supported' };
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', permission);

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return { success: true, permission };
      } else if (permission === 'denied') {
        console.warn('⛔ Notification permission denied');
        return { success: false, error: 'Permission denied' };
      } else {
        console.warn('⚠️ Notification permission dismissed');
        return { success: false, error: 'Permission dismissed' };
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 取得 FCM Token
   */
  async getToken() {
    if (!this.messaging) {
      console.error('❌ Messaging not initialized');
      return null;
    }

    try {
      console.log('🔑 Requesting FCM token...');
      console.log('VAPID Key:', window.vapidKey ? 'Present' : 'Missing');

      const token = await this.messaging.getToken({
        vapidKey: window.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      if (token) {
        console.log('✅ FCM Token obtained:', token);
        this.currentToken = token;
        this.saveTokenToStorage(token);
        return token;
      } else {
        console.warn('⚠️ No FCM token available');
        console.warn('可能原因：Service Worker 未正確註冊或 VAPID key 錯誤');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      console.error('錯誤詳情:', error.code, error.message);

      // 提供更友善的錯誤訊息
      if (error.code === 'messaging/permission-blocked') {
        console.error('🚫 通知權限被封鎖，請在瀏覽器設定中允許通知');
      } else if (error.code === 'messaging/registration-token-not-found') {
        console.error('🔍 Service Worker 註冊失敗或未找到');
      } else if (error.code === 'messaging/token-subscribe-failed') {
        console.error('📡 FCM 訂閱失敗，請檢查網路連線和 Firebase 配置');
      }

      return null;
    }
  }

  /**
   * 訂閱推播
   */
  async subscribe() {
    try {
      // 1. 請求權限
      const permissionResult = await this.requestPermission();
      if (!permissionResult.success) {
        return {
          success: false,
          error: permissionResult.error
        };
      }

      // 2. 取得 Token
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Failed to get FCM token'
        };
      }

      // 3. 儲存訂閱狀態
      this.saveSubscriptionStatus(true);

      // 4. TODO: 發送 token 到後端儲存
      await this.sendTokenToServer(token);

      console.log('✅ Successfully subscribed to push notifications');
      return {
        success: true,
        token
      };
    } catch (error) {
      console.error('❌ Error subscribing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 取消訂閱推播
   */
  async unsubscribe() {
    try {
      if (!this.messaging || !this.currentToken) {
        console.warn('⚠️ No active subscription to unsubscribe');
        return { success: true };
      }

      // Delete FCM token
      await this.messaging.deleteToken();

      // Clear storage
      this.currentToken = null;
      this.saveTokenToStorage(null);
      this.saveSubscriptionStatus(false);

      // TODO: 通知後端刪除 token
      await this.deleteTokenFromServer();

      console.log('✅ Successfully unsubscribed from push notifications');
      return { success: true };
    } catch (error) {
      console.error('❌ Error unsubscribing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 監聽前景推播消息
   */
  onMessage(callback) {
    if (!this.messaging) {
      console.error('❌ Messaging not initialized');
      return;
    }

    this.messaging.onMessage((payload) => {
      console.log('📬 Message received (foreground):', payload);

      // 顯示自定義通知
      this.showNotification(payload);

      // 執行回調
      if (callback && typeof callback === 'function') {
        callback(payload);
      }
    });
  }

  /**
   * 顯示通知
   */
  showNotification(payload) {
    const title = payload.notification?.title || 'YONI 約你';
    const options = {
      body: payload.notification?.body || '您有新的通知',
      icon: payload.notification?.icon || '/yoni_icon.ico',
      badge: '/yoni_icon.ico',
      tag: payload.data?.tag || 'yoni-notification',
      data: payload.data,
      requireInteraction: false
    };

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  /**
   * 儲存 Token 到 LocalStorage
   */
  saveTokenToStorage(token) {
    try {
      if (token) {
        localStorage.setItem('fcm_token', token);
        localStorage.setItem('fcm_token_time', Date.now().toString());
      } else {
        localStorage.removeItem('fcm_token');
        localStorage.removeItem('fcm_token_time');
      }
    } catch (error) {
      console.error('❌ Error saving token to storage:', error);
    }
  }

  /**
   * 從 LocalStorage 讀取 Token
   */
  getTokenFromStorage() {
    try {
      return localStorage.getItem('fcm_token');
    } catch (error) {
      console.error('❌ Error reading token from storage:', error);
      return null;
    }
  }

  /**
   * 儲存訂閱狀態
   */
  saveSubscriptionStatus(isSubscribed) {
    try {
      localStorage.setItem('push_subscribed', isSubscribed.toString());
    } catch (error) {
      console.error('❌ Error saving subscription status:', error);
    }
  }

  /**
   * 取得訂閱狀態
   */
  getSubscriptionStatus() {
    try {
      return localStorage.getItem('push_subscribed') === 'true';
    } catch (error) {
      console.error('❌ Error reading subscription status:', error);
      return false;
    }
  }

  /**
   * 發送 Token 到伺服器（需要實現後端 API）
   */
  async sendTokenToServer(token) {
    try {
      // TODO: 實現後端 API 呼叫
      console.log('📤 Sending token to server:', token);

      // 範例 API 呼叫（需要根據實際後端實現）
      /*
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          userId: getCurrentUserId(), // 需要實現
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send token to server');
      }

      return await response.json();
      */

      return { success: true };
    } catch (error) {
      console.error('❌ Error sending token to server:', error);
      // 即使後端失敗，前端訂閱仍然有效
      return { success: false, error: error.message };
    }
  }

  /**
   * 從伺服器刪除 Token（需要實現後端 API）
   */
  async deleteTokenFromServer() {
    try {
      // TODO: 實現後端 API 呼叫
      console.log('🗑️ Deleting token from server');

      // 範例 API 呼叫
      /*
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.currentToken,
          userId: getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete token from server');
      }

      return await response.json();
      */

      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting token from server:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 檢查當前推播權限狀態
   */
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  }
}

// 創建全域實例
window.pushNotificationManager = new PushNotificationManager();

// 自動初始化（如果需要）
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Push Notification Manager loaded');
  // 可以選擇在這裡自動初始化
  // window.pushNotificationManager.initialize();
});
