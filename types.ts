
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
  user_id: string; // Multi-usuário ready
  name: string;
  company: string;
  website: string;
  email: string;
  phone: string;
  status: ContactStatus;
  commercial_area: string;
  created_at: string;
}

// Interface composta para facilitar o gerenciamento de estado local antes do Supabase
export interface ContactWithDetails extends Contact {
  internalNotes: InternalNote[];
  interactions: Interaction[];
  financials: FinancialRecord[];
  alerts: BillingAlert[];
}

export type View = 'dashboard' | 'contacts' | 'contact-details' | 'login';
