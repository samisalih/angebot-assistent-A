
export class PerformanceMonitor {
  private static metrics = new Map<string, { count: number; totalTime: number; errors: number }>();

  static startTimer(operation: string): { stop: () => number } {
    const startTime = performance.now();
    
    return {
      stop: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(operation, duration, false);
        return duration;
      }
    };
  }

  static recordError(operation: string): void {
    this.recordMetric(operation, 0, true);
  }

  private static recordMetric(operation: string, duration: number, isError: boolean): void {
    const current = this.metrics.get(operation) || { count: 0, totalTime: 0, errors: 0 };
    
    current.count++;
    current.totalTime += duration;
    if (isError) current.errors++;
    
    this.metrics.set(operation, current);
  }

  static getMetrics(): Record<string, { 
    count: number; 
    averageTime: number; 
    errorRate: number; 
  }> {
    const result: Record<string, any> = {};
    
    for (const [operation, metrics] of this.metrics) {
      result[operation] = {
        count: metrics.count,
        averageTime: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        errorRate: metrics.count > 0 ? metrics.errors / metrics.count : 0,
      };
    }
    
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}
