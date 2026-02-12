
import { ContactWithDetails, ContactStatus } from './types';

export const initialContacts: ContactWithDetails[] = [
  {
    id: '1',
    user_id: 'default-user',
    name: 'João Silva',
    company: 'Tech Innovators',
    website: 'https://techinnovators.com',
    email: 'joao@techinnovators.com',
    phone: '(11) 98888-7777',
    status: ContactStatus.ACTIVE,
    commercial_area: 'SaaS Enterprise',
    internalNotes: [
      { id: 'n1', contact_id: '1', content: 'Cliente estratégico focado em expansão.', date: '2023-10-15' }
    ],
    created_at: new Date().toISOString(),
    interactions: [
      { id: 'i1', contact_id: '1', type: 'Comment', content: 'Primeira reunião de alinhamento concluída.', date: '2023-10-15' },
      { id: 'i2', contact_id: '1', type: 'Strategy', content: 'Focar em expansão de licenças para Q4.', date: '2023-11-01' }
    ],
    financials: [
      { id: 'f1', contact_id: '1', service_name: 'Consultoria Mensal', value_charged: 5000, value_paid: 5000, payment_date: '2023-11-05', status: 'Paid', created_at: '2023-11-01' }
    ],
    alerts: []
  },
  {
    id: '2',
    user_id: 'default-user',
    name: 'Maria Oliveira',
    company: 'Marketing Pro',
    website: 'https://marketingpro.com.br',
    email: 'maria@marketingpro.com.br',
    phone: '(21) 97777-6666',
    status: ContactStatus.PROSPECT,
    commercial_area: 'Agência Digital',
    internalNotes: [],
    created_at: new Date().toISOString(),
    interactions: [],
    financials: [],
    alerts: []
  }
];
