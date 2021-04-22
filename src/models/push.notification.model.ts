import { model, Model, type } from 'aurelia-deco';

@model('/push/notification')
export class PushNotificationModel extends Model {

  @type.string
  public title: string;

  @type.string
  public message: string;
  
  @type.string
  public collapseKey: string;

  @type.boolean
  public contentAvailable: false;

  @type.integer
  public badge: false;

  @type.string({textarea: true})
  public custom: string;

  @type.date
  public sendAt: Date;

  @type.array({type: 'string'})
  public sendToTags: Array<string> = [];
  
}
