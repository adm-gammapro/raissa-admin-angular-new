import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { ClienteResponse } from "./cliente-response";

export class ClienteDatasourceResponse {
    codigo!: number;
    codigoDataSource!: string;
    cliente!: ClienteResponse;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}