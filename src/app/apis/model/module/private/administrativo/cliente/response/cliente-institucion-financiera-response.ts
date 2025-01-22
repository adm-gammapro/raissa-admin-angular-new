import { InstitucionfinancieraResponse } from "../../../commons/response/institucion-financiera-response";

export class ClienteInstitucionFinancieraResponse {
    listBancosVinculados!: InstitucionfinancieraResponse[];
    listBancosNoVinculados!: InstitucionfinancieraResponse[];
}