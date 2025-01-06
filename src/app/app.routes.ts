import { Routes } from '@angular/router';
import { ContentWebComponent } from './modules/public/content-web/content-web.component';
import { ContentComponent } from './modules/private/layout/content/content.component';
import { AuthorizedComponent } from './config/authorized/authorized.component';
import { LogoutComponent } from './modules/private/layout/logout/logout.component';
import { EntornoComponent } from './modules/private/operativo/entorno/entorno.component';
import { FormEntornoComponent } from './modules/private/operativo/entorno/formulario-entorno/form-entorno.component';
import { AplicacionComponent } from './modules/private/operativo/aplicacion/aplicacion.component';
import { FormAplicacionComponent } from './modules/private/operativo/aplicacion/formulario-aplicacion/form-aplicacion.component';

export const routes: Routes = [
    { path: '', component: ContentWebComponent },
    { path: 'content-web', component: ContentWebComponent },
    { path: 'content', component: ContentComponent },
    { path: 'authorized', component: AuthorizedComponent },
    { path: 'logout', component: LogoutComponent},

    { path: 'entorno', component: EntornoComponent },
    { path: 'entorno/:pagina/:cantReg/:estadoSearch', component: EntornoComponent },
    { path: 'form-entorno', component: FormEntornoComponent },

    { path: 'aplicacion', component: AplicacionComponent },
    { path: 'aplicacion/:pagina/:cantReg/:estadoSearch', component: AplicacionComponent },
    { path: 'form-aplicacion', component: FormAplicacionComponent }
];
