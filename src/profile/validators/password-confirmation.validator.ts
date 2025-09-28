import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordConfirmationConstraint
  implements ValidatorConstraintInterface
{
  validate(confirmPassword: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const newPassword = (args.object as any)[relatedPropertyName];
    return newPassword === confirmPassword;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${relatedPropertyName} and ${args.property} do not match`;
  }
}

export function PasswordConfirmation(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PasswordConfirmationConstraint,
    });
  };
}
