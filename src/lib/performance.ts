/**
 * 性能监控和优化工具
 */

// 性能指标收集
interface PerformanceMetrics {
  pageLoadTime: number;
  translationResponseTime: number;
  wordSaveTime: number;
  memoryUsage: number;
  errors: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    translationResponseTime: 0,
    wordSaveTime: 0,
    memoryUsage: 0,
    errors: []
  };

  private startTimes: Map<string, number> = new Map();

  /**
   * 开始计时
   */
  startTimer(name: string) {
    this.startTimes.set(name, performance.now());
  }

  /**
   * 结束计时并记录
   */
  endTimer(name: string, metricKey: keyof PerformanceMetrics) {
    const startTime = this.startTimes.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      (this.metrics[metricKey] as number) = duration;
      this.startTimes.delete(name);
      
      // 如果响应时间过长，记录警告
      if (duration > 3000) {
        this.recordError('PERFORMANCE_WARNING', `${name} 响应时间过长: ${duration.toFixed(0)}ms`);
      }
    }
  }

  /**
   * 记录错误
   */
  recordError(type: string, message: string) {
    this.metrics.errors.push({
      type,
      message,
      timestamp: Date.now()
    });

    // 限制错误记录数量
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    // 发送错误报告（生产环境）
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorReport(type, message);
    }
  }

  /**
   * 发送错误报告
   */
  private async sendErrorReport(type: string, message: string) {
    try {
      // 这里可以集成错误监控服务如Sentry
      console.warn('Error report:', { type, message, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * 获取性能报告
   */
  getReport(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指标
   */
  reset() {
    this.metrics = {
      pageLoadTime: 0,
      translationResponseTime: 0,
      wordSaveTime: 0,
      memoryUsage: 0,
      errors: []
    };
    this.startTimes.clear();
  }

  /**
   * 检查内存使用
   */
  checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      // 内存使用超过80%时警告
      if (this.metrics.memoryUsage > 0.8) {
        this.recordError('MEMORY_WARNING', `内存使用率过高: ${(this.metrics.memoryUsage * 100).toFixed(1)}%`);
      }
    }
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        // 指数退避
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

/**
 * 缓存函数
 */
export function cache<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 5 * 60 * 1000 // 默认5分钟
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, { value: ReturnType<T>; expires: number }>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, {
      value: result,
      expires: Date.now() + ttl
    });
    
    // 清理过期缓存
    setTimeout(() => {
      for (const [cacheKey, cacheValue] of cache.entries()) {
        if (cacheValue.expires <= Date.now()) {
          cache.delete(cacheKey);
        }
      }
    }, ttl);
    
    return result;
  };
}

/**
 * 错误边界处理
 */
export class ErrorBoundary {
  private static instance: ErrorBoundary;
  private errorHandlers: Array<(error: Error) => void> = [];
  
  static getInstance(): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary();
    }
    return ErrorBoundary.instance;
  }
  
  /**
   * 添加错误处理器
   */
  addErrorHandler(handler: (error: Error) => void) {
    this.errorHandlers.push(handler);
  }
  
  /**
   * 处理错误
   */
  handleError(error: Error, context?: string) {
    const errorWithContext = new Error(context ? `${context}: ${error.message}` : error.message);
    errorWithContext.stack = error.stack;
    
    // 记录错误
    performanceMonitor.recordError('RUNTIME_ERROR', errorWithContext.message);
    
    // 调用所有错误处理器
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorWithContext);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    });
    
    // 显示用户友好的错误消息
    this.showUserError(errorWithContext);
  }
  
  /**
   * 显示用户友好的错误消息
   */
  private showUserError(error: Error) {
    // 这里可以显示Toast或Modal
    console.error('User-facing error:', error.message);
    
    // 示例：显示简单的alert
    if (process.env.NODE_ENV === 'development') {
      alert(`发生错误: ${error.message}`);
    }
  }
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring() {
  // 监控页面加载性能
  if (document.readyState === 'complete') {
    performanceMonitor.startTimer('pageLoad');
    window.addEventListener('load', () => {
      performanceMonitor.endTimer('pageLoad', 'pageLoadTime');
    });
  }
  
  // 定期检查内存使用
  setInterval(() => {
    performanceMonitor.checkMemoryUsage();
  }, 60000); // 每分钟检查一次
  
  // 全局错误捕获
  window.addEventListener('error', (event) => {
    performanceMonitor.recordError('WINDOW_ERROR', event.message);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    performanceMonitor.recordError('UNHANDLED_REJECTION', event.reason?.message || 'Unknown promise rejection');
  });
  
  // 发送性能报告（生产环境）
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const report = performanceMonitor.getReport();
      if (report.errors.length > 0) {
        // 这里可以发送报告到监控服务
        console.log('Performance report:', report);
      }
    }, 5 * 60 * 1000); // 每5分钟发送一次
  }
}

// 导出错误边界实例
export const errorBoundary = ErrorBoundary.getInstance();