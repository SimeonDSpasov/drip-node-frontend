import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { tap, finalize, share, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class IpiImgService {

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) { }

  private svgs = new Map<string, SVGElement>();
  private svgsLoading = new Map<string, Observable<SVGElement>>();

  public defaultSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m 4 1 c -1.644531 0 -3 1.355469 -3 3 v 1 h 1 v -1 c 0 -1.109375 0.890625 -2 2 -2 h 1 v -1 z m 2 0 v 1 h 4 v -1 z m 5 0 v 1 h 1 c 1.109375 0 2 0.890625 2 2 v 1 h 1 v -1 c 0 -1.644531 -1.355469 -3 -3 -3 z m -5 4 c -0.550781 0 -1 0.449219 -1 1 s 0.449219 1 1 1 s 1 -0.449219 1 -1 s -0.449219 -1 -1 -1 z m -5 1 v 4 h 1 v -4 z m 13 0 v 4 h 1 v -4 z m -4.5 2 l -2 2 l -1.5 -1 l -2 2 v 0.5 c 0 0.5 0.5 0.5 0.5 0.5 h 7 s 0.472656 -0.035156 0.5 -0.5 v -1 z m -8.5 3 v 1 c 0 1.644531 1.355469 3 3 3 h 1 v -1 h -1 c -1.109375 0 -2 -0.890625 -2 -2 v -1 z m 13 0 v 1 c 0 1.109375 -0.890625 2 -2 2 h -1 v 1 h 1 c 1.644531 0 3 -1.355469 3 -3 v -1 z m -8 3 v 1 h 4 v -1 z m 0 0" fill="#2e3434" fill-opacity="0.34902"/></svg>'; 

  public loadImg(url: string): Observable<SVGElement> | string {
    if (!url.endsWith('.svg')) {
      return url;
    }

    if (this.svgs.has(url)) {
      return of(this.svgs.get(url) as SVGElement);
    }

    if (this.svgsLoading.has(url)) {
      return this.svgsLoading.get(url) as Observable<SVGElement>;
    }

    const observable = this.getSvg(url)
      .pipe(
        catchError(() => { return of(this.defaultSvg); }),
        map(content => this.createSVG(content)),
        tap(element => this.svgs.set(url, element as SVGElement)),
        finalize(() => this.svgsLoading.delete(url)),
        share()
      );

    this.svgsLoading.set(url, observable);

    return observable;
  }

  private getSvg(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }

  private createSVG(content: string): SVGElement {
      const div = this.document.createElement('DIV');

      div.innerHTML = content;

      return div.querySelector('svg') as SVGElement;
  }

}
