import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, lastValueFrom } from 'rxjs';

import { CustomResponse } from './requests/http.service';
import { RequestsExchangeRateService } from './requests/requests.exchange-rate.service';
import { PlatformService } from './platform.service';

interface ExchangeRateResponse {
  rate: number;
}


@Injectable({
  providedIn: 'root'
})

export class RateService {
  private rateSubject = new BehaviorSubject<number | null>(null);
  private readonly CACHE_TIME = 1000 * 60 * 5; // 5 minutes cache

  constructor(private requestsExchangeRateService: RequestsExchangeRateService, private platformService: PlatformService) {
    if (this.platformService.isServer()) {return;}
    // Initial fetch
    this.fetchRate();

    // Set up periodic refresh
    timer(this.CACHE_TIME, this.CACHE_TIME).subscribe(() => {
      this.fetchRate();
    });
  }

  private async fetchRate() {
    const request = this.requestsExchangeRateService.getRate()
    const response = await lastValueFrom(request) as CustomResponse<ExchangeRateResponse>;

    switch (response.status) {
        case 200:
            this.rateSubject.next(response.data.rate);
            break;
        default:
            break;
    }
  }

  public getRate(): number | null {
    return this.rateSubject.value;
  }

  public getRateObservable() {
    return this.rateSubject.asObservable();
  }
} 