
import React from 'react';
import { ContactWithDetails, ContactStatus, View } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  contacts: ContactWithDetails[];
  onNavigate: (view: View, id?: string) => void;
  onUpdateContact: (contact: ContactWithDetails) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ contacts, onNavigate, onUpdateContact }) => {
  const activeCount = contacts.filter(c => c.status === ContactStatus.ACTIVE).length;
  const prospectCount = contacts.filter(c => c.status === ContactStatus.PROSPECT).length;

  const totalReceived = contacts.reduce((sum, c) =>
    sum + c.financials.reduce((fSum, f) => fSum + f.value_paid, 0), 0
  );

  const billingByClient = contacts.map(c => ({
    name: c.company,
    value: c.financials.reduce((sum, f) => sum + f.value_paid, 0)
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const statusData = [
    { name: 'Active', value: activeCount, color: '#3b82f6' },
    { name: 'Prospect', value: prospectCount, color: '#8b5cf6' },
    { name: 'Inactive', value: contacts.length - activeCount - prospectCount, color: '#475569' }
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);

  const upcomingAlerts = contacts.flatMap(c =>
    (c.alerts || []).map(a => ({ ...a, contactName: c.name, companyName: c.company, contactId: c.id }))
  ).filter(a => {
    const chargeDate = new Date(a.charge_date);
    return chargeDate >= today && chargeDate <= tenDaysFromNow;
  }).sort((a, b) => new Date(a.charge_date).getTime() - new Date(b.charge_date).getTime());

  const handlePayAlert = (e: React.MouseEvent, contactId: string, alertId: string) => {
    e.stopPropagation();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const alert = contact.alerts.find(a => a.id === alertId);
    if (!alert) return;

    let nextAlerts = [...contact.alerts];

    if (alert.recurrence === 'Once') {
      nextAlerts = nextAlerts.filter(a => a.id !== alertId);
    } else {
      const currentPos = new Date(alert.charge_date);
      if (alert.recurrence === 'Weekly') currentPos.setDate(currentPos.getDate() + 7);
      if (alert.recurrence === 'Monthly') currentPos.setMonth(currentPos.getMonth() + 1);
      if (alert.recurrence === 'Yearly') currentPos.setFullYear(currentPos.getFullYear() + 1);
      nextAlerts = nextAlerts.map(a => a.id === alertId ? { ...a, charge_date: currentPos.toISOString().split('T')[0] } : a);
    }

    onUpdateContact({ ...contact, alerts: nextAlerts });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Alertas Premium */}
      {upcomingAlerts.length > 0 && (
        <section className="glass-panel border-blue-500/20 shadow-2xl shadow-blue-500/5 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-8 py-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3 text-white">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30">
                <AlertIcon />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-blue-400">Critical Alerts</h3>
                <p className="text-[10px] font-bold text-slate-400 opacity-80">Next 10 days payments schedule</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {upcomingAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center p-4 lg:px-8 hover:bg-white/5 transition-all cursor-pointer group rounded-xl"
                  onClick={() => onNavigate('contact-details', alert.contactId)}
                >
                  <div className="lg:col-span-2">
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      {new Date(alert.charge_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="font-bold text-white text-sm">{alert.contactName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{alert.companyName}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="text-xs text-slate-400 italic line-clamp-1 opacity-70">"{alert.reason}"</p>
                  </div>
                  <div className="lg:col-span-2 text-right">
                    <p className="text-lg font-black text-white tracking-tighter">
                      R$ {alert.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="lg:col-span-2 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handlePayAlert(e, alert.contactId, alert.id)}
                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <CheckIconSmall />
                    </button>
                    <button className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                      <EditIconSmall />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Clients" value={contacts.length} icon={<UsersIcon />} color="blue" />
        <StatCard label="Active Portfolio" value={activeCount} icon={<CheckIcon />} color="emerald" />
        <StatCard label="Gross Revenue" value={`R$ ${totalReceived.toLocaleString('pt-BR')}`} icon={<DollarIcon />} color="indigo" />
        <StatCard label="Opportunities" value={prospectCount} icon={<TargetIcon />} color="purple" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 glass-panel p-8 border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Revenue Analytics</h3>
              <p className="text-[10px] font-bold text-slate-500">Top 5 clients performance</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billingByClient} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={25}>
                  {billingByClient.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-8 border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Portfolio Mix</h3>
              <p className="text-[10px] font-bold text-slate-500">Segmentation by status</p>
            </div>
          </div>
          <div className="h-80 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white">{contacts.length}</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Scan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="glass-card p-10 flex flex-col items-center justify-center group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-${color}-500/10 transition-all`} />
    <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-${color}-500 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-${color}-500/30 group-hover:shadow-[0_0_20px_rgba(var(--accent-glow),0.1)] mb-6`}>
      {icon}
    </div>
    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">{label}</p>
    <p className="text-3xl font-black text-white leading-none tracking-tighter">{value}</p>
  </div>
);

const CheckIconSmall = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
const EditIconSmall = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CheckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DollarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TargetIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const AlertIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
