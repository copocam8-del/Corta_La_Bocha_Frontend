import { describe, expect, it } from 'vitest';
import { maxBirthDate, validateLogin, validateRegister, type RegisterForm } from './rules';

const hoy = new Date(Date.UTC(2026, 9, 8));

const valido: RegisterForm = {
  name: 'Lionel',
  lastName: 'Messi',
  username: 'messi_10',
  birthDate: '1987-06-24',
  country: 'Argentina',
  email: 'leo@mail.com',
  password: 'contraseña123',
};

describe('validateRegister', () => {
  it('un formulario completo y correcto no tiene errores', () => {
    expect(validateRegister(valido, hoy)).toEqual({});
  });

  it('marca cada campo vacío con su propio mensaje', () => {
    const vacio = { name: '', lastName: '', username: '', birthDate: '', country: '', email: '', password: '' };
    expect(Object.keys(validateRegister(vacio, hoy)).sort()).toEqual(
      ['birthDate', 'country', 'email', 'lastName', 'name', 'password', 'username'],
    );
  });

  it.each([
    ['1234567', true],
    ['12345678', false],
    ['a'.repeat(72), false],
    ['a'.repeat(73), true],
  ])('contraseña de %s → error: %s', (password, hayError) => {
    expect(!!validateRegister({ ...valido, password }, hoy).password).toBe(hayError);
  });

  it.each([
    ['ab', 'entre 3 y 30'],
    ['a'.repeat(31), 'entre 3 y 30'],
    ['leo messi', 'letras, números y _'],
    ['leo-10', 'letras, números y _'],
  ])('rechaza el usuario "%s"', (username, mensaje) => {
    expect(validateRegister({ ...valido, username }, hoy).username).toContain(mensaje);
  });

  it('acepta usuarios con letras, números y _', () => {
    expect(validateRegister({ ...valido, username: 'Leo_10' }, hoy).username).toBeUndefined();
  });

  it('exige 13 años cumplidos', () => {
    expect(validateRegister({ ...valido, birthDate: '2013-10-08' }, hoy).birthDate).toBeUndefined();
    expect(validateRegister({ ...valido, birthDate: '2013-10-09' }, hoy).birthDate).toBe(
      'Tenés que tener al menos 13 años para registrarte',
    );
  });

  it('rechaza un email mal escrito', () => {
    expect(validateRegister({ ...valido, email: 'leo@mail' }, hoy).email).toBe('El email no es válido');
  });
});

describe('validateLogin', () => {
  it('pide email y contraseña', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Ingresá tu email',
      password: 'Ingresá tu contraseña',
    });
  });

  it('no exige 8 caracteres en el login (cuentas viejas)', () => {
    expect(validateLogin({ email: 'leo@mail.com', password: '123456' })).toEqual({});
  });
});

describe('maxBirthDate', () => {
  it('es la fecha de hoy hace 13 años', () => {
    expect(maxBirthDate(hoy)).toBe('2013-10-08');
  });
});
