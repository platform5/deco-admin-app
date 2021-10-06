import {inject} from 'aurelia-framework';
import { Global } from 'global';
import { getLogger, Logger } from 'aurelia-logging';
import { notify } from 'aurelia-resources';
import * as moment from 'moment';

@inject(Global)
export class Exemple {    

  private log: Logger;
  private src = 'images/welcome.jpg';

  private selectMultiple: boolean = false;
  private selectValue: string | Array<string> = '';

  private rangeValue = 50;
  private rangeValue1 = 300;
  private rangeValue2 = 7000;

  private date1 = moment('04-02-1992', 'DD-MM-YYYY').toDate();
  private date2 = moment('06-05-1998', 'DD-MM-YYYY').toDate();
  private date3 = moment('12-08-2010', 'DD-MM-YYYY').toDate();
  
  constructor(private global: Global) {
    this.log = getLogger('page:exemple');
  }

  notify(type: 'normal' | 'danger' | 'primary' | 'warning' | 'info' = 'normal') {
    if (type === 'normal') {
      notify('Have a great day', {formatter: undefined});
    } else if (type === 'danger') {
      notify('Be careful with this operation', {type: 'danger', formatter: undefined});
    } else if (type === 'info') {
      notify('Input must be an integer', {type: 'info', formatter: undefined});
    } else if (type === 'primary') {
      notify('Important notice', {type: 'primary', formatter: undefined});
    } else if (type === 'warning') {
      notify('This was dangerous !', {type: 'warning', formatter: undefined});
    }
  }

  setSelectType(type: 'multiple' | 'single' = 'single') {
    if (type === 'multiple') {
      this.selectValue = [];
      this.selectMultiple = true;
    } else {
      this.selectValue = '';
      this.selectMultiple = false;
    }
  }
}
