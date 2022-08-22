import { model, Model, type, validate, form } from 'aurelia-deco';

@model('/template')
export class TemplateModel extends Model {

  @type.id
  public id: string;

  @type.select({options: ['validate-email', 'double-auth', 'reset-password-code', 'change-email-or-mobile-code', 'shop/order-confirm', 'shop/order-paid', 'shop/order-payment', 'shop/packaging-return-reminder']})
  @validate.required
  @form.label('admin.template.Template Key')
  @form.hint('admin.template.Must be unique')
  key: string;

  @type.string({multilang: true, textarea: true})
  @validate.required
  @form.label('admin.template.Template Subject')
  subject: string;

  @type.string({multilang: true, textarea: true})
  @validate.required
  @form.label('admin.template.Template HTML')
  html: string;

  @type.string({multilang: true, textarea: true})
  @form.label('admin.template.Template Text')
  text: string;

  @type.string({multilang: true, textarea: true})
  @form.label('admin.template.Template SMS')
  sms: string;

}
