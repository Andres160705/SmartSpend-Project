import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

interface Usuario {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario: Usuario = { email: '', password: '' };

  constructor(private router: Router, private supabase: SupabaseService) { }

  async iniciarSesion() {
  const { email, password } = this.usuario;

  if (email.trim() && password.trim()) {
    const { data, error } = await this.supabase.signIn(email, password);

    if (error) {
      alert('Correo o contraseña incorrectos.');
      console.error('Error de login:', error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      alert('No se pudo obtener el ID del usuario');
      return;
    }

    localStorage.setItem('userId', userId);

    alert('Inicio de sesión exitoso!');
    console.log('Usuario autenticado:', data.user);

    this.router.navigate(['/inicio']);
  } else {
    alert('Por favor, complete todos los campos.');
  }
}
  recuperarContrasena() {
    this.router.navigate(['/actualizar-contrasena']);
  }
  irRegister(){
    this.router.navigate(['/register']);
  }

}
