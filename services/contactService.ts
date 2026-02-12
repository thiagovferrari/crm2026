
import { supabase } from './supabase';

export const contactService = {
    async getContacts() {
        const { data, error } = await supabase
            .from('contacts')
            .select(`
        *,
        interactions(*),
        financials(*),
        alerts(*),
        internal_notes(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async addContact(contact: any) {
        const { data, error } = await supabase
            .from('contacts')
            .insert([contact])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateContact(id: string, updates: any) {
        const { data, error } = await supabase
            .from('contacts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteContact(id: string) {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
