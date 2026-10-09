import { Link } from 'react-router-dom';
import LegalLayout, { Falta, Section } from '../../components/LegalLayout';

export default function Cookies() {
  return (
    <LegalLayout title="Política de cookies">
      <p>
        Esta política explica qué información guarda <strong>Corta la bocha</strong> en tu navegador y por qué.
      </p>

      <Section title="1. ¿Usamos cookies?">
        <p>
          <strong>No usamos cookies propias</strong>, ni cookies de publicidad, ni herramientas de
          seguimiento o analítica. En su lugar usamos el <strong>almacenamiento local (localStorage)</strong> del
          navegador, que es parecido a una cookie pero no se envía automáticamente a ningún servidor.
        </p>
      </Section>

      <Section title="2. Qué guardamos en tu navegador">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Qué contiene</th><th>Para qué</th><th>Cuánto dura</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>token</code></td>
              <td>Tu token de sesión (JWT)</td>
              <td>Mantener tu sesión iniciada. Es estrictamente necesario para usar la app.</td>
              <td>Hasta que vence (por defecto, 7 días) o cerrás sesión</td>
            </tr>
            <tr>
              <td><code>username</code></td>
              <td>Tu nombre de usuario</td>
              <td>Saludarte y mostrarlo en pantalla sin pedirlo al servidor.</td>
              <td>Hasta que cerrás sesión</td>
            </tr>
            <tr>
              <td><code>name</code></td>
              <td>Tu nombre</td>
              <td>Saludarte por tu nombre.</td>
              <td>Hasta que cerrás sesión</td>
            </tr>
          </tbody>
        </table>
        <p>
          Como son necesarios para que la app funcione, no pedimos un consentimiento aparte para guardarlos.
        </p>
      </Section>

      <Section title="3. Servicios de terceros">
        <p>
          Las tipografías se descargan de <strong>Google Fonts</strong> y la página está alojada en
          <strong> Vercel</strong>. Al cargar la página, estos servicios reciben datos técnicos como tu dirección
          IP y el tipo de navegador, según sus propias políticas de privacidad. No usamos sus herramientas de
          publicidad ni de seguimiento.
        </p>
        <p>
          En las pantallas de inicio de sesión y registro se carga el botón de <strong>Google</strong>. Google puede
          guardar sus propias cookies para que funcione el inicio de sesión con tu cuenta de Google, según su
          política de privacidad.
        </p>
      </Section>

      <Section title="4. Cómo borrar estos datos">
        <ul>
          <li>Tocá <strong>Cerrar sesión</strong> dentro de la app: se borran los tres datos de la tabla.</li>
          <li>O borrá los "datos de sitios" desde la configuración de tu navegador.</li>
        </ul>
        <p>
          Si los borrás, vas a tener que volver a iniciar sesión.
        </p>
      </Section>

      <Section title="5. Más información">
        <p>
          Para saber qué datos guardamos en nuestros servidores, leé la <Link to="/privacidad">Política de
          privacidad</Link>. Consultas: <Falta>EMAIL DE CONTACTO</Falta>.
        </p>
      </Section>
    </LegalLayout>
  );
}
