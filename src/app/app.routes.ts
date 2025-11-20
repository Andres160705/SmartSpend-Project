import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerificaCorreoComponent } from './components/verificar-correo/verificar-correo.component';
import { ActualizarContrasenaComponent } from './components/actualizar-contrasena/actualizar-contrasena.component';
import { NuevaContrasenaComponent } from './components/nueva-contrasena/nueva-contrasena.component';
import { VerificadoComponent } from './components/verificado/verificado.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: RegisterComponent },
  { path: 'verifica-correo', component: VerificaCorreoComponent },
  { path: 'actualizar-contrasena', component: ActualizarContrasenaComponent },
  { path: 'nueva-contrasena', component: NuevaContrasenaComponent },
  { path: 'verificado', component: VerificadoComponent },
  {path: 'register',component:RegisterComponent}
];
