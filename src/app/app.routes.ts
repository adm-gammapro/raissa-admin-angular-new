import { Routes } from '@angular/router';
import { ContentWebComponent } from './modules/public/content-web/content-web.component';
import { ContentComponent } from './modules/private/layout/content/content.component';
import { AuthorizedComponent } from './config/authorized/authorized.component';
import { LogoutComponent } from './modules/private/layout/logout/logout.component';
import { EntornoComponent } from './modules/private/operativo/entorno/entorno.component';
import { FormEntornoComponent } from './modules/private/operativo/entorno/formulario-entorno/form-entorno.component';
import { AplicacionComponent } from './modules/private/operativo/aplicacion/aplicacion.component';
import { FormAplicacionComponent } from './modules/private/operativo/aplicacion/formulario-aplicacion/form-aplicacion.component';
import { ModuloComponent } from './modules/private/administrativo/modulo/modulo.component';
import { FormModuloComponent } from './modules/private/administrativo/modulo/formulario-modulo/form-modulo.component';
import { ProveedorComponent } from './modules/private/operativo/proveedor/proveedor.component';
import { FormProveedorComponent } from './modules/private/operativo/proveedor/formulario-proveedor/form-proveedor.component';
import { OpcionComponent } from './modules/private/administrativo/opcion/opcion.component';
import { FormOpcionComponent } from './modules/private/administrativo/opcion/formulario-opcion/form-opcion.component';
import { UsuarioComponent } from './modules/private/administrativo/usuario/usuario.component';
import { FormUsuarioComponent } from './modules/private/administrativo/usuario/formulario-usuario/form-usuario.component';
import { ClienteComponent } from './modules/private/administrativo/cliente/cliente.component';
import { FormClienteComponent } from './modules/private/administrativo/cliente/formulario-cliente/form-cliente.component';
import { ServicioAplicacionComponent } from './modules/private/operativo/servicio/servicio-aplicacion/servicio-aplicacion.component';
import { FormServicioAplicacionComponent } from './modules/private/operativo/servicio/servicio-aplicacion/formulario-servicio-aplicacion/form-servicio-aplicacion.component';
import { PerfilComponent } from './modules/private/administrativo/perfil/perfil.component';
import { FormPerfilComponent } from './modules/private/administrativo/perfil/formulario-perfil/form-perfil.component';
import { ClienteAplicacionEntornoComponent } from './modules/private/administrativo/cliente/cliente-aplicacion-entorno/cliente-aplicacion-entorno.component';
import { FormClienteAplicacionEntornoComponent } from './modules/private/administrativo/cliente/cliente-aplicacion-entorno/formulario-cliente-aplicacion-entorno/form-cliente-aplicacion-entorno.component';
import { UsuarioClienteComponent } from './modules/private/administrativo/usuario/usuario-cliente/usuario-cliente.component';
import { FormUsuarioClienteComponent } from './modules/private/administrativo/usuario/usuario-cliente/formulario-usuario-cliente/form-usuario-cliente.component';

export const routes: Routes = [
    { path: '', component: ContentComponent },
    { path: 'content-web', component: ContentWebComponent },
    { path: 'content', component: ContentComponent },
    { path: 'authorized', component: AuthorizedComponent },
    { path: 'logout', component: LogoutComponent},

    { path: 'entorno', component: EntornoComponent },
    { path: 'entorno/:pagina/:cantReg/:estadoSearch', component: EntornoComponent },
    { path: 'form-entorno', component: FormEntornoComponent },

    { path: 'aplicacion', component: AplicacionComponent },
    { path: 'aplicacion/:pagina/:cantReg/:estadoSearch', component: AplicacionComponent },
    { path: 'form-aplicacion', component: FormAplicacionComponent },

    { path: 'modulo', component: ModuloComponent },
    { path: 'modulo/:pagina/:cantReg/:estadoSearch/:nombreModuloSearch', component: ModuloComponent },
    { path: 'form-modulo', component: FormModuloComponent },

    { path: 'perfil', component: PerfilComponent },
    { path: 'perfil/:pagina/:cantReg/:estadoSearch/:nombrePerfilSearch', component: PerfilComponent },
    { path: 'form-perfil', component: FormPerfilComponent },

    { path: 'opcion', component: OpcionComponent },
    { path: 'opcion/:pagina/:cantReg/:estadoSearch/:descripcionOpcionSearch', component: OpcionComponent },
    { path: 'form-opcion', component: FormOpcionComponent },

    { path: 'proveedor', component: ProveedorComponent },
    { path: 'proveedor/:pagina/:cantReg/:estadoSearch/:nombreSearch/:entidadFinancieraSearch', component: ProveedorComponent },
    { path: 'form-proveedor', component: FormProveedorComponent },

    { path: 'usuario', component: UsuarioComponent },
    { path: 'usuario/:pagina/:cantReg/:estadoSearch/:usernameSearch', component: UsuarioComponent },
    { path: 'form-usuario', component: FormUsuarioComponent },
    { path: 'usuario-cliente/:codigoUsuario', component: UsuarioClienteComponent },
    { path: 'form-usuario-cliente', component: FormUsuarioClienteComponent },

    { path: 'cliente', component: ClienteComponent },
    { path: 'cliente/:pagina/:cantReg/:estadoSearch/:razonSocialSearch', component: ClienteComponent },
    { path: 'form-cliente', component: FormClienteComponent },

    { path: 'servicio', component: ServicioAplicacionComponent },
    { path: 'servicio/:pagina/:cantReg/:estadoSearch', component: ServicioAplicacionComponent },
    { path: 'form-servicio', component: FormServicioAplicacionComponent },

    { path: 'cliente-aplicacion-entorno/:codigoCliente', component: ClienteAplicacionEntornoComponent },
    { path: 'form-cliente-aplicacion-entorno', component: FormClienteAplicacionEntornoComponent }
];
