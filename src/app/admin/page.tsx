'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from "@clerk/nextjs";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaEnvelope,
  FaCreditCard,
  FaUserTie,
  FaBuilding,
  FaCog,
  FaMicrophone,
  FaPhone,
  FaHandshake,
  FaMailBulk,
  FaUserCheck,
  FaChartBar,
  FaUserFriends,
  FaAddressCard,
  FaFileInvoice,
  FaImage,
  FaCogs,
  FaEnvelopeOpenText
} from 'react-icons/fa';

export default function AdminPage() {
  const { userId } = useAuth();

  const adminButtons = [
    {
      href: '/admin',
      icon: FaHome,
      label: 'Admin Home',
      color: 'gray',
      key: 'admin-home'
    },
    {
      href: '/admin/manage-usage',
      icon: FaUsers,
      label: 'Manage Users',
      color: 'blue',
      key: 'manage-usage'
    },
    {
      href: '/admin/manage-events',
      icon: FaCalendarAlt,
      label: 'Manage Events',
      color: 'green',
      key: 'manage-events'
    },
    {
      href: '/admin/events/dashboard',
      icon: FaChartLine,
      label: 'Event Analytics',
      color: 'teal',
      key: 'event-analytics'
    },
    {
      href: '/admin/events/registrations',
      icon: FaUsers,
      label: 'Registrations',
      color: 'indigo',
      key: 'event-registrations'
    },
    {
      href: '/admin/polls',
      icon: FaChartBar,
      label: 'Poll Management',
      color: 'purple',
      key: 'poll-management'
    },
    {
      href: '/admin/focus-groups',
      icon: FaUserFriends,
      label: 'Focus Groups',
      color: 'orange',
      key: 'focus-groups'
    },
    {
      href: '/admin/membership/plans',
      icon: FaAddressCard,
      label: 'Membership Plans',
      color: 'pink',
      key: 'membership-plans'
    },
    {
      href: '/admin/membership/subscriptions',
      icon: FaFileInvoice,
      label: 'Membership Subscriptions',
      color: 'rose',
      key: 'membership-subscriptions'
    },
    {
      href: '/admin/promotion-emails',
      icon: FaEnvelope,
      label: 'Promotion Emails',
      color: 'yellow',
      key: 'promotion-emails'
    },
    {
      href: '/admin/email-configuration',
      icon: FaEnvelopeOpenText,
      label: 'Email Configuration',
      color: 'teal',
      key: 'email-configuration'
    },
    {
      href: '/admin/batch-jobs',
      icon: FaCogs,
      label: 'Batch Jobs',
      color: 'slate',
      key: 'batch-jobs'
    },
    {
      href: '/admin/test-stripe',
      icon: FaCreditCard,
      label: 'Test Stripe',
      color: 'purple',
      key: 'test-stripe'
    },
    {
      href: '/admin/media',
      icon: FaImage,
      label: 'Media Management',
      color: 'cyan',
      key: 'media-management'
    },
    {
      href: '/admin/executive-committee',
      icon: FaUserTie,
      label: 'Executive Committee',
      color: 'orange',
      key: 'executive-committee'
    },
    {
      href: '/admin/event-sponsors',
      icon: FaHandshake,
      label: 'Event Sponsors',
      color: 'amber',
      key: 'event-sponsors'
    },
    {
      href: '/admin/tenant-management/organizations',
      icon: FaBuilding,
      label: 'Organizations',
      color: 'cyan',
      key: 'tenant-organizations'
    },
    {
      href: '/admin/tenant-management/settings',
      icon: FaCog,
      label: 'Tenant Settings',
      color: 'slate',
      key: 'tenant-settings'
    },
    {
      href: '/admin/tenant-management/test',
      icon: FaChartLine,
      label: 'Test CRUD',
      color: 'red',
      key: 'tenant-test'
    },
    {
      href: '/admin/event-featured-performers',
      icon: FaMicrophone,
      label: 'Global Performers',
      color: 'pink',
      key: 'global-performers'
    },
    {
      href: '/admin/event-contacts',
      icon: FaPhone,
      label: 'Global Contacts',
      color: 'emerald',
      key: 'global-contacts'
    },
    {
      href: '/admin/event-emails',
      icon: FaMailBulk,
      label: 'Global Emails',
      color: 'cyan',
      key: 'global-emails'
    },
    {
      href: '/admin/event-program-directors',
      icon: FaUserCheck,
      label: 'Global Directors',
      color: 'indigo',
      key: 'global-directors'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200',
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
      teal: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200',
      cyan: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200',
      slate: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200',
      red: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
      pink: 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200',
      emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
      amber: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200',
      rose: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
    };
    return colorMap[color] || colorMap.gray;
  };

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Event Management</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {adminButtons.map((button) => {
            const IconComponent = button.icon;
            const colorClasses = getColorClasses(button.color);

            return (
        <Link
                key={button.key}
                href={button.href}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 lg:p-6 transition-all duration-200 hover:scale-105 hover:shadow-md ${colorClasses}`}
              >
                <IconComponent className="text-2xl lg:text-3xl mb-2 lg:mb-3" />
                <span className="font-semibold text-center text-sm lg:text-base leading-tight">
                  {button.label}
                </span>
        </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}