import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import {NgChartsModule} from 'ng2-charts';


@Component({
  selector: 'app-inicio',
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

  constructor(private supabase: SupabaseService) { }

  mostrarFormulario = false;
  mostrarFormularioEgresos = false;

  nuevaMeta = {
    nombre: '',
    objetivo: 0,
    ingreso: 0
  };


  nuevoEgreso = {
    nombre: '',
    fechaInicio: "",
    fechaFin: "",
    ingreso: 0,
    objetivos: 0
  };

  historial: {
    tipo: 'Meta' | 'Egreso';
    nombre: string;
    monto: number;
    objetivo: number;
    fecha: Date;
  }[] = [];

  mostrarHistorial: boolean = false;

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
    this.cargarMetas();
    this.cargarEgresos();

  }

  async cargarMetas() {
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

  async cargarEgresos() {
    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData?.user?.id) {
      console.error('Usuario no autenticado o error al obtener datos:', userError?.message);
      return;
    }

    const usuarioId = userData.user.id;
    const { data, error } = await this.supabase.getEgresos(usuarioId);

    if (error) {
      console.error('Error al cargar egresos:', error.message);
      return;
    }

    this.egresos = data ?? [];
  }

  async logout() {
    await this.supabase.logout();
    // Redirige al login o recarga para limpiar el estado
    window.location.href = '/login'; // o usa router.navigate(['/login'])
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

  //------------------------------------------------------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------------------------------------------------------//
  // Agregar Egreso

  async agregarEgreso() {
    this.mostrarFormularioEgresos = false;

    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData?.user?.id) {
      alert('Usuario no autenticado');
      return;
    }

    const usuarioId = userData.user.id;

    if (
      this.nuevoEgreso.nombre.trim().length === 0 ||
      this.nuevoEgreso.fechaInicio.trim().length === 0 ||
      this.nuevoEgreso.fechaFin.trim().length === 0 ||
      this.nuevoEgreso.ingreso < 0 ||
      this.nuevoEgreso.objetivos < 0
    ) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const hoy = new Date();
    const fechaInicio = new Date(this.nuevoEgreso.fechaInicio + 'T00:00:00');
    const fechaFin = new Date(this.nuevoEgreso.fechaFin + 'T00:00:00');

    // Normaliza hoy para comparar solo fecha
    hoy.setHours(0, 0, 0, 0);

    // Validaciones
    if (fechaInicio < hoy) {
      alert('La fecha de inicio no puede ser anterior al día actual.');
      return;
    }

    if (fechaFin <= fechaInicio) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }


    const nuevoEgreso = {
      usuario_id: usuarioId,
      nombre: this.nuevoEgreso.nombre,
      fecha_inicio: this.nuevoEgreso.fechaInicio,
      fecha_fin: this.nuevoEgreso.fechaFin,
      ingreso: this.nuevoEgreso.ingreso,
      objetivos: this.nuevoEgreso.objetivos,
      creada_en: new Date()
    };

    const { data, error } = await this.supabase.insertEgreso(nuevoEgreso);

    if (error) {
      alert('Error al guardar el egreso');
      console.error(error);
    } else if (data && data.length > 0) {
      this.egresos.push(data[0]);
      this.nuevoEgreso = { nombre: '', fechaInicio: '', fechaFin: '', ingreso: 0, objetivos: 0 };
    }
  }

  async editarEgreso(egreso: any) {
    if (egreso.ingreso >= egreso.objetivos) {
      alert(` La Meta de ahorro "${egreso.nombre}" ya está completa. No puedes agregar más dinero.`);
      return;
    }

    const nuevoMonto = prompt(`¿Cuánto deseas agregar a "${egreso.nombre}"?`);
    if (nuevoMonto !== null) {
      const monto = parseFloat(nuevoMonto);
      if (isNaN(monto) || monto <= 0) {
        alert(' Monto inválido. Intenta nuevamente.');
        return;
      }

      const ingresoTotal = egreso.ingreso + monto;
      if (ingresoTotal > egreso.objetivos) {
        alert(` El monto excede el objetivo. Solo puedes agregar hasta $${egreso.objetivos - egreso.ingreso}.`);
        return;
      }

      egreso.ingreso = ingresoTotal;
      await this.supabase.actualizarIngreso(egreso.id, egreso.ingreso);

      if (egreso.ingreso === egreso.objetivos) {
        alert(`¡Meta "${egreso.nombre}" completada con éxito!`);
      }
    }
  }

  async sumarIngresoEgreso(egreso: any) {
    const monto = parseFloat(egreso.montoNuevo);

    if (!isNaN(monto) && monto > 0) {
      if (egreso.ingreso >= egreso.objetivos) {
        alert(`La meta "${egreso.nombre}" ya está completa. No puedes agregar más dinero.`);
        return;
      }

      const nuevoTotal = egreso.ingreso + monto;

      if (nuevoTotal > egreso.objetivos) {
        alert(`El monto excede el objetivo. Solo puedes agregar hasta $${egreso.objetivos - egreso.ingreso}.`);
        return;
      }

      egreso.ingreso = nuevoTotal;
      egreso.montoNuevo = 0;
      egreso.mostrarIngreso = false;

      await this.supabase.actualizarIngreso(egreso.id, egreso.ingreso);

      if (egreso.ingreso === egreso.objetivos) {
        alert(` ¡Meta "${egreso.nombre}" completada con éxito!`);
      }
    } else {
      alert(' Monto inválido.');
    }
  }

  async eliminarEgreso(egreso: any) {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el egreso "${egreso.nombre}"?`);
    if (!confirmacion) return;

    const { error } = await this.supabase.eliminarEgreso(egreso.id);
    if (error) {
      alert('❌ Error al eliminar el egreso');
      console.error(error);
    } else {
      this.egresos = this.egresos.filter(e => e.id !== egreso.id);
      alert(`Egreso "${egreso.nombre}" eliminado correctamente`);
    }
  }
  // Fin Egresos


  //------------------------------------------------------------------------------------------------------------------------------//

  // Comienzo Historial
  async verHistorial() {
    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData?.user?.id) {
      alert('Usuario no autenticado');
      return;
    }

    const usuarioId = userData.user.id;

    // 🔽 AQUÍ VA TU BLOQUE
    const [metasRes, egresosRes] = await Promise.all([
      this.supabase.getMetas(usuarioId),
      this.supabase.getEgresos(usuarioId)
    ]);

    const metas = metasRes.data?.map(meta => ({
      tipo: 'Meta' as const,
      nombre: meta.nombre,
      monto: meta.ingreso,
      objetivo: meta.objetivo,
      fecha: new Date(meta.creada_en)
    })) ?? [];

    const egresos = egresosRes.data?.map(egreso => ({
      tipo: 'Egreso' as const,
      nombre: egreso.nombre,
      monto: egreso.ingreso,
      objetivo: egreso.objetivos,
      fecha: new Date(egreso.creada_en)
    })) ?? [];

    this.historial = [...metas, ...egresos].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    this.mostrarHistorial = true;
  }

  cerrarHistorial() {
    this.mostrarHistorial = false;
  }

toggleDetalle(item: any) {
  item.mostrarDetalle = !item.mostrarDetalle;
}




}
