// src/lib/validation/useRegisterFormValidation.ts
import { watch } from 'vue'
import { isValidEmail, isValidPhone } from '@/lib/utils'
import { useAuthStore } from '../stores/auth'

/**
 * Hook para validar en tiempo real el formulario de registro.
 * Debe importarse y ejecutarse en el setup() de la vista de registro.
 */
export function useRegisterFormValidation() {
  const auth = useAuthStore()

  // First name
  watch(
    () => auth.formData.first_name,
    (val) => {
      if (!val.trim()) auth.fieldErrors.first_name = 'Nombre requerido'
      else delete auth.fieldErrors.first_name
    }
  )

  // Last name
  watch(
    () => auth.formData.last_name,
    (val) => {
      if (!val.trim()) auth.fieldErrors.last_name = 'Apellido requerido'
      else delete auth.fieldErrors.last_name
    }
  )

  // Phone
  watch(
    () => auth.formData.phone,
    (val) => {
      if (!val.trim()) auth.fieldErrors.phone = 'Teléfono requerido'
      else if (!isValidPhone(val)) auth.fieldErrors.phone = 'Teléfono inválido (9 dígitos)'
      else delete auth.fieldErrors.phone
    }
  )

  // Email
  watch(
    () => auth.formData.email,
    (val) => {
      if (val && !isValidEmail(val)) auth.fieldErrors.email = 'Email inválido'
      else delete auth.fieldErrors.email
    }
  )

  // Password + confirm
  watch(
    () => auth.formData.password,
    (val) => {
      if (!val) auth.fieldErrors.password = 'Contraseña requerida'
      else if (val.length < 6) auth.fieldErrors.password = 'Mínimo 6 caracteres'
      else delete auth.fieldErrors.password

      // actualizar confirmPassword al cambiar password
      const confirm = auth.confirmPassword
      if (confirm && confirm !== val) auth.fieldErrors.confirmPassword = 'Las contraseñas no coinciden'
      else delete auth.fieldErrors.confirmPassword
    }
  )

  watch(
    () => auth.confirmPassword,
    (val) => {
      if (val !== auth.formData.password) auth.fieldErrors.confirmPassword = 'Las contraseñas no coinciden'
      else delete auth.fieldErrors.confirmPassword
    }
  )
}
