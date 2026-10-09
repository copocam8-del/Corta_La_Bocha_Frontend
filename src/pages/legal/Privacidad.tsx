import { Link } from 'react-router-dom';
import LegalLayout, { Falta, Section } from '../../components/LegalLayout';

export default function Privacidad() {
  return (
    <LegalLayout title="Política de privacidad">
      <p>
        En <strong>Corta la bocha</strong> (el "Tutti Frutti del fútbol") cuidamos tus datos personales.
        Esta política explica qué datos guardamos, para qué, con quién los compartimos y cómo podés
        ejercer tus derechos, de acuerdo con la <strong>Ley 25.326 de Protección de los Datos Personales</strong> de
        la República Argentina y su reglamentación.
      </p>

      <Section title="1. Quién es el responsable">
        <p>
          El responsable de la base de datos es <Falta>NOMBRE DEL RESPONSABLE</Falta>, con domicilio
          en <Falta>DOMICILIO DEL RESPONSABLE</Falta>. Para cualquier consulta sobre tus datos podés
          escribirnos a <Falta>EMAIL DE CONTACTO</Falta>.
        </p>
      </Section>

      <Section title="2. Qué datos guardamos">
        <table>
          <thead>
            <tr><th>Dato</th><th>Cuándo lo obtenemos</th><th>Para qué lo usamos</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Email y contraseña (o identificador de tu cuenta de Google)</td>
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
              <td>Partidas, respuestas, votos y estadísticas (partidas jugadas y ganadas, puntos, rachas)</td>
              <td>Mientras jugás</td>
              <td>Hacer funcionar el juego, calcular puntajes y armar los rankings. Las estadísticas son
                públicas.</td>
            </tr>
            <tr>
              <td>Fecha de creación de la cuenta</td>
              <td>Al registrarte</td>
              <td>Funcionamiento interno y estadísticas generales.</td>
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
        <p>No vendemos ni alquilamos tus datos. Para que la app funcione usamos estos proveedores:</p>
        <ul>
          <li><strong>Vercel</strong>: aloja la página web que ves.</li>
          <li><strong>Render</strong>: aloja el servidor de la aplicación.</li>
          <li><strong>Supabase</strong>: aloja la base de datos donde se guardan los datos de la sección 2.</li>
          <li>
            <strong>OpenAI</strong>: valida si tus respuestas del juego son correctas. Sólo le enviamos la letra
            de la ronda, las categorías y las respuestas escritas; <strong>nunca</strong> tu nombre, email ni
            otros datos de tu cuenta.
          </li>
          <li><strong>Google Fonts</strong>: sirve las tipografías de la página; tu navegador se conecta a sus
            servidores para descargarlas.</li>
          <li>
            <strong>Google (inicio de sesión)</strong>: si elegís "Continuar con Google", Google nos confirma tu
            email, tu nombre y un identificador de tu cuenta de Google, que guardamos para reconocerte la
            próxima vez. No recibimos tu contraseña de Google.
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
          Guardamos tus datos mientras tengas una cuenta. Si pedís que la eliminemos, borramos tus datos
          personales; podemos conservar información anónima de partidas (sin identificarte) para
          estadísticas generales.
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
          un menor nos dio datos sin autorización, escribinos a <Falta>EMAIL DE CONTACTO</Falta> y los borramos.
        </p>
      </Section>

      <Section title="9. Tus derechos">
        <p>Según la Ley 25.326, podés:</p>
        <ul>
          <li><strong>Acceder</strong> a tus datos: saber qué datos tenemos sobre vos.</li>
          <li><strong>Rectificar</strong> o actualizar datos incorrectos (varios los podés cambiar vos mismo desde tu perfil).</li>
          <li><strong>Suprimir</strong> tus datos, es decir, pedir que eliminemos tu cuenta.</li>
          <li><strong>Retirar tu consentimiento</strong> en cualquier momento.</li>
        </ul>
        <p>
          Para ejercerlos escribí a <Falta>EMAIL DE CONTACTO</Falta> desde el email de tu cuenta. Respondemos
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
          te lo vamos a avisar dentro de la app.
        </p>
      </Section>
    </LegalLayout>
  );
}
