
import React, { useState } from 'react';
import { ContactWithDetails, ContactStatus, Interaction, FinancialRecord, BillingAlert, InternalNote, RecurrenceType } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ContactDetailsProps {
  contact: ContactWithDetails;
  onUpdate: (contact: ContactWithDetails) => void;
  onBack: () => void;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ contact, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'financial' | 'alerts'>('info');

  const [editingGeneral, setEditingGeneral] = useState(false);
  const [commercial_area, setCommercialArea] = useState(contact.commercial_area || '');

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [newInteraction, setNewInteraction] = useState('');
  const [newInteractionType, setNewInteractionType] = useState<Interaction['type']>('Comment');
  const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);

  const [serviceName, setServiceName] = useState('');
  const [valueCharged, setValueCharged] = useState('');
  const [valuePaid, setValuePaid] = useState('');
  const [editingFinancialId, setEditingFinancialId] = useState<string | null>(null);

  const [alertReason, setAlertReason] = useState('');
  const [alertValue, setAlertValue] = useState('');
  const [alertDate, setAlertDate] = useState('');
  const [alertRecurrence, setAlertRecurrence] = useState<RecurrenceType>('Once');
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);

  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleSaveGeneral = () => {
    onUpdate({ ...contact, commercial_area });
    setEditingGeneral(false);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    if (editingNoteId) {
      onUpdate({
        ...contact,
        internalNotes: (contact.internalNotes || []).map(n => n.id === editingNoteId ? { ...n, content: newNoteContent } : n)
      });
      setEditingNoteId(null);
    } else {
      const note: InternalNote = {
        id: Date.now().toString(),
        contact_id: contact.id,
        content: newNoteContent,
        date: new Date().toISOString().split('T')[0]
      };
      onUpdate({
        ...contact,
        internalNotes: [note, ...(contact.internalNotes || [])]
      });
    }
    setNewNoteContent('');
  };

  const deleteNote = (id: string) => {
    if (confirm('Delete this insight permanently?')) {
      onUpdate({ ...contact, internalNotes: contact.internalNotes.filter(n => n.id !== id) });
    }
  };

  const handleSaveFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !valueCharged) return;

    const vCharged = Number(valueCharged);
    const vPaid = valuePaid ? Number(valuePaid) : 0;

    if (editingFinancialId) {
      onUpdate({
        ...contact,
        financials: contact.financials.map(f => f.id === editingFinancialId ? {
          ...f,
          service_name: serviceName,
          value_charged: vCharged,
          value_paid: vPaid,
          status: vPaid >= vCharged ? 'Paid' : 'Pending',
          payment_date: vPaid > 0 ? (f.payment_date !== '-' ? f.payment_date : new Date().toISOString().split('T')[0]) : '-'
        } : f)
      });
      setEditingFinancialId(null);
    } else {
      const record: FinancialRecord = {
        id: Date.now().toString(),
        contact_id: contact.id,
        service_name: serviceName,
        value_charged: vCharged,
        value_paid: vPaid,
        payment_date: vPaid > 0 ? new Date().toISOString().split('T')[0] : '-',
        status: vPaid >= vCharged ? 'Paid' : 'Pending',
        created_at: new Date().toISOString()
      };
      onUpdate({
        ...contact,
        financials: [record, ...contact.financials]
      });
    }
    setServiceName('');
    setValueCharged('');
    setValuePaid('');
  };

  const deleteFinancial = (id: string) => {
    if (confirm('Remove financial record?')) {
      onUpdate({ ...contact, financials: contact.financials.filter(f => f.id !== id) });
    }
  };

  const handleSaveInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.trim()) return;

    if (editingInteractionId) {
      onUpdate({
        ...contact,
        interactions: contact.interactions.map(i => i.id === editingInteractionId ? { ...i, content: newInteraction, type: newInteractionType } : i)
      });
      setEditingInteractionId(null);
    } else {
      const interaction: Interaction = {
        id: Date.now().toString(),
        contact_id: contact.id,
        type: newInteractionType,
        content: newInteraction,
        date: new Date().toISOString().split('T')[0]
      };
      onUpdate({
        ...contact,
        interactions: [interaction, ...contact.interactions]
      });
    }
    setNewInteraction('');
  };

  const deleteInteraction = (id: string) => {
    if (confirm('Delete interaction log?')) {
      onUpdate({ ...contact, interactions: contact.interactions.filter(i => i.id !== id) });
    }
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertReason || !alertValue || !alertDate) return;

    if (editingAlertId) {
      onUpdate({
        ...contact,
        alerts: (contact.alerts || []).map(a => a.id === editingAlertId ? { ...a, reason: alertReason, value: Number(alertValue), charge_date: alertDate, recurrence: alertRecurrence } : a)
      });
      setEditingAlertId(null);
    } else {
      const alert: BillingAlert = {
        id: Date.now().toString(),
        contact_id: contact.id,
        reason: alertReason,
        value: Number(alertValue),
        charge_date: alertDate,
        recurrence: alertRecurrence,
        created_at: new Date().toISOString()
      };
      onUpdate({
        ...contact,
        alerts: [...(contact.alerts || []), alert]
      });
    }
    setAlertReason('');
    setAlertValue('');
    setAlertDate('');
    setAlertRecurrence('Once');
  };

  const handlePayAlert = (alertId: string) => {
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

    onUpdate({ ...contact, alerts: nextAlerts });
  };

  const startEditAlert = (alert: BillingAlert) => {
    setAlertReason(alert.reason);
    setAlertValue(alert.value.toString());
    setAlertDate(alert.charge_date);
    setAlertRecurrence(alert.recurrence);
    setEditingAlertId(alert.id);
  };

  const getAISuggestion = async () => {
    setIsAIThinking(true);
    setAiSuggestion(null);
    try {
      const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' });
      const prompt = `Analise este cliente e sugira 3 estratégias comerciais. Nome: ${contact.name}, Empresa: ${contact.company}, Status: ${contact.status}. Area: ${contact.commercial_area}`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiSuggestion(response.text || 'Insight not available.');
    } catch (e) {
      setAiSuggestion('AI offline. Please check connection.');
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Top Profile Card */}
      <div className="glass-panel p-10 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
          <div className="flex items-center space-x-10">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white border-2 border-white/10 shadow-2xl skew-y-1 group-hover:skew-y-0 transition-transform duration-700">
              {contact.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <h3 className="text-4xl font-black text-white tracking-tighter">{contact.name}</h3>
                <StatusBadge status={contact.status} />
              </div>
              <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{contact.company}</p>

              <div className="flex flex-wrap gap-8 mt-8">
                <QuickInfo icon={<MailIcon />} value={contact.email} label="IDENTITY EMAIL" />
                <QuickInfo icon={<PhoneIcon />} value={contact.phone} label="DIRECT COMMS" />
                <QuickInfo icon={<GlobeIcon />} value={contact.website} label="DOMAIN ASSET" isLink />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button onClick={onBack} className="px-8 py-4 glass-card border-white/5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500/20">
              Return to Archive
            </button>
            <button
              onClick={getAISuggestion}
              disabled={isAIThinking}
              className="px-8 py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/5"
            >
              {isAIThinking ? 'Analyzing Data...' : 'Generate AI Insights'}
            </button>
          </div>
        </div>
      </div>

      {aiSuggestion && (
        <div className="glass-panel p-8 border-blue-500/20 bg-blue-500/5 animate-fade-in">
          <div className="flex items-center space-x-3 text-blue-400 mb-6 font-black uppercase tracking-widest text-xs">
            <SparkleIcon />
            <span>Intelligent Commercial Strategy</span>
          </div>
          <p className="text-slate-200 font-bold leading-relaxed whitespace-pre-wrap">{aiSuggestion}</p>
        </div>
      )}

      {/* Tabs System */}
      <div className="glass-panel border-white/5 min-h-[600px] flex flex-col overflow-hidden">
        <nav className="flex bg-white/5 border-b border-white/5 px-2">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Core Data" />
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Interaction log" />
          <TabButton active={activeTab === 'financial'} onClick={() => setActiveTab('financial')} label="Revenue Stream" />
          <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} label="Payment schedule" />
        </nav>

        <div className="p-10 flex-1 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card p-10 border-white/5">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Business Specs</h4>
                    <button onClick={() => editingGeneral ? handleSaveGeneral() : setEditingGeneral(true)} className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                      {editingGeneral ? 'Push Changes' : 'Mod Mode'}
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Market Segment</p>
                      {editingGeneral ? (
                        <input value={commercial_area} onChange={(e) => setCommercialArea(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white" />
                      ) : (
                        <p className="text-2xl font-black text-white tracking-widest uppercase">{contact.commercial_area || 'Undefined'}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Registry Timestamp</p>
                      <p className="text-2xl font-black text-white tracking-widest uppercase">{new Date(contact.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest ml-4">Internal Intelligence Notes</h4>
                  <form onSubmit={handleSaveNote} className="relative">
                    <textarea
                      className="w-full glass-card min-h-[180px] p-8 border-white/5 text-white placeholder-slate-600 focus:border-blue-500/50 outline-none"
                      placeholder="Log strategic observation..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                    />
                    <button type="submit" className="absolute bottom-6 right-6 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-500 transition-all font-black uppercase text-[9px] tracking-widest">
                      Dispatch Note
                    </button>
                  </form>

                  <div className="space-y-4">
                    {(contact.internalNotes || []).map(note => (
                      <div key={note.id} className="glass-card p-6 border-white/5 group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(note.date).toLocaleDateString()}</span>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setNewNoteContent(note.content); setEditingNoteId(note.id); }} className="p-1.5 text-slate-500 hover:text-blue-500"><EditIconThin /></button>
                            <button onClick={() => deleteNote(note.id)} className="p-1.5 text-slate-500 hover:text-red-500"><TrashIconThin /></button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
              <form onSubmit={handleSaveInteraction} className="glass-card p-10 border-blue-500/10 bg-blue-600/5">
                <div className="flex items-center space-x-4 mb-8">
                  <select
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-400 outline-none"
                    value={newInteractionType}
                    onChange={(e) => setNewInteractionType(e.target.value as any)}
                  >
                    <option value="Comment">COMMENTARY</option>
                    <option value="Strategy">STRATEGY</option>
                    <option value="Meeting">MEETING</option>
                    <option value="Call">CALL</option>
                  </select>
                </div>
                <textarea
                  className="w-full glass-card p-8 min-h-[140px] border-white/10 text-white focus:border-blue-500/50 outline-none mb-8"
                  placeholder="Input interaction summary..."
                  value={newInteraction}
                  onChange={(e) => setNewInteraction(e.target.value)}
                />
                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500">
                  Document Activity
                </button>
              </form>

              <div className="relative space-y-8 before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-[2px] before:bg-white/5">
                {(contact.interactions || []).map(item => (
                  <div key={item.id} className="relative pl-14 group">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center text-blue-500 z-10 group-hover:border-blue-500 transition-colors">
                      <ActivityIcon />
                    </div>
                    <div className="glass-card p-6 border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded-lg">{item.type}</span>
                        <span className="text-[9px] font-black text-slate-600 tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-300">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-10 animate-fade-in">
              <form onSubmit={handleSaveFinancial} className="glass-panel p-10 border-white/5 bg-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InputMinimal label="ASSET / SERVICE NAME" value={serviceName} onChange={setServiceName} />
                  <InputMinimal label="QUOTED VALUE" value={valueCharged} onChange={setValueCharged} type="number" />
                  <InputMinimal label="RECEIVED TRANSACTION" value={valuePaid} onChange={setValuePaid} type="number" color="emerald" />
                </div>
                <button type="submit" className="w-full mt-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5">
                  Log Financial Data
                </button>
              </form>

              <div className="glass-panel border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6">Service</th>
                      <th className="px-10 py-6 text-center">Status</th>
                      <th className="px-10 py-6 text-right">Value</th>
                      <th className="px-10 py-6 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(contact.financials || []).map(f => (
                      <tr key={f.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-10 py-6 text-sm font-black text-white">{f.service_name}</td>
                        <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${f.status === 'Paid' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                            }`}>{f.status === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
                        </td>
                        <td className="px-10 py-6 text-right font-black text-white text-lg tracking-tighter">R$ {f.value_charged.toLocaleString('pt-BR')}</td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingFinancialId(f.id); setServiceName(f.service_name); setValueCharged(f.value_charged.toString()); setValuePaid(f.value_paid.toString()); }} className="text-slate-500 hover:text-blue-500"><EditIconThin /></button>
                            <button onClick={() => deleteFinancial(f.id)} className="text-slate-500 hover:text-red-500"><TrashIconThin /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-10 animate-fade-in">
              <div className="glass-panel p-10 border-orange-500/20 bg-orange-500/5">
                <h4 className="text-orange-400 font-black text-sm uppercase tracking-widest mb-10 flex items-center space-x-3">
                  <AlertIcon />
                  <span>Secure Payment Scheduling</span>
                </h4>
                <form onSubmit={handleSaveAlert} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <InputMinimal label="BILLING REASON" value={alertReason} onChange={setAlertReason} color="orange" />
                  <InputMinimal label="QUOTA (R$)" value={alertValue} onChange={setAlertValue} type="number" color="orange" />
                  <InputMinimal label="DEADLINE" value={alertDate} onChange={setAlertDate} type="date" color="orange" />
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest ml-1">CYCLE</label>
                    <select className="w-full bg-white/5 border border-orange-500/20 rounded-xl px-5 py-3.5 text-xs font-black uppercase tracking-widest text-orange-400 outline-none appearance-none" value={alertRecurrence} onChange={(e) => setAlertRecurrence(e.target.value as any)}>
                      <option value="Once" className="bg-[#1a1a1a]">ONCE</option>
                      <option value="Weekly" className="bg-[#1a1a1a]">WEEKLY</option>
                      <option value="Monthly" className="bg-[#1a1a1a]">MONTHLY</option>
                      <option value="Yearly" className="bg-[#1a1a1a]">YEARLY</option>
                    </select>
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <button type="submit" className="px-12 py-5 bg-orange-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-orange-500">
                      {editingAlertId ? 'Commit Update' : 'Initialize Protocol'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(contact.alerts || []).map(alert => (
                  <div key={alert.id} className="glass-card p-10 border-orange-500/10 group hover:border-orange-500/30">
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-orange-500 bg-orange-500/5 p-3 rounded-2xl border border-orange-500/10">
                        <CalendarIcon />
                      </div>
                      <span className="text-[9px] font-black text-orange-400 tracking-[0.2em] uppercase">{alert.recurrence} CYCLE</span>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Vence em {new Date(alert.charge_date).toLocaleDateString()}</p>
                    <h6 className="text-xl font-black text-white tracking-widest uppercase mb-4">{alert.reason}</h6>
                    <p className="text-3xl font-black text-white tracking-tighter">R$ {alert.value.toLocaleString('pt-BR')}</p>

                    <div className="flex items-center space-x-4 mt-8 pt-8 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePayAlert(alert.id)} className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center space-x-2">
                        <CheckIconSmall /> <span>VERIFIED</span>
                      </button>
                      <button onClick={() => startEditAlert(alert)} className="text-slate-500 hover:text-white"><EditIconThin /></button>
                      <button onClick={() => { if (confirm('Excluir alerta?')) onUpdate({ ...contact, alerts: contact.alerts.filter(a => a.id !== alert.id) }); }} className="text-slate-500 hover:text-red-500"><TrashIconThin /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-10 py-6 text-[9px] font-black transition-all border-b-2 uppercase tracking-[0.2em] flex-1 ${active ? 'border-blue-600 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
  >
    {label}
  </button>
);

const QuickInfo: React.FC<{ icon: React.ReactNode; label: string; value: string; isLink?: boolean }> = ({ icon, label, value, isLink }) => (
  <div className="flex flex-col">
    <div className="flex items-center space-x-2 mb-2">
      <div className="text-blue-500/50">{icon}</div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
    {isLink ? (
      <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" className="text-xs font-bold text-slate-200 hover:text-blue-400 truncate max-w-[150px] transition-colors">{value}</a>
    ) : (
      <p className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{value}</p>
    )}
  </div>
);

const InputMinimal: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; color?: string }> = ({ label, value, onChange, type = "text", color = "white" }) => (
  <div className="space-y-4">
    <label className={`text-[9px] font-black text-${color === 'white' ? 'slate-500' : color + '-500/60'} uppercase tracking-widest ml-1`}>{label}</label>
    <div className="relative">
      <input
        type={type}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-xs font-black text-white outline-none focus:border-blue-500/30 transition-all`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: ContactStatus }> = ({ status }) => {
  const styles = {
    [ContactStatus.ACTIVE]: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    [ContactStatus.PROSPECT]: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    [ContactStatus.INACTIVE]: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  };
  return (
    <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]} shadow-lg shadow-black/20`}>{status}</span>
  );
};

// Icons components...
const MailIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const GlobeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
const EditIconThin = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const TrashIconThin = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SparkleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>;
const ActivityIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CalendarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CheckIconSmall = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
