import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
  edad: number | null;
  password: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  usuario: Usuario = { nombre: '', apellido: '', email: '', edad: null, password: '' };

  constructor(private router: Router, private supabase: SupabaseService) { }

  async agregarUsuario() {
    const { nombre, apellido, email, edad, password } = this.usuario;

    if (nombre.trim() && apellido.trim() && email.trim() && edad && password.trim()) {
      // 1. Registrar en Supabase Auth
      const { data, error } = await this.supabase.signUp(email, password);

      if (error) {
        alert('Error al registrar: ' + error.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        alert('No se pudo obtener el ID del usuario');
        return;
      }

      // 2. Insertar datos adicionales en tabla usuarios
      const perfil = {
        id: userId,
        nombre,
        apellido,
        edad
      };

      const { error: perfilError } = await this.supabase.insertUsuario(perfil);
      if (perfilError) {
        alert('Error al guardar perfil: ' + perfilError.message);
        return;
      }

      alert('Usuario registrado con éxito!');
      this.usuario = { nombre: '', apellido: '', email: '', edad: null, password: '' };
      await this.supabase.signUp(email, password);

      // Guarda email y password temporalmente
      localStorage.setItem('pendingEmail', email);
      localStorage.setItem('pendingPassword', password);

      // Redirige a la página de verificación
      this.router.navigate(['/verifica-correo']);
    } else {
      alert('Por favor, complete todos los campos.');
    }
  }



  irLogin() {
    this.router.navigate(['/login']);
  }
}