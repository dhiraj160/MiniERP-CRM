import React from 'react';

type StatusType =
  | 'ACTIVE' | 'INACTIVE' | 'LEAD'
  | 'CONFIRMED' | 'DRAFT' | 'CANCELLED'
  | 'IN' | 'OUT'
  | 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  ACTIVE:      { className: 'badge badge-active',    label: 'Active' },
  INACTIVE:    { className: 'badge badge-inactive',  label: 'Inactive' },
  LEAD:        { className: 'badge badge-lead',      label: 'Lead' },
  CONFIRMED:   { className: 'badge badge-confirmed', label: 'Confirmed' },
  DRAFT:       { className: 'badge badge-draft',     label: 'Draft' },
  CANCELLED:   { className: 'badge badge-cancelled', label: 'Cancelled' },
  IN:          { className: 'badge badge-in',        label: 'IN' },
  OUT:         { className: 'badge badge-out',       label: 'OUT' },  'LOW STOCK': { className: 'badge badge-warning',   label: 'LOW STOCK' },  RETAIL:      { className: 'badge badge-gray',      label: 'Retail' },
  WHOLESALE:   { className: 'badge badge-gray',      label: 'Wholesale' },
  DISTRIBUTOR: { className: 'badge badge-info',      label: 'Distributor' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = false }) => {
  const config = STATUS_CONFIG[status] ?? {
    className: 'badge badge-gray',
    label: status,
  };

  return (
    <span className={config.className}>
      {showDot && <span className="badge-dot" aria-hidden="true" />}
      {config.label}
    </span>
  );
};
