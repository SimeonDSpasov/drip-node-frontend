import { Injectable } from '@angular/core';

export enum Theme {
    First,
    Second,
    Third
}

@Injectable({
  providedIn: 'root',
})

export class ThemeService {

  private currentTheme = Theme.First;

  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

}
