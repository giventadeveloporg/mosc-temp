'use client';

import { Check } from 'lucide-react';

interface Feature {
  key: string;
  value: string;
}

interface PlanFeaturesListProps {
  features: Feature[];
  highlightFeatures?: string[];
}

export function PlanFeaturesList({ features, highlightFeatures = [] }: PlanFeaturesListProps) {
  if (features.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {features.map((feature) => {
        const isHighlighted = highlightFeatures.includes(feature.key);
        return (
          <li key={feature.key} className="flex items-start gap-3">
            <Check
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                isHighlighted ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <span
              className={`font-body text-sm ${
                isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {feature.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}



