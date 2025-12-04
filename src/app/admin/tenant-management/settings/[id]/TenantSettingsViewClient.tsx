'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCog, FaCode, FaToggleOn, FaToggleOff, FaExternalLinkAlt } from 'react-icons/fa';
import { TenantSettingsDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';

interface TenantSettingsViewClientProps {
  settings: TenantSettingsDTO;
  settingsId: number;
  organization?: TenantOrganizationDTO | null;
}

export default function TenantSettingsViewClient({ settings, settingsId, organization }: TenantSettingsViewClientProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'limits' | 'customization'>('general');

  // Tab navigation
  const tabs = [
    { id: 'general' as const, label: 'General', icon: FaCog },
    { id: 'integrations' as const, label: 'Integrations', icon: FaCode },
    { id: 'limits' as const, label: 'Limits', icon: FaCog },
    { id: 'customization' as const, label: 'Customization', icon: FaCode }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{settings?.tenantId}</dd>
            </div>
            {organization && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link
                    href={`/admin/tenant-management/organizations/${organization.id}`}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {organization.organizationName}
                  </Link>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">User Registration</dt>
              <dd className="mt-1">
                {settings?.allowUserRegistration ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaToggleOn className="w-3 h-3 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaToggleOff className="w-3 h-3 mr-1" />
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Admin Approval Required</dt>
              <dd className="mt-1">
                {settings?.requireAdminApproval ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaToggleOn className="w-3 h-3 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaToggleOff className="w-3 h-3 mr-1" />
                    No
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Guest Registration</dt>
              <dd className="mt-1">
                {settings?.enableGuestRegistration ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaToggleOn className="w-3 h-3 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaToggleOff className="w-3 h-3 mr-1" />
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Max Guests Per Attendee</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.maxGuestsPerAttendee || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Default Event Capacity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.defaultEventCapacity || 'Not set'}
              </dd>
            </div>
            {settings?.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.email}</dd>
              </div>
            )}
            {settings?.phoneNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.phoneNumber}</dd>
              </div>
            )}
            {settings?.addressLine1 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {[settings.addressLine1, settings.addressLine2, settings.stateProvince, settings.zipCode, settings.country]
                    .filter(Boolean)
                    .join(', ')}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.createdAt
                  ? new Date(settings.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.updatedAt
                  ? new Date(settings.updatedAt).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">WhatsApp Integration</dt>
              <dd className="mt-1">
                {settings?.enableWhatsappIntegration ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaToggleOn className="w-3 h-3 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaToggleOff className="w-3 h-3 mr-1" />
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Marketing</dt>
              <dd className="mt-1">
                {settings?.enableEmailMarketing ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaToggleOn className="w-3 h-3 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaToggleOff className="w-3 h-3 mr-1" />
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            {settings?.whatsappPhoneNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">WhatsApp Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.whatsappPhoneNumber}</dd>
              </div>
            )}
            {settings?.whatsappMaxMessagesPerDay && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Max Messages Per Day</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.whatsappMaxMessagesPerDay}</dd>
              </div>
            )}
            {settings?.whatsappRateLimit && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Rate Limit (per minute)</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.whatsappRateLimit}</dd>
              </div>
            )}
            {settings?.emailProviderConfig && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Email Provider Config</dt>
                <dd className="mt-1">
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(settings.emailProviderConfig), null, 2)}
                  </pre>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Usage Limits</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Max Events Per Month</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.maxEventsPerMonth || 'Unlimited'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Max Attendees Per Event</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.maxAttendeesPerEvent || 'Unlimited'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Default Event Capacity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.defaultEventCapacity || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Platform Fee Percentage</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.platformFeePercentage !== undefined && settings?.platformFeePercentage !== null
                  ? `${settings.platformFeePercentage}%`
                  : 'Not set'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Customization Tab */}
      {activeTab === 'customization' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Custom Styling</h3>

          {/* Custom CSS */}
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-2">Custom CSS</dt>
            <dd className="mt-1">
              {settings?.customCss ? (
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                  {settings.customCss}
                </pre>
              ) : (
                <span className="text-sm text-gray-500">No custom CSS</span>
              )}
            </dd>
          </div>

          {/* Custom JavaScript */}
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-2">Custom JavaScript</dt>
            <dd className="mt-1">
              {settings?.customJs ? (
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                  {settings.customJs}
                </pre>
              ) : (
                <span className="text-sm text-gray-500">No custom JavaScript</span>
              )}
            </dd>
          </div>

          {/* Homepage Display Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Homepage Display Settings</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Show Events Section</dt>
                <dd className="mt-1">
                  {settings?.showEventsSectionInHomePage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaToggleOn className="w-3 h-3 mr-1" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaToggleOff className="w-3 h-3 mr-1" />
                      Hidden
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Show Team Members Section</dt>
                <dd className="mt-1">
                  {settings?.showTeamMembersSectionInHomePage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaToggleOn className="w-3 h-3 mr-1" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaToggleOff className="w-3 h-3 mr-1" />
                      Hidden
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Show Sponsors Section</dt>
                <dd className="mt-1">
                  {settings?.showSponsorsSectionInHomePage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaToggleOn className="w-3 h-3 mr-1" />
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaToggleOff className="w-3 h-3 mr-1" />
                      Hidden
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Email Footer HTML */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Email Footer HTML</h4>
            {settings?.emailFooterHtmlUrl ? (
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Email Footer HTML File:</p>
                <a
                  href={settings.emailFooterHtmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-2"
                >
                  {settings.emailFooterHtmlUrl}
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No email footer HTML file uploaded</p>
            )}
          </div>

          {/* Tenant Logo */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Tenant Logo</h4>
            {settings?.logoImageUrl ? (
              <div className="relative inline-block">
                <Image
                  src={settings.logoImageUrl}
                  alt="Tenant logo"
                  width={200}
                  height={200}
                  className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300 object-contain"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No logo image uploaded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

