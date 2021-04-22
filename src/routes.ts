import {PLATFORM} from 'aurelia-pal';
import {RouteConfig} from 'aurelia-router';

export let routes: Array<RouteConfig> = [
  { route: ['', 'login'],       name: 'login',       moduleId: PLATFORM.moduleName('pages/login-page') },
  { route: 'account',       name: 'account',       moduleId: PLATFORM.moduleName('pages/account'), settings: {auth: true} },
  { route: 'profile',       name: 'profile',       moduleId: PLATFORM.moduleName('pages/account-profile'), settings: {auth: true} },
  { route: 'credentials',       name: 'credentials',       moduleId: PLATFORM.moduleName('pages/account-credentials'), settings: {auth: true} },
  { route: 'exemples',       name: 'exemple',       moduleId: PLATFORM.moduleName('pages/exemple') },

  { route: 'apps',       name: 'apps',       moduleId: PLATFORM.moduleName('pages/apps'), settings: {auth: true} },
  { route: 'apps/:appId',       name: 'app',       moduleId: PLATFORM.moduleName('pages/app'), settings: {auth: true} },
  { route: 'apps/:appId/settings',       name: 'app-settings',       moduleId: PLATFORM.moduleName('pages/app-settings'), settings: {auth: true} },
  { route: 'apps/:appId/models',       name: 'app-models',       moduleId: PLATFORM.moduleName('pages/app-models'), settings: {auth: true} },
  { route: 'apps/:appId/models/:modelId',       name: 'app-model',       moduleId: PLATFORM.moduleName('pages/app-model'), settings: {auth: true} },
  { route: 'apps/:appId/keys',       name: 'app-keys',       moduleId: PLATFORM.moduleName('pages/app-keys'), settings: {auth: true} },
  { route: 'apps/:appId/policies',       name: 'app-policies',       moduleId: PLATFORM.moduleName('pages/app-policies'), settings: {auth: true} },
  { route: 'apps/:appId/templates',       name: 'app-templates',       moduleId: PLATFORM.moduleName('pages/app-templates'), settings: {auth: true} },
  { route: 'apps/:appId/users',       name: 'app-users',       moduleId: PLATFORM.moduleName('pages/app-users'), settings: {auth: true} },
  { route: 'apps/:appId/push',       name: 'app-push',       moduleId: PLATFORM.moduleName('pages/app-push'), settings: {auth: true} },
  // { route: 'dico',       name: 'dico',       moduleId: PLATFORM.moduleName('aurelia-deco/components/dico/dico', 'dico'), settings: { auth: true } },
  { route: 'dico2',       name: 'dico2',       moduleId: PLATFORM.moduleName('aurelia-deco/components/dico2/dico', 'dico'), settings: { auth: true } },


];

export default routes;
