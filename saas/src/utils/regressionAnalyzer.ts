import { LocalSession, LocalTelemetryEvent } from '../lib/localStore';

export interface PerformanceBaselines {
  avgLcp: number;
  stdLcp: number;
  avgNetworkDuration: number;
  stdNetworkDuration: number;
  avgLongTasks: number;
  stdLongTasks: number;
}

export interface MetricRegression {
  metric: 'LCP' | 'Network Latency' | 'Long Tasks';
  activeValue: number;
  baselineAvg: number;
  percentageIncrease: number;
  severity: 'warning' | 'critical';
}

/**
 * Calculates standard statistical metrics from an array of past sessions
 */
export function calculatePerformanceBaselines(historicalSessions: LocalSession[]): PerformanceBaselines {
  const lcpValues: number[] = [];
  const netDurations: number[] = [];
  const longTaskCounts: number[] = [];

  // Parse metrics from historical sessions
  historicalSessions.forEach(session => {
    let hasLcp = false;
    let longTasks = 0;

    session.events.forEach(evt => {
      if (evt.category === 'performance') {
        if (evt.metricName === 'LCP' && evt.value) {
          lcpValues.push(evt.value);
          hasLcp = true;
        } else if (evt.metricName === 'LongTask' || (evt.metricName === 'FID' && evt.value && evt.value > 50)) {
          longTasks++;
        }
      } else if (evt.category === 'network' && evt.duration) {
        netDurations.push(evt.duration);
      }
    });

    longTaskCounts.push(longTasks);
  });

  // Basic average calculation helper
  const avg = (arr: number[]) => arr.length ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;

  // Standard deviation helper
  const stdDev = (arr: number[], mean: number) => {
    if (!arr.length) return 0;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length);
  };

  const avgLcp = avg(lcpValues);
  const avgNetworkDuration = avg(netDurations);
  const avgLongTasks = avg(longTaskCounts);

  return {
    avgLcp: avgLcp || 1200, // Fallback to standard fast baseline (1.2s) if no data
    stdLcp: stdDev(lcpValues, avgLcp) || 300,
    avgNetworkDuration: avgNetworkDuration || 150, // Fallback to 150ms
    stdNetworkDuration: stdDev(netDurations, avgNetworkDuration) || 50,
    avgLongTasks: avgLongTasks || 1,
    stdLongTasks: stdDev(longTaskCounts, avgLongTasks) || 0.5,
  };
}

/**
 * Evaluates an active session's performance metrics against historical baselines
 * Returns a list of identified regressions
 */
export function detectRegressions(activeSession: LocalSession, baselines: PerformanceBaselines): MetricRegression[] {
  const regressions: MetricRegression[] = [];
  
  // Calculate active session values
  let activeLcp = 0;
  let activeLongTasks = 0;
  const activeNetDurations: number[] = [];

  activeSession.events.forEach(evt => {
    if (evt.category === 'performance') {
      if (evt.metricName === 'LCP' && evt.value) {
        activeLcp = evt.value;
      } else if (evt.metricName === 'LongTask' || (evt.metricName === 'FID' && evt.value && evt.value > 50)) {
        activeLongTasks++;
      }
    } else if (evt.category === 'network' && evt.duration) {
      activeNetDurations.push(evt.duration);
    }
  });

  const avgActiveNetDuration = activeNetDurations.length 
    ? activeNetDurations.reduce((sum, val) => sum + val, 0) / activeNetDurations.length 
    : 0;

  // 1. Evaluate LCP Regression
  if (activeLcp > 0) {
    const thresholdWarning = baselines.avgLcp + 1.2 * baselines.stdLcp;
    const thresholdCritical = baselines.avgLcp + 2.0 * baselines.stdLcp;

    if (activeLcp > thresholdWarning) {
      const pct = Math.round(((activeLcp - baselines.avgLcp) / baselines.avgLcp) * 100);
      regressions.push({
        metric: 'LCP',
        activeValue: activeLcp,
        baselineAvg: Math.round(baselines.avgLcp),
        percentageIncrease: pct,
        severity: activeLcp > thresholdCritical ? 'critical' : 'warning',
      });
    }
  }

  // 2. Evaluate Network Latency Regression
  if (avgActiveNetDuration > 0) {
    const thresholdWarning = baselines.avgNetworkDuration + 1.2 * baselines.stdNetworkDuration;
    const thresholdCritical = baselines.avgNetworkDuration + 2.0 * baselines.stdNetworkDuration;

    if (avgActiveNetDuration > thresholdWarning) {
      const pct = Math.round(((avgActiveNetDuration - baselines.avgNetworkDuration) / baselines.avgNetworkDuration) * 100);
      regressions.push({
        metric: 'Network Latency',
        activeValue: Math.round(avgActiveNetDuration),
        baselineAvg: Math.round(baselines.avgNetworkDuration),
        percentageIncrease: pct,
        severity: avgActiveNetDuration > thresholdCritical ? 'critical' : 'warning',
      });
    }
  }

  // 3. Evaluate CPU Long Task Regression
  if (activeLongTasks > 0) {
    const thresholdWarning = baselines.avgLongTasks + 1.5 * baselines.stdLongTasks;
    if (activeLongTasks > thresholdWarning) {
      const pct = Math.round(((activeLongTasks - baselines.avgLongTasks) / (baselines.avgLongTasks || 1)) * 100);
      regressions.push({
        metric: 'Long Tasks',
        activeValue: activeLongTasks,
        baselineAvg: Math.round(baselines.avgLongTasks * 10) / 10,
        percentageIncrease: pct,
        severity: activeLongTasks > (baselines.avgLongTasks + 3 * baselines.stdLongTasks) ? 'critical' : 'warning',
      });
    }
  }

  return regressions;
}
