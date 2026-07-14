export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password) {
  const errors = []
  if (password.length < 8)          errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password))      errors.push('One uppercase letter')
  if (!/[a-z]/.test(password))      errors.push('One lowercase letter')
  if (!/[0-9]/.test(password))      errors.push('One number')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character')
  return { valid: errors.length === 0, errors }
}

export function validateOtp(otp) {
  return /^\d{6}$/.test(otp)
}

export function validateName(name) {
  return name.trim().length >= 2
}

export function validateRegisterForm(data) {
  const errors = {}
  if (!validateName(data.fullName))
    errors.fullName = 'Name must be at least 2 characters'
  if (!validateEmail(data.email))
    errors.email = 'Enter a valid email address'
  const pwCheck = validatePassword(data.password)
  if (!pwCheck.valid)
    errors.password = `Password needs: ${pwCheck.errors.join(', ')}`
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Passwords do not match'
  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateLoginForm(data) {
  const errors = {}
  if (!validateEmail(data.email))   errors.email    = 'Enter a valid email address'
  if (!data.password)               errors.password = 'Password is required'
  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateForgotPasswordForm(data) {
  const errors = {}
  if (!validateEmail(data.email))
    errors.email = 'Enter a valid email address'
  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateResetPasswordForm(data) {
  const errors = {}
  if (!validateOtp(data.otp))
    errors.otp = 'Enter the 6-digit code'
  const pwCheck = validatePassword(data.newPassword)
  if (!pwCheck.valid)
    errors.newPassword = `Password needs: ${pwCheck.errors.join(', ')}`
  if (data.newPassword !== data.confirmPassword)
    errors.confirmPassword = 'Passwords do not match'
  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateTradeForm(data) {
  const errors = {}
  if (!data.amount || parseFloat(data.amount) <= 0)
    errors.amount = 'Enter a valid amount'
  if (!data.price || parseFloat(data.price) <= 0)
    errors.price = 'Enter a valid price'
  return { isValid: Object.keys(errors).length === 0, errors }
}
