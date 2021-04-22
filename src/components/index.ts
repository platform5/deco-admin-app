import {FrameworkConfiguration} from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./ad-dialog-app-key.html'),
    PLATFORM.moduleName('./ad-dialog-field.html'),
    PLATFORM.moduleName('./ad-dialog-notification.html'),
    PLATFORM.moduleName('./ad-dialog-user.html'),
    PLATFORM.moduleName('./ar-dialog-prompt-create-key'),
    PLATFORM.moduleName('./ar-dialog-prompt-search-user'),
    PLATFORM.moduleName('./ar-dialog-swissdata-user.html'),
    PLATFORM.moduleName('./login'),
    PLATFORM.moduleName('./menu')
  ]);
}
