"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void;
  defaultRange?: DateRange;
  className?: string;
}

const PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 6 Months', days: 180 },
  { label: 'Last Year', days: 365 },
  { label: 'All Time', days: null },
];

export default function DateRangeSelector({
  onRangeChange,
  defaultRange,
  className = '',
}: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState<string>(
    defaultRange?.startDate || ''
  );
  const [endDate, setEndDate] = useState<string>(
    defaultRange?.endDate || ''
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with "Last 30 Days" if no default range provided
    if (!defaultRange && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const start = thirtyDaysAgo.toISOString().split('T')[0];
      const end = today.toISOString().split('T')[0];

      setStartDate(start);
      setEndDate(end);
      onRangeChange({ startDate: start, endDate: end });
      setSelectedPreset('Last 30 Days');
    } else if (defaultRange) {
      onRangeChange(defaultRange);
    }
  }, []);

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.label);

    if (preset.days === null) {
      // All Time - clear dates
      setStartDate('');
      setEndDate('');
      onRangeChange({ startDate: null, endDate: null });
    } else {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - preset.days);

      const startStr = start.toISOString().split('T')[0];
      const endStr = today.toISOString().split('T')[0];

      setStartDate(startStr);
      setEndDate(endStr);
      onRangeChange({ startDate: startStr, endDate: endStr });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    setSelectedPreset(null); // Clear preset when manually changing dates
    onRangeChange({ startDate: value || null, endDate: endDate || null });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    setSelectedPreset(null); // Clear preset when manually changing dates
    onRangeChange({ startDate: startDate || null, endDate: value || null });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 ${
                selectedPreset === preset.label
                  ? 'bg-blue-100 hover:bg-blue-200'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={preset.label}
              aria-label={preset.label}
              type="button"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedPreset === preset.label
                  ? 'bg-blue-200'
                  : 'bg-gray-200'
              }`}>
                <svg className={`w-6 h-6 ${selectedPreset === preset.label ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`font-semibold ${selectedPreset === preset.label ? 'text-blue-700' : 'text-gray-700'}`}>
                {preset.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate || undefined}
              className="border-2 border-gray-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate || undefined}
              max={new Date().toISOString().split('T')[0]}
              className="border-2 border-gray-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
