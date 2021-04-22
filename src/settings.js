var settings = {
  title: 'deco-api-app',
  description: 'An API tools for your data',
  keywords: "Deco API app",
  author: "Platform5",
  stateVersion: '2.0',
  stateLog: {
    dispatchedActions: 'debug',
    performanceLog: 'debug',
    devToolsStatus: 'debug'
  },
  language: 'fr',
  languages: ['fr', 'en', 'de', 'it'],
  country: 'CH',
  countries: ['CH'],
  stateStorageKey: 'sd2-state',
  defaultRoutes: {
    unauthenticated: 'login',
    authenticated: 'apps'
  },
  ux: {
    design: {
      primary: '#ad1457',
      primaryForeground: '#fff',
      accent: '#6a1b9a',
      accentForeground: '#fff',

      primaryLight: '#e35183',
      primaryLightForeground: '#333',
      primaryDark: '#78002e',
      primaryDarkForeground: '#fff',

      accentLight: '#9c4dcc',
      accentLightForeground: '#fff',
      accentDark: '#38006b',
      accentDarkForeground: '#fff',

      appBackground: '#F2F2F2',
      appForeground: '#000',

      surfaceBackground: '#FFFFFF',
      surfaceForeground: '212121',

      disabledBackground: '#EFEFEF',
      disabledForeground: '#BBBBBB',
      error: '#F44336',
      errorForeground: '#FFFFFF'

    }
  }
};

// auto detection of locale
if (typeof window !== `undefined`) {
  var userLang = navigator.language || navigator.userLanguage; 
  var userLang = navigator.language || navigator.userLanguage; 
  for (var index in settings.languages) {
    var language = settings.languages[index];
    if (userLang.substr(0, 2) === language) {
      settings.language = language;
      break;
    }  
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.settings = settings;
exports.default = settings;


