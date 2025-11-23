'use client';

import { useState } from 'react';
import type { EventDashboardData } from './ApiServerActions';
import {
  FaUsers,
  FaUserFriends,
  FaChartLine,
  FaCalendarAlt,
  FaChild,
  FaHeart,
  FaExclamationTriangle,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import Link from 'next/link';

interface EventDashboardClientProps {
  data: EventDashboardData;
}

export default function EventDashboardClient({ data }: EventDashboardClientProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const {
    eventDetails,
    totalAttendees,
    totalGuests,
    capacityUtilization,
    registrationTrends,
    ageGroupStats,
    relationshipStats,
    specialRequirements,
    recentRegistrations,
    topEvents
  } = data;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {eventDetails ? `${eventDetails.title} - Dashboard` : 'Event Management Dashboard'}
        </h1>
        <p className="text-gray-600">
          {eventDetails
            ? `Manage registrations and analytics for this event`
            : 'Overview of all events and registrations'
          }
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{totalAttendees.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaUserFriends className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">{totalGuests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaChartLine className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Capacity Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{capacityUtilization}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaCalendarAlt className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">{topEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Registration Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registration Trends</h3>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {registrationTrends.slice(-7).map((trend, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full"
                  style={{ height: `${Math.max((trend.count / Math.max(...registrationTrends.map(t => t.count))) * 200, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-medium text-gray-700">{trend.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age Group Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Age Groups</h3>
          <div className="space-y-3">
            {ageGroupStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaChild className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{stat.ageGroup}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stat.count} ({stat.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Relationship Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Relationships</h3>
          <div className="space-y-3">
            {relationshipStats.slice(0, 5).map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaHeart className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{stat.relationship}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {stat.count} ({stat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
          <div className="space-y-3">
            {specialRequirements.slice(0, 5).map((req, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaExclamationTriangle className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 truncate">{req.requirement}</span>
                </div>
                <span className="text-sm text-gray-600">{req.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Events by Attendance</h3>
          <div className="space-y-3">
            {topEvents.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaEye className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 truncate">{event.title}</span>
                </div>
                <span className="text-sm text-gray-600">{event.attendeeCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-lg shadow p-6">
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            <FaDownload className="h-4 w-4 mr-1" />
            Export CSV
          </button>
        </div>
        <div className="rounded-lg overflow-hidden" style={{
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRegistrations.map((attendee, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {attendee.firstName} {attendee.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eventDetails?.title || 'Event'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.registrationDate
                      ? new Date(attendee.registrationDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${attendee.registrationStatus === 'REGISTERED'
                      ? 'bg-green-100 text-green-800'
                      : attendee.registrationStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {attendee.registrationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.totalNumberOfGuests || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <Link
          href="/admin/event-analytics"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold"
        >
          Event Analytics
        </Link>
        <Link
          href="/admin/events/registrations"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md font-semibold"
        >
          View All Registrations
        </Link>
      </div>
    </div>
  );
}
