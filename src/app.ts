import { Global } from './global';
import { inject } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { ArDrawer, addNotifyContainerAlias, setNotifyDefaults } from 'aurelia-resources';
import routes from './routes';
import { AuthorizeStep } from 'aurelia-deco';
import { BaseApp } from 'base/base-app';
import * as FastClick from 'fastclick';
import * as environment from '../config/environment.json';

@inject(Global, Router)
export class App extends BaseApp {

  menuDrawer: ArDrawer;
  appName: string =  environment.appName;

  public toolbarTopOpened: boolean = false;

  constructor(private global: Global, private router: Router) {
    super();
    addNotifyContainerAlias('top', '.notify-top-host');
    addNotifyContainerAlias('bottom', '.notify-bottom-host');
    setNotifyDefaults({
      containerSelector: '.notify-top-host',
      formatter: (message, options) => {
        if (options.type === 'error' || options.type === 'info' || options.type === 'warning') {
          return this.global.i18n.tr(`${options.type}.${message}`);
        } else {
          return message;
        }
      }
    });
  }

  public attached() {
    (FastClick as any).attach(document.body);
  }

  public detached() {
  }

  public configureRouter(config: RouterConfiguration) {
    AuthorizeStep.redirectUnauthenticatedTo = 'login';
    if (!(window as any).cordova) config.options.pushState = true;
    config.addAuthorizeStep(AuthorizeStep);
    config.map(routes);
  }

}
 