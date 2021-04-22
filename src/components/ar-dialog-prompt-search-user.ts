import { jsonify } from 'aurelia-deco';
import { inject, bindable, bindingMode } from 'aurelia-framework';
import { Global } from 'global';

export interface ValueType {
  type?: 'private' | 'public';
  name?: string;
}

@inject(Element, Global)
export class ArDialogPromptSearchUser {  
  @bindable value: string; // userId
  @bindable({defaultBindingMode: bindingMode.twoWay}) inviteUsers: Array<string> = [];
  @bindable currentlyInvitedUsers: Array<string> = [];
  
  private q: string;
  private users: Array<any> = [];

  constructor(private element: Element, private global: Global) {

  }

  search() {
    console.log('this.global', this.global);
    this.global.swissdataApi.get(`/search-user?q=${this.q}`).then(jsonify).then((users) => {
      console.log('users', users);
      this.users = users;
    });
  }
}
