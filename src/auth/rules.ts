// Mismas reglas que el backend (src/auth/dto/auth-rules.ts en Corta_La_Bocha_Backend).
// Acá sólo sirven para avisar antes de enviar el formulario; el backend es el que decide.

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const NAME_MAX = 50; // nombre y apellido (backend: NAME_MAX en auth-rules.ts)
export const MIN_AGE = 13;

export type FieldErrors = Record<string, string>;

export interface RegisterForm {
  name: string;
  lastName: string;
  username: string;
  birthDate: string;
  country: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ageFrom(birthDate: string, today = new Date()): number {
  const birth = new Date(birthDate);
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

// Fecha máxima para el input de nacimiento (hoy hace MIN_AGE años), en formato AAAA-MM-DD
export function maxBirthDate(today = new Date()): string {
  const d = new Date(today);
  d.setUTCFullYear(d.getUTCFullYear() - MIN_AGE);
  return d.toISOString().slice(0, 10);
}

// Nombre o apellido: obligatorio y hasta NAME_MAX caracteres (mismas reglas en el registro y en el perfil)
export function validateName(value: string, campo: 'nombre' | 'apellido'): string | undefined {
  const v = value.trim();
  if (!v) return campo === 'nombre' ? 'Ingresá tu nombre' : 'Ingresá tu apellido';
  if (v.length > NAME_MAX) return `El ${campo} puede tener hasta ${NAME_MAX} caracteres`;
}

// "Editar perfil": nombre y apellido (los errores usan los nombres de campo del backend)
export function validateProfileNames(firstName: string, lastName: string): FieldErrors {
  const errors: FieldErrors = {};
  const nombre = validateName(firstName, 'nombre');
  if (nombre) errors.first_name = nombre;
  const apellido = validateName(lastName, 'apellido');
  if (apellido) errors.last_name = apellido;
  return errors;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Ingresá tu email';
  if (!EMAIL_REGEX.test(email.trim())) return 'El email no es válido';
}

export function validateRegister(form: RegisterForm, today = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  const username = form.username.trim();

  const nombre = validateName(form.name, 'nombre');
  if (nombre) errors.name = nombre;
  const apellido = validateName(form.lastName, 'apellido');
  if (apellido) errors.lastName = apellido;

  // El usuario es opcional: si queda vacío, el backend genera uno a partir del nombre
  if (!username) {
    // sin error
  } else if (username.length < USERNAME_MIN || username.length > USERNAME_MAX)
    errors.username = `El nombre de usuario debe tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres`;
  else if (!USERNAME_REGEX.test(username))
    errors.username = 'El nombre de usuario sólo puede tener letras, números y _';

  if (!form.birthDate) errors.birthDate = 'Ingresá tu fecha de nacimiento';
  else if (isNaN(Date.parse(form.birthDate))) errors.birthDate = 'La fecha de nacimiento no es válida';
  else if (ageFrom(form.birthDate, today) < MIN_AGE)
    errors.birthDate = `Tenés que tener al menos ${MIN_AGE} años para registrarte`;

  if (!form.country) errors.country = 'Elegí tu país';

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  if (!form.password) errors.password = 'Ingresá una contraseña';
  else if (form.password.length < PASSWORD_MIN || form.password.length > PASSWORD_MAX)
    errors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;

  return errors;
}

// Contraseña nueva (recuperar contraseña): mismas reglas que el registro + que coincida la confirmación
export function validateNewPassword(password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!password) errors.password = 'Ingresá una contraseña';
  else if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)
    errors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;
  if (!errors.password && password !== confirm) errors.confirm = 'Las contraseñas no coinciden';
  return errors;
}

export function validateLogin(form: LoginForm): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  if (!form.password) errors.password = 'Ingresá tu contraseña';
  return errors;
}
