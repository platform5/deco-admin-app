import { inject, bindable } from 'aurelia-framework';

export interface ValueType {
  type?: 'private' | 'public';
  name?: string;
}

@inject(Element)
export class ArDialogPromptCreateKey {  
  @bindable value: ValueType = {
    type: 'private',
    name: ''
  };

  bind() {
    this.valueChanged();
  }

  valueChanged() {
    if (typeof this.value !== 'object') {
      this.value = {};
    }
    if (!this.value.type) this.value.type = 'private';
    if (typeof this.value.name !== 'string') this.value.name = '';
  }
}
