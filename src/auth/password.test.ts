import { describe, expect, it } from 'vitest';
import { validateNewPassword } from './rules';

describe('contraseña nueva (recuperar contraseña)', () => {
  it('mismas reglas que el registro y tiene que coincidir con la confirmación', () => {
    expect(validateNewPassword('', '')).toEqual({ password: 'Ingresá una contraseña' });
    expect(validateNewPassword('corta', 'corta').password).toContain('entre 8 y 72');
    expect(validateNewPassword('a'.repeat(73), 'a'.repeat(73)).password).toContain('entre 8 y 72');
    expect(validateNewPassword('buena-clave', 'otra-clave')).toEqual({ confirm: 'Las contraseñas no coinciden' });
    expect(validateNewPassword('buena-clave', 'buena-clave')).toEqual({});
  });
});
