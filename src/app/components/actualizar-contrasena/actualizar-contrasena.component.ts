import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actualizar-contrasena',
  imports: [FormsModule, CommonModule],
  templateUrl: './actualizar-contrasena.component.html',
  styleUrl: './actualizar-contrasena.component.css'
})
export class ActualizarContrasenaComponent {
  email: string = '';
  constructor(private supabase: SupabaseService) { }

  async enviarCorreo() {
    if (!this.email.trim()) {
      alert('Por favor, ingresa tu correo.');
      return;
    }

    const { error } = await this.supabase.resetPassword(this.email.trim());

    if (error) {
      alert('❌ Error al enviar el correo: ' + error.message);
    } else {
      alert('📩 Te hemos enviado un enlace de recuperación a tu correo.');
    }


  }



}
