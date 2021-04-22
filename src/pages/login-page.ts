import { inject } from 'aurelia-framework'
import { Global } from 'global';
import { Redirect } from 'aurelia-router';
import settings from 'settings';

console.log('settings', settings);
console.log('settings.defaultRoutes.authenticated', settings.defaultRoutes.authenticated);

@inject(Global)
export class LoginPage {

  public routeNext: string = settings.defaultRoutes.authenticated;

  constructor(private global: Global) {
    
  }

  public canActivate(params) {
    if (params?.t) {
      this.routeNext = params.t;
    } else {
      this.routeNext = settings.defaultRoutes.authenticated;
    }
    if (this.global.state.swissdata.authenticated) {
      return new Redirect(this.routeNext);
    }
  }

  public activate(params: any) {
    if (params?.t) {
      this.routeNext = params.t;
    } else {
      this.routeNext = settings.defaultRoutes.authenticated;
    }

  }

}
