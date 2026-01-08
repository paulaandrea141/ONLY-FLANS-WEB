// Validación de datos sin dependencias externas

export const validators = {
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  isValidAge: (age: number): boolean => {
    return age >= 18 && age <= 80;
  },

  sanitizeString: (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
  },

  validateVacante: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.puesto || data.puesto.trim().length < 2) {
      errors.push('El puesto es requerido y debe tener al menos 2 caracteres');
    }

    if (!data.descripcion || data.descripcion.trim().length < 10) {
      errors.push('La descripción es requerida y debe tener al menos 10 caracteres');
    }

    if (data.salario && isNaN(parseInt(data.salario))) {
      errors.push('El salario debe ser un número válido');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  validateCandidato: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.nombre || !validators.isValidName(data.nombre)) {
      errors.push('El nombre es requerido (2-100 caracteres)');
    }

    if (!data.whatsapp || !validators.isValidPhone(data.whatsapp)) {
      errors.push('Número de WhatsApp inválido');
    }

    if (!data.edad || !validators.isValidAge(data.edad)) {
      errors.push('La edad debe estar entre 18 y 80 años');
    }

    if (!data.colonia || data.colonia.trim().length < 2) {
      errors.push('La colonia es requerida');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
