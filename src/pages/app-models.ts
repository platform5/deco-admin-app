import {inject, observable} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel,  DynamicConfigModel } from 'aurelia-deco';
import { arDialog } from 'aurelia-resources';

@inject(Global)
export class AppModels {    

  private log: Logger;
  @observable public appId: string = '';
  public app: AppModel;
  public apps: Array<AppModel> = [];
  public models: Array< DynamicConfigModel> = [];
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-models');
  }

  determineActivationStrategy(params) {
    if (params.appId !== this.appId) {
      return activationStrategy.replace;
    }    
  }

  activate(params) {
    this.global.scrollToTop();
    this.log.debug('activate');
    this.getApps().then(() => {
      this.log.debug('apps', this.apps);
      if (params.appId) {
        this.log.debug('appId', this.appId, params.appId);
        this.appId = params.appId;
      }
    });
  }

  getApps() {
    return AppModel.getAll().then((elements) => {
      this.apps = (elements as Array<AppModel>);
    });
  }

  getModels() {
    this.log.debug('getModels', this.app);
    if (!this.app) return;
    DynamicConfigModel.getAll(`?relatedToAppId=${this.app.id}&sort=name`).then((elements) => {
      this.log.debug('elements', elements);
      this.models = (elements as Array<DynamicConfigModel>);
    });
  }

  appIdChanged() {
    //this.log.debug('appId changed');
    if (this.appId) {
      let found = false;
      for (let app of this.apps) {
        if (app.id === this.appId) {
          this.app = app;
          this.getModels();
          found = true;
        }
      }
      if (!found) {
        this.appId = '';
        this.app = null;
      }
    }
  }

  createNewModel() {
    let newModel = new DynamicConfigModel;
    newModel.relatedToAppId = this.appId;
    let vm = arDialog({
      title: `Create a New Model`, 
      type: 'edition',
      editionModel: {
        instance: newModel,
        properties: ['name', 'slug']/*,
        viewPath: 'components/ad-dialog-model.html'*/
      },
      editionViewModelPath: 'aurelia-deco/deco/components/form/ad-dialog-model',
      editionCallback: () => {
        return newModel.save('');
      }
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed) {
        this.getModels();
      }
    });
  }
}
