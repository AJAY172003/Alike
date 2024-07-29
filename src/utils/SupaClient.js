import {createClient} from '@supabase/supabase-js';
import {SUPABASE_KEY, SUPABASE_URL} from './creds';
import 'react-native-url-polyfill/auto'
export const supaClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export const checkAndCreateUser = async (name, email) => {
  try {
    const {error} = await supaClient
      .from('users')
      .insert([{email: email, name: name}]);
    if (error) throw error;
  } catch (error) {
    console.error('User already exists: ', error.message);
  }
};

export const getUserByEmail = async email => {
  try {
    const {data, error} = await supaClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user: ', error.message);
    return null;
  }
};

export const insertMessage = async user => {
  try {
    const {error} = await supaClient.from('messages').insert([user]);
    if (error) throw error;
  } catch (error) {
    console.error('Error inserting user: ', error.message);
  }
};
