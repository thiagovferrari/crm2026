
import React, { useState } from 'react';
import { ContactWithDetails, ContactStatus } from '../types';

interface ContactListProps {
  contacts: ContactWithDetails[];
  onSelectContact: (id: string) => void;
  onAddContact: (contact: ContactWithDetails) => void;
  onDeleteContact: (id: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact, onAddContact, onDeleteContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'All'>('All');
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedForEdit, setSelectedForEdit] = useState<ContactWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (e: React.MouseEvent, contact: ContactWithDetails) => {
    e.stopPropagation();
    setSelectedForEdit(contact);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedForEdit(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header e Filtros */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, empresa ou setor..."
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            className="bg-white/5 border border-white/10 px-6 py-4 rounded-[1.25rem] text-sm font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-white/10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All" className="bg-[#0f172a]">Filtro Global</option>
            <option value={ContactStatus.ACTIVE} className="bg-[#0f172a]">Apenas Ativos</option>
            <option value={ContactStatus.PROSPECT} className="bg-[#0f172a]">Em Prospecção</option>
            <option value={ContactStatus.INACTIVE} className="bg-[#0f172a]">Inativos</option>
          </select>

          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs flex items-center space-x-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <PlusIcon />
            <span>Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* Grid de Contatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div
            key={contact.id}
            className="glass-card group p-8 cursor-pointer flex flex-col h-full hover:border-blue-500/30"
            onClick={() => onSelectContact(contact.id)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-white border border-white/10 group-hover:scale-110 transition-transform">
                {contact.name.charAt(0)}
              </div>
              <StatusBadge status={contact.status} />
            </div>

            <div className="flex-1 mb-8">
              <h3 className="text-xl font-black text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors">{contact.name}</h3>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{contact.company}</p>

              <div className="mt-6 space-y-3 opacity-60">
                <div className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                  <MailIconSmall />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-bold text-slate-300">
                  <PhoneIconSmall />
                  <span>{contact.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adicionado em {new Date(contact.created_at).toLocaleDateString('pt-BR')}</span>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => handleEditClick(e, contact)}
                  className="p-2.5 bg-white/5 text-slate-400 hover:text-blue-400 rounded-xl transition-all hover:bg-blue-500/10"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Excluir contato?')) onDeleteContact(contact.id); }}
                  className="p-2.5 bg-white/5 text-slate-400 hover:text-red-400 rounded-xl transition-all hover:bg-red-500/10"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ContactModal
          mode={modalMode}
          initialData={selectedForEdit}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            if (modalMode === 'add') {
              onAddContact({
                ...data,
                id: Date.now().toString(),
                user_id: '',
                created_at: new Date().toISOString(),
                interactions: [],
                financials: [],
                alerts: [],
                internalNotes: []
              });
            } else if (selectedForEdit) {
              onAddContact({ ...selectedForEdit, ...data });
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: ContactStatus }> = ({ status }) => {
  const styles = {
    [ContactStatus.ACTIVE]: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    [ContactStatus.PROSPECT]: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    [ContactStatus.INACTIVE]: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

const ContactModal: React.FC<{ mode: 'add' | 'edit'; initialData: ContactWithDetails | null; onClose: () => void; onSubmit: (data: any) => void }> = ({ mode, initialData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    website: initialData?.website || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    status: initialData?.status || ContactStatus.PROSPECT,
    commercial_area: initialData?.commercial_area || ''
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#05070a]/80 backdrop-blur-xl animate-fade-in">
      <div className="glass-panel w-full max-w-2xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 bg-[#05070a] z-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{mode === 'add' ? 'Novo Registro' : 'Atualizar Registro'}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Protocolo de Gestão de Dados</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-10 space-y-8">
          <Input label="Nome Completo" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Empresa" value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} required />
            <Input label="Segmento" value={formData.commercial_area} onChange={(v) => setFormData({ ...formData, commercial_area: v })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="E-mail Corporativo" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
            <Input label="Telefone Direto" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Site/Domínio" value={formData.website} onChange={(v) => setFormData({ ...formData, website: v })} />
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status do Ciclo</label>
              <select
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
              >
                <option value={ContactStatus.ACTIVE} className="bg-[#0f172a]">ATIVO</option>
                <option value={ContactStatus.PROSPECT} className="bg-[#0f172a]">EM PROSPECÇÃO</option>
                <option value={ContactStatus.INACTIVE} className="bg-[#0f172a]">INATIVO/ARQUIVADO</option>
              </select>
            </div>
          </div>

          <div className="pt-8 flex space-x-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 text-slate-500 font-bold hover:text-white transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
            <button type="submit" className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] uppercase text-xs tracking-[0.2em]">
              {mode === 'add' ? 'Confirmar Adição' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }> = ({ label, value, onChange, type = "text", required = false }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      required={required}
      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.25rem] text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold placeholder-slate-600"
      value={value}
      placeholder="..."
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SearchIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const MailIconSmall = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIconSmall = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
