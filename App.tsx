
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContactList } from './components/ContactList';
import { ContactDetails } from './components/ContactDetails';
import { Login } from './components/Login';
import { ContactWithDetails, View } from './types';
import { supabase } from './services/supabase';
import { contactService } from './services/contactService';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [contacts, setContacts] = useState<ContactWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      } else {
        setUser(null);
        setContacts([]);
        setView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await contactService.getContacts();
      setContacts(data as ContactWithDetails[]);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();

      let timeout: any;
      const debouncedFetch = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fetchContacts();
        }, 1000);
      };

      // Subscribe to Realtime for all relevant tables
      const channel = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, debouncedFetch)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, debouncedFetch)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'financials' }, debouncedFetch)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, debouncedFetch)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_notes' }, debouncedFetch)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        clearTimeout(timeout);
      };
    }
  }, [user]);

  const handleNavigate = (newView: View, contactId?: string) => {
    setView(newView);
    if (contactId) {
      setSelectedContactId(contactId);
    }
  };

  const handleAddOrUpdateContact = async (contact: ContactWithDetails) => {
    try {
      if (contacts.find(c => c.id === contact.id)) {
        await contactService.updateContact(contact.id, contact);
      } else {
        const { id, ...newContact } = contact; // Supabase generates UUID
        await contactService.addContact({ ...newContact, user_id: user?.id });
      }
      // Realtime will trigger fetchContacts()
    } catch (err) {
      console.error('Operation failed:', err);
      alert('Error saving data. Please try again.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.deleteContact(id);
        if (selectedContactId === id) {
          setView('contacts');
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-blue-500 font-black tracking-[0.3em] animate-pulse">AUTHENTICATING...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="min-h-screen bg-[#05070a] relative overflow-hidden">
      <div className="mesh-gradient" />
      <Layout
        currentView={view}
        onNavigate={handleNavigate}
        userEmail={user.email}
        onLogout={() => supabase.auth.signOut()}
      >
        <main className="max-w-[1400px] mx-auto px-6 py-6 lg:px-10 lg:py-10">
          {view === 'dashboard' && (
            <Dashboard
              contacts={contacts}
              onNavigate={handleNavigate}
              onUpdateContact={handleAddOrUpdateContact}
            />
          )}
          {view === 'contacts' && (
            <ContactList
              contacts={contacts}
              onAddContact={handleAddOrUpdateContact}
              onSelectContact={(id) => handleNavigate('contact-details', id)}
              onDeleteContact={handleDeleteContact}
            />
          )}
          {view === 'contact-details' && selectedContact && (
            <ContactDetails
              contact={selectedContact}
              onUpdate={handleAddOrUpdateContact}
              onBack={() => setView('contacts')}
            />
          )}
        </main>
      </Layout>
    </div>
  );
};

export default App;
