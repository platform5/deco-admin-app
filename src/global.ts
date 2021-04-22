import { inject } from 'aurelia-framework';
import { AppState, initAppState, initialState, setFullState } from 'state';
import { SwissdataGlobal, ProfileHelper } from 'aurelia-deco';
import { Store } from 'aurelia-store';
import settings from 'settings';
import { DomHelpers } from 'aurelia-resources';

@inject(Store)
export class Global extends SwissdataGlobal {

  public ready = false;
  public scrollingContainer: HTMLElement;

  constructor(public store: Store<AppState>) {
    super();
    //let store = Container.instance.get(Store);
    this.store.registerAction('initAppState', initAppState);
    this.store.registerAction('setFullState', setFullState);
    this.bootstrap({
      stateStorageKey: settings.stateStorageKey,
      language: 'fr',
      languages: ['fr', 'en'],
      country: 'CH',
      countries: ['CH'],
      dynamicModelSlugsForAutoLoading: [],
      initialState: initialState,
      stateVersion: settings.stateVersion
    }).then(() => {
      this.ready = true;
    });
  }

  public async logout() {
    console.log('settings.defaultRoutes.unauthenticated', settings.defaultRoutes.unauthenticated);
    await this.swissdataApi.logout();
    this.navigateToRoute(settings.defaultRoutes.unauthenticated);
  }

  public registerActions() {
    super.registerActions();
    ProfileHelper.registerActions();
  }

  public scrollToTop(animate: boolean = false, duration: number = 250) {
    if (!this.scrollingContainer) {
      this.findScrollingContainer();
    }
    if (animate = false) duration = 1;
    DomHelpers.scrollToTop(this.scrollingContainer, animate, duration);
  }

  public findScrollingContainer() {
    let routerView = (document.querySelector('ROUTER-VIEW') as HTMLElement);
    this.scrollingContainer = this.getClosestParentScrollingContainer(routerView);
  }

  public getClosestParentScrollingContainer(element: HTMLElement) {
    let currentElement = element;
    let found = false;
    let counter = 0;
    do {
      currentElement = currentElement.parentElement;

      let overflowY: string;
      if (window.getComputedStyle) {
        let style = window.getComputedStyle(currentElement, null);
        overflowY = style.overflowY;
      } else if ((currentElement as any).currentStyle) {
        overflowY = (currentElement as any).currentStyle.overflowY;
      }

      if (overflowY === 'scroll') found = true;
      else if (overflowY === 'auto') found = true;
      else if (currentElement.tagName === 'BODY') found = true;
      counter++;
    } while (found === false && currentElement.parentElement && counter < 1000);
    if (found) return currentElement;
    else return null;
  }

  //
  // Possible methods to overwrite
  // * start() - called before anything else in the bootstrap method
  // * beforeEnsuringAuthentication()
  // * afterEnsuringAuthentication()
  // * onAnyLoad() - by default: if config.useDynamicModels is true => 
  //    => load the dynamic models settings and 
  //    => autload dynamic data from dynamicModelSlugsForAutoLoading
  // * onAuthenticatedLoad() - calls onAnyLoad by default
  // * onUnauthenticatedLoad - calls onAnyLoad by default
  // * onLogin() - calls onAuthenticatedLoad by default
  // * onLogout()
  // * registerActions() - make sure to call super.registerActions() inside
  // 

}

