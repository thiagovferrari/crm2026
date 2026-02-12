
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContactList } from './components/ContactList';
import { ContactDetails } from './components/ContactDetails';
import { Login } from './components/Login';
import { ContactWithDetails, View } from './types';
import { initialContacts } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    const saved = localStorage.getItem('nexus_crm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactWithDetails[]>(() => {
    const saved = localStorage.getItem('nexus_crm_data');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  useEffect(() => {
    localStorage.setItem('nexus_crm_data', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_crm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_crm_user');
    }
  }, [user]);

  const handleNavigate = (newView: View, contactId?: string) => {
    setView(newView);
    if (contactId) {
      setSelectedContactId(contactId);
    }
  };

  const handleAddOrUpdateContact = (contact: ContactWithDetails) => {
    setContacts(prev => {
      const exists = prev.find(c => c.id === contact.id);
      if (exists) {
        return prev.map(c => c.id === contact.id ? contact : c);
      }
      return [...prev, { ...contact, user_id: user?.id || 'default' }];
    });
  };

  const handleUpdateContact = (updatedContact: ContactWithDetails) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selectedContactId === id) {
      setView('contacts');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  // Se não estiver logado, força vista de login (exceto se o usuário for nulo mas estivermos em dev)
  if (!user && view !== 'login') {
    return <Login onLogin={(u) => { setUser(u); setView('dashboard'); }} />;
  }

  if (view === 'login') {
    return <Login onLogin={(u) => { setUser(u); setView('dashboard'); }} />;
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <Layout currentView={view} onNavigate={handleNavigate}>
      {view === 'dashboard' && (
        <Dashboard
          contacts={contacts.filter(c => c.user_id === user?.id)}
          onNavigate={handleNavigate}
          onUpdateContact={handleUpdateContact}
        />
      )}
      {view === 'contacts' && (
        <ContactList
          contacts={contacts.filter(c => c.user_id === user?.id)}
          onSelectContact={(id) => handleNavigate('contact-details', id)}
          onAddContact={handleAddOrUpdateContact}
          onDeleteContact={handleDeleteContact}
        />
      )}
      {view === 'contact-details' && selectedContact && (
        <ContactDetails
          contact={selectedContact}
          onUpdate={handleUpdateContact}
          onBack={() => setView('contacts')}
        />
      )}
    </Layout>
  );
};

export default App;
