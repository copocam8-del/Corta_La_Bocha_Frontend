import { describe, expect, it } from 'vitest';
import { maxBirthDate, NAME_MAX, validateLogin, validateProfile, validateProfileNames, validateRegister, type RegisterForm } from './rules';

const hoy = new Date(Date.UTC(2026, 9, 8));

const valido: RegisterForm = {
  name: 'Lionel',
  lastName: 'Messi',
  username: 'messi_10',
  birthDate: '1987-06-24',
  country: 'Argentina',
  email: 'leo@mail.com',
  password: 'gambeta-de-potrero',
};

describe('validateRegister', () => {
  it('un formulario completo y correcto no tiene errores', () => {
    expect(validateRegister(valido, hoy)).toEqual({});
  });

  it('marca cada campo obligatorio vacío con su propio mensaje', () => {
    const vacio = { name: '', lastName: '', username: '', birthDate: '', country: '', email: '', password: '' };
    expect(Object.keys(validateRegister(vacio, hoy)).sort()).toEqual(
      ['birthDate', 'country', 'email', 'lastName', 'name', 'password'],
    );
  });

  it('el nombre de usuario es opcional (el backend genera uno)', () => {
    expect(validateRegister({ ...valido, username: '' }, hoy)).toEqual({});
    expect(validateRegister({ ...valido, username: '   ' }, hoy)).toEqual({});
  });

  it.each([
    ['1234567', true],
    ['Gambeta8', false],
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

describe('validateProfileNames (Editar perfil)', () => {
  it('nombre y apellido correctos no tienen errores', () => {
    expect(validateProfileNames('Lionel', 'Messi')).toEqual({});
    expect(validateProfileNames('x'.repeat(NAME_MAX), 'y'.repeat(NAME_MAX))).toEqual({});
  });

  it('no pueden quedar vacíos (ni con sólo espacios)', () => {
    expect(validateProfileNames('', '   ')).toEqual({ first_name: 'Ingresá tu nombre', last_name: 'Ingresá tu apellido' });
  });

  it('hasta 50 caracteres, como en el registro', () => {
    expect(NAME_MAX).toBe(50);
    expect(validateProfileNames('x'.repeat(51), 'Messi')).toEqual({ first_name: 'El nombre puede tener hasta 50 caracteres' });
    expect(validateRegister({ ...valido, lastName: 'y'.repeat(51) }, hoy)).toEqual({ lastName: 'El apellido puede tener hasta 50 caracteres' });
  });
});

// Filtro de malas palabras (copia del backend): avisa antes de enviar con el mismo mensaje que el backend
describe('filtro de malas palabras en los formularios', () => {
  it('registro: usuario ofensivo o reservado, nombre y apellido ofensivos', () => {
    expect(validateRegister({ ...valido, username: 'puuuto_10' }, hoy)).toEqual({ username: 'Ese nombre de usuario no está permitido. Elegí otro.' });
    expect(validateRegister({ ...valido, username: 'admin' }, hoy)).toEqual({ username: 'Ese nombre de usuario no está permitido. Elegí otro.' });
    expect(validateRegister({ ...valido, name: 'Pelotudo', lastName: 'P.u.t.o' }, hoy)).toEqual({
      name: 'Ese nombre no está permitido. Elegí otro.',
      lastName: 'Ese apellido no está permitido. Elegí otro.',
    });
    expect(validateRegister({ ...valido, username: 'Modric10', name: 'Concha', lastName: 'Acayaguá' }, hoy)).toEqual({});
  });

  it('perfil: usuario, nombre y textos públicos', () => {
    const ok = { first_name: 'Lionel', last_name: 'Messi', username: 'messi_10', bio: 'Me gusta el pollo', favorite_team: 'Boca', favorite_country: 'Nigeria', favorite_player: 'Riquelme' };
    expect(validateProfile(ok)).toEqual({});
    expect(validateProfile({ ...ok, username: 'soporte', bio: 'sos un b0lud0', favorite_team: 'm1erd4', favorite_country: 'Sudacas', favorite_player: 'puuuto' })).toEqual({
      username: 'Ese nombre de usuario no está permitido. Elegí otro.',
      bio: 'Ese texto no está permitido.',
      favorite_team: 'Ese texto no está permitido.',
      favorite_country: 'Ese texto no está permitido.',
      favorite_player: 'Ese texto no está permitido.',
    });
    // Usuario vacío no se revisa acá (el backend lo ignora)
    expect(validateProfile({ ...ok, username: '' })).toEqual({});
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
