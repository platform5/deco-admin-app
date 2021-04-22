import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { activationStrategy } from 'aurelia-router';
import { AppModel } from 'aurelia-deco';
import { TemplateModel } from 'models/template.model';
import { arDialog, errorify } from 'aurelia-resources';
import { ArDialogPromptOption } from 'aurelia-resources/dist/commonjs/elements/ar-dialog-prompt';

@inject(Global)
export class AppTemplates {    

  private log: Logger;
  public appId: string = '';
  public app: AppModel;
  public templates: Array<TemplateModel> = [];

  public contentLocale: string;
  public refLocale: string;
  
  constructor(private global: Global) {
    this.log = getLogger('page:app-templates');
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
      return this.getTemplates();
    });
  }

  getApp() {
    return AppModel.getOneWithId(this.appId).then((element) => {
      if (!element) throw new Error('App not found');
      this.app = (element as AppModel);
      if (this.app.locales && this.app.locales.length) {
        this.contentLocale = this.app.locales[0];
        this.refLocale = '';
      } else {
        this.contentLocale = '';
        this.refLocale = '';
      }
      this.log.debug('this.app', this.app);
    });
  }

  setContentLocale(locale) {
    if (locale === this.refLocale) this.setRefLocale('');
    if (this.contentLocale !== locale) {
      this.contentLocale = locale;
      return this.getTemplates();
    }
  }

  setRefLocale(locale) {
    if (locale === this.contentLocale) locale = '';
    if (this.refLocale !== locale) {
      this.refLocale = locale;
      return this.getTemplates();
    }
  }

  getTemplates() {
    this.log.debug('getTemplates', this.app);
    if (!this.app) return;
    TemplateModel.getAll(`?locale=${this.contentLocale}&reflocale=${this.refLocale}&sort=key`, {route: `/template/${this.app.id}`}).then((elements) => {
      this.log.debug('elements', elements);
      this.templates = elements
    });
  }

  createNewTemplate() {
    let newTemplate = new TemplateModel;
    let vm = arDialog({
      title: `Create a New Template`, 
      type: 'edition',
      editionModel: {
        instance: newTemplate,
        properties: ['key', 'subject', 'html', 'text', 'sms'],
        displayRefLocale: (this.refLocale !== ''),
        refLocale: this.refLocale/*,
        viewPath: 'components/ad-dialog-model.html'*/
      },
      editionViewModelPath: 'aurelia-deco/components/form/ad-dialog-model',
      editionCallback: () => {
        return newTemplate.save(`?locale=${this.contentLocale}`, {route: `/template/${this.app.id}`});
      }
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed) {
        this.getTemplates();
      }
    }).catch(errorify);
  }

  editTemplate(template: TemplateModel) {


    let vm = arDialog({
      title: `Edit Template`, 
      type: 'edition',
      editionModel: {
        instance: template,
        properties: ['key', 'subject', 'html', 'text', 'sms'],
        displayRefLocale: (this.refLocale !== ''),
        refLocale: this.refLocale/*,
        viewPath: 'components/ad-dialog-model.html'*/
      },
      editionViewModelPath: 'aurelia-deco/components/form/ad-dialog-model',
      editionCallback: () => {
        return template.updateProperties(`?locale=${this.contentLocale}`, ['key', 'subject', 'html', 'text', 'sms'], {route: `/template/${this.app.id}/${template.id}`});
      }
    });
    vm.whenClosed().then((result) => {
      if (!(result as any).dissmissed) {
        this.getTemplates();
      }
    }).catch(errorify);
  }

  deleteTemplate() {

    let options: Array<ArDialogPromptOption> = [];
    for (let template of this.templates) {
      options.push({
        value: template.id,
        label: template.key
      });
    }

    let vm = arDialog({
      type: 'prompt',
      title: 'Select a template',
      content: 'When you confirm, the selected template will be removed from the database. The operation cannot be undone',
      promptOptions: options
    });
    vm.whenClosed().then((result) => {
      if (result.value) {
        let template = new TemplateModel;
        template.id = result.value;
        return template.remove('', {route: `/template/${this.app.id}/${template.id}`}).then(() => {
          this.getTemplates();
        });
      }
    }).catch(errorify);
  }
}
