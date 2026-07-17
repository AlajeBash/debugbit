(function () {
  // Guard against double injection
  if ((window as any).__aiDebuggingCopilotInjected) return;
  (window as any).__aiDebuggingCopilotInjected = true;

  console.log('[AI Copilot Collector] Core telemetry injection activated.');

  // --- Safe Messaging Utility ---
  function reportEvent(type: string, data: any) {
    try {
      window.postMessage({
        source: 'ai-debugging-collector',
        payload: {
          type,
          timestamp: Date.now(),
          ...data
        }
      }, '*');
    } catch (err) {
      // Suppress any errors to prevent disrupting host execution
    }
  }

  // Initial event signaling loading state
  reportEvent('PAGE_LOADED', { url: window.location.href });

  // --- Circular-safe & Depth-limited object stringifier ---
  function safeStringify(obj: any, maxDepth = 3): string {
    const seen = new WeakSet();
    
    function helper(value: any, depth: number): any {
      if (value === null || value === undefined) return String(value);
      if (typeof value !== 'object') return value;
      if (depth > maxDepth) return '[Object (Max Depth Reached)]';
      if (seen.has(value)) return '[Circular]';
      
      seen.add(value);
      
      if (value instanceof Error) {
        return `${value.name}: ${value.message}\n${value.stack || ''}`;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (value instanceof RegExp) {
        return value.toString();
      }
      
      if (Array.isArray(value)) {
        const res = value.map(item => helper(item, depth + 1));
        seen.delete(value);
        return res;
      }
      
      const res: Record<string, any> = {};
      try {
        for (const key of Object.keys(value)) {
          res[key] = helper(value[key], depth + 1);
        }
      } catch {
        return '[Object (Parsing Blocked)]';
      }
      
      seen.delete(value);
      return res;
    }
    
    try {
      const processed = helper(obj, 0);
      if (typeof processed === 'object') {
        return JSON.stringify(processed);
      }
      return String(processed);
    } catch {
      return '[Object (Stringify Failed)]';
    }
  }

  // --- Utility helper to turn console arguments into readable logs ---
  function formatConsoleArgs(args: any[]): string {
    return args
      .map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
        if (typeof arg === 'object') {
          return safeStringify(arg);
        }
        return String(arg);
      })
      .join(' ');
  }

  // --- Console Method Interception ---
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  try {
    console.log = function (...args: any[]) {
      try {
        originalConsole.log.apply(console, args);
      } finally {
        reportEvent('CONSOLE_LOG', {
          level: 'log',
          message: formatConsoleArgs(args)
        });
      }
    };

    console.warn = function (...args: any[]) {
      try {
        originalConsole.warn.apply(console, args);
      } finally {
        reportEvent('CONSOLE_LOG', {
          level: 'warn',
          message: formatConsoleArgs(args)
        });
      }
    };

    console.error = function (...args: any[]) {
      try {
        originalConsole.error.apply(console, args);
      } finally {
        reportEvent('CONSOLE_LOG', {
          level: 'error',
          message: formatConsoleArgs(args)
        });
      }
    };

    console.info = function (...args: any[]) {
      try {
        originalConsole.info.apply(console, args);
      } finally {
        reportEvent('CONSOLE_LOG', {
          level: 'info',
          message: formatConsoleArgs(args)
        });
      }
    };
  } catch (err) {
    originalConsole.error('[AI Copilot] Failed to hook console logs:', err);
  }

  // --- Global Uncaught Error Interception ---
  window.addEventListener('error', (event) => {
    try {
      const stack = event.error ? event.error.stack : undefined;
      const message = event.message || 'Uncaught Error';
      const file = event.filename ? event.filename.split('/').pop() : 'unknown';
      const location = `${file}:${event.lineno || 0}:${event.colno || 0}`;

      reportEvent('CONSOLE_LOG', {
        level: 'exception',
        message: `${message} (${location})`,
        stack
      });
    } catch (err) {
      // Prevent failure in extension error handler from crashing tab
    }
  });

  // --- Unhandled Promise Rejections Interception ---
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      let message = 'Unhandled Promise Rejection';
      let stack = undefined;

      if (reason instanceof Error) {
        message = `Unhandled Rejection: ${reason.name}: ${reason.message}`;
        stack = reason.stack;
      } else if (typeof reason === 'string') {
        message = `Unhandled Rejection: ${reason}`;
      } else {
        try {
          message = `Unhandled Rejection: ${JSON.stringify(reason)}`;
        } catch {
          message = `Unhandled Rejection: ${String(reason)}`;
        }
      }

      reportEvent('CONSOLE_LOG', {
        level: 'exception',
        message,
        stack
      });
    } catch (err) {
      // Safety guard
    }
  });

  // --- fetch Interception ---
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      const start = performance.now();
      const timestamp = Date.now();

      let url = '';
      let method = 'GET';

      try {
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof Request) {
          url = input.url;
          method = input.method || 'GET';
        } else if (input instanceof URL) {
          url = input.toString();
        }

        if (init && init.method) {
          method = init.method;
        }
      } catch (err) {
        url = 'unknown';
      }

      // Record headers and body safely
      let requestHeaders: Record<string, string> = {};
      let requestBody: string | null = null;

      try {
        if (init && init.headers) {
          if (init.headers instanceof Headers) {
            init.headers.forEach((val, key) => {
              requestHeaders[key] = val;
            });
          } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, val]) => {
              requestHeaders[key] = val;
            });
          } else {
            requestHeaders = { ...init.headers } as Record<string, string>;
          }
        }

        if (init && init.body) {
          if (typeof init.body === 'string') {
            requestBody = init.body;
          } else if (init.body instanceof URLSearchParams) {
            requestBody = init.body.toString();
          } else {
            requestBody = '[Payload Body Type: Complex]';
          }
        }
      } catch {
        // Safe fallback
      }

      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - start;

        // Clone response to parse text content safely without lock
        const clonedResponse = response.clone();
        clonedResponse.text()
          .then(responseBody => {
            const responseHeaders: Record<string, string> = {};
            try {
              response.headers.forEach((val, key) => {
                responseHeaders[key] = val;
              });
            } catch {
              // Safe fallback
            }

            reportEvent('NETWORK_LOG', {
              timestamp,
              method,
              url,
              status: response.status,
              duration,
              requestHeaders,
              responseHeaders,
              requestBody,
              responseBody
            });
          })
          .catch(() => {
            reportEvent('NETWORK_LOG', {
              timestamp,
              method,
              url,
              status: response.status,
              duration,
              requestHeaders,
              responseHeaders: {},
              requestBody,
              responseBody: '[Response Body: Parsing Failed]'
            });
          });

        return response;
      } catch (error: any) {
        const duration = performance.now() - start;
        reportEvent('NETWORK_LOG', {
          timestamp,
          method,
          url,
          status: 0, // Code 0 represents direct network/connection error
          duration,
          requestHeaders,
          responseHeaders: {},
          requestBody,
          responseBody: error?.message || 'Connection Refused'
        });
        throw error;
      }
    };
  }

  // --- XMLHttpRequest Interception ---
  if (window.XMLHttpRequest) {
    const OriginalXHR = window.XMLHttpRequest;

    class InstrumentedXHR extends OriginalXHR {
      private _method: string = 'GET';
      private _url: string = '';
      private _requestHeaders: Record<string, string> = {};
      private _requestBody: string | null = null;
      private _timestamp: number = 0;
      private _startTime: number = 0;

      open(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null): void {
        try {
          this._method = method;
          this._url = typeof url === 'string' ? url : url.toString();
        } catch {
          // Safeguard
        }
        super.open(method, url, async !== false, username, password);
      }

      setRequestHeader(header: string, value: string): void {
        try {
          this._requestHeaders[header] = value;
        } catch {
          // Safeguard
        }
        super.setRequestHeader(header, value);
      }

      send(body?: Document | XMLHttpRequestBodyInit | null): void {
        try {
          this._timestamp = Date.now();
          this._startTime = performance.now();

          if (body) {
            if (typeof body === 'string') {
              this._requestBody = body;
            } else if (body instanceof URLSearchParams) {
              this._requestBody = body.toString();
            } else {
              this._requestBody = '[Payload Body Type: Complex]';
            }
          }

          this.addEventListener('loadend', () => {
            try {
              const duration = performance.now() - this._startTime;
              const responseHeaders: Record<string, string> = {};

              try {
                const rawHeaders = this.getAllResponseHeaders();
                if (rawHeaders) {
                  rawHeaders.split('\r\n').forEach(line => {
                    const parts = line.split(': ');
                    if (parts.length >= 2) {
                      responseHeaders[parts[0].trim()] = parts.slice(1).join(': ').trim();
                    }
                  });
                }
              } catch {
                // Safeguard
              }

              let responseBody: string | null = null;
              try {
                if (!this.responseType || this.responseType === 'text' || this.responseType === 'json') {
                  responseBody = this.responseText;
                } else {
                  responseBody = `[Response Type: ${this.responseType}]`;
                }
              } catch {
                responseBody = '[Response Body: Parsing Failed]';
              }

              reportEvent('NETWORK_LOG', {
                timestamp: this._timestamp,
                method: this._method,
                url: this._url,
                status: this.status,
                duration,
                requestHeaders: this._requestHeaders,
                responseHeaders,
                requestBody: this._requestBody,
                responseBody
              });
            } catch {
              // Safeguard
            }
          });
        } catch {
          // Safeguard
        }

        super.send(body);
      }
    }

    // Replace global constructor
    window.XMLHttpRequest = InstrumentedXHR;
  }

  // --- Performance Tracking & Web Vitals Interception ---
  try {
    // 1. Capture First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          reportEvent('PERFORMANCE_METRIC', {
            metricName: 'FCP',
            value: entry.startTime,
            timestamp: Date.now()
          });
        }
      });
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    // 2. Capture Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        reportEvent('PERFORMANCE_METRIC', {
          metricName: 'LCP',
          value: entry.startTime,
          timestamp: Date.now()
        });
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 3. Capture Cumulative Layout Shift (CLS)
    let cumulativeClsScore = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cumulativeClsScore += entry.value;
          reportEvent('PERFORMANCE_METRIC', {
            metricName: 'CLS',
            value: cumulativeClsScore,
            timestamp: Date.now()
          });
        }
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 4. Capture Long Tasks (blocking execution > 50ms)
    const longTaskObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        reportEvent('CONSOLE_LOG', {
          level: 'warn',
          message: `[Long Task] Main thread blocked for ${Math.round(entry.duration)}ms during execution context.`,
          stack: `Duration: ${entry.duration.toFixed(2)}ms\nStart Time: ${entry.startTime.toFixed(2)}ms\nType: longtask`
        });
      });
    });
    longTaskObserver.observe({ type: 'longtask' });

  } catch (err) {
    // Suppress performance tracking exceptions gracefully
  }
})();
