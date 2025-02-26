import CryptoJS from 'crypto-js';

// 安全存储服务
export const securityService = {
  // 加密密钥 (理想情况下应该是从环境变量或其他安全来源获取)
  _encryptionKey: 'db-tool-secure-key-2024',
  
  // 获取加密密钥
  getEncryptionKey(): string {
    // 可以选择从更复杂的来源获取密钥，例如与用户会话相关的信息
    // 这里简单使用固定密钥 + 浏览器指纹的组合
    const browserInfo = navigator.userAgent + navigator.language;
    const browserHash = CryptoJS.SHA256(browserInfo).toString().substring(0, 16);
    return this._encryptionKey + browserHash;
  },
  
  // 加密数据
  encrypt(data: any): string {
    const jsonStr = JSON.stringify({
      data,
      timestamp: new Date().getTime(),
      expires: new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 默认7天过期
    });
    return CryptoJS.AES.encrypt(jsonStr, this.getEncryptionKey()).toString();
  },
  
  // 解密数据
  decrypt(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.getEncryptionKey());
      const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
      if (!jsonStr) return null;
      
      const data = JSON.parse(jsonStr);
      
      // 检查是否过期
      if (data.expires && data.expires < new Date().getTime()) {
        return null; // 数据已过期
      }
      
      return data.data;
    } catch (error) {
      console.error('解密失败:', error);
      return null;
    }
  },
  
  // 存储带过期时间的数据
  storeWithExpiry(key: string, data: any, days = 7): void {
    const jsonData = {
      data,
      timestamp: new Date().getTime(),
      expires: new Date().getTime() + (days * 24 * 60 * 60 * 1000)
    };
    
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(jsonData), 
      this.getEncryptionKey()
    ).toString();
    
    localStorage.setItem(key, encrypted);
  },
  
  // 获取数据并检查过期
  getWithExpiry(key: string): any {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.getEncryptionKey());
      const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
      if (!jsonStr) return null;
      
      const data = JSON.parse(jsonStr);
      
      // 检查是否过期
      if (data.expires && data.expires < new Date().getTime()) {
        localStorage.removeItem(key); // 移除过期数据
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error(`获取${key}失败:`, error);
      return null;
    }
  },
  
  // 清除所有安全存储的数据
  clearAllSecureData(): void {
    const keysToRemove = [
      'connectionInfo', 
      'connected', 
      'connectionsHistory'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}; 