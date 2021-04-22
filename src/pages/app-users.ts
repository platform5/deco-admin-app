import { adDialogModel, jsonify, Model, AppModel, UserModel } from 'aurelia-deco';
import { arDialog } from 'aurelia-resources';
import {inject, observable} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { errorify } from 'aurelia-resources';

@inject(Global)
export class AppUsers {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;

  public users: Array<UserModel> = [];
  public newUser: UserModel;
  public showNewUser: boolean = false;

  @observable private mode: 'swissdata' | 'internal' = 'internal';


  constructor(private global: Global) {
    this.log = getLogger('page:app-users');
  }

  determineActivationStrategy(params) {
    if (params.appId !== this.appId) {
      return activationStrategy.replace;
    }
    if (params.mode !== this.mode) {
      return activationStrategy.replace;
    }
  }

  activate(params) {
    this.global.scrollToTop();
    if (params.mode) {
      this.mode = params.mode;
    }
    if (params.appId) {
      this.appId = params.appId;
    }
    return this.getApp().then(() => {
      return this.getUsers();
    });
  }

  modeChanged() {
    if (!this.appId) return;
    this.getUsers();
  }

  getApp() {
    return AppModel.getOneWithId(this.appId).then((element) => {
      if (!element) throw new Error('App not found');
      this.app = (element as AppModel);
    });
  }

  getUsers() {
    if (this.mode === 'internal') {
      UserModel.request('get', `/app/${this.app.id}/user`).then((elements) => {
        for (let element of elements) {
          if (!(element as any).roles || !Array.isArray((element as any).roles)) {
            element.set('roles', []);
          }
        }
        this.users = (elements as Array<UserModel>);
      });
    } else {
      UserModel.request('get', `/app/${this.app.id}/parent-user`).then((elements) => {
        for (let element of elements) {
          if (!(element as any).roles || !Array.isArray((element as any).roles)) {
            element.set('roles', []);
          }
        }
        this.users = (elements as Array<UserModel>);
      });
    }
  }

  editInternalUserX(user: UserModel) {
    let vm = adDialogModel(user as unknown as Model, {
      title: `Edit ${user._label}`, 
      editionViewPath: 'components/ad-dialog-user.html', 
      data: {app:this.app}
    }, ['requireDoubleAuth', 'roles']);
  }

  editInternalUser(user: UserModel) {
    let vm = arDialog({
      title: `Edit ${user._label}`, 
      type: 'edition', 
      editionModel: {
        instance: user as unknown as Model,
        properties: ['requireDoubleAuth', 'roles'],
        viewPath: 'components/ad-dialog-user.html',
        data: {app: this.app}
      },
      editionViewModelPath: 'aurelia-deco/components/form/ad-dialog-model', 
      editionCallback: () => {
        return this.global.swissdataApi.put(`/app/${this.app.id}/user/${user.id}`, {
          requireDoubleAuth: user.requireDoubleAuth,
          roles: user.roles
        }).then(jsonify).then((updatedUser) => {
          user.requireDoubleAuth = (updatedUser as any).requireDoubleAuth;
          user.roles = (updatedUser as any).roles;
        }).catch(errorify);
      }
    });
    vm.whenClosed().then((result) => {
      console.log('result', result);
    });
  }

  editSwissdataUser(user: UserModel) {
    let vm = arDialog({
      title: `Edit ${user._label}`, 
      type: 'edition', 
      editionModel: {
        instance: user as unknown as Model,
        properties: ['roles'],
        viewPath: 'components/ar-dialog-swissdata-user.html'
      },
      editionViewModelPath: 'aurelia-deco/components/form/ad-dialog-model', 
      editionCallback: () => {
        return this.global.swissdataApi.put(`/app/${this.app.id}/parent-user/${user.id}`, {roles: user.roles}).then(jsonify).then((updatedUser) => {
          user.roles = (updatedUser as any).roles;
        }).catch(errorify);
      }
    });
    vm.whenClosed().then((result) => {
      console.log('result', result);
    });
  }

  removeSwissdataUser(user: UserModel) {
    let vm = arDialog({
      type: 'confirmation',
      title: `Remove ${user.firstname} ${user.lastname} ?`,
      content: 'This will remove access to managing this application from Swissdata'
    });
    vm.whenClosed().then((result) => {
      if (result.agree) {
        this.global.swissdataApi.delete(`/app/${this.app.id}/user/${user.id}`).then(jsonify).then(() => {
          this.getUsers();
        }).catch(errorify);
      }
    })
  }

  inviteUsers: Array<string> = [];
  currentlyInvitedUsers: Array<string> = [];
  inviteUser() {
    //arDialog({title: 'Not yet available', content: 'Sorry, this feature is currently under development.'});
    this.inviteUsers = [];
    this.currentlyInvitedUsers = [];
    for (let user of this.users) {
      this.currentlyInvitedUsers.push(user.id);
    }
    let vm = arDialog({
      type: 'edition', 
      title: 'Invite New User',
      slotHTML: '<ar-dialog-prompt-search-user currently-invited-users.bind="currentlyInvitedUsers" invite-users.bind="inviteUsers"></ar-dialog-prompt-search-user>',
      bindingContext: this,
      editionCallback: () => {
        let promises: Array<Promise<any>> = [];
        for (let userId of this.inviteUsers) {
          promises.push(this.global.swissdataApi.post(`/app/${this.app.id}/user/${userId}`).then(jsonify).then((element) => {
            console.log('element', element);
          }));
        }
        return Promise.all(promises);
      }
    });
    vm.whenClosed().then((result) => {
      if (!result.dismissed) {
        this.getUsers();
      }
    }).catch(errorify);
  }

  test() {
    console.log('click');
  }

}

export class filterSearchValueConverter {
  toView(items: Array<UserModel>, search: string) {
    if (!search) return items;
    if (!Array.isArray(items)) return items;
    let value: Array<UserModel> = [];
    let q = search.toLowerCase();
    for (let item of items) {
      if (item._label.toLowerCase().indexOf(q) !== -1) {
        value.push(item);
        continue;
      }
      if (item.email.toLowerCase().indexOf(q) !== -1) {
        value.push(item);
        continue;
      }
      if (item.mobile.toLowerCase().indexOf(q) !== -1) {
        value.push(item);
        continue;
      }
    }
    return value;
  }
}
