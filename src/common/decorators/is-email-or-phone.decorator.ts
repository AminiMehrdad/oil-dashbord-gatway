import {
  isEmail,
  isPhoneNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

type PhoneRegion = Parameters<typeof isPhoneNumber>[1];

export function IsEmailOrPhone(
  validationOptions?: ValidationOptions,
  region?: PhoneRegion,
): PropertyDecorator {
  return (target: object, propertyName: string | symbol): void => {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      constraints: [region],

      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          const normalizedValue = value.trim();

          if (!normalizedValue) {
            return false;
          }

          return (
            isEmail(normalizedValue) ||
            isPhoneNumber(normalizedValue, region)
          );
        },

        defaultMessage(): string {
          return 'Email or phone must be a valid email address or phone number';
        },
      },
    });
  };
}