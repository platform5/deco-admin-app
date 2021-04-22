import { arDialog } from 'aurelia-resources';
import { inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { AppModel, adDialogModel, Model } from 'aurelia-deco';

@inject(Global)
export class Apps {    

  private log: Logger;
  public apps: Array<AppModel> = [];
  
  constructor(private global: Global) {
    this.log = getLogger('page:apps');
  }

  activate() {
    this.global.scrollToTop();
    this.getApps();
  }

  getApps() {
    AppModel.getAll().then((apps) => {
      this.apps = (apps as Array<AppModel>);
    });
  }

  createNewApp() {
    let newApp = new AppModel;
    let vm = adDialogModel(newApp as unknown as Model, {
      title: `Create a New App`
    }, ['name']);
    vm.whenClosed().then((result) => {
      if (!(result as any).dismissed) {
        arDialog({
          title: `The app '${newApp.name}' has been properly created`, 
          content: 'You can manage the settings, add models and start to use your new API'
        });
        this.getApps();
      }
    });
  }

}
