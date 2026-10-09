import { Link } from 'react-router-dom';
import LegalLayout, { Falta, Section } from '../../components/LegalLayout';

export default function Terminos() {
  return (
    <LegalLayout title="Términos y condiciones">
      <p>
        Estos términos regulan el uso de <strong>Corta la bocha</strong>, un juego online de preguntas y
        respuestas sobre fútbol al estilo "Tutti Frutti", ofrecido por <Falta>NOMBRE DEL RESPONSABLE</Falta>.
        Al crear una cuenta o usar la app aceptás estos términos y la <Link to="/privacidad">Política de privacidad</Link>.
      </p>

      <Section title="1. El servicio">
        <p>
          Corta la bocha te permite jugar partidas solo (contra la máquina) o con otros jugadores en salas
          públicas y privadas, sumar puntos y aparecer en rankings. El servicio es gratuito y se ofrece
          "tal como está": puede tener errores, interrupciones o cambios, y podemos modificar o dar de baja
          funciones en cualquier momento.
        </p>
      </Section>

      <Section title="2. Tu cuenta">
        <ul>
          <li>Tenés que tener al menos <strong>13 años</strong>. Si sos menor de 18, necesitás la autorización de tus padres o tutores.</li>
          <li>Los datos que cargues tienen que ser reales y estar actualizados.</li>
          <li>Sos responsable de cuidar tu contraseña y de lo que se haga con tu cuenta. Si creés que alguien
            entró a tu cuenta, cambiá la contraseña y avisanos.</li>
          <li>Una persona, una cuenta. No podés vender ni transferir tu cuenta.</li>
        </ul>
      </Section>

      <Section title="3. Reglas de convivencia">
        <p>Al jugar, te comprometés a no:</p>
        <ul>
          <li>Usar nombres de usuario, biografías o respuestas ofensivas, discriminatorias, violentas o que
            suplanten a otra persona.</li>
          <li>Hacer trampa: usar programas automáticos, explotar errores del juego o manipular puntajes,
            votos o rankings.</li>
          <li>Intentar acceder a cuentas o datos ajenos, sobrecargar el servicio o afectar su funcionamiento.</li>
          <li>Usar la app para fines ilegales o publicitarios.</li>
        </ul>
        <p>
          Si no cumplís estas reglas podemos borrar contenido, anular puntajes o suspender o eliminar tu
          cuenta, según la gravedad.
        </p>
      </Section>

      <Section title="4. Validación de respuestas y puntajes">
        <p>
          Las respuestas se validan de forma automática (con ayuda de inteligencia artificial) y, en algunas
          partidas, con los votos de los jugadores. La validación puede equivocarse. Los puntajes, rankings y
          resultados que calcula el servidor son los oficiales del juego y no tienen valor económico.
        </p>
      </Section>

      <Section title="5. Propiedad intelectual">
        <p>
          El diseño, el código, el nombre y los contenidos de Corta la bocha pertenecen a sus creadores.
          Los nombres de jugadores, clubes, selecciones y torneos se usan sólo como referencia para el juego;
          sus marcas pertenecen a sus respectivos dueños, que no tienen relación con esta app.
        </p>
      </Section>

      <Section title="6. Responsabilidad">
        <p>
          En la medida que lo permita la ley, no somos responsables por daños derivados de interrupciones del
          servicio, pérdida de puntajes o estadísticas, ni por el contenido que publiquen otros jugadores.
          Nada de esto limita los derechos que te da la Ley 24.240 de Defensa del Consumidor.
        </p>
      </Section>

      <Section title="7. Baja de la cuenta">
        <p>
          Podés pedir la baja de tu cuenta cuando quieras escribiendo a <Falta>EMAIL DE CONTACTO</Falta>.
          Tus datos se tratan como explica la <Link to="/privacidad">Política de privacidad</Link>.
        </p>
      </Section>

      <Section title="8. Cambios en los términos">
        <p>
          Podemos actualizar estos términos. Vamos a cambiar la fecha de arriba y, si el cambio es importante,
          te lo vamos a avisar en la app. Si seguís usando Corta la bocha después del cambio, se entiende que
          lo aceptás.
        </p>
      </Section>

      <Section title="9. Ley aplicable y contacto">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto serán
          competentes los tribunales ordinarios de <Falta>CIUDAD / JURISDICCIÓN</Falta>, sin perjuicio de
          los derechos que te correspondan como consumidor. Consultas: <Falta>EMAIL DE CONTACTO</Falta>.
        </p>
      </Section>
    </LegalLayout>
  );
}
