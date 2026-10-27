import { Link } from 'react-router-dom';
import LegalLayout, { Section } from '../../components/LegalLayout';

export default function Privacidad() {
  return (
    <LegalLayout title="Política de privacidad">
      <p>
        En <strong>Corta la bocha</strong> (juegos de fútbol online) cuidamos tus datos personales.
        Esta política explica qué datos guardamos, para qué, con quién los compartimos y cómo podés
        ejercer tus derechos, de acuerdo con la <strong>Ley 25.326 de Protección de los Datos Personales</strong> de
        la República Argentina y su reglamentación.
      </p>

      <Section title="1. Quién es el responsable">
        <p>
          El responsable de la base de datos es <strong>CLB Devs (responsable: Camila Copo)</strong>, con domicilio
          en Ciudad Autónoma de Buenos Aires, Argentina. Para cualquier consulta sobre tus datos podés
          escribirnos a <a href="mailto:clbdevelopers@outlook.es">clbdevelopers@outlook.es</a>.
        </p>
      </Section>

      <Section title="2. Qué datos guardamos">
        <table>
          <thead>
            <tr><th>Dato</th><th>Cuándo lo obtenemos</th><th>Para qué lo usamos</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Email y contraseña. Si entrás con Google: tu nombre, tu email y el identificador de tu cuenta
                de Google (no tu contraseña de Google)</td>
              <td>Al registrarte o al entrar con Google</td>
              <td>Identificarte e iniciar sesión. La contraseña se guarda cifrada (con bcrypt): nadie, ni
                siquiera nosotros, puede leerla.</td>
            </tr>
            <tr>
              <td>Nombre, apellido, fecha de nacimiento y país</td>
              <td>Al registrarte</td>
              <td>Personalizar tu cuenta y verificar que tengas la edad mínima (13 años). Tu nombre real y
                tu fecha de nacimiento no se muestran a otros jugadores.</td>
            </tr>
            <tr>
              <td>Nombre de usuario</td>
              <td>Al registrarte (o lo generamos nosotros)</td>
              <td>Identificarte ante otros jugadores en salas y rankings. Es público.</td>
            </tr>
            <tr>
              <td>Perfil: avatar, biografía, equipo, país y jugador favoritos</td>
              <td>Cuando los completás en tu perfil</td>
              <td>Mostrar tu perfil. Son públicos para otros jugadores.</td>
            </tr>
            <tr>
              <td>Partidas de todos los juegos (Tutti Frutti, ahorcado, trivia, etc.), tus respuestas y tus
                estadísticas, en total y por juego (partidas jugadas y ganadas, puntos, rachas, ELO y posición en
                las ligas semanales y mensuales)</td>
              <td>Mientras jugás</td>
              <td>Hacer funcionar los juegos, calcular puntajes y armar los rankings y las ligas. Las
                estadísticas y el ELO son públicos.</td>
            </tr>
            <tr>
              <td>Fecha de creación de la cuenta</td>
              <td>Al registrarte</td>
              <td>Funcionamiento interno y estadísticas generales.</td>
            </tr>
            <tr>
              <td>Fecha y versión de los Términos y de esta política que aceptaste</td>
              <td>Al registrarte y cada vez que los actualizamos y los volvés a aceptar</td>
              <td>Poder demostrar que diste tu consentimiento (Ley 25.326) y pedírtelo de nuevo si los cambiamos.</td>
            </tr>
          </tbody>
        </table>
        <p>
          No pedimos datos sensibles (salud, religión, ideas políticas, etc.) ni datos de pago.
        </p>
      </Section>

      <Section title="3. Datos que quedan en tu dispositivo">
        <p>
          Cuando iniciás sesión, guardamos en el <strong>almacenamiento local (localStorage)</strong> de tu
          navegador un token de sesión y tu nombre de usuario, para que no tengas que ingresar cada vez.
          El token vence solo y se borra al cerrar sesión. Más detalles en la <Link to="/cookies">Política de cookies</Link>.
        </p>
      </Section>

      <Section title="4. Con quién compartimos tus datos">
        <p>No vendemos ni alquilamos tus datos. Para que la app funcione usamos estos proveedores (cada uno recibe sólo lo necesario):</p>
        <ul>
          <li><strong>Supabase</strong> (base de datos): guarda los datos de la sección 2.</li>
          <li><strong>Render</strong> (servidor): ejecuta la aplicación, así que procesa los datos que mandás mientras la usás
            (por ejemplo, tu email y contraseña al iniciar sesión, o tus respuestas en las partidas) y tu dirección IP.</li>
          <li><strong>Vercel</strong> (página web): sirve la página que ves; recibe tu dirección IP y los datos técnicos de tu
            navegador al cargarla.</li>
          <li>
            <strong>Google (inicio de sesión)</strong>: podés registrarte y entrar con tu cuenta de Google. En ese
            caso, el inicio de sesión lo hace Google, que nos confirma quién sos; nosotros guardamos tu nombre, tu
            email y el identificador de tu cuenta de Google para reconocerte la próxima vez. No recibimos tu
            contraseña de Google.
          </li>
          <li>
            <strong>Google Gemini</strong> (inteligencia artificial): valida si tus respuestas del Tutti Frutti son correctas.
            Sólo le enviamos la letra de la ronda, las categorías y las respuestas escritas; <strong>nunca</strong> tu nombre,
            email ni otros datos personales.
          </li>
          <li>
            <strong>Brevo (Sendinblue)</strong>, servicio de envío de emails: sólo si pedís recuperar tu contraseña,
            le pasamos tu email para mandarte el link. El link vence en una hora y sirve una sola vez.
          </li>
          <li>
            <strong>Cloudflare Turnstile</strong> (verificación anti-robots del registro): al registrarte, Cloudflare analiza
            datos técnicos de tu navegador y tu dirección IP para comprobar que no sos un robot. No le pasamos tu email ni tus datos de la cuenta.
          </li>
          <li><strong>Google Fonts</strong>: sirve las tipografías de la página; tu navegador se conecta a sus
            servidores para descargarlas.</li>
          <li>
            <strong>Copias de seguridad (backups)</strong>: todos los días hacemos una copia de la base de datos, <strong>cifrada</strong>,
            que se guarda en <strong>Google Drive</strong> y en <strong>GitHub</strong>. Cada copia se borra a los <strong>30 días</strong>.
            Sin la clave no se puede leer, y sólo la usamos para recuperar los datos si algo sale mal.
          </li>
        </ul>
        <p>
          También podemos compartir datos si una autoridad judicial o administrativa competente lo exige
          por ley.
        </p>
      </Section>

      <Section title="5. Transferencia internacional">
        <p>
          Estos proveedores tienen servidores fuera de la Argentina (principalmente en los Estados Unidos).
          Al usar la app, prestás tu consentimiento para que tus datos se transfieran y almacenen allí,
          con las medidas de seguridad indicadas en esta política.
        </p>
      </Section>

      <Section title="6. Cuánto tiempo los guardamos">
        <p>
          Guardamos tus datos mientras tengas una cuenta. Cuando la borrás (o nos pedís que la borremos), se
          borran en el momento tu cuenta, tu perfil, tus estadísticas, tu lugar en el ranking, tus logros y tus
          partidas. En las partidas multijugador quedan sólo los resultados de los demás jugadores, sin los tuyos.
          Tus datos pueden seguir en las copias de seguridad hasta 30 días después, hasta que esas copias se
          borran solas.
        </p>
      </Section>

      <Section title="7. Seguridad">
        <p>
          Usamos conexiones cifradas (HTTPS), guardamos las contraseñas cifradas, limitamos los intentos de
          inicio de sesión y restringimos quién puede ver cada dato. Ningún sistema es 100% seguro: si
          detectamos un incidente que afecte tus datos, te vamos a avisar.
        </p>
      </Section>

      <Section title="8. Menores de edad">
        <p>
          Para registrarte tenés que tener al menos <strong>13 años</strong>. Si sos menor de 18, usá la app con el
          conocimiento y la autorización de tus padres o tutores. Si sos madre, padre o tutor y creés que
          un menor nos dio datos sin autorización, escribinos a <a href="mailto:clbdevelopers@outlook.es">clbdevelopers@outlook.es</a> y los borramos.
        </p>
      </Section>

      <Section title="9. Tus derechos">
        <p>Según la Ley 25.326, podés:</p>
        <ul>
          <li><strong>Acceder</strong> a tus datos: saber qué datos tenemos sobre vos.</li>
          <li><strong>Rectificar</strong> o actualizar datos incorrectos (varios los podés cambiar vos mismo desde tu perfil).</li>
          <li><strong>Suprimir</strong> tus datos, es decir, borrar tu cuenta.</li>
          <li><strong>Retirar tu consentimiento</strong> en cualquier momento.</li>
        </ul>
        <p>
          <strong>Borrar tu cuenta</strong> lo podés hacer vos mismo desde la app, en <strong>Perfil → Borrar mi
          cuenta</strong>: se borra en el momento y para siempre. Si no podés entrar, escribinos desde el email de tu
          cuenta. Todo el detalle está en <Link to="/borrar-cuenta">Borrar tu cuenta</Link>.
        </p>
        <p>
          Para ejercer los demás derechos (o si no podés entrar a la app) escribí a <a href="mailto:clbdevelopers@outlook.es">clbdevelopers@outlook.es</a> desde el email de tu cuenta. Respondemos
          los pedidos de acceso dentro de los 10 días corridos y los de rectificación o supresión dentro de
          los 5 días hábiles, como indica la ley.
        </p>
        <p>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos
          en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo
          al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326.
        </p>
        <p>
          La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley
          N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes
          resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de
          protección de datos personales.
        </p>
      </Section>

      <Section title="10. Cambios en esta política">
        <p>
          Si cambiamos esta política, vamos a actualizar la fecha de arriba y, si el cambio es importante,
          te vamos a pedir que la vuelvas a aceptar dentro de la app antes de seguir jugando.
        </p>
      </Section>
    </LegalLayout>
  );
}
