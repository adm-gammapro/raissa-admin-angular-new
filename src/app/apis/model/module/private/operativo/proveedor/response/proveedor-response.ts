import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { InstitucionfinancieraResponse } from "../../../commons/response/institucion-financiera-response";

export class ProveedorResponse {
    codigo!: string;
    nombre!: string;
    referencia!: string;
    institucionFinanciera!: InstitucionfinancieraResponse;
    indicadorValorAdicional!: boolean;
    indicadorTokenizable!: boolean;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}