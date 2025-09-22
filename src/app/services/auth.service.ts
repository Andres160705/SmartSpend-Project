import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private router: Router) {}

  // Autenticación con Google
  autenticarConGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then((result) => {
        console.log('Logueado con Google', result);
      })
      .catch((error) => {
        console.error('Error al loguear con Google', error);
      });
  }

  // Cerrar sesión
  async logout() {
    await signOut(this.auth);
    console.log('Sesión cerrada');
  }

  // Estado del usuario
  estadoUsuario(): Observable<any> {
    return authState(this.auth);
  }
}