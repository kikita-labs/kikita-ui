import { minLength, required, type SchemaPathTree } from '@angular/forms/signals';

import { OTP_INPUT_VALIDATION_CODE_LENGTH } from '../constants';
import type { OtpInputValidationFormModel } from '../interfaces';

/** Creates the OTP Input Signal Forms schema with reactive, localized error messages. */
export function createOtpInputValidationSchema(
  requiredMessage: () => string,
  lengthMessage: () => string,
): (path: SchemaPathTree<OtpInputValidationFormModel>) => void {
  return function otpInputValidationSchema(path): void {
    required(path.code, { message: requiredMessage });
    minLength(path.code, OTP_INPUT_VALIDATION_CODE_LENGTH, { message: lengthMessage });
  };
}
