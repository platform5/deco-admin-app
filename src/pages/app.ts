import { arDialog } from 'aurelia-resources';
import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { errorify } from 'aurelia-resources';
import { Model, AppModel } from 'aurelia-deco';

@inject(Global)
export class App {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;
  
  constructor(private global: Global) {
    this.log = getLogger('page:app');
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

  propertyLabel(instance: Model, property: string) {
    if (instance.deco.propertyForms[property]) {
      for (let propertyForm of instance.deco.propertyForms[property]) {
        if (propertyForm.type === 'label') return propertyForm.options.text;
      }
    }
    return property;
  }

  propertyHint(instance: Model, property: string) {
    if (instance.deco.propertyForms[property]) {
      for (let propertyForm of instance.deco.propertyForms[property]) {
        if (propertyForm.type === 'hint') return propertyForm.options.text;
      }
    }
    return '';
  }

  deleteApp(app) {
    let vm = arDialog({
      title: `Remove '${this.app.name}' and delete all its data?`,
      content: 'Explanation of everything that is going to happen',
      type: 'confirmation'
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed && (result as any).agree) {
        this.app.remove().then(() => {
          arDialog({
            title: `The app '${this.app.name}' has been properly removed`
          });
          this.global.navigateToRoute('apps');
        }).catch(errorify);
      }
    });
  }
}
