import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, addDoc, collectionData } from "@angular/fire/firestore"
import { Observable } from 'rxjs';
import { getDocs, query, where } from 'firebase/firestore/lite';

interface usuario {
  email: string;
  password: string;
}


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  usuario: usuario = { email: '', password: '' };

  usuario$: Observable<any[]>;

  constructor(private router: Router, private auth: AuthService, private firestore: Firestore) {

    const usuariosReg = collection(this.firestore, 'usuarios');
    this.usuario$ = collectionData(usuariosReg, { idField: 'id' });

  }

  async iniciarSesion() {
    if (this.usuario.email.trim() && this.usuario.password.trim()) {
      const usuariosReg = collection(this.firestore, 'usuarios');
      const verificar = query(
        usuariosReg,
        where('email', '==', this.usuario.email),
        where('password', '==', this.usuario.password)
      );
      try {
        const consulta = await getDocs(verificar);

        if (!consulta.empty) {
          alert('Inicio de sesión exitoso!');
          console.log('Usuario autenticado:', this.usuario, "navegando a inicio");
          this.router.navigate(['/inicio']);
        } else {
          alert('Correo o contraseña incorrectos.');
        }
      } catch (error) {
        console.error('Error al consultar usuarios:', error);
        alert('Ocurrió un error al verificar las credenciales.');
      }
    }
  }

  autenticarConGoogle() {
    this.auth.autenticarConGoogle()
      .then(() => {
        alert('Inicio de sesión exitoso!');
        this.router.navigate(['/inicio']);
      })
      .catch(error => {
        alert('Error al iniciar sesión: ' + error.message);
      });
  }

}
