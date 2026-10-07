import type { OtpInputValidationFormModel } from '../interfaces';

/** Number of characters the validated OTP code must have. */
export const OTP_INPUT_VALIDATION_CODE_LENGTH = 6;

/** Empty initial values for the OTP Input Signal Forms example. */
export const OTP_INPUT_VALIDATION_FORM_DEFAULT_STATE: OtpInputValidationFormModel = {
  code: '',
};
