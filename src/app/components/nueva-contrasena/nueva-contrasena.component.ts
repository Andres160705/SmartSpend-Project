import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nueva-contrasena',
  imports: [FormsModule, CommonModule],
  templateUrl: './nueva-contrasena.component.html',
  styleUrl: './nueva-contrasena.component.css'
})
export class NuevaContrasenaComponent {
 nuevaPassword: string = '';
  confirmacion: string = '';
  mensaje: string = '';

  constructor(private supabase: SupabaseService, private router: Router) {}
async actualizarPassword() {
  if (!this.nuevaPassword.trim() || !this.confirmacion.trim()) {
    alert('Por favor, completa ambos campos.');
    return;
  }

  if (this.nuevaPassword !== this.confirmacion) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  const { error } = await this.supabase.updatePassword(this.nuevaPassword);

  if (error) {
    alert(' Error al actualizar la contraseña: ' + error.message);
  } else {
    alert(' Contraseña actualizada con éxito. Redirigiendo...');
    setTimeout(() => this.router.navigate(['/login']), 2000);
  }
}


}