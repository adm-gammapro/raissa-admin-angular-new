import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { TipoDocumentoResponse } from "../../../commons/response/tipo-documento-response";

export class UsuarioResponse {
    id!: number;
    username!: string;
    nombres!: string;
    apePaterno!: string;
    apeMaterno!: string;
    password!: string;
    fechaCambioClave!: string;
    indicadorExpiracion!: string;
    fechaExpiracionClave!: string;
    correo!: string;
    telefono!: string;
    tipoDocumento!: TipoDocumentoResponse;
    numeroDocumento!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}