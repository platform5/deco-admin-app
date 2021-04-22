import { AppModel, Model } from 'aurelia-deco';
import { inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { errorify, notify } from 'aurelia-resources';

@inject(Global)
export class AppSettings {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;

  public mainSettingsOpened: boolean = true;
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-settings');
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
      if (!Array.isArray(element.locales)) {
        element.locales = [];
      }
      if (!Array.isArray(element.availableRoles)) {
        element.availableRoles = [];
      }
      if (!Array.isArray(element.adminShopRoles)) {
        element.adminShopRoles = [];
      }
      if (!Array.isArray(element.adminUserRoles)) {
        element.adminUserRoles = [];
      }
      if (!Array.isArray(element.adminThreeRoles)) {
        element.adminThreeRoles = [];
      }
      this.app = (element as AppModel);
      if (!Array.isArray(this.app.adminThreeRoles)) {
        this.app.adminThreeRoles = [];
      }
    });
  }

  saveSettings(type: 'main' | 'colors' | 'language' | 'registration' | 'roles' | 'smtp' | 'push') {
    let fields: Array<string> = [];
    if (type === 'main') {
      fields = ['name', 'description', 'image'];
    } else if (type === 'colors') {
      fields = [
                'primaryColor', 'primaryForegroundColor',
                'primaryLightColor', 'primaryLightForegroundColor',
                'primaryDarkColor', 'primaryDarkForegroundColor',
                'accentColor', 'accentForegroundColor',
                'accentLightColor', 'accentLightForegroundColor',
                'accentDarkColor', 'accentDarkForegroundColor'
              ];
    } else if (type === 'language') {
      fields = ['defaultLocale', 'locales'];
    } else if (type === 'registration') {
      fields = ['openUserRegistration', 'createAccountValidation', 'requireDoubleAuth', 'doubleAuthMethod'];
    } else if (type === 'roles') {
      fields = ['availableRoles', 'adminUserRoles', 'enableShop', 'enableMultipleShops', 'adminShopRoles', 'enableThree', 'adminThreeRoles'];
    } else if (type === 'smtp') {
      fields = ['smtpConfigHost', 'smtpConfigPort', 'smtpConfigUser', 'smtpConfigPassword', 'smtpConfigSecure', 'smtpConfigFromName', 'smtpConfigFromEmail'];
    } else if (type === 'push') {
      fields = ['pushEnabled', 'pushGmId', 'pushApnCert', 'pushApnKey', 'pushApnPass', 'pushApnProduction', 'pushTopic'];
    }
    this.app.updateProperties('', fields).then(() => {
      notify('All changes saved', {type: 'success'});
    }).catch(errorify);
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
}
