'use client';

import { useState, useEffect, useRef } from 'react';
import { FaCopy, FaCheckCircle, FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
}

export default function MobileDebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Intercept console methods
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: 'log' | 'warn' | 'error' | 'info', ...args: any[]) => {
      const timestamp = new Date().toISOString();
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      setLogs(prev => [...prev, { timestamp, level, message, data: args }]);
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('log', ...args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', ...args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      addLog('info', ...args);
    };

    // Log initial page load
    console.log('[MobileDebugConsole] Mobile debug console initialized');
    console.log('[MobileDebugConsole] User Agent:', navigator.userAgent);
    console.log('[MobileDebugConsole] Current URL:', window.location.href);
    console.log('[MobileDebugConsole] Timestamp:', new Date().toISOString());

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const copyLogsToClipboard = async () => {
    const logsText = logs.map(log =>
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(logsText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = logsText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('[MobileDebugConsole] Copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    console.log('[MobileDebugConsole] Logs cleared');
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-gray-300 shadow-2xl">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white cursor-pointer hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">Debug Console</span>
          {errorCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {errorCount} errors
            </span>
          )}
          {warnCount > 0 && (
            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {warnCount} warnings
            </span>
          )}
          <span className="text-gray-400 text-sm">
            {logs.length} logs
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyLogsToClipboard();
                }}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Copy logs to clipboard"
              >
                {copySuccess ? <FaCheckCircle className="text-green-400" /> : <FaCopy />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLogs();
                }}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Clear logs"
              >
                <FaTrash />
              </button>
            </>
          )}
          {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
        </div>
      </div>

      {/* Logs Panel */}
      {isExpanded && (
        <div className="max-h-[60vh] overflow-y-auto bg-gray-900 text-white">
          {/* Action Buttons */}
          <div className="sticky top-0 bg-gray-800 px-4 py-2 border-b border-gray-700 flex gap-2">
            <button
              onClick={copyLogsToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            >
              {copySuccess ? (
                <>
                  <FaCheckCircle /> Copied!
                </>
              ) : (
                <>
                  <FaCopy /> Copy All Logs
                </>
              )}
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
              <FaTrash /> Clear
            </button>
          </div>

          {/* Log Entries */}
          <div className="p-2 space-y-1">
            {logs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No logs yet. Console output will appear here.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 border-l-4 ${getLogColor(log.level)} rounded text-xs font-mono whitespace-pre-wrap break-all`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-bold flex-shrink-0 uppercase ${log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-yellow-400' :
                          log.level === 'info' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                      {log.level}
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
