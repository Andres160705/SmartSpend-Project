import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-verificar-correo',
  templateUrl: './verificar-correo.component.html',
  styleUrls: ['./verificar-correo.component.css']
})
export class VerificaCorreoComponent implements OnInit {
  email: string = '';
  password: string = '';
  mensaje: string = 'Esperando confirmación de correo...';

  constructor(private router: Router, private supabase: SupabaseService) {}

  ngOnInit() {
    // Recupera email y password desde localStorage
    this.email = localStorage.getItem('pendingEmail') || '';
    this.password = localStorage.getItem('pendingPassword') || '';

    if (!this.email || !this.password) {
      this.mensaje = 'No se encontraron credenciales pendientes.';
      return;
    }

    this.verificarCorreoCada(5000); // cada 5 segundos
  }

  verificarCorreoCada(ms: number) {
    const intervalo = setInterval(async () => {
      const { data: user, error } = await this.supabase.getUser();

      if (error) {
        console.error('Error al obtener usuario:', error.message);
        return;
      }

      if (user && ('email_confirmed_at' in user) && user.email_confirmed_at) {
        const { error: loginError } = await this.supabase.signIn(this.email, this.password);

        if (!loginError) {
          clearInterval(intervalo);
          localStorage.removeItem('pendingEmail');
          localStorage.removeItem('pendingPassword');
          this.router.navigate(['/inicio']);
        } else {
          console.error('Error al iniciar sesión:', loginError.message);
        }
      }
    }, ms);
  }
}