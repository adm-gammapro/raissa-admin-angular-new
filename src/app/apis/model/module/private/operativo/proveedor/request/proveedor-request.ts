import { InstitucionfinancieraResponse } from "../../../commons/response/institucion-financiera-response";

export class ProveedorRequest {
    codigo!: string;
    nombre!: string;
    referencia!: string;
    codigoInstitucionFinanciera!: InstitucionfinancieraResponse;
    indicadorValorAdicional!: boolean;
    indicadorTokenizable!: boolean;
}