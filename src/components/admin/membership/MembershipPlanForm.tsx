'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { MembershipPlanDTO } from '@/types';

interface MembershipPlanFormProps {
  plan?: MembershipPlanDTO | null;
  onSubmit: (plan: Partial<MembershipPlanDTO>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MembershipPlanForm({ plan, onSubmit, onCancel, isLoading = false }: MembershipPlanFormProps) {
  const [formData, setFormData] = useState<Partial<MembershipPlanDTO>>({
    planName: '',
    planCode: '',
    description: '',
    planType: 'SUBSCRIPTION',
    billingInterval: 'MONTHLY',
    price: 0,
    currency: 'USD',
    trialDays: 0,
    isActive: true,
    maxEventsPerMonth: undefined,
    maxAttendeesPerEvent: undefined,
    featuresJson: {},
    stripePriceId: '',
    stripeProductId: '',
  });
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setFormData({
        planName: plan.planName || '',
        planCode: plan.planCode || '',
        description: plan.description || '',
        planType: plan.planType || 'SUBSCRIPTION',
        billingInterval: plan.billingInterval || 'MONTHLY',
        price: plan.price || 0,
        currency: plan.currency || 'USD',
        trialDays: plan.trialDays || 0,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        maxEventsPerMonth: plan.maxEventsPerMonth,
        maxAttendeesPerEvent: plan.maxAttendeesPerEvent,
        featuresJson: plan.featuresJson || {},
        stripePriceId: plan.stripePriceId || '',
        stripeProductId: plan.stripeProductId || '',
      });
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }
      if (type === 'number') {
        // Handle empty number fields as undefined (for nullable fields)
        if (value === '' && (name === 'maxEventsPerMonth' || name === 'maxAttendeesPerEvent')) {
          return { ...prev, [name]: undefined };
        }
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON before submitting
    if (jsonError) {
      alert('Please fix the JSON syntax error before submitting.');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
        <input
          type="text"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Code</label>
        <input
          type="text"
          name="planCode"
          value={formData.planCode}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
          <select
            name="planType"
            value={formData.planType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          >
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="ONE_TIME">One Time</option>
            <option value="FREEMIUM">Freemium</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Interval</label>
          <select
            name="billingInterval"
            value={formData.billingInterval}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="ONE_TIME">One Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <input
            type="text"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            required
            maxLength={3}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
        <input
          type="number"
          name="trialDays"
          value={formData.trialDays}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Events Per Month</label>
          <input
            type="number"
            name="maxEventsPerMonth"
            value={formData.maxEventsPerMonth || ''}
            onChange={handleChange}
            min="0"
            placeholder="Unlimited if empty"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees Per Event</label>
          <input
            type="number"
            name="maxAttendeesPerEvent"
            value={formData.maxAttendeesPerEvent || ''}
            onChange={handleChange}
            min="0"
            placeholder="Unlimited if empty"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Product ID</label>
          <input
            type="text"
            name="stripeProductId"
            value={formData.stripeProductId || ''}
            onChange={handleChange}
            placeholder="prod_xxxxx"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Price ID</label>
          <input
            type="text"
            name="stripePriceId"
            value={formData.stripePriceId || ''}
            onChange={handleChange}
            placeholder="price_xxxxx"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features JSON</label>
        <textarea
          name="featuresJson"
          value={JSON.stringify(formData.featuresJson || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData((prev) => ({ ...prev, featuresJson: parsed }));
              setJsonError(null);
            } catch (err) {
              setJsonError('Invalid JSON format. Please check your syntax.');
            }
          }}
          rows={6}
          placeholder='{"feature1": true, "feature2": "value"}'
          className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm ${
            jsonError ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
          }`}
        />
        {jsonError ? (
          <p className="mt-1 text-xs text-red-600">{jsonError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Enter valid JSON format for features (e.g., {"{"}"feature1": true, "feature2": "value"{"}"})</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center cursor-pointer">
          <span className="relative flex items-center justify-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="custom-checkbox"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="custom-checkbox-tick">
              {formData.isActive && (
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                </svg>
              )}
            </span>
          </span>
          <span className="ml-2 text-sm font-medium text-gray-700 select-none">Active</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {isLoading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="bg-teal-100 hover:bg-teal-200 text-teal-800">
          Cancel
        </Button>
      </div>
    </form>
  );
}

