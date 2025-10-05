import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://njczbgmwrauhftlxzejq.supabase.co',        // URL de tu proyecto Supabase
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY3piZ213cmF1aGZ0bHh6ZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjgyNTUsImV4cCI6MjA3NDg0NDI1NX0.MWVNOjHT7iSZI53J9S3LyaItW3ywYv8v9p83hOMvpsY'                   // Public anon key desde Supabase
    );
  }

   // 🔐 Autenticación
  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  
  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:4200/nueva-contrasena' // Cambia esto a la URL de tu aplicación
    });
  }

  updatePassword(nuevaPassword: string) {
    return this.supabase.auth.updateUser({ password: nuevaPassword });
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  // 📥 Insertar gasto
  insertGasto(gasto: any) {
    return this.supabase.from('gastos').insert([gasto]);
  }

  // 📤 Obtener metas
  getMetas(usuarioId: string) {
    return this.supabase.from('metas').select('*').eq('usuario_id', usuarioId);
  }

  // 🧾 Obtener gastos
  getGastos(usuarioId: string) {
    return this.supabase.from('gastos').select('*').eq('usuario_id', usuarioId);
  }

  // 👤 Insertar perfil de usuario
  insertUsuario(usuario: { id: string; nombre: string; apellido: string; edad: number }) {
    return this.supabase.from('usuarios').insert([usuario]);
  }
}
  
