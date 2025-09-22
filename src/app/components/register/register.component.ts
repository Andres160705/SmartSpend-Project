import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, addDoc, collectionData } from "@angular/fire/firestore"
import { Observable } from 'rxjs';

//Crear la interfaz del usuario
interface usuario {
  nombre: string
  apellido: string
  email: string
  edad: number | null
  password: string
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {

  //Lista en la cual se guardaran los datos del usuario
  usuario: usuario = { nombre: "", apellido: "", email: "", edad: null, password: "" }
  usuarios$: Observable<any[]>

  constructor(private router: Router, private auth: AuthService, private firestore: Firestore) {

    const usuariosReg = collection(this.firestore, "usuarios")
    this.usuarios$ = collectionData(usuariosReg, { idField: "id" })

  }

  async agregarUsuario() {
    console.log("Usuario a registrar:", this.usuario)
    if (this.usuario.nombre.trim() && this.usuario.apellido.trim() && this.usuario.email.trim() && this.usuario.edad && this.usuario.password.trim()) {
      const usuariosReg = collection(this.firestore, "usuarios")

      await addDoc(usuariosReg, this.usuario)

      this.usuario = { nombre: "", apellido: "", email: "", edad: null, password: "" }
      alert("Usuario registrado con éxito!")

      this.router.navigate(["/inicio"])
    } else {
      alert("Por favor, complete todos los campos.")
    }
  }

  //Método para autenticar con Google
  autenticarConGoogle() {
    this.auth
      .autenticarConGoogle()
      .then((result) => {
        // Si la autenticación fue exitosa
        alert("Usuario registrado con éxito!")
        this.router.navigate(["/inicio"])
      })
      .catch((error) => {
        // Si ocurrió un error durante la autenticación
        alert("Error al registrar el usuario: " + error.message)
      })
  }

  irLogin() {
    this.router.navigate(['/login']);
  }


}
