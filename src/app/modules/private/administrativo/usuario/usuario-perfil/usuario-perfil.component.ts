import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PRIME_NG_MODULES } from '../../../../../config/primeNg/primeng-global-imports';
import { PerfilResponse } from '../../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import { MessagesService } from '../../../../../service/commons/messages.service';
import { UsuarioService } from '../../../../../service/modules/private/administrativo/usuario/usuario.service';
import { UsuarioPerfilRequest } from '../../../../../apis/model/module/private/administrativo/usuario/request/usuario-perfil-request';

@Component({
  selector: 'app-usuario-perfil',
  imports: [FormsModule,
      ReactiveFormsModule,
      CommonModule,
      ...PRIME_NG_MODULES],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './usuario-perfil.component.html',
  styleUrl: './usuario-perfil.component.scss'
})
export class UsuarioPerfilComponent {
  codigoUsuario!: number;
  perfilesNoAsignados!: PerfilResponse[];
  perfilesAsignados!: PerfilResponse[];
  @Output() cerrarModal = new EventEmitter<void>();

  constructor(private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
        private readonly messagesService: MessagesService
  ) {}

  cargarModelo(codigoUsuario: number) {
    this.codigoUsuario = codigoUsuario;
    this.cargarPerfiles(codigoUsuario);
    this.cdr.markForCheck();
  }

  cargarPerfiles(codigoUsuario: number): void {
    this.usuarioService.getUsuarioPerfiles(codigoUsuario).subscribe(response => {
      this.perfilesAsignados = response.perfilesAsignados;
      this.perfilesNoAsignados = response.perfilesNoAsignados;
    });
  }

  guardarListas() {
    let usuarioPerfilVincular: UsuarioPerfilRequest = new UsuarioPerfilRequest();
    let usuarioPerfilDesvincular: UsuarioPerfilRequest = new UsuarioPerfilRequest();

    let diferentesA;
    let diferentesB;

    let perfilesNoAsignados!: PerfilResponse[];
    let perfilesAsignados!: PerfilResponse[];

    this.usuarioService.getUsuarioPerfiles(this.codigoUsuario).subscribe(response => {
      perfilesAsignados = response.perfilesAsignados;
      diferentesA = this.perfilesAsignados.filter(itemA => !perfilesAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesA.length > 0) {
        const idsAsignados: number[] = diferentesA.map(perfil => perfil.codigo);

        usuarioPerfilVincular.codigoPerfil = idsAsignados;
        usuarioPerfilVincular.codigoUsuario = [this.codigoUsuario];

        this.usuarioService.vincularPerfil(usuarioPerfilVincular).subscribe();
      }

      perfilesNoAsignados = response.perfilesNoAsignados;
      diferentesB = this.perfilesNoAsignados.filter(itemA => !perfilesNoAsignados.some(itemB => itemB.codigo === itemA.codigo));
      if (diferentesB.length > 0) {
        const idsNoAsignados: number[] = diferentesB.map(perfil => perfil.codigo);

        usuarioPerfilDesvincular.codigoPerfil = idsNoAsignados;
        usuarioPerfilDesvincular.codigoUsuario = [this.codigoUsuario];

        this.usuarioService.desVincularPerfil(usuarioPerfilDesvincular).subscribe();
      }
    });

    this.cerrar();

    this.messagesService.setMessage('Registro guardado satisfactoriamente.');
  }

  cerrar(): void {
    this.cerrarModal.emit(); // Emitir un evento para cerrar el modal
  }
}
