import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel } from 'aurelia-deco';
import { LDAPServerModel } from './../models/ldap-server';
import { arDialog, errorify } from 'aurelia-resources';
import { ArDialogPromptOption } from 'aurelia-resources/dist/commonjs/elements/ar-dialog-prompt';

@inject(Global)
export class AppLdapServers {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;
  public servers: Array<LDAPServerModel> = [];
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-ldap-servers');
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
    return this.getApp().then(() => {
      return this.getServers();
    });
  }

  getApp() {
    return AppModel.getOneWithId(this.appId).then((element) => {
      if (!element) throw new Error('App not found');
      this.app = (element as AppModel);
      this.log.debug('this.app', this.app);
    });
  }

  getServers() {
    this.log.debug('getServers', this.app);
    if (!this.app) return;
    LDAPServerModel.getAll(`?sort=key`, {route: `/ldap/${this.app.id}`}).then((elements) => {
      this.log.debug('elements', elements);
      this.servers = elements
    });
  }

  createNewServer() {
    let newServer = new LDAPServerModel;
    let vm = arDialog({
      title: `Create a New Server`, 
      type: 'edition',
      editionModel: {
        instance: newServer,
        properties: ['name', 'url', 'dc', 'secret'],
        /*viewPath: 'components/ad-dialog-model.html'*/
      },
      editionViewModelPath: 'aurelia-deco/deco/components/form/ad-dialog-model',
      editionCallback: () => {
        return newServer.save(``, {route: `/ldap/${this.app.id}`});
      }
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed) {
        this.getServers();
      }
    }).catch(errorify);
  }

  editServer(server: LDAPServerModel) {
    let vm = arDialog({
      title: `Edit Server`, 
      type: 'edition',
      editionModel: {
        instance: server,
        properties: ['name', 'url', 'dc', 'secret'],
        /*,
        viewPath: 'components/ad-dialog-model.html'*/
      },
      editionViewModelPath: 'aurelia-deco/deco/components/form/ad-dialog-model',
      editionCallback: () => {
        const properties: string[] = ['name', 'url', 'dc'];
        if (server.secret) {
          properties.push('secret');
        }
        return server.updateProperties(``, properties, {route: `/ldap/${this.app.id}/${server.id}`});
      }
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed) {
        this.getServers();
      }
    }).catch(errorify);
  }

  deleteServer() {

    let options: Array<ArDialogPromptOption> = [];
    for (let server of this.servers) {
      options.push({
        value: server.id,
        label: server.name
      });
    }

    let vm = arDialog({
      type: 'prompt',
      title: 'Select a server',
      content: 'When you confirm, the selected server will be removed from the database. The operation cannot be undone',
      promptOptions: options
    });
    vm.whenClosed().then((result) => {
      if (result.value) {
        let server = new LDAPServerModel;
        server.id = result.value;
        return server.remove('', {route: `/ldap/${this.app.id}/${server.id}`}).then(() => {
          this.getServers();
        });
      }
    }).catch(errorify);
  }
}
