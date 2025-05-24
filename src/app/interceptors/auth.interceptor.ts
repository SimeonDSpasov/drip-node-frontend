import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpHandlerFn, HttpClient, HttpRequest, HttpResponse, HttpErrorResponse, HttpEvent, HttpHeaders } from '@angular/common/http';

import { Observable, switchMap, catchError, throwError } from 'rxjs';

import { UserService } from './../services/user.service';
import { StorageService } from './../services/storage.service';

import { env } from './../environments/environment';

let httpClient!: HttpClient;
let userService!: UserService;
let storageService!: StorageService;

let isRefresh!: boolean;
let isUserLogged!: boolean;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  httpClient = inject(HttpClient);
  userService = inject(UserService);
  storageService = inject(StorageService);

  isRefresh = false;
  isUserLogged = userService.isUserLogged();

  if (isUserLogged) {
    const clonedRequest = request.clone({
      setHeaders: {
        'Authorization-Access': storageService.getItem('accessToken')!,
      },
    });

    return next(clonedRequest)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 498 && !isRefresh) {
            return requestNewAccessToken(next, request);
          }
            
          handleServerAndUnauthorizedError(error);

          isRefresh = false;

          return throwError(() => error);
        })
      );
  }

  return next(request);
};

function requestNewAccessToken(next: HttpHandlerFn, request: HttpRequest<any>): Observable<HttpEvent<any>> {
  isRefresh = true;

  const refreshToken = storageService.getItem('refreshToken');
  const url = env.apiUrl + env.endpoints.auth.refreshAccessToken;
  const options = {
    headers: new HttpHeaders({ 'Authorization-Refresh': refreshToken ? refreshToken : '' }),
    observe: 'response' as 'response',
    responseType: 'json' as 'json',
  };

  return httpClient.get(url, options)
    .pipe(
      switchMap((res: HttpResponse<any>) => {
        const accessToken = res.headers.get('Authorization-Access')!;
    
        storageService.setItem('accessToken', accessToken);

        return next(request.clone({
          setHeaders: {
            'Authorization-Access': accessToken,
          },
        }));
      })
    );
}

function handleServerAndUnauthorizedError(error: HttpErrorResponse): void {
  // Unauthorized
  if (error.status === 401) {
    userService.logout();
  }

  // Server Error
  const isServerError = error.status.toString().match('^5') !== null;
  if (isServerError) {
    // userService.logout();
  }
}
