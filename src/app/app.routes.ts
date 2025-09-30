import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerificaCorreoComponent } from './components/verificar-correo/verificar-correo.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: RegisterComponent },
  { path: 'verifica-correo', component: VerificaCorreoComponent }
];
