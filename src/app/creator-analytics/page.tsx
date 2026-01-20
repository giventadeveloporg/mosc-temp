'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreatorAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience' | 'revenue'>('overview');

  // Mock analytics data - in real app, this would come from API
  const stats = {
    totalViews: 125000,
    totalSubscribers: 8500,
    totalRevenue: 12500.50,
    avgEngagement: 8.5,
    totalContent: 142,
    growthRate: 12.5
  };

  const recentContent = [
    { id: 1, title: 'How to Build a Brand', views: 12500, engagement: 9.2, revenue: 450.25 },
    { id: 2, title: 'Marketing Strategies 2024', views: 9800, engagement: 8.7, revenue: 320.50 },
    { id: 3, title: 'Content Creation Tips', views: 15200, engagement: 9.5, revenue: 580.75 },
  ];

  const audienceData = {
    demographics: [
      { age: '18-24', percentage: 25 },
      { age: '25-34', percentage: 35 },
      { age: '35-44', percentage: 28 },
      { age: '45+', percentage: 12 }
    ],
    topCountries: [
      { country: 'United States', percentage: 45 },
      { country: 'United Kingdom', percentage: 18 },
      { country: 'Canada', percentage: 12 },
      { country: 'Australia', percentage: 10 },
      { country: 'Other', percentage: 15 }
    ]
  };

  // Navigation buttons with unique colors (following design system)
  const navButtons = [
    {
      href: '/creator-analytics',
      icon: 'dashboard',
      label: 'Analytics Dashboard',
      color: 'blue',
      key: 'dashboard'
    },
    {
      href: '/creator-analytics/content',
      icon: 'content',
      label: 'Content Performance',
      color: 'indigo',
      key: 'content'
    },
    {
      href: '/creator-analytics/audience',
      icon: 'audience',
      label: 'Audience Insights',
      color: 'green',
      key: 'audience'
    },
    {
      href: '/creator-analytics/revenue',
      icon: 'revenue',
      label: 'Revenue Analytics',
      color: 'teal',
      key: 'revenue'
    },
    {
      href: '/creator-analytics/comparison',
      icon: 'comparison',
      label: 'Period Comparison',
      color: 'purple',
      key: 'comparison'
    },
    {
      href: '/creator-analytics/export',
      icon: 'export',
      label: 'Export Reports',
      color: 'violet',
      key: 'export'
    },
    {
      href: '/creator-analytics/goals',
      icon: 'goals',
      label: 'Goals & Targets',
      color: 'orange',
      key: 'goals'
    },
    {
      href: '/creator-analytics/settings',
      icon: 'settings',
      label: 'Analytics Settings',
      color: 'pink',
      key: 'settings'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800',
      green: 'bg-green-50 hover:bg-green-100 text-green-800',
      teal: 'bg-teal-50 hover:bg-teal-100 text-teal-800',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-800',
      violet: 'bg-violet-50 hover:bg-violet-100 text-violet-800',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-800',
      pink: 'bg-pink-50 hover:bg-pink-100 text-pink-800',
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100',
      indigo: 'bg-indigo-100',
      green: 'bg-green-100',
      teal: 'bg-teal-100',
      purple: 'bg-purple-100',
      violet: 'bg-violet-100',
      orange: 'bg-orange-100',
      pink: 'bg-pink-100',
    };
    return colorMap[color] || colorMap.blue;
  };

  const getIconTextColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-500',
      indigo: 'text-indigo-500',
      green: 'text-green-500',
      teal: 'text-teal-500',
      purple: 'text-purple-500',
      violet: 'text-violet-500',
      orange: 'text-orange-500',
      pink: 'text-pink-500',
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'content':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'audience':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'revenue':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'comparison':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'export':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'goals':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Creator Analytics Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Track your content performance, audience growth, and revenue metrics
        </p>
      </div>

      {/* Navigation Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {navButtons.map((button) => {
            const colorClasses = getColorClasses(button.color);
            const iconBgColor = getIconBgColor(button.color);
            const iconTextColor = getIconTextColor(button.color);

            return (
              <Link
                key={button.key}
                href={button.href}
                className={`flex flex-col items-center justify-center ${colorClasses} rounded-lg shadow-md p-4 text-xs transition-all group`}
                title={button.label}
                aria-label={button.label}
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${iconBgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {renderIcon(button.icon, `w-10 h-10 ${iconTextColor}`)}
                </div>
                <span className="font-semibold text-center leading-tight">{button.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Date Range Toggle */}
      <div className="flex justify-center items-center gap-4 mt-6 mb-8">
        <span className={`text-lg font-semibold transition-colors duration-300 ${dateRange !== '7d' ? 'text-purple-600' : 'text-purple-300'}`}>
          7 Days
        </span>
        <button
          onClick={() => setDateRange(dateRange === '7d' ? '30d' : dateRange === '30d' ? '90d' : dateRange === '90d' ? 'all' : '7d')}
          className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 ${
            dateRange === '30d' || dateRange === '90d' || dateRange === 'all'
              ? 'bg-blue-500 focus:ring-blue-500'
              : 'bg-purple-500 focus:ring-purple-500'
          }`}
          title="Toggle Date Range"
          aria-label="Toggle Date Range"
        >
          <span
            className={`inline-flex items-center justify-center h-8 w-8 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
              dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'translate-x-7' : 'translate-x-1'
            }`}
          >
            {(dateRange === '30d' || dateRange === '90d' || dateRange === 'all') ? (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
        </button>
        <span className={`text-lg font-semibold transition-colors duration-300 ${dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'text-blue-600' : 'text-blue-300'}`}>
          {dateRange === '30d' ? '30 Days' : dateRange === '90d' ? '90 Days' : 'All Time'}
        </span>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Views Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.totalViews)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Subscribers Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Subscribers</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.totalSubscribers)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Avg Engagement Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Engagement</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.avgEngagement}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4">
          {[
            { id: 'overview', label: 'Overview', icon: 'chart', color: 'blue' },
            { id: 'content', label: 'Content', icon: 'file', color: 'green' },
            { id: 'audience', label: 'Audience', icon: 'users', color: 'purple' },
            { id: 'revenue', label: 'Revenue', icon: 'dollar', color: 'orange' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const getTabColors = (color: string) => {
              if (color === 'blue') {
                return {
                  active: 'bg-blue-100 text-blue-600 border-blue-500',
                  inactive: 'bg-blue-50 text-blue-400 border-transparent hover:bg-blue-100 hover:text-blue-500',
                  iconBgActive: 'bg-blue-100',
                  iconBgInactive: 'bg-blue-50',
                  iconTextActive: 'text-blue-500',
                  iconTextInactive: 'text-blue-400',
                  textActive: 'text-blue-700',
                  textInactive: 'text-blue-500'
                };
              } else if (color === 'green') {
                return {
                  active: 'bg-green-100 text-green-600 border-green-500',
                  inactive: 'bg-green-50 text-green-400 border-transparent hover:bg-green-100 hover:text-green-500',
                  iconBgActive: 'bg-green-100',
                  iconBgInactive: 'bg-green-50',
                  iconTextActive: 'text-green-500',
                  iconTextInactive: 'text-green-400',
                  textActive: 'text-green-700',
                  textInactive: 'text-green-500'
                };
              } else if (color === 'purple') {
                return {
                  active: 'bg-purple-100 text-purple-600 border-purple-500',
                  inactive: 'bg-purple-50 text-purple-400 border-transparent hover:bg-purple-100 hover:text-purple-500',
                  iconBgActive: 'bg-purple-100',
                  iconBgInactive: 'bg-purple-50',
                  iconTextActive: 'text-purple-500',
                  iconTextInactive: 'text-purple-400',
                  textActive: 'text-purple-700',
                  textInactive: 'text-purple-500'
                };
              } else {
                return {
                  active: 'bg-orange-100 text-orange-600 border-orange-500',
                  inactive: 'bg-orange-50 text-orange-400 border-transparent hover:bg-orange-100 hover:text-orange-500',
                  iconBgActive: 'bg-orange-100',
                  iconBgInactive: 'bg-orange-50',
                  iconTextActive: 'text-orange-500',
                  iconTextInactive: 'text-orange-400',
                  textActive: 'text-orange-700',
                  textInactive: 'text-orange-500'
                };
              }
            };
            const colors = getTabColors(tab.color);
            const getTabIcon = (iconName: string) => {
              switch (iconName) {
                case 'chart':
                  return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
                case 'file':
                  return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
                case 'users':
                  return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
                case 'dollar':
                  return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
                default:
                  return '';
              }
            };

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 border-b-2 font-semibold text-base flex items-center gap-3 rounded-t-lg transition-all duration-300 ${
                  isActive ? colors.active : colors.inactive
                }`}
                title={tab.label}
                aria-label={tab.label}
                type="button"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isActive ? colors.iconBgActive : colors.iconBgInactive
                }`}>
                  <svg className={`w-10 h-10 ${isActive ? colors.iconTextActive : colors.iconTextInactive}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTabIcon(tab.icon)} />
                </svg>
                </div>
                <span className={isActive ? colors.textActive : colors.textInactive}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
            
            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Growth Rate</h4>
                <p className="text-3xl font-bold text-blue-700">{stats.growthRate}%</p>
                <p className="text-sm text-gray-600 mt-2">Compared to last period</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Total Content</h4>
                <p className="text-3xl font-bold text-green-700">{stats.totalContent}</p>
                <p className="text-sm text-gray-600 mt-2">Published pieces</p>
              </div>
            </div>

            {/* Recent Top Content */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Top Performing Content</h4>
              <div className="space-y-4">
                {recentContent.map((content) => (
                  <div key={content.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{content.title}</h5>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {formatNumber(content.views)} views
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {content.engagement}% engagement
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatCurrency(content.revenue)}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/creator-analytics/content/${content.id}`}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        title="View Details"
                        aria-label="View content details"
                      >
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Content Performance</h3>
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Detailed content performance metrics coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Audience Insights</h3>
            
            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Age Demographics</h4>
                <div className="space-y-3">
                  {audienceData.demographics.map((demo, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{demo.age}</span>
                        <span className="font-semibold text-gray-900">{demo.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${demo.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Top Countries</h4>
                <div className="space-y-3">
                  {audienceData.topCountries.map((country, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{country.country}</span>
                        <span className="font-semibold text-gray-900">{country.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">This Month</h4>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(4500.25)}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Last Month</h4>
                <p className="text-2xl font-bold text-teal-700">{formatCurrency(3800.50)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Growth</h4>
                <p className="text-2xl font-bold text-orange-700">+18.4%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
