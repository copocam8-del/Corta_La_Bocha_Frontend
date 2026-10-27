import { Link } from 'react-router-dom';
import LegalLayout, { Section } from '../../components/LegalLayout';

// Página pública para pedir que se borre la cuenta (la pide Google Play: tiene que poder abrirse sin la app y sin sesión)
export default function BorrarCuenta() {
  return (
    <LegalLayout title="Borrar tu cuenta">
      <p>
        Podés borrar tu cuenta de <strong>Corta la bocha</strong> y todos tus datos cuando quieras. Es gratis y
        es <strong>para siempre</strong>: después no se puede recuperar.
      </p>

      <Section title="1. Desde la app">
        <ol style={{ margin: '0 0 10px', paddingLeft: '20px', listStyle: 'decimal' }}>
          <li>Iniciá sesión y entrá a tu <strong>Perfil</strong>.</li>
          <li>Al final, tocá <strong>Borrar mi cuenta</strong>.</li>
          <li>Confirmá con tu contraseña. Si entrás con Google, escribí tu nombre de usuario.</li>
          <li>Tocá <strong>Borrar para siempre</strong>.</li>
        </ol>
        <p>Se borra en el momento y se cierra tu sesión.</p>
      </Section>

      <Section title="2. Qué se borra">
        <ul>
          <li>Tu cuenta: email, contraseña (o el vínculo con Google), nombre, apellido, fecha de nacimiento y país.</li>
          <li>Tu perfil: nombre de usuario, avatar, biografía y favoritos.</li>
          <li>Tus estadísticas, tu ELO, tu lugar en el ranking y en las ligas, y tus logros.</li>
          <li>Tus partidas y respuestas, el desafío del día y los pedidos para cambiar la contraseña.</li>
        </ul>
        <p>
          En las partidas multijugador que jugaste con otras personas, se borran tus resultados y tus respuestas; los
          de los demás jugadores quedan como estaban. Tu email y tu nombre de usuario quedan libres para una cuenta nueva.
        </p>
      </Section>

      <Section title="3. Copias de seguridad">
        <p>
          Hacemos una copia de seguridad cifrada de la base de datos todos los días. Tus datos pueden seguir en esas
          copias hasta <strong>30 días</strong>, hasta que se borran solas. No las usamos para recuperar cuentas
          borradas.
        </p>
      </Section>

      <Section title="4. Si no podés entrar">
        <p>
          Escribinos a <a href="mailto:clbdevelopers@outlook.es?subject=Borrar%20mi%20cuenta">clbdevelopers@outlook.es</a>{' '}
          <strong>desde el email de tu cuenta</strong>, con el asunto "Borrar mi cuenta". Así sabemos que la cuenta es tuya.
          La borramos dentro de los 5 días hábiles y te avisamos por email.
        </p>
        <p>
          Si olvidaste la contraseña, también podés <Link to="/olvide-contrasena">recuperarla</Link> y borrarla desde la app.
        </p>
      </Section>

      <Section title="5. Más información">
        <p>
          Para saber qué datos guardamos y cuáles son tus derechos, leé la <Link to="/privacidad">Política de privacidad</Link>.
        </p>
      </Section>
    </LegalLayout>
  );
}
