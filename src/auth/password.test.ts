import { describe, expect, it } from 'vitest';
import { COMMON_PASSWORD_MESSAGE, isCommonPassword, validateNewPassword, validateRegister } from './rules';

describe('contraseña nueva (recuperar contraseña)', () => {
  it('mismas reglas que el registro y tiene que coincidir con la confirmación', () => {
    expect(validateNewPassword('', '')).toEqual({ password: 'Ingresá una contraseña' });
    expect(validateNewPassword('corta', 'corta').password).toContain('entre 8 y 72');
    expect(validateNewPassword('a'.repeat(73), 'a'.repeat(73)).password).toContain('entre 8 y 72');
    expect(validateNewPassword('buena-clave', 'otra-clave')).toEqual({ confirm: 'Las contraseñas no coinciden' });
    expect(validateNewPassword('buena-clave', 'buena-clave')).toEqual({});
  });
});

describe('contraseñas comunes (misma lista que el backend)', () => {
  it.each(['12345678', 'password', 'PASSWORD', 'Qwerty123', 'argentina10'])('"%s" es común', (p) => {
    expect(isCommonPassword(p)).toBe(true);
  });

  it('el registro y la contraseña nueva muestran el mismo mensaje que el backend', () => {
    const registro = { name: 'Leo', lastName: 'Messi', username: '', birthDate: '1987-06-24', country: 'Argentina', email: 'leo@mail.com' };
    expect(validateRegister({ ...registro, password: 'password' }).password).toBe(COMMON_PASSWORD_MESSAGE);
    expect(validateNewPassword('12345678', '12345678').password).toBe(COMMON_PASSWORD_MESSAGE);
    expect(COMMON_PASSWORD_MESSAGE).toMatch(/^Esa contraseña es muy común/);
  });

  it('una contraseña que no es común pasa', () => {
    expect(isCommonPassword('gambeta-de-potrero')).toBe(false);
    expect(validateNewPassword('gambeta-de-potrero', 'gambeta-de-potrero')).toEqual({});
  });
});
