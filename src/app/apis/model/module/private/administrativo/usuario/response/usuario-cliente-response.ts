import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { ClienteResponse } from "../../cliente/response/cliente-response";
import { PerfilResponse } from "../../perfil/response/perfil-response";
import { UsuarioResponse } from "./usuario-response";

export class UsuarioClienteResponse {
    codigo!: number;
    usuario!: UsuarioResponse;
    cliente!: ClienteResponse;
    perfil!: PerfilResponse;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}