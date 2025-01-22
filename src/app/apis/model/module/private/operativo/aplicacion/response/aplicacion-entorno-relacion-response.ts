import { EntornoResponse } from "../../entorno/response/entorno-response";
import { AplicacionResponse } from "./aplicacion.response";

export class AplicacionEntornoRelacionResponse {
    codigo!: number;
    aplicacion!: AplicacionResponse;
    entorno!: EntornoResponse;
}