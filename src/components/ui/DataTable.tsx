'use client';

import React from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onSort,
  onEdit,
  onDelete,
  onView,
  sortKey,
  sortDirection,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (columnKey: string) => {
    if (!onSort || !columns.find(col => col.key === columnKey)?.sortable) return null;

    if (sortKey === columnKey) {
      return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .table-scroll-container {
            overflow-x: scroll !important;
            overflow-y: visible !important;
            scrollbar-width: thin !important;
            scrollbar-color: #EC4899 #FCE7F3 !important;
            -ms-overflow-style: -ms-autohiding-scrollbar !important;
          }
          .table-scroll-container::-webkit-scrollbar {
            height: 20px !important;
            display: block !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          .table-scroll-container::-webkit-scrollbar-track {
            background: linear-gradient(90deg, #DBEAFE, #E9D5FF, #FCE7F3, #FED7AA) !important;
            border-radius: 10px !important;
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
            box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
          }
          .table-scroll-container::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F97316) !important;
            border-radius: 10px !important;
            border: 4px solid #F3F4F6 !important;
            -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
            box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
            min-width: 50px !important;
            background-clip: padding-box !important;
          }
          .table-scroll-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(90deg, #2563EB, #7C3AED, #DB2777, #EA580C) !important;
            border-color: #E5E7EB !important;
          }
          .table-scroll-container::-webkit-scrollbar-thumb:active {
            background: linear-gradient(90deg, #1D4ED8, #6D28D9, #BE185D, #C2410C) !important;
            border-color: #D1D5DB !important;
          }
          .table-scroll-container::-webkit-scrollbar-button {
            display: none !important;
          }
          .table-scroll-container::-webkit-scrollbar-corner {
            background: #E0E7FF !important;
          }
          .table-scroll-container::after {
            content: '';
            display: block;
            width: 100vw;
            height: 1px;
            flex-shrink: 0;
          }
          .table-scroll-container {
            display: flex !important;
          }
        `
      }} />
      <div className={`rounded-lg shadow-md overflow-hidden ${className}`} style={{
        background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
        padding: '4px'
      }}>
        <div
          className="w-full table-scroll-container"
          style={{
            overflowX: 'scroll',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
            display: 'flex',
            position: 'relative',
            width: '100%',
            minHeight: '1px',
            scrollbarGutter: 'stable',
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
            borderRadius: '8px',
            padding: '20px'
          }}
        >
          <table className="divide-y divide-gray-200" style={{
            width: 'max-content',
            minWidth: 'fit-content',
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.className || ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {renderSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${onView ? 'cursor-pointer' : ''}`}
                  onClick={() => onView && onView(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="icon-btn icon-btn-view bg-green-700 hover:bg-green-800 text-white p-4 shadow-lg"
                            title="View"
                          >
                            <FaEye className="text-xl text-white" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="icon-btn icon-btn-edit bg-blue-700 hover:bg-blue-800 text-white p-4 shadow-lg"
                            title="Edit"
                          >
                            <FaEdit className="text-xl text-white" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              console.log('🗑️ Delete button clicked for item:', item);
                              onDelete(item);
                            }}
                            className="icon-btn icon-btn-delete bg-red-700 hover:bg-red-800 text-white p-4 shadow-lg"
                            title="Delete"
                          >
                            <FaTrashAlt className="text-xl text-white" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
