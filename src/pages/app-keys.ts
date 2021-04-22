import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel, jsonify } from 'aurelia-deco';
import { arDialog, errorify, notify } from 'aurelia-resources';

@inject(Global)
export class AppKeys {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-keys');
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

  revealKey(type: 'public' | 'private', index: number) {
    return this.global.swissdataApi.get(`/app/${this.app.id}/key/${type}/${index}`).then(jsonify).then((result) => {
      if (result.key) {
        if (type === 'public') this.app.publicKeys[index].key = result.key;
        if (type === 'private') this.app.privateKeys[index].key = result.key;
      }
    })
  }

  editKey(type: 'public' | 'private', key: any, index) {
    let vm = arDialog({
      title: `Edit Key ${key.name}`, 
      type: 'edition',
      editionModel: {
        instance: key,
        properties: 'all',
        viewPath: 'components/ad-dialog-app-key.html'
      },
      editionViewModelPath: 'aurelia-deco/components/form/ad-dialog-model',
      editionCallback: () => {
        let body = {
          name: key.name,
          active: key.active,
          expires: key.expires
        }
        return this.global.swissdataApi.put(`/app/${this.app.id}/key/${type}/${index}/${key.last4}`, body).then(jsonify).then((element) => {
          this.app = element;
        }).catch(errorify);
      }
    });
    vm.whenClosed().then((result) => {
      if (!result.dismissed) {
        notify(`Key ${key.name} has been updated`, {type: 'success'});
      }
    }).catch(errorify);
  }

  addNewKey() {
    let vm = arDialog({type: 'prompt', title: 'Create New Key', promptCompName: 'ar-dialog-prompt-create-key'});
    vm.whenClosed().then((result) => {
      if (!result.dismissed) {
        let type = result.value.type;
        let name = result.value.name;
        this.global.swissdataApi.post(`/app/${this.app.id}/key/${type}`, {name: name}).then(jsonify).then((element) => {
          this.app = (element as AppModel);
        }).catch(errorify);
      }
    });
  }

  removeKey(type: 'public' | 'private', key, index) {
    let vm = arDialog({type: 'confirmation', title: `Remove the ${key.name} key ?`});
    vm.whenClosed().then((result) => {
      if (result.agree) {
        this.global.swissdataApi.delete(`/app/${this.app.id}/key/${type}/${index}/${key.last4}`).then(jsonify).then((element) => {
          this.app = (element as AppModel);
        }).catch(errorify);
      }
    })
  }
}
