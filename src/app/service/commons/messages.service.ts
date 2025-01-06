import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private _message: string | null = null;

  setMessage(message: string): void {
    this._message = message;
  }

  getMessage(): string | null {
    const message = this._message;
    this._message = null; // Limpia el mensaje después de obtenerlo
    return message;
  }
}
