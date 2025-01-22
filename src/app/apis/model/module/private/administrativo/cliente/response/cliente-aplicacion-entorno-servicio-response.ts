import { ServicioResponse } from "../../../operativo/servicio/response/servicio-response";

export class ClienteAplicacionEntornoServicioResponse {
    serviciosVinculados!: ServicioResponse[];
    serviciosNoVinculados!: ServicioResponse[];
}