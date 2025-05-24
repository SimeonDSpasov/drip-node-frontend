import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { StorageService } from './../storage.service';

interface HttpOptions {
  headers?: HttpHeaders;
  observe: 'response';
  responseType?: any;
}

export interface CustomResponse<R> {
  status: number;
  data: R;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})

export class HttpService {
  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService) { }

  public get<R>(url: string, responseType?: string): Observable<CustomResponse<R>> {
    return this.httpClient.get(url, this.getOptions(responseType))
    .pipe(
      map((response: HttpResponse<any>) => {
        return this.handleSuccess<R>(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<R>(error);
      })
    )
  }

  public post<B, R>(url: string, body: B, responseType?: string): Observable<CustomResponse<R>> {
    return this.httpClient.post(url, body, this.getOptions(responseType))
    .pipe(
      map((response: HttpResponse<any>) => {
        return this.handleSuccess<R>(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<R>(error);
      })
    );
  }

  public delete<B, R>(url: string, body: B, responseType?: string): Observable<CustomResponse<R>> {
    return this.httpClient.delete(url, { ...this.getOptions(responseType), body: body })
    .pipe(
      map((response: HttpResponse<any>) => {
        return this.handleSuccess<R>(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError<R>(error);
      })
    );
  }

  private getOptions(responseType: string | undefined): HttpOptions {
    const options: HttpOptions = {
      observe: 'response',
      responseType: responseType ? responseType : 'json'
    };

    return options;
  }

  private handleSuccess<R>(response: HttpResponse<R>): CustomResponse<R> {
    this.handleTokens(response.headers);

    const customResponse: CustomResponse<R> = {
      status: response.status,
      data: response.body ? response.body : { } as R
    };

    return customResponse;
  }

  private handleTokens(headers: HttpHeaders): void {
    const accessToken = headers.get('Authorization-Access');
    const refreshToken = headers.get('Authorization-Refresh');

    if (accessToken && refreshToken) {
      this.storageService.setItem('accessToken', accessToken);
      this.storageService.setItem('refreshToken', refreshToken);
    }
  }

  private handleError<R>(error: HttpErrorResponse): Observable<CustomResponse<R>> {
    // Maintenance
    if (error.status === 503) {
      window.location.reload();
    }

    const customResponse: CustomResponse<R> = {
      status: error.status,
      data: { } as R,
      error: error.error ? error.error.message : 'No error message'
    };

    return of(customResponse);
  }

}