// js/supabaseClient.js (Using window.supabase)

const SUPABASE_URL = 'https://hdxriwksqgbdiyadboyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeHJpd2tzcWdiZGl5YWRib3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NjM2MDgsImV4cCI6MjA3NTAzOTYwOH0.jxWvAFhvICmgY6oUcyetvxhRwFdjZwRbc5h2uDLuSrg';

// Using window.supabase as you suggested
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);