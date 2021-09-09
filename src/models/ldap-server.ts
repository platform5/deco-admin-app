import { model, Model, type, io, validate, AppModel } from 'aurelia-deco';

@model('/ldap')
export class LDAPServerModel extends Model {

  @type.id
  public id: string;

  @type.string
  @validate.required
  name: string = '';

  @type.string
  @validate.required
  url: string

  @type.string
  @validate.required
  dc: string = '';

  @type.string
  @validate.required
  secret: string = '';

  @type.boolean
  @validate.required
  active = true;
}
