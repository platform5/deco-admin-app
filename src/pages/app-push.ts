import { PushNotificationModel } from './../models/push.notification.model';
import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel, jsonify } from 'aurelia-deco';
import { arDialog, StringNumberMap } from 'aurelia-resources';

@inject(Global)
export class AppPush {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;

  private tags: StringNumberMap = {};
  
  private refreshTimeout;
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-push');
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

    this.refreshTimeout = setInterval(() => {
      this.getNotifications();
    }, 5000);

    return this.getApp().then(() => {
      this.global.swissdataApi.get(`/push/${this.appId}/player/nb`).then(jsonify).then((response) => {
        return this.global.swissdataApi.get(`/push/${this.appId}/player/tags`);
      }).then(jsonify).then((response) => {
        this.tags = response;
      });
    });
  }

  deactivate() {
    clearInterval(this.refreshTimeout);
  }

  getApp() {
    return AppModel.getOneWithId(this.appId).then((element) => {
      if (!element) throw new Error('App not found');
      this.app = (element as AppModel);
    }).then(() => {
      this.getNotifications();
    });
  }

  getNotifications() {
    this.log.debug('getNotifications', this.app);
    if (!this.app) return;
    PushNotificationModel.getAll('?sort=-_createdAt', {route: `/push/${this.appId}/notification`}).then((elements) => {
      this.log.debug('elements', elements);
    });
  }

  newNotification() {
    let notification = new PushNotificationModel;
    let vm = arDialog({
      title: `New Notification`, 
      type: 'edition',
      editionModel: {
        instance: notification,
        properties: ['title', 'message', 'sendAt'],
        viewPath: 'components/ad-dialog-notification.html',
        data: {
          tags: this.tags
        }
      },
      editionViewModelPath: 'aurelia-deco/deco/components/form/ad-dialog-model',
      editionCallback: () => {
        return notification.save('', {route: `/push/${this.appId}/notification`});
      }
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed) {
        this.getNotifications();
      }
    });
  }
}
