import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel } from 'aurelia-deco';

@inject(Global)
export class AppPolicies {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-policies');
  }

  determineActivationStrategy(params) {
    if (params.appId !== this.appId) {
      return activationStrategy.replace;
    }    
  }

  activate(params) {
    this.global.scrollToTop();
    if (params.appId) {
      this.appId = params.appId;
    }
    return this.getApp();
  }

  getApp() {
    return AppModel.getOneWithId(this.appId).then((element) => {
      if (!element) throw new Error('App not found');
      this.app = (element as AppModel);
    });
  }
}
