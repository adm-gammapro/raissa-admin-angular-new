import { ProveedorResponse } from "../../../operativo/proveedor/response/proveedor-response";

export class ClienteProveedorResponse {
    proveedoresVinculados!: ProveedorResponse[];
    proveedoresNoVinculados!: ProveedorResponse[];
}