import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel, DynamicConfigModel, DynamicConfigField } from 'aurelia-deco';
import { arDialog, notify, errorify } from 'aurelia-resources';


@inject(Global)
export class AppModelModule {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;
  public modelId: string = '';
  public model:  DynamicConfigModel;
  public models: Array< DynamicConfigModel> = [];

  public newField: DynamicConfigField;
  public fields: Array<DynamicConfigField> = [];
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-model');
  }

  determineActivationStrategy(params) {
    if (params.appId !== this.appId) {
      return activationStrategy.replace;
    }    
  }

  activate(params) {
    this.global.scrollToTop();
    if (!params || !params.modelId) return false;
    if (!params.appId) return false;
    this.appId = params.appId;
    this.modelId = params.modelId;
    return this.getApp().then(() => {
      return this.getModel();
    }).then(() => {
      this.getModels();
    });
  }

  getApp() {
    return AppModel.getOneWithId(this.appId).then((element) => {
      if (!element) throw new Error('App not found');
      this.app = (element as AppModel);
    });
  }

  getModel() {
    if (!this.modelId) return Promise.resolve();
    return DynamicConfigModel.getOneWithId(this.modelId).then((element) => {
      this.model = (element as DynamicConfigModel);
      this.resolveFields();
    });
  }

  getModels() {
    if (!this.model) return;
    DynamicConfigModel.getAll(`?relatedToAppId=${this.model.relatedToAppId}`).then((elements) => {
      this.models = (elements as Array<DynamicConfigModel>);
    });
  }

  modelName(modelId: string) {
    for (let model of this.models) {
      if (model.id === modelId) return model.name;
    }
    return '';
  }

  resolveFields() {
    for (let field of this.model.fields) {
      if (!field.validation) field.validation = [];
      if (field.type === 'string') {
        if (field.validation && Array.isArray(field.validation)) {
          for (let validation of field.validation) {
            if (validation.type === 'slug') field.onlySlug = true;
          }
        }
        if (field.validation && Array.isArray(field.validation)) {
          for (let validation of field.validation) {
            if (validation.type === 'email') field.onlyEmail = true;
          }
        }
      }
    }
  }

  fixFields() {
    console.log('fixFields');
    for (let field of this.model.fields) {
      console.log('field', field.name, field.type);
      if (!field.validation) field.validation = [];
      if (field.type === 'any') {
        field.filterable = 'no';
        field.searchable = false;
        field.sortable = false;
        field.validation = [];
      } else if (field.type === 'string') {
        // remove slug validation and only add it if necessary
        let removeSlugIndex = -1;
        let slugIndex = 0;
        for (let validation of field.validation || []) {
          if (validation.type === 'slug') {
            removeSlugIndex = slugIndex;
            break;
          }
          slugIndex++;
        }
        if (removeSlugIndex !== -1 && !field.onlySlug) field.validation.splice(removeSlugIndex, 1);
        else if (field.onlySlug && removeSlugIndex === -1) {
          field.validation.push({type: 'slug', options: {}});
        }
        delete(field.onlySlug);

        let removeEmailIndex = -1;
        let emailIndex = 0;
        for (let validation of field.validation || []) {
          if (validation.type === 'email') {
            removeEmailIndex = emailIndex;
            break;
          }
          emailIndex++;
        }
        if (removeEmailIndex !== -1 && !field.onlyEmail) field.validation.splice(removeEmailIndex, 1);
        else if (field.onlyEmail && removeEmailIndex === -1) {
          field.validation.push({type: 'email', options: {}});
        }
        delete(field.onlyEmail);
        console.log('now field', field);
      } else if (field.type === 'array') {
        let subTypes = ['any', 'string', 'integer', 'float'];
        if (subTypes.indexOf(field.options.type) === -1) field.options.type = 'any';
      } else if (field.type === 'select') {
        if (!field.options) {
          field.options = {options: []};
        }
        if (!Array.isArray(field.options.options)) {
          field.options.options = [];
        }
      } else if (field.type === 'file' || field.type === 'files') {
        if (!field.options) {
          field.options = {options: []};
        }
        if (!Array.isArray(field.options.accepted)) {
          field.options.accepted = [];
        }
        if (!Array.isArray(field.options.previewsFormats)) {
          field.options.previewsFormats = [];
        }
      }
    }
  }

  addNewField() {
    let vm = arDialog({type: 'prompt', title: 'Field Name', content: 'This name will also be the property name of the field'}).whenClosed().then((result) => {
      if (result.dismissed) return;
      let field = new DynamicConfigField();
      field.name = result.value;
      field.type = 'any';
      this.model.fields.push(field);
      let index = this.model.fields.length - 1;
      return this.model.updateProperties('', ['fields']).then(() => {
        return this.getModel();
      }).then(() => {
        let field = this.model.fields[index];
        if (field.name === result.value) this.clickOnField(field);
      });
    }).catch(errorify);
  }

  clickOnField(field) {
    this.fixFields();
    let vm = arDialog({
      title: `Edit ${field.name}`, 
      type: 'edition',
      editionModel: {
        instance: field,
        properties: 'all',
        data: {
          models: this.models
        },
        viewPath: 'components/ad-dialog-field.html'
      },
      editionViewModelPath: 'aurelia-deco/deco/components/form/ad-dialog-model',
      editionCallback: () => {
        this.fixFields();
        return this.model.updateProperties('', ['fields']);
      }
    });
    vm.whenClosed().then((result) => {
      if (!result.dismissed) {
        notify(`Field ${field.name} has been updated`, {type: 'success', formatter: undefined});
      }
    }).catch(errorify);
  }

  modelRemoved(event) {
    this.global.navigateToRoute('app', {appId: this.app.id})
  }

  modelUpdated(event) {
    this.getModel();
  }

  updateOrdering() {
    return this.model.updateProperties('', ['fields']).then(() => {
      notify(`Fields order saved`, {type: 'success'});
    }).catch(errorify);
  }

  saveSettings(type: 'main' | 'access' | 'notification') {
    let fields: Array<string> = [];
    if (type === 'main') {
      fields = ['name', 'slug', 'label'];
    } else if (type === 'access') {
      fields = ['policy', 'isPublic', 'readingAccess', 'readingRoles', 'writingAccess', 'writingRoles'];
    } else if (type === 'notification') {
      fields = ['enableAdminNotification', 'enableUserNotification', 'notifyWhen',
        'notificationAdminEmail', 'notificationAdminSubject', 'notificationAdminContentPrefix', 'notificationAdminContentSuffix', 'notificationAdminTemplate',
        'notificationUserField', 'notificationUserSubject', 'notificationUserContentPrefix', 'notificationUserContentSuffix', 'notificationUserTemplate'];
    }
    this.model.updateProperties('', fields).then(() => {
      notify(`All changes saved`, {type: 'success'});
    }).catch(errorify);
  }

  deleteModel() {
    let vm = arDialog({
      title: `Remove '${this.model.name}' and delete all its data?`,
      content: 'Explanation of everything that is going to happen',
      type: 'confirmation'
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed && (result as any).agree) {
        this.model.remove().then(() => {
          arDialog({
            title: `The model '${this.model.name}' has been properly removed`
          });
          this.global.navigateToRoute('app', {appId: this.appId});
        }).catch(errorify);
      }
    });
  }
}


export class json2stringValueConverter {
  toView(value: any) {
    if (typeof value !== 'string') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {

      }
    }
    return value;
  }
}
