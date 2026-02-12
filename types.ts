
export enum ContactStatus {
  ACTIVE = 'Active',
  PROSPECT = 'Prospect',
  INACTIVE = 'Inactive'
}

export type RecurrenceType = 'Once' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Interaction {
  id: string;
  contact_id: string;
  type: 'Comment' | 'Strategy' | 'Meeting' | 'Call';
  content: string;
  date: string;
}

export interface FinancialRecord {
  id: string;
  contact_id: string;
  service_name: string;
  value_charged: number;
  value_paid: number;
  payment_date: string;
  status: 'Pending' | 'Paid';
  created_at: string;
}

export interface BillingAlert {
  id: string;
  contact_id: string;
  reason: string;
  value: number;
  charge_date: string;
  recurrence: RecurrenceType;
  created_at: string;
}

export interface InternalNote {
  id: string;
  contact_id: string;
  content: string;
  date: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  company: string;
  website: string;
  email: string;
  phone: string;
  status: ContactStatus;
  commercial_area: string;
  created_at: string;
}

export interface ContactWithDetails extends Contact {
  internal_notes: InternalNote[];
  interactions: Interaction[];
  financials: FinancialRecord[];
  alerts: BillingAlert[];
}

export type View = 'dashboard' | 'contacts' | 'contact-details' | 'login';
