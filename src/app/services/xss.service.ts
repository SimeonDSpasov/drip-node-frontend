import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class XSSService {

  public clean(data: any): any {
    if (typeof data === 'string') {
      return this.replace(data);
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        data[key] = this.replace(value);
      }
    }

    return data;
  }

  private replace(data: string): string {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/=/g, '&equals;')
      .replace(/"/g, '&quot;')
      .replace(/`/g, '&grave;');
  }

}
