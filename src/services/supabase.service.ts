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
  return this.supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://smart-spend-project.vercel.app/verificado'
    }
  });
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

  // Insertar gasto
  insertGasto(gasto: any) {
    return this.supabase.from('gastos').insert([gasto]);
  }

  // Obtener metas
  getMetas(usuarioId: string) {
    return this.supabase.from('metas').select('*').eq('usuario_id', usuarioId);
  }

  //  Obtener gastos
  getGastos(usuarioId: string) {
    return this.supabase.from('gastos').select('*').eq('usuario_id', usuarioId);
  }

  //  Insertar perfil de usuario
  insertUsuario(usuario: { id: string; nombre: string; apellido: string; edad: number }) {
    return this.supabase.from('usuarios').insert([usuario]);
  }

  getEgresos(usuarioId: string) {
    return this.supabase.from('egresos').select('*').eq('usuario_id', usuarioId);
  }

  insertMeta(meta: any) {
  return this.supabase.from('metas').insert([meta]).select(); // esto devuelve un array con el objeto insertado
}
insertEgreso(egreso: any) {
  return this.supabase.from('egresos').insert([egreso]).select('*');
}



actualizarIngreso(metaId: string, nuevoIngreso: number) {
  return this.supabase.from('metas').update({ ingreso: nuevoIngreso }).eq('id', metaId);
}

actualizarEgreso(egresoId: string, nuevoMonto: number) {
  return this.supabase.from('egresos').update({ monto: nuevoMonto }).eq('id', egresoId);
}

eliminarMeta(metaId: string) {
  return this.supabase.from('metas').delete().eq('id', metaId);
}

eliminarEgreso(egresoId: string) {
  return this.supabase.from('egresos').delete().eq('id', egresoId);
}

logout() {
  return this.supabase.auth.signOut();
}

 async subirImagen(nombre: string, archivo: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await this.supabase.storage.from('metas').upload(nombre, archivo);
    if (error) {
      console.error('Error al subir imagen:', error.message);
      return { url: null, error: error.message };
    }

    const { data: urlData } = this.supabase.storage.from('metas').getPublicUrl(nombre);
    const publicUrl = urlData.publicUrl;

    return { url: publicUrl, error: null };
  } catch (err: any) {
    console.error('Error inesperado al subir imagen:', err);
    return { url: null, error: 'Error inesperado al subir imagen' };
  }
}


}

  
