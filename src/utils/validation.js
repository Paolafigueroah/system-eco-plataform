// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - Contraseña segura
export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Password strength checker
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' };
  
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  strength = Object.values(checks).filter(Boolean).length;
  
  if (strength <= 2) {
    return { strength, label: 'Débil', color: 'red' };
  } else if (strength === 3) {
    return { strength, label: 'Regular', color: 'yellow' };
  } else if (strength === 4) {
    return { strength, label: 'Buena', color: 'blue' };
  } else {
    return { strength, label: 'Fuerte', color: 'green' };
  }
};

// Get password requirements status
export const getPasswordRequirements = (password) => {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
};

// Phone number validation (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

// Minimum length validation
export const hasMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

// Maximum length validation
export const hasMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

// Number validation
export const isNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

// Integer validation
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

// Positive number validation
export const isPositive = (value) => {
  return isNumber(value) && Number(value) > 0;
};

// Date validation
export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

// Future date validation
export const isFutureDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

// Past date validation
export const isPastDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rules = validationRules[field];
    
    if (rules.required && !isRequired(value)) {
      errors[field] = `${field} is required`;
      return;
    }
    
    if (value && rules.email && !isValidEmail(value)) {
      errors[field] = 'Invalid email format';
      return;
    }
    
    if (value && rules.password && !isValidPassword(value)) {
      errors[field] = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
      return;
    }
    
    if (value && rules.minLength && !hasMinLength(value, rules.minLength)) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
      return;
    }
    
    if (value && rules.maxLength && !hasMaxLength(value, rules.maxLength)) {
      errors[field] = `${field} must be no more than ${rules.maxLength} characters`;
      return;
    }
    
    if (value && rules.number && !isNumber(value)) {
      errors[field] = `${field} must be a number`;
      return;
    }
    
    if (value && rules.positive && !isPositive(value)) {
      errors[field] = `${field} must be a positive number`;
      return;
    }
    
    if (value && rules.custom) {
      const customValidation = rules.custom(value, formData);
      if (customValidation !== true) {
        errors[field] = customValidation;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Example validation rules
export const commonValidationRules = {
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    password: true,
    minLength: 8
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  phone: {
    required: false,
    custom: (value) => {
      if (value && !isValidPhone(value)) {
        return 'Invalid phone number format';
      }
      return true;
    }
  }
};
