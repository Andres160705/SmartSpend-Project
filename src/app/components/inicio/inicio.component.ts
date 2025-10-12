import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

  constructor(private supabase: SupabaseService) { }

  mostrarFormulario = false;

  nuevaMeta = {
    nombre: '',
    objetivo: 0,
    ingreso: 0
  };


  nuevoEgreso = {
    nombre: '',
    fecha : "",
    ingreso: 0
  };


  metas: any[] = [];
  egresos: any[] = [];
  imagenSeleccionada: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
      this.imagenSeleccionada = file;
    } else {
      alert('Solo se permiten imágenes menores a 5MB.');
    }
  }



  async ngOnInit() {
    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData?.user?.id) {
      console.error('Usuario no autenticado o error al obtener datos:', userError?.message);
      return;
    }

    const usuarioId = userData.user.id;
    const { data, error } = await this.supabase.getMetas(usuarioId);

    if (error) {
      console.error('Error al cargar metas:', error.message);
      return;
    }

    this.metas = data ?? [];
    this.metas.forEach(meta => {
      console.log('Tipo:', typeof meta.imagen_url, 'URL:', meta.imagen_url);
    });

  }

  // Agregar Nueva Meta

  async agregarMeta() {
    this.mostrarFormulario = false;

    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData?.user?.id) {
      alert('Usuario no autenticado');
      return;
    }

    const usuarioId = userData.user.id;

    if (
      this.nuevaMeta.nombre.trim().length === 0 ||
      this.nuevaMeta.objetivo <= 0 ||
      this.nuevaMeta.ingreso < 0
    ) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    let imagenUrl = '';
    if (this.imagenSeleccionada) {
      const nombreArchivo = `${usuarioId}-${Date.now()}-${this.imagenSeleccionada.name}`;
      const { url, error } = await this.supabase.subirImagen(nombreArchivo, this.imagenSeleccionada);

      if (error) {
        alert('Error al subir la imagen');
        console.error('Detalles del error:', error);
      } else {
        imagenUrl = url ?? '';
      }
    }

    const nuevaMeta = {
      usuario_id: usuarioId,
      nombre: this.nuevaMeta.nombre,
      objetivo: this.nuevaMeta.objetivo,
      ingreso: this.nuevaMeta.ingreso,
      imagen_url: imagenUrl,
      creada_en: new Date()
    };

    const { data, error } = await this.supabase.insertMeta(nuevaMeta);

    if (error) {
      alert('Error al guardar la meta');
      console.error(error);
    } else if (data && data.length > 0) {
      this.metas.push(data[0]);
      this.nuevaMeta = { nombre: '', objetivo: 0, ingreso: 0 };
      this.imagenSeleccionada = null;
    }
  }


  async editarMeta(meta: any) {
    if (meta.ingreso >= meta.objetivo) {
      alert(` La meta "${meta.nombre}" ya está completa. No puedes agregar más dinero.`);
      return;
    }

    const nuevoMonto = prompt(`¿Cuánto deseas agregar a "${meta.nombre}"?`);
    if (nuevoMonto !== null) {
      const monto = parseFloat(nuevoMonto);
      if (isNaN(monto) || monto <= 0) {
        alert(' Monto inválido. Intenta nuevamente.');
        return;
      }

      const ingresoTotal = meta.ingreso + monto;
      if (ingresoTotal > meta.objetivo) {
        alert(` El monto excede el objetivo. Solo puedes agregar hasta $${meta.objetivo - meta.ingreso}.`);
        return;
      }

      meta.ingreso = ingresoTotal;
      await this.supabase.actualizarIngreso(meta.id, meta.ingreso);

      if (meta.ingreso === meta.objetivo) {
        alert(`¡Meta "${meta.nombre}" completada con éxito!`);
      }
    }
  }


  async sumarIngreso(meta: any) {
    const monto = parseFloat(meta.montoNuevo);

    if (!isNaN(monto) && monto > 0) {
      if (meta.ingreso >= meta.objetivo) {
        alert(`La meta "${meta.nombre}" ya está completa. No puedes agregar más dinero.`);
        return;
      }

      const nuevoTotal = meta.ingreso + monto;

      if (nuevoTotal > meta.objetivo) {
        alert(`El monto excede el objetivo. Solo puedes agregar hasta $${meta.objetivo - meta.ingreso}.`);
        return;
      }

      meta.ingreso = nuevoTotal;
      meta.montoNuevo = 0;
      meta.mostrarIngreso = false;

      await this.supabase.actualizarIngreso(meta.id, meta.ingreso);

      if (meta.ingreso === meta.objetivo) {
        alert(` ¡Meta "${meta.nombre}" completada con éxito!`);
      }
    } else {
      alert(' Monto inválido.');
    }
  }

  async eliminarMeta(meta: any) {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar la meta "${meta.nombre}"?`);
    if (!confirmacion) return;

    const { error } = await this.supabase.eliminarMeta(meta.id);
    if (error) {
      alert('❌ Error al eliminar la meta');
      console.error(error);
    } else {
      this.metas = this.metas.filter(m => m.id !== meta.id);
      alert(`Meta "${meta.nombre}" eliminada correctamente`);
    }
  }


  // Fin de Agregar Nueva Meta


  // Agregar Egreso

  async agregarEgreso() {
    this.mostrarFormulario = false;

    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData?.user?.id) {
      alert('Usuario no autenticado');
      return;
    }

    const usuarioId = userData.user.id;

    if (
      this.nuevoEgreso.nombre.trim().length === 0 ||
      this.nuevoEgreso.fecha.trim().length === 0 ||
      this.nuevoEgreso.ingreso < 0
    ) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const nuevoEgreso = {
      usuario_id: usuarioId,
      nombre: this.nuevoEgreso.nombre,
      objetivo: this.nuevoEgreso.fecha,
      ingreso: this.nuevoEgreso.ingreso,
      creada_en: new Date()
    };

    const { data, error } = await this.supabase.insertMeta(nuevoEgreso);

    if (error) {
      alert('Error al guardar la meta');
      console.error(error);
    } else if (data && data.length > 0) {
      this.metas.push(data[0]);
      this.nuevoEgreso = { nombre: '', fecha: '', ingreso: 0 };
    }
  }

}
