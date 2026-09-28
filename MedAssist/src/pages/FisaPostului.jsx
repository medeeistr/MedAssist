import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';

const FisaPostului = () => {
  const navigate = useNavigate();

  // Tab activ: 'fisa' sau 'regulament'
  const [activeTab, setActiveTab] = useState('fisa');
  const [dateFisa, setDateFisa] = useState(null);

  const fiseDisponibile = {
    'MedicSef': {
      titluPost: 'Medic Șef de Secție',
      departament: 'Secția Medicală / Coordonare',
      subordonatCatre: 'Director Medical / Manager Spital',
      locatie: 'Corp A, Etaj 3',
      obiective: 'Coordonarea întregii activități medicale, administrative și de personal a secției, asigurarea calității actului medical și respectarea protocoalelor clinice.',
      responsabilitati: [
        'Coordonează și supraveghează activitatea medicilor, asistenților și a personalului auxiliar din secție.',
        'Stabilește graficele de gardă și programul de lucru al personalului medical.',
        'Efectuează vizite medicale periodice și supervizează cazurile complexe sau critice.',
        'Răspunde de gestionarea eficientă a resurselor materiale și a medicamentelor din secție.',
        'Reprezintă secția în cadrul consiliului medical și colaborează cu conducerea spitalului.'
      ],
      cerinteLocMunca: [
        'Diplomă de Licență în Medicină și titlul de Medic Primar.',
        'Certificat de membru CMR vizat la zi și aviz de liberă practică.',
        'Experiență în management sanitar sau curs de leadership medical constituie avantaj.'
      ]
    },
    'Medic': {
      titluPost: 'Medic Specialist / Primar',
      departament: 'Secția Medicală',
      subordonatCatre: 'Medic Șef Secție / Director Medical',
      locatie: 'Corp A, Etaj 3',
      obiective: 'Diagnosticarea corectă, prescrierea tratamentului adecvat și îngrijirea clinică de specialitate a pacienților internați.',
      responsabilitati: [
        'Consultul medical zilnic al pacienților și stabilirea conduitei terapeutice.',
        'Interpretarea rezultatelor analizelor de laborator și a investigațiilor imagistice.',
        'Efectuarea manevrelor și procedurilor medicale specifice specialității.',
        'Supervizarea completării corecte a documentației medicale de către echipa de asistenți.',
        'Participarea la gărzile obligatorii conform planificării secției.'
      ],
      cerinteLocMunca: [
        'Diplomă de Licență în Medicină și Farmacie.',
        'Certificat de Specialist sau Primar în specialitatea postului.',
        'Asigurare de malpraxis valabilă și aviz CMR.'
      ]
    },
    'AsistentGeneralist': {
      titluPost: 'Asistent Medical Generalist',
      departament: 'Secția de Specialitate',
      subordonatCatre: 'Medic Șef Secție / Asistent Șef',
      locatie: 'Corp A, Etaj 2',
      obiective: 'Asigurarea îngrijirilor medicale calificate pacienților, administrarea tratamentelor prescrise și monitorizarea constantă a stării de sănătate.',
      responsabilitati: [
        'Preluarea pacienților la internare și monitorizarea funcțiilor vitale (puls, tensiune, temperatură).',
        'Administrarea tratamentului medicamentos prescris de medic (oral, intravenos, intramuscular).',
        'Recoltarea probelor biologice pentru analize de laborator.',
        'Completarea foilor de observație și predarea corectă a turei.',
        'Pregătirea instrumentarului și menținerea curățeniei în cabinetul de tratament.'
      ],
      cerinteLocMunca: [
        'Studii de specialitate (Postliceale sau Universitare sanitare).',
        'Certificat de membru OAMGMAMR vizat la zi.',
        'Asigurare de malpraxis valabilă.'
      ]
    },
    'AsistentInstrumentar': {
      titluPost: 'Asistent Medical de Instrumentar / Săli Operație',
      departament: 'Bloc Operator / Chirurgie',
      subordonatCatre: 'Medic Șef Bloc Operator / Asistent Șef',
      locatie: 'Bloc Operator, Corp B',
      obiective: 'Pregătirea și asigurarea instrumentarului steril necesar intervențiilor chirurgicale și asistarea echipei operatorii.',
      responsabilitati: [
        'Pregătirea sălii de operație și a materialului steril înainte de fiecare intervenție.',
        'Asistarea chirurgului în timpul operației prin servirea corectă și rapidă a instrumentarului.',
        'Verificarea și monitorizarea stocurilor de materiale sanitare sterile.',
        'Respectarea riguroasă a normelor de asepsie și antisepsie în blocul operator.',
        'Predarea instrumentarului folosit către stația de sterilizare după finalizarea intervenției.'
      ],
      cerinteLocMunca: [
        'Diplomă de Asistent Medical Generalist / Specializare în Sala de Operație.',
        'Certificat de membru OAMGMAMR și asigurare de malpraxis.',
        'Rezistență la stres și program prelungit.'
      ]
    },
    'Infirmier': {
      titluPost: 'Infirmier / Infirmieră',
      departament: 'Secția de Îngrijire',
      subordonatCatre: 'Asistent Șef de Secție / Asistentul de Tură',
      locatie: 'Corp A, Saloane Pacienți',
      obiective: 'Asigurarea igienei personale a pacienților imobilizați, menținerea curățeniei în saloane și sprijinirea echipei medicale.',
      responsabilitati: [
        'Efectuarea toaletei zilnice și schimbarea lenjeriei de pat pentru pacienții nedeplasați.',
        'Asigurarea igienei spațiilor comune și a saloanelor conform protocoalelor de curățenie.',
        'Transportul probelor biologice către laborator și a dosarelor medicale între compartimente.',
        'Ajutarea asistenților la poziționarea și mobilizarea pacienților.',
        'Colectarea și transportul deșeurilor menajere și medicale în locurile special amenajate.'
      ],
      cerinteLocMunca: [
        'Școală de infirmiere sau curs de calificare recunoscut.',
        'Apt din punct de vedere medical pentru efort fizic și mediu spitalicesc.'
      ]
    },
    'Brancardier': {
      titluPost: 'Brancardier',
      departament: 'Serviciul Transport / UPU',
      subordonatCatre: 'Asistent Șef / Coordonator Serviciu',
      locatie: 'Toate Corpurile Spitalului',
      obiective: 'Transportul sigur și prompt al pacienților către săli de operație, investigații imagistice sau alte secții.',
      responsabilitati: [
        'Transportul pacienților cu targa, scaunul cu rotile sau pe jos, în condiții de maximă siguranță.',
        'Însoțirea pacienților la investigații paraclinice (RMN, CT, Radiologie, Ecografie).',
        'Transportul produselor biologice, al sângelui și al rezervelor de la banca de sânge.',
        'Asigurarea igienizării și dezinfecției tărgilor și a scaunelor cu rotile după fiecare utilizare.',
        'Colaborarea strânsă cu personalul medical în situații de urgență.'
      ],
      cerinteLocMunca: [
        'Studii medii (școală generală / liceu).',
        'Rezistență la efort fizic susținut și abilități bune de comunicare.'
      ]
    },
    'Ingrijitor': {
      titluPost: 'Îngrijitor de Curățenie (Cleaner)',
      departament: 'Serviciul Curățenie și Dezinfecție',
      subordonatCatre: 'Asistent Șef / Responsabil IGV',
      locatie: 'Toate Spațiile Spitalului',
      obiective: 'Menținerea curățeniei riguroase, a dezinfecției și a igienei totale în spațiile spitalului pentru prevenirea infecțiilor asociate asistenței medicale.',
      responsabilitati: [
        'Efectuarea operațiunilor de curățenie și dezinfecție a pardoselilor, pereților și mobilierului din saloane și coridoare.',
        'Respectarea graficului de curățenie și a diluțiilor corecte pentru substanțele dezinfectante.',
        'Golirea, curățarea și dezinfectarea recipientelor pentru colectarea deșeurilor.',
        'Păstrarea și depozitarea corectă a ustensilelor de curățenie conform normelor SSM.',
        'Semnalarea imediată a oricăror defecțiuni tehnice sau probleme de igienă.'
      ],
      cerinteLocMunca: [
        'Studii medii sau generale.',
        'Cunoașterea și respectarea normelor de igienă și a codurilor de culori pentru curățenie.'
      ]
    },
    'Implicit': {
      titluPost: 'Personal Administrativ / Suport',
      departament: 'Departament Administrativ',
      subordonatCatre: 'Director Administrativ',
      locatie: 'Corp Administrativ',
      obiective: 'Asigurarea suportului logistic și administrativ pentru buna funcționare a unității medicale.',
      responsabilitati: [
        'Gestionarea documentelor oficiale, a registrelor și a corespondenței instituției.',
        'Menținerea legăturii operative cu celelalte departamente din spital.',
        'Respectarea confidențialității datelor conform normelor GDPR.',
        'Elaborarea de rapoarte periodice la solicitarea conducerii.'
      ],
      cerinteLocMunca: [
        'Studii corespunzătoare postului.',
        'Abilități de operare pe calculator și utilizare pachet Office.'
      ]
    }
  };

  // Regulamentul intern standard aplicabil tuturor angajaților
  const regulamentInternStandard = [
    {
      titlu: '1. Program de Lucru și Punctualitate',
      text: 'Tura de zi începe la ora 07:00, iar tura de noapte la ora 19:00. Predarea turei se face obligatoriu în prezența colegilor cu 15 minute înainte.'
    },
    {
      titlu: '2. Cod Vestimentar și Igienă',
      text: 'Echipamentul medical sau uniforma de serviciu completă (ecuson inclus) este obligatorie pe toată durata programului în incinta spitalului.'
    },
    {
      titlu: '3. Norme SSM și PSI',
      text: 'Respectarea strictă a protocoalelor de spălare și dezinfectare a mâinilor, precum și a colectării selective a deșeurilor periculoase.'
    },
    {
      titlu: '4. Relația cu Pacienții și Aparținătorii',
      text: 'Comunicarea se va face pe un ton empatic și profesionist, respectând cu strictețe confidențialitatea datelor medicale.'
    }
  ];

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log("UTILIZATOR CURENT LOGAT:", currentUser); // Vizibil în F12 > Console

    // Preluam rolul direct din baza de date
    const rolUser = (currentUser?.rol || currentUser?.numeRol || currentUser?.functie || '').toLowerCase();

    let fisaSelectata = fiseDisponibile['Implicit'];

    if (rolUser.includes('sefsectie')) {
      fisaSelectata = fiseDisponibile['MedicSef'];
    } else if (rolUser.includes('doctor') || rolUser.includes('medic')) {
      fisaSelectata = fiseDisponibile['Medic'];
    } else if (rolUser.includes('asistentgeneralist')) {
      fisaSelectata = fiseDisponibile['AsistentGeneralist'];
    } else if (rolUser.includes('asistentinstrumentar')) {
      fisaSelectata = fiseDisponibile['AsistentInstrumentar'];
    } else if (rolUser.includes('infirmier')) {
      fisaSelectata = fiseDisponibile['Infirmier'];
    } else if (rolUser.includes('brancardier')) {
      fisaSelectata = fiseDisponibile['Brancardier'];
    } else if (rolUser.includes('ingrijitor') || rolUser.includes('îngrijitor')) {
      fisaSelectata = fiseDisponibile['Ingrijitor'];
    }

    setDateFisa({
      ...fisaSelectata,
      regulamentIntern: regulamentInternStandard
    });
  }, []);

  if (!dateFisa) {
    return <div style={styles.container}>Se încarcă fișa postului...</div>;
  }

  return (
    <div style={styles.container}>
      <button 
        onClick={() => navigate('/angajat')} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi
      </button>

      <h2>Documente Oficiale & Responsabilități</h2>

      {/* Bara de Navigare intre Tab-uri */}
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === 'fisa' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('fisa')}
        >
          📋 Fișa Postului
        </button>
        <button 
          style={activeTab === 'regulament' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('regulament')}
        >
          🏥 Regulament Intern Spital
        </button>
      </div>

      {/* CONTINUT TAB 1: FISA POSTULUI */}
      {activeTab === 'fisa' && (
        <div style={styles.card}>
          <div style={styles.headerPost}>
            <h3 style={{ margin: 0 }}>{dateFisa.titluPost}</h3>
            <span style={styles.badge}>{dateFisa.departament}</span>
          </div>

          <div style={styles.infoMeta}>
            <p><strong>Subordonat către:</strong> {dateFisa.subordonatCatre}</p>
            <p><strong>Locație:</strong> {dateFisa.locatie}</p>
          </div>

          <hr style={styles.separator} />

          <h4>🎯 Obiectivul Principal al Postului</h4>
          <p style={styles.textBlock}>{dateFisa.obiective}</p>
          <br /> <br />
          <h4>📌 Responsabilități și Atribuții Zilnice</h4>
          <ul style={styles.list}>
            {dateFisa.responsabilitati.map((item, index) => (
              <li key={index} style={styles.listItem}>✓ {item}</li>
            ))}
          </ul>
          <br /> <br />
          <h4>🎓 Cerințe și Calificări Obligatorii</h4>
          <ul style={styles.list}>
            {dateFisa.cerinteLocMunca.map((item, index) => (
              <li key={index} style={styles.listItem}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CONTINUT TAB 2: REGULAMENT INTERN */}
      {activeTab === 'regulament' && (
        <div style={styles.card}>
          <h3>Regulamentul Intern al Spitalului</h3>
          <p style={styles.subtext}>
            Toți angajații au obligația de a cunoaște și de a respecta regulile de conduită și siguranță de mai jos.
          </p>

          <div style={styles.rulesContainer}>
            {dateFisa.regulamentIntern.map((rule, index) => (
              <div key={index} style={styles.ruleCard}>
                <h4 style={styles.ruleTitle}>{rule.titlu}</h4>
                <p style={styles.ruleText}>{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '750px',
    margin: '20px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f9',
    minHeight: '100vh',
    borderRadius: '8px',
    textAlign: 'left'
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tab: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ccc',
    backgroundColor: '#e9ecef',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center'
  },
  activeTab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    backgroundColor: '#0066cc',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '6px',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'left'
  },
  headerPost: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  badge: {
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  infoMeta: {
    backgroundColor: '#f8f9fa',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#444',
    textAlign: 'left'
  },
  separator: {
    margin: '20px 0',
    border: '0',
    borderTop: '1px solid #eee'
  },
  textBlock: {
    lineHeight: '1.6',
    color: '#333',
    textAlign: 'left'
  },
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
    margin: '10px 0',
    textAlign: 'left'
  },
  listItem: {
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
    color: '#444',
    textAlign: 'left'
  },
  subtext: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'left'
  },
  rulesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  ruleCard: {
    borderLeft: '4px solid #0066cc',
    backgroundColor: '#f8f9fa',
    padding: '12px 15px',
    borderRadius: '0 6px 6px 0',
    textAlign: 'left'
  },
  ruleTitle: {
    margin: '0 0 5px 0',
    color: '#0066cc',
    textAlign: 'left'
  },
  ruleText: {
    margin: 0,
    fontSize: '14px',
    color: '#444',
    lineHeight: '1.5',
    textAlign: 'left'
  }
};

export default FisaPostului;