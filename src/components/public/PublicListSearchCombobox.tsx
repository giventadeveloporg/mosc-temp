'use client';

import AdminListSearchCombobox, {
  type AdminListSearchComboboxProps,
  type AdminListSearchItem,
} from '@/components/admin/AdminListSearchCombobox';

/**
 * Public listing typeahead wrapper — same behavior as AdminListSearchCombobox,
 * with organic / `mh-events-search` class names when those styles are present.
 * Callers may override className / inputClassName for MOSC glass-card pages.
 */
export default function PublicListSearchCombobox<T extends AdminListSearchItem>(
  props: AdminListSearchComboboxProps<T>,
) {
  const {
    className = 'relative w-full mh-typeahead',
    inputClassName = 'mh-typeahead-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white',
    ...rest
  } = props;

  return (
    <AdminListSearchCombobox
      {...rest}
      className={className}
      inputClassName={inputClassName}
    />
  );
}
