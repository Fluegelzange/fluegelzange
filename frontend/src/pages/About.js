import React from 'react';
import './About.css'; // Füge hier deine Styles für die About-Seite hinzu

function About() {
  return (
    <div className="about">
      <h1>Über Flügelzange</h1>
      <p>
        Herzlich willkommen bei Flügelzange, einem komplett werbefreien Sportjournal, das zur Unterhaltung und zum Austausch von Gedanken über die aktuelle Fußballwelt dient. 
      </p>
      <p>
        Flügelzange wurde als Freizeitprojekt gestartet, um gemeinsame Werte und Überlegungen über das spannende Feld des Fußballs zu teilen. Unsere Leidenschaft für den Sport und der Wunsch, eine Plattform zu schaffen, die ungestört von Werbung und kommerziellen Interessen ist, treiben uns an.
      </p>
      <p>
        Wir verdienen mit Flügelzange kein Geld und unser Engagement basiert rein auf der Freude am Fußball und dem Austausch mit unserer Leserschaft. Wenn du uns unterstützen möchtest, kannst du dies gerne mit einer kleinen Spende tun. 
      </p>
      <p>
        <a href="https://www.paypal.com/paypalme/fluegelzange.spende" target="_blank" rel="noopener noreferrer">Spende an Flügelzange</a>
      </p>
      <p>
        Vielen Dank für dein Interesse und deine Unterstützung!
      </p>
    </div>
  );
}

export default About;
