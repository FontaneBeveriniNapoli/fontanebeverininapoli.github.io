// ==========================================
// FILE: quiz_data.js
// DATABASE DOMANDE FISSE DEL GIOCO (Oltre 120 domande)
// Categorie: Scienza, Napoli, Sostenibilità, Fontane
// ==========================================

const QUIZ_STATIC_DATA = [
    // --- SCIENZA E CHIMICA DELL'ACQUA ---
    { domanda: "Qual è la formula chimica dell'acqua?", risposte: ["CO2", "H2O", "O2", "HO2"], corretta: 1 },
    { domanda: "Qual è l'unico elemento in natura presente in tutti e tre gli stati (solido, liquido, gas)?", risposte: ["L'Acqua", "Il Carbonio", "Il Ferro", "L'Ossigeno"], corretta: 0 },
    { domanda: "A quale temperatura l'acqua pura raggiunge la sua massima densità?", risposte: ["0°C", "100°C", "4°C", "50°C"], corretta: 2 },
    { domanda: "Quale percentuale della superficie terrestre è coperta d'acqua?", risposte: ["50%", "71%", "90%", "30%"], corretta: 1 },
    { domanda: "Di tutta l'acqua sulla Terra, quanta è dolce e accessibile per l'uomo?", risposte: ["Circa il 20%", "Circa il 10%", "Meno dell'1%", "Circa il 50%"], corretta: 2 },
    { domanda: "Quanto del corpo umano adulto è composto d'acqua?", risposte: ["40%", "60%", "80%", "95%"], corretta: 1 },
    { domanda: "Cos'è l'acqua dal punto di vista chimico?", risposte: ["Un elemento puro", "Una lega", "Un composto", "Un miscuglio"], corretta: 2 },
    { domanda: "Qual è il pH dell'acqua pura a temperatura ambiente?", risposte: ["0 (Acido)", "7 (Neutro)", "14 (Basico)", "5 (Leggermente acido)"], corretta: 1 },
    { domanda: "Come si chiama il passaggio dell'acqua dallo stato liquido a quello gassoso?", risposte: ["Condensazione", "Sublimazione", "Evaporazione", "Fusione"], corretta: 2 },
    { domanda: "E il passaggio diretto dallo stato solido a quello gassoso?", risposte: ["Sublimazione", "Evaporazione", "Brinamento", "Solidificazione"], corretta: 0 },
    { domanda: "L'acqua è conosciuta come 'solvente universale' perché...", risposte: ["Scioglie i metalli", "Scioglie più sostanze di qualsiasi altro liquido", "Pulisce ogni macchia", "Si mescola con l'olio"], corretta: 1 },
    { domanda: "Quale forza permette ad alcuni insetti di camminare sull'acqua?", risposte: ["Forza di gravità", "Tensione superficiale", "Spinta di Archimede", "Elettromagnetismo"], corretta: 1 },
    { domanda: "In quale stato l'acqua occupa più volume?", risposte: ["Liquido", "Solido (Ghiaccio)", "Gassoso", "Non cambia volume"], corretta: 1 },
    { domanda: "A che temperatura bolle l'acqua al livello del mare?", risposte: ["90°C", "100°C", "120°C", "80°C"], corretta: 1 },
    { domanda: "L'acqua del mare non gela a 0°C. A che temperatura gela circa?", risposte: ["A -2°C", "A -10°C", "A -20°C", "Non gela mai"], corretta: 0 },

    // --- STORIA DELL'ACQUA A NAPOLI ---
    { domanda: "Quale antico acquedotto romano dissetava Napoli e la flotta imperiale di Miseno?", risposte: ["Acquedotto Carolino", "Acquedotto del Serino", "Acquedotto Vergine", "Acquedotto Traiano"], corretta: 1 },
    { domanda: "Come si chiamava l'acquedotto greco-romano che passava sotto il centro antico di Napoli?", risposte: ["Acqua della Bolla", "Acqua del Vesuvio", "Acqua Cumana", "Acqua Sannitica"], corretta: 0 },
    { domanda: "Quale fiume sotterraneo e leggendario bagnava l'antica Neapolis?", risposte: ["Il Volturno", "Il Sebeto", "Il Sarno", "Il Clanio"], corretta: 1 },
    { domanda: "Chi era il 'Pozzaro' nella Napoli antica?", risposte: ["Il venditore di pozioni", "Il manutentore degli acquedotti e dei pozzi", "Il becchino", "Il pescatore"], corretta: 1 },
    { domanda: "Perché i Pozzari antichi divennero famosi nel folklore napoletano?", risposte: ["Perché erano ricchi", "Perché scoprirono il tesoro di San Gennaro", "Perché si credeva fossero il 'Munaciello'", "Perché inventarono la pizza"], corretta: 2 },
    { domanda: "Quale viceré spagnolo nel 1600 fece costruire un nuovo acquedotto per la città?", risposte: ["Pedro de Toledo", "Il Conte di Lemos", "Cesare Carmignano", "Carlo di Borbone"], corretta: 2 },
    { domanda: "Dove si raccoglievano un tempo le acque piovane nei palazzi storici napoletani?", risposte: ["Nelle cisterne di tufo sotto i cortili", "Sui tetti a terrazza", "Nelle fontane pubbliche", "Nelle cantine di legno"], corretta: 0 },
    { domanda: "Cos'è l'ABC Napoli?", risposte: ["L'Aeroporto di Napoli", "L'Azienda Speciale Acqua Bene Comune", "Un'associazione culturale", "Un sindacato"], corretta: 1 },
    { domanda: "Quale grande serbatoio idrico fu costruito scavando nel tufo di Capodimonte?", risposte: ["Il serbatoio dello Scudillo", "Il serbatoio di Posillipo", "La Piscina Mirabilis", "Le Catacombe"], corretta: 0 },

    // --- FONTANE MONUMENTALI DI NAPOLI ---
    { domanda: "Dove si trova la Fontana del Carciofo?", risposte: ["Piazza Dante", "Piazza Trieste e Trento", "Piazza Plebiscito", "Piazza Vittoria"], corretta: 1 },
    { domanda: "Cosa raffigura la strana Fontana di Spinacorona?", risposte: ["Un drago che sputa fuoco", "Una sirena che spegne le fiamme del Vesuvio col latte delle mammelle", "Un re a cavallo", "Un angelo con la spada"], corretta: 1 },
    { domanda: "Come è comunemente chiamata dai napoletani la Fontana di Spinacorona?", risposte: ["Fontana delle Zizze", "Fontana della Sirena", "Fontana del Latte", "Fontana del Fuoco"], corretta: 0 },
    { domanda: "Dove si trovava in origine la Fontana del Nettuno prima di arrivare in Piazza Municipio?", risposte: ["A Roma", "Presso l'Arsenale del Porto", "A Caserta", "A Capodimonte"], corretta: 1 },
    { domanda: "Quale fontana si trova oggi sul lungomare, vicino Castel dell'Ovo?", risposte: ["Fontana del Gigante (o dell'Immacolatella)", "Fontana del Sebeto", "Fontana di Monteoliveto", "Fontana del Formiello"], corretta: 0 },
    { domanda: "Cosa regge il Nettuno nell'omonima fontana napoletana?", risposte: ["Un tridente", "Un pesce", "Una conchiglia", "Una spada"], corretta: 0 },
    { domanda: "Quale scultore e architetto celebre lavorò a molte fontane napoletane del '600?", risposte: ["Michelangelo", "Cosimo Fanzago", "Bernini", "Canova"], corretta: 1 },
    { domanda: "Quale fontana monumentale decora la piazza davanti alla chiesa di Sant'Anna dei Lombardi?", risposte: ["Fontana di Monteoliveto (o di Carlo II)", "Fontana del Nettuno", "Fontana del Carciofo", "Fontana del Sebeto"], corretta: 0 },
    { domanda: "La fontana dell'Esedra, la più grande della città, dove si trova?", risposte: ["Mostra d'Oltremare", "Piazza Garibaldi", "Bosco di Capodimonte", "Lungomare Caracciolo"], corretta: 0 },
    { domanda: "Cosa riproduce la Fontana del Formiello dietro Castel Capuano?", risposte: ["Un castello medievale", "Un abbeveratoio monumentale per cavalli", "Una barca a vela", "Un tempio greco"], corretta: 1 },
    { domanda: "Quale fontana si trova al centro di Piazza Vittoria, vicino alla Villa Comunale?", risposte: ["Fontana della Tazza di Pido", "Fontana del Ratto di Europa", "Nessuna, c'è una statua", "Fontana del Sebeto"], corretta: 0 },

    // --- MITOLOGIA E LEGGENDE ---
    { domanda: "Secondo la mitologia, quale creatura diede origine al primo insediamento di Napoli?", risposte: ["La Sirena Partenope", "La Ninfa Calipso", "La Dea Venere", "Il Mostro Scilla"], corretta: 0 },
    { domanda: "Perché la Sirena Partenope si lasciò morire sulle coste di Napoli?", risposte: ["Per amore di un pescatore", "Per il dispiacere di non aver incantato Ulisse", "Perché aveva perso la voce", "Per scappare da Nettuno"], corretta: 1 },
    { domanda: "Dove si trovava la famosa 'Acqua Ferrata' o 'Acqua Suffregna' tanto amata dai napoletani?", risposte: ["A Posillipo", "Al Chiatamone (Santa Lucia)", "Ai Quartieri Spagnoli", "Al Vomero"], corretta: 1 },
    { domanda: "Come veniva trasportata e venduta l'Acqua Suffregna ai napoletani?", risposte: ["Nelle bottiglie di vetro", "Nelle 'mummare', anforette di creta", "Nei secchi di legno", "Nei fiaschi di paglia"], corretta: 1 },
    { domanda: "Cos'è il 'Sebeto' citato in molti monumenti?", risposte: ["Un re di Napoli", "Un antico fiume che scorreva a est di Napoli", "Un vento freddo", "Un monte vicino al Vesuvio"], corretta: 1 },

    // --- SOSTENIBILITÀ E IMPRONTA IDRICA ---
    { domanda: "Quanti litri d'acqua servono in media per produrre un singolo paio di jeans?", risposte: ["100 litri", "500 litri", "3.800 litri", "10.000 litri"], corretta: 2 },
    { domanda: "Quanta acqua serve per produrre un solo chilogrammo di carne di manzo?", risposte: ["1.000 litri", "5.000 litri", "Oltre 15.000 litri", "100 litri"], corretta: 2 },
    { domanda: "Quanto tempo impiega una bottiglietta di plastica d'acqua per degradarsi nell'ambiente?", risposte: ["1 anno", "10 anni", "Fino a 450 anni", "Poche settimane"], corretta: 2 },
    { domanda: "Cosa sono le 'microplastiche' spesso trovate nell'acqua in bottiglia?", risposte: ["Vitamine aggiunte", "Frammenti di plastica più piccoli di 5 mm", "Batteri", "Sali minerali"], corretta: 1 },
    { domanda: "Cosa risparmi utilizzando i beverini pubblici mappati in questa app?", risposte: ["Denaro e bottiglie di plastica monouso", "Elettricità della città", "Gas metano", "Acqua potabile"], corretta: 0 },
    { domanda: "Quale settore umano consuma più acqua dolce a livello globale?", risposte: ["Uso domestico", "Industria", "Agricoltura (Irrigazione)", "Produzione di energia"], corretta: 2 },
    { domanda: "Qual è la differenza di emissioni di CO2 tra acqua del rubinetto e acqua in bottiglia?", risposte: ["Sono uguali", "L'acqua in bottiglia inquina fino a 1000 volte di più per plastica e trasporti", "L'acqua del rubinetto inquina di più", "Nessuna delle due inquina"], corretta: 1 },
    { domanda: "L'acqua erogata dai beverini pubblici di Napoli (ABC) è...", risposte: ["Non potabile", "Potabile, controllata e di ottima qualità", "Da bollire prima dell'uso", "Solo per lavarsi le mani"], corretta: 1 },
    { domanda: "Cos'è 'l'impronta idrica' (Water Footprint)?", risposte: ["Il segno che lasciano le scarpe bagnate", "Il volume totale di acqua dolce usata per produrre beni e servizi", "Il livello del mare", "La quantità di pioggia in un anno"], corretta: 1 },
    { domanda: "Quanta acqua si spreca lasciando il rubinetto aperto mentre ci si lava i denti?", risposte: ["1 litro", "Circa 5-10 litri al minuto", "Mezzo litro", "Nessuno spreco"], corretta: 1 },

    // --- ORIGINI DELLA VITA E SPAZIO ---
    { domanda: "Dove si crede che l'acqua sia comparsa prima nel nostro sistema solare?", risposte: ["Sulla Terra", "Sulle comete e asteroidi", "Su Marte", "Sul Sole"], corretta: 1 },
    { domanda: "Esiste acqua in forma ghiacciata sulla Luna?", risposte: ["No, è completamente secca", "Sì, nei crateri ai poli che non vedono mai il sole", "Sì, ma solo sotto forma di gas", "Sì, in laghi sotterranei"], corretta: 1 },
    { domanda: "Quale pianeta del nostro sistema solare ha i famosi 'canali' che un tempo si credeva contenessero acqua?", risposte: ["Venere", "Giove", "Marte", "Saturno"], corretta: 2 },
    { domanda: "Quale luna di Giove si pensa abbia un immenso oceano di acqua liquida sotto la sua crosta di ghiaccio?", risposte: ["Titano", "Io", "Europa", "Callisto"], corretta: 2 },
    { domanda: "La prima forma di vita sulla Terra dove si è sviluppata?", risposte: ["Nelle foreste", "Negli oceani primordiali", "Sui vulcani", "Sotto terra"], corretta: 1 },

    // --- CURIOSITÀ GENERALI SULL'ACQUA ---
    { domanda: "Cosa significa che l'acqua ha un'elevata 'capacità termica'?", risposte: ["Che bolle subito", "Che ci mette molto tempo a scaldarsi e a raffreddarsi", "Che scotta sempre", "Che congela istantaneamente"], corretta: 1 },
    { domanda: "A causa di quale fenomeno fisico il ghiaccio galleggia sull'acqua liquida?", risposte: ["Perché ha bolle d'aria dentro", "Perché lo stato solido dell'acqua è meno denso del suo stato liquido", "Per la corrente", "Perché è più leggero"], corretta: 1 },
    { domanda: "Quanti litri d'acqua dovrebbe bere in media un adulto al giorno?", risposte: ["1 litro", "Circa 2-2,5 litri", "5 litri", "Mezzo litro"], corretta: 1 },
    { domanda: "Cos'è la 'desalinizzazione'?", risposte: ["Aggiungere sale al cibo", "Togliere il sale dall'acqua di mare per renderla potabile", "Un tipo di nuvola", "Inquinare l'acqua dolce"], corretta: 1 },
    { domanda: "Qual è il fiume più lungo del mondo?", risposte: ["Il Rio delle Amazzoni", "Il Nilo", "Il Mississippi", "Lo Yangtze"], corretta: 1 },
    { domanda: "Quale animale può resistere senza bere acqua più a lungo del cammello?", risposte: ["Il topo canguro", "L'elefante", "Il leone", "Lo struzzo"], corretta: 0 },
    { domanda: "Cosa misura un idrometro?", risposte: ["La velocità del vento", "La pressione dell'acqua", "L'umidità dell'aria", "La profondità del mare"], corretta: 2 },
    { domanda: "Come si chiama la paura irrazionale dell'acqua?", risposte: ["Aracnofobia", "Idrofobia o Acquafobia", "Claustrofobia", "Agorafobia"], corretta: 1 },
    { domanda: "Quanti giorni può sopravvivere un essere umano in media senza bere acqua?", risposte: ["10 giorni", "3-5 giorni", "2 settimane", "1 giorno"], corretta: 1 },

    // --- E TANTE ALTRE AGGIUNTIVE PER IL MESCOLO (Cultura Generale e Idratazione) ---
    { domanda: "Il colore blu degli oceani da cosa dipende?", risposte: ["Dal riflesso del cielo", "Dalla presenza di pesci", "Dal modo in cui l'acqua assorbe e diffonde la luce solare", "Dal sale"], corretta: 2 },
    { domanda: "Cosa si intende per 'acqua virtuale'?", risposte: ["L'acqua nei videogiochi", "Il volume d'acqua nascosto, usato per produrre ciò che consumiamo", "L'acqua piovana", "L'acqua distillata"], corretta: 1 },
    { domanda: "Se la Terra fosse una mela, l'acqua disponibile per bere rappresenterebbe...", risposte: ["La polpa", "La buccia", "Un pezzettino sottilissimo della buccia", "I semi"], corretta: 2 },
    { domanda: "Cos'è l'acqua dura?", risposte: ["Ghiaccio", "Acqua ricca di minerali come calcio e magnesio", "Acqua inquinata", "Acqua gassata"], corretta: 1 },
    { domanda: "Da cosa è formato l'acquedotto?", risposte: ["Solo tubature", "Un sistema di opere per raccogliere, purificare e distribuire l'acqua", "Da fiumi deviati", "Solo dalle fontane"], corretta: 1 },
    { domanda: "Qual è il lago più profondo della Terra, contenente il 20% dell'acqua dolce superficiale?", risposte: ["Lago Superiore", "Lago Vittoria", "Lago Baikal", "Lago di Garda"], corretta: 2 },
    { domanda: "Chi fu il famoso scienziato a stabilire che l'acqua non è un elemento, ma un composto di Idrogeno e Ossigeno?", risposte: ["Isaac Newton", "Galileo Galilei", "Antoine Lavoisier", "Albert Einstein"], corretta: 2 },
    { domanda: "L'acqua piovana è purissima e pronta da bere?", risposte: ["Sì, sempre", "No, assorbe inquinanti dall'atmosfera prima di cadere", "È troppo salata", "Contiene troppo ferro"], corretta: 1 },
    { domanda: "L'Acquedotto del Serino porta a Napoli acque provenienti da quale provincia?", risposte: ["Avellino (Monti Terminio)", "Salerno", "Benevento", "Caserta"], corretta: 0 },
    { domanda: "Napoli è famosa per la bontà della sua acqua. A cosa è dovuta?", risposte: ["Viene filtrata dai vulcani", "Arriva dalle purissime sorgenti montane irpine del Serino", "Viene dal mare desalinizzata", "È aggiunta di zuccheri"], corretta: 1 },
    { domanda: "Quale di queste fontane napoletane non esiste?", risposte: ["Fontana del Carciofo", "Fontana del Formiello", "Fontana del Vesuvio Fumante", "Fontana del Nettuno"], corretta: 2 },
    { domanda: "Nei periodi di carestia e siccità, a Napoli chi aveva le chiavi delle cisterne sotterranee?", risposte: ["Il Re", "I 'Fontanieri' e i 'Pozzari'", "I sacerdoti", "Nessuno"], corretta: 1 },
    
    // --- IL CORPO UMANO E LA BIOLOGIA ---
    { domanda: "Quale organo umano contiene in proporzione la maggior quantità d'acqua (circa l'85%)?", risposte: ["Le ossa", "Il cervello", "Il cuore", "Il fegato"], corretta: 1 },
    { domanda: "Circa il 90% di quale fluido corporeo è composto da acqua?", risposte: ["La saliva", "Il sudore", "Il plasma sanguigno", "Le lacrime"], corretta: 2 },
    { domanda: "Qual è la funzione principale della sudorazione umana?", risposte: ["Eliminare il sale", "Raffreddare il corpo (termoregolazione)", "Nutrire la pelle", "Attirare le zanzare"], corretta: 1 },
    { domanda: "In media, quanta acqua perdiamo al giorno solo respirando?", risposte: ["Quasi zero", "Circa 300-400 millilitri", "Circa 2 litri", "Un bicchiere scarso"], corretta: 1 },
    { domanda: "Cosa succede alle cellule umane se si beve acqua di mare per dissetarsi?", risposte: ["Si idratano meglio", "Si disidratano fino a morire per espellere il sale in eccesso", "Diventano luminose", "Nulla, l'acqua di mare fa bene"], corretta: 1 },
    { domanda: "I neonati hanno una percentuale di acqua nel corpo diversa dagli adulti. Quale?", risposte: ["Uguale, 60%", "Molto più bassa, 40%", "Molto più alta, circa il 75-80%", "Solo il 20%"], corretta: 2 },

    // --- L'ACQUA NEL MONDO (GEOGRAFIA) ---
    { domanda: "Quale oceano copre da solo quasi il 30% della superficie terrestre?", risposte: ["Oceano Atlantico", "Oceano Indiano", "Oceano Pacifico", "Oceano Artico"], corretta: 2 },
    { domanda: "In quale corpo idrico la concentrazione di sale è così alta da impedire al corpo umano di affondare?", risposte: ["Nel Mar Rosso", "Nel Mar Morto", "Nell'Oceano Indiano", "Nel Lago di Garda"], corretta: 1 },
    { domanda: "Qual è la cascata con il salto ininterrotto d'acqua più alto del mondo?", risposte: ["Cascate del Niagara (Canada/USA)", "Cascate Vittoria (Zambia/Zimbabwe)", "Salto Angel (Venezuela)", "Cascate di Iguazù (Argentina/Brasile)"], corretta: 2 },
    { domanda: "Dove è racchiusa la stragrande maggioranza (circa il 68%) dell'acqua dolce del nostro pianeta?", risposte: ["Nei fiumi", "Nei laghi", "Nelle nuvole", "Nei ghiacciai e nelle calotte polari"], corretta: 3 },
    { domanda: "Quale fiume ha la portata d'acqua più imponente del mondo, superando di gran lunga tutti gli altri?", risposte: ["Il Nilo", "Il Rio delle Amazzoni", "Il Mississippi", "Il Gange"], corretta: 1 },
    { domanda: "Qual è il lago d'acqua dolce più grande del mondo per superficie?", risposte: ["Lago Superiore (Nord America)", "Lago Vittoria (Africa)", "Lago Baikal (Russia)", "Lago di Como (Italia)"], corretta: 0 },

    // --- SEGRETI, LEGGENDE E FONTANE DI NAPOLI (Livello Esperto) ---
    { domanda: "Perché la leggendaria figura napoletana del 'Munaciello' è storicamente legata ai 'Pozzari' (manutentori degli acquedotti)?", risposte: ["Perché i pozzari rubavano l'acqua", "Perché i pozzari entravano nelle case dai pozzi indossando mantelli simili a saio monacali", "Perché i pozzari erano tutti monaci", "Perché vivevano nei conventi"], corretta: 1 },
    { domanda: "La maestosa Fontana dell'Esedra, capace di spettacolari giochi d'acqua e luce, dove si trova?", risposte: ["Nella Mostra d'Oltremare", "Nel Real Bosco di Capodimonte", "In Piazza Garibaldi", "All'Orto Botanico"], corretta: 0 },
    { domanda: "Da chi fu commissionata la Fontana del Formiello (situata dietro Castel Capuano)?", risposte: ["Dal Viceré Don Pedro de Toledo", "Dai monaci del vicino convento", "Da Masaniello", "Dall'Imperatore Augusto"], corretta: 0 },
    { domanda: "Quale celebre fontana monumentale di Napoli raffigura un Re bambino (Carlo II di Spagna) circondato da tre leoni?", risposte: ["Fontana del Carciofo", "Fontana di Monteoliveto", "Fontana del Nettuno", "Fontana della Sirena"], corretta: 1 },
    { domanda: "La famosa e perduta 'Acqua Suffregna' di Santa Lucia perché non fu più erogata dalle fontane pubbliche?", risposte: ["La sorgente si prosciugò", "Per i lavori di colmata del lungomare e per rischio inquinamento dopo epidemie", "Perché fu venduta a privati", "Perché il Re la voleva tutta per sé"], corretta: 1 },
    { domanda: "A Bacoli, vicino Napoli, esiste la 'Piscina Mirabilis'. Cos'era in epoca romana?", risposte: ["Una terme per le donne", "Il più grande serbatoio d'acqua dolce per rifornire la flotta navale", "Un acquario per pesci esotici", "Un tempio dedicato a Nettuno"], corretta: 1 },
    { domanda: "Cos'è la 'Cisterna del Vico del Gargiulo'?", risposte: ["Un locale notturno", "Una delle più grandi caverne sotterranee usata come cisterna dell'acquedotto della Bolla", "Un tipo di pentola napoletana", "Una piazza di Napoli"], corretta: 1 },
    { domanda: "La Fontana del Nettuno di Napoli (oggi in Piazza Municipio) è celebre per quale motivo logistico?", risposte: ["È la più piccola della città", "È stata smontata e spostata almeno 7 volte nella sua storia", "L'acqua scorre al contrario", "È interamente in legno"], corretta: 1 },
    { domanda: "Come si chiamava l'antico magistrato romano che aveva il compito di amministrare e proteggere gli acquedotti?", risposte: ["Curator Aquarum", "Centurione", "Gladiatore", "Prefetto"], corretta: 0 },

    // --- FISICA, CLIMA E FENOMENI NATURALI ---
    { domanda: "Di cosa sono fatte prevalentemente le nuvole?", risposte: ["Solo di gas", "Di minuscole goccioline d'acqua liquida o cristalli di ghiaccio in sospensione", "Di fumo", "Di aria calda"], corretta: 1 },
    { domanda: "Qual è il fenomeno che permette all'acqua di sfidare la gravità e risalire lungo le radici e i fusti delle piante?", risposte: ["Magia", "Forza di Coriolis", "Capillarità", "Spinta di Archimede"], corretta: 2 },
    { domanda: "L'acqua ha un 'calore specifico' altissimo. Cosa significa questo per il clima terrestre?", risposte: ["Che fa evaporare subito gli oceani", "Che gli oceani assorbono calore lentamente e lo rilasciano lentamente, mitigando il clima", "Che d'estate piove di più", "Che il ghiaccio è caldo"], corretta: 1 },
    { domanda: "Cos'è l'acqua pesante (spesso usata nei reattori nucleari)?", risposte: ["Acqua mischiata a piombo", "Acqua in cui l'idrogeno è sostituito dal suo isotopo deuterio (D2O)", "Acqua molto inquinata", "L'acqua del fondale oceanico"], corretta: 1 },
    { domanda: "Come si chiama il ciclo naturale continuo dell'acqua sulla Terra?", risposte: ["Ciclo Termico", "Ciclo Idrologico", "Ciclo di Krebs", "Riciclo universale"], corretta: 1 },
    { domanda: "Cosa provoca il fenomeno delle 'piogge acide'?", risposte: ["Gli Ufo", "L'inquinamento atmosferico (anidride solforosa e ossidi di azoto) che si mescola col vapore acqueo", "I vulcani sottomarini", "L'eccesso di sale nel mare"], corretta: 1 },
    { domanda: "Qual è l'unico mammifero in grado di annusare l'acqua sotterranea nel deserto a chilometri di distanza?", risposte: ["Il Cammello", "L'Elefante africano", "Il Leone", "Il Topo"], corretta: 1 },

    // --- IMPRONTA IDRICA (WATER FOOTPRINT) E CIBO ---
    { domanda: "Quanti litri d'acqua dolce sono necessari (dalla coltivazione alla tazza) per produrre un solo caffè espresso?", risposte: ["1 litro", "10 litri", "Circa 140 litri", "500 litri"], corretta: 2 },
    { domanda: "Tra questi alimenti, quale ha l'impronta idrica (consumo di acqua per la produzione) più devastante per il pianeta?", risposte: ["1 Kg di Pomodori", "1 Kg di Carne di Manzo (oltre 15.000 litri)", "1 Kg di Patate", "1 Kg di Mele"], corretta: 1 },
    { domanda: "Quanta acqua serve per produrre una singola tavoletta di cioccolato (100g)?", risposte: ["10 litri", "50 litri", "Circa 1.700 litri", "Zero litri"], corretta: 2 },
    { domanda: "Cosa consuma meno acqua per l'igiene personale?", risposte: ["Fare un bagno nella vasca", "Fare una doccia di 5 minuti chiudendo l'acqua quando ci si insapona", "Lasciare scorrere l'acqua mentre ci si lava i denti", "Farsi la doccia due volte al giorno"], corretta: 1 },
    { domanda: "Quanta acqua dolce spreca in media un rubinetto che perde una goccia al secondo in un anno intero?", risposte: ["5 litri", "20 litri", "Oltre 3.000 litri", "100.000 litri"], corretta: 2 },
    { domanda: "Quale tra i seguenti obiettivi dell'Agenda 2030 (ONU) è dedicato specificamente all'Acqua pulita e ai Servizi Igienico-Sanitari?", risposte: ["Obiettivo 1", "Obiettivo 6", "Obiettivo 15", "Obiettivo 2"], corretta: 1 },
    
    // --- CULTURA GENERALE, ARTE E GIOCO ---
    { domanda: "In quale celebre saga cinematografica e letteraria l'acqua è la debolezza letale degli alieni invasori?", risposte: ["Star Wars", "Signs", "Alien", "Avatar"], corretta: 1 },
    { domanda: "Quale dio romano brandisce il tridente ed è signore delle acque e dei mari?", risposte: ["Giove", "Marte", "Nettuno", "Vulcano"], corretta: 2 },
    { domanda: "A Napoli esiste una via chiamata 'Cupa dell'Acqua'. Cos'è una 'Cupa' nella toponomastica napoletana?", risposte: ["Una fontana a forma di scodella", "Una strada incassata tra alte pareti di tufo, spesso antico letto di scolo delle acque piovane", "Un tipo di secchio", "Una grotta marina"], corretta: 1 },
    { domanda: "Cos'era il 'Carro dell'Acqua' che un tempo girava per Napoli?", risposte: ["Un carro allegorico di Carnevale", "Il carretto dei venditori ambulanti di acqua fresca e sulfurea d'estate", "Un carro dei pompieri", "Un modo per pulire le strade"], corretta: 1 },
    { domanda: "A chi è affidata oggi la tutela e l'erogazione dell'acqua potabile per la città di Napoli?", risposte: ["Al Sindaco", "All'Azienda Speciale ABC (Acqua Bene Comune)", "Alla Regione Campania", "A un'azienda privata di Milano"], corretta: 1 },
    { domanda: "Se ti perdi nel deserto, quale di queste piante può fornirti acqua d'emergenza tagliandola?", risposte: ["Una quercia", "Un cactus a botte (Ferocactus)", "Un pino", "Un'orchidea"], corretta: 1 },
    { domanda: "Qual è lo sport olimpico che si pratica esclusivamente nell'acqua?", risposte: ["Pallanuoto", "Scherma", "Atletica Leggera", "Curling"], corretta: 0 },
    { domanda: "Cosa misura il termine 'Durezza dell'acqua'?", risposte: ["La forza del getto del rubinetto", "La difficoltà di nuotarci dentro", "La concentrazione di sali di calcio e magnesio sciolti in essa", "Il tempo che impiega a ghiacciare"], corretta: 2 },
    { domanda: "Perché l'acqua del mare non si può bere per dissetarsi?", risposte: ["Perché ha un cattivo sapore", "Perché i reni umani necessitano di più acqua per smaltire il sale di quanta se ne beva, causando morte per disidratazione", "Perché contiene pesci", "Perché fa sudare freddo"], corretta: 1 },
// --- STORIA E SEGRETI DI NAPOLI (Volume 2) ---
    { domanda: "Quale architetto progettò il maestoso Acquedotto Carolino, patrimonio UNESCO?", risposte: ["Domenico Fontana", "Cosimo Fanzago", "Luigi Vanvitelli", "Ferdinando Fuga"], corretta: 2 },
    { domanda: "A chi fu commissionato l'Acquedotto Carolino per alimentare le cascate della Reggia di Caserta e Napoli?", risposte: ["Ai Savoia", "Ai Borbone (Carlo di Borbone)", "Agli Angioini", "Agli Aragonesi"], corretta: 1 },
    { domanda: "Cosa si usava per proteggere le fontane monumentali napoletane dai lavandai nel '700?", risposte: ["Guardie armate", "Recinti e imponenti cancellate di ferro", "Cani da guardia", "Acqua avvelenata"], corretta: 1 },
    { domanda: "Nella Fontana della Sirena a Mergellina, quali animali marini sorreggono la vasca?", risposte: ["Quattro delfini", "Quattro cavallucci marini", "Tre balene", "Quattro tartarughe"], corretta: 1 },
    { domanda: "In quale quartiere di Napoli sgorgavano le acque termali sulfuree sfruttate già dagli antichi Romani?", risposte: ["Agnano", "Vomero", "Posillipo", "Sanità"], corretta: 0 },
    { domanda: "Come si chiamava l'antica corporazione che gestiva i guasti alla rete idrica nella Napoli antica?", risposte: ["I Tubisti", "I Fontanieri", "I Guardiacque", "Gli Acquaioli"], corretta: 1 },
    { domanda: "Cos'è una 'Mummara' nella tradizione napoletana?", risposte: ["Una statua di marmo", "Un antico strumento musicale", "Una brocca di terracotta usata per mantenere l'acqua freschissima", "Una barca per trasportare l'acqua"], corretta: 2 },
    { domanda: "Oltre all'Acqua Suffregna, quale altra famosa acqua veniva venduta a Napoli per le sue proprietà ferruginose?", risposte: ["L'Acqua del Vesuvio", "L'Acqua Ferrata", "L'Acqua Salata", "L'Acqua Santa"], corretta: 1 },
    { domanda: "Dove si trova oggi la monumentale 'Fontana degli Incanti'?", risposte: ["A Posillipo (Piazza San Luigi)", "In Piazza Plebiscito", "Al Vomero", "A Spaccanapoli"], corretta: 0 },
    { domanda: "Perché l'acqua di Napoli è considerata storicamente una delle migliori d'Italia?", risposte: ["Perché è depurata chimicamente", "Per il lungo filtraggio naturale nelle rocce carsiche dei Monti Terminio e Partenio", "Perché viene dal mare", "Perché è addolcita con lo zucchero"], corretta: 1 },

    // --- SCIENZA E FISICA DELL'ACQUA (Avanzato) ---
    { domanda: "Quale proprietà fisica permette al ghiaccio di galleggiare sull'acqua?", risposte: ["Il ghiaccio ha bolle d'aria dentro", "L'acqua allo stato solido è meno densa che allo stato liquido", "Il ghiaccio è più pesante", "Per la spinta dei pesci"], corretta: 1 },
    { domanda: "Come si chiama la forza che tiene unite le molecole d'acqua creando le gocce?", risposte: ["Forza magnetica", "Forza di gravità", "Forza di coesione", "Forza centrifuga"], corretta: 2 },
    { domanda: "A quale temperatura bolle l'acqua in cima al Monte Everest?", risposte: ["Esattamente a 100°C", "A circa 71°C, per via della minore pressione atmosferica", "A 150°C", "Non bolle mai"], corretta: 1 },
    { domanda: "L'acqua pura distillata conduce l'elettricità?", risposte: ["Sì, è un ottimo conduttore", "No, sono i sali minerali disciolti in essa a condurre l'elettricità", "Solo di notte", "Sì, ma solo se calda"], corretta: 1 },
    { domanda: "Cosa misura un pluviometro?", risposte: ["La profondità dei fiumi", "L'umidità dell'aria", "La quantità di pioggia caduta", "La velocità del vento"], corretta: 2 },
    { domanda: "Come si chiama il processo per cui le piante assorbono acqua dalle radici e la rilasciano dalle foglie come vapore?", risposte: ["Condensazione", "Evaporazione", "Traspirazione", "Fotosintesi"], corretta: 2 },
    { domanda: "Qual è lo stato della materia in cui le molecole d'acqua si muovono più velocemente e liberamente?", risposte: ["Solido (Ghiaccio)", "Liquido", "Gas (Vapore acqueo)", "Plasma"], corretta: 2 },
    { domanda: "Cosa s'intende per acqua 'salmastra'?", risposte: ["Acqua inquinata", "Un mix naturale tra acqua dolce dei fiumi e acqua salata del mare", "Acqua stagnante", "Acqua piovana"], corretta: 1 },
    { domanda: "Quale colore dello spettro luminoso viene assorbito meno dall'acqua, donando al mare il suo colore tipico?", risposte: ["Il rosso", "Il giallo", "Il blu/azzurro", "Il verde"], corretta: 2 },
    { domanda: "In chimica, la presenza in abbondanza di quale ione determina se un'acqua è acida?", risposte: ["Ione Sodio", "Ione Idrogeno (H+)", "Ione Calcio", "Ione Cloro"], corretta: 1 },

    // --- BIOLOGIA, SALUTE E IDRATAZIONE ---
    { domanda: "Quanto tempo impiega in media l'acqua appena bevuta a raggiungere il circolo sanguigno?", risposte: ["Circa 5 minuti", "Più di 2 ore", "Mezz'ora", "Un giorno intero"], corretta: 0 },
    { domanda: "Quale organo è il principale responsabile dell'assorbimento dell'acqua nel corpo umano?", risposte: ["Lo stomaco", "Il fegato", "L'intestino crasso (colon)", "I polmoni"], corretta: 2 },
    { domanda: "Qual è il primissimo campanello d'allarme che il corpo invia in caso di lieve disidratazione?", risposte: ["Svenimento", "Febbre", "La sensazione di sete", "Mal di denti"], corretta: 2 },
    { domanda: "Qual è la percentuale di acqua contenuta nel sangue umano?", risposte: ["Circa il 50%", "Circa il 70%", "Circa il 92%", "Il 100%"], corretta: 2 },
    { domanda: "Quale animale marino è composto per ben il 95% di acqua?", risposte: ["Il delfino", "La balena", "La tartaruga", "La medusa"], corretta: 3 },
    { domanda: "Quale importante funzione svolgono i reni in relazione all'acqua?", risposte: ["Filtrano il sangue dalle tossine e regolano l'equilibrio idrico espellendo l'urina", "Pompano l'acqua nel cuore", "Riscaldano l'acqua corporea", "Nessuna funzione"], corretta: 0 },
    { domanda: "Quanto può sudare una persona adulta durante un'ora di esercizio fisico intenso al caldo?", risposte: ["Poche gocce", "Circa un bicchiere", "Da 0,5 fino a oltre 2 litri", "10 litri"], corretta: 2 },
    { domanda: "È vero che le ossa umane contengono acqua?", risposte: ["No, sono completamente secche", "Sì, contengono circa il 31% di acqua", "Solo le ossa dei bambini", "Sì, ma solo il 2%"], corretta: 1 },
    { domanda: "Qual è l'ortaggio con la più alta percentuale d'acqua in assoluto (circa 96%)?", risposte: ["La patata", "Il pomodoro", "Il cetriolo", "La carota"], corretta: 2 },
    { domanda: "Perché bere enormi quantità di acqua ghiacciata di colpo quando si è molto accaldati può essere pericoloso?", risposte: ["Perché congela i denti", "Può causare una congestione o un severo shock termico", "Perché disidrata di più", "Non è affatto pericoloso"], corretta: 1 },

    // --- SOSTENIBILITÀ E IMPRONTA IDRICA (Volume 2) ---
    { domanda: "In media, quanti litri d'acqua potabile vengono scaricati ogni volta che si tira lo sciacquone del WC?", risposte: ["1 litro", "Dai 6 ai 9 litri", "20 litri", "Mezzo litro"], corretta: 1 },
    { domanda: "Cos'è il fenomeno dell'eutrofizzazione delle acque?", risposte: ["La depurazione naturale dei fiumi", "Una proliferazione abnorme di alghe dovuta a inquinamento, che soffoca i pesci", "Il congelamento dei laghi", "L'evaporazione rapida"], corretta: 1 },
    { domanda: "Cosa provoca principalmente lo scioglimento dei ghiacciai terrestri (come quelli della Groenlandia)?", risposte: ["Maremoti", "Innalzamento globale del livello dei mari", "Terremoti", "Pioggia acida"], corretta: 1 },
    { domanda: "Quale comune capo d'abbigliamento richiede quasi 2.500 litri d'acqua dolce per essere coltivato e prodotto?", risposte: ["Una maglietta di cotone", "Un paio di calzini di lana", "Una giacca a vento sintetica", "Un cappello di paglia"], corretta: 0 },
    { domanda: "Cosa si intende in ecologia per 'Acque Grigie'?", risposte: ["Le acque reflue provenienti da lavandini e docce, che possono essere filtrate e riutilizzate", "L'acqua piovana inquinata", "L'acqua del mare in inverno", "Le acque dei wc"], corretta: 0 },
    { domanda: "Cosa si intende invece per 'Acque Nere'?", risposte: ["L'acqua del caffè", "Le acque di scarico dei wc, ad alto carico batterico", "Il petrolio", "L'acqua delle pozzanghere"], corretta: 1 },
    { domanda: "Quale tecnica di irrigazione agricola è considerata la più efficiente per risparmiare acqua?", risposte: ["L'irrigazione a pioggia", "L'allagamento dei campi", "L'irrigazione a goccia", "L'uso di elicotteri"], corretta: 2 },
    { domanda: "Quanta acqua occorre per produrre e sbiancare un singolo foglio di carta in formato A4?", risposte: ["1 bicchiere", "Circa 10 litri", "100 litri", "Nessuna, si fa a secco"], corretta: 1 },
    { domanda: "In quale data si celebra ogni anno la 'Giornata Mondiale dell'Acqua' (World Water Day) voluta dall'ONU?", risposte: ["1 Gennaio", "22 Marzo", "15 Agosto", "25 Dicembre"], corretta: 1 },
    { domanda: "Oltre a fornire idratazione, qual è il principale beneficio ambientale dei beverini urbani ABC presenti in mappa?", risposte: ["Decorano le strade", "Danno da bere ai piccioni", "Riducono drasticamente la produzione e l'abbandono di bottiglie di plastica", "Rinfrescano l'asfalto"], corretta: 2 },

    // --- INGEGNERIA E GRANDI OPERE IDRAULICHE ---
    { domanda: "Quale antica civiltà sudamericana costruì enormi sistemi a terrazza per gestire le piogge e l'agricoltura sulle Ande?", risposte: ["Gli Egizi", "Gli Inca", "I Romani", "I Celti"], corretta: 1 },
    { domanda: "Cos'è il Canale di Panama?", risposte: ["Un fiume naturale", "Il canale artificiale che taglia l'America Centrale collegando Oceano Atlantico e Pacifico", "Un acquedotto romano in Spagna", "Una diga in Africa"], corretta: 1 },
    { domanda: "Quale maestoso acquedotto romano è l'unico rimasto ininterrottamente in uso dall'antichità, alimentando oggi la Fontana di Trevi?", risposte: ["Acquedotto Appio", "Acquedotto Claudio", "L'Acqua Vergine (Aqua Virgo)", "Acquedotto Traiano"], corretta: 2 },
    { domanda: "Come funziona una centrale idroelettrica?", risposte: ["Brucia l'acqua per fare fumo", "Sfrutta l'energia cinetica della caduta dell'acqua per far girare le turbine e creare elettricità", "Scalda l'acqua con il sole", "Usa i pesci per girare le ruote"], corretta: 1 },
    { domanda: "Quale geniale invenzione a spirale, attribuita a un matematico greco, veniva usata per sollevare l'acqua dai fiumi?", risposte: ["La ruota dentata", "Il mulino a vento", "La Vite di Archimede", "La pompa idraulica"], corretta: 2 },
    { domanda: "A cosa serviva storicamente la grande 'ruota idraulica' nei mulini posizionati sui fiumi?", risposte: ["A pescare", "A macinare il grano sfruttando la forza della corrente dell'acqua", "A fare il bagno", "A misurare la profondità del fiume"], corretta: 1 },
    { domanda: "Qual è il canale navigabile artificiale più lungo del mondo (oltre 1700 km)?", risposte: ["Il Canal Grande a Venezia", "Il Canale di Suez", "Il Canale Imperiale in Cina (Jinghang)", "Il Canale di Corinto"], corretta: 2 },
    { domanda: "Cosa sono i famosi 'Murazzi' o l'odierno sistema 'MOSE' in Italia?", risposte: ["Ponti autostradali", "Sistemi di difesa per proteggere la città di Venezia dalle inondazioni e dall'alta marea", "Acquedotti di Roma", "Mura di castelli"], corretta: 1 },
    { domanda: "Cos'è un 'pozzo artesiano'?", risposte: ["Un pozzo dove l'acqua è avvelenata", "Un pozzo senza fondo", "Un pozzo in cui l'acqua sotterranea zampilla in superficie naturalmente grazie alla pressione della falda", "Un pozzo dipinto"], corretta: 2 },
    { domanda: "Cosa misurava l'antico strumento architettonico chiamato 'Nilometro' in Egitto?", risposte: ["L'altezza delle piramidi", "Il livello delle inondazioni stagionali del fiume Nilo", "La velocità delle navi", "Il peso dell'acqua"], corretta: 1 },

    // --- GEOGRAFIA DELL'ACQUA MONDIALE ---
    { domanda: "Come si chiama lo stretto di mare che separa l'Asia (Russia) dal Nord America (Alaska)?", risposte: ["Stretto di Gibilterra", "Stretto di Magellano", "Stretto di Bering", "Canale della Manica"], corretta: 2 },
    { domanda: "In quale continente si trova il Lago Titicaca, il lago navigabile più alto del mondo?", risposte: ["Europa", "Asia", "America del Sud (tra Perù e Bolivia)", "Africa"], corretta: 2 },
    { domanda: "Quale bacino d'acqua è tecnicamente il lago più grande del mondo (sebbene sia chiamato mare per la sua salinità)?", risposte: ["Mar Mediterraneo", "Mar Caspio", "Lago Superiore", "Mar Nero"], corretta: 1 },
    { domanda: "Il famoso Fiume Giallo (Huang He) attraversa quale grande nazione?", risposte: ["India", "Vietnam", "Giappone", "Cina"], corretta: 3 },
    { domanda: "Il vasto Golfo del Messico fa parte di quale oceano?", risposte: ["Oceano Indiano", "Oceano Atlantico", "Oceano Pacifico", "Oceano Artico"], corretta: 1 },
    { domanda: "Quale fiume attraversa il centro della città di Londra?", risposte: ["La Senna", "Il Danubio", "Il Tamigi", "Il Reno"], corretta: 2 },
    { domanda: "Qual è il lago di origine vulcanica più grande d'Italia?", risposte: ["Lago di Garda", "Lago di Como", "Lago di Bolsena", "Lago Maggiore"], corretta: 2 },
    { domanda: "Da quale maestoso monte del Piemonte ha origine la sorgente del fiume Po?", risposte: ["Monte Bianco", "Monviso", "Gran Paradiso", "Cervino"], corretta: 1 },
    { domanda: "Quale oceano, il più freddo della Terra, circonda interamente l'Antartide?", risposte: ["Oceano Pacifico", "Oceano Indiano", "Oceano Antartico (o Meridionale)", "Oceano Atlantico"], corretta: 2 },
    { domanda: "Cos'è un 'fiordo', tipico delle coste norvegesi?", risposte: ["Una foresta di pini", "Un'insenatura costiera stretta e profonda, scavata da un antico ghiacciaio e invasa dal mare", "Un'isola vulcanica", "Una cascata sotterranea"], corretta: 1 },

    // --- L'ACQUA NELLO SPAZIO E FENOMENI ESTREMI ---
    { domanda: "Quale luna del pianeta Saturno nasconde un oceano globale liquido e spruzza immensi geyser di ghiaccio nello spazio?", risposte: ["Europa", "Encelado", "Titano", "Callisto"], corretta: 1 },
    { domanda: "Di cosa è composta prevalentemente la spettacolare 'coda' di una cometa?", risposte: ["Fuoco e fiamme", "Gas e vapore acqueo rilasciati dal ghiaccio che si scioglie avvicinandosi al Sole", "Metalli fusi", "Solo roccia"], corretta: 1 },
    { domanda: "Come si chiama l'onda anomala e distruttiva causata da un violento terremoto sottomarino?", risposte: ["Alta marea", "Tsunami", "Tornado", "Uragano"], corretta: 1 },
    { domanda: "Cos'è un 'Maelstrom' nella letteratura e nella navigazione nordica?", risposte: ["Una nave fantasma", "Un potentissimo e pericoloso vortice d'acqua nel mare", "Un mostro marino", "Una tempesta di neve"], corretta: 1 },
    { domanda: "Come si chiama il fenomeno per cui il livello del mare si alza e si abbassa ciclicamente due volte al giorno?", risposte: ["Moto ondoso", "La Corrente del Golfo", "Le Maree", "Evaporazione"], corretta: 2 },
    { domanda: "Da cosa sono causate principalmente le maree sulla Terra?", risposte: ["Dal respiro delle balene", "Dal vento", "Dall'attrazione gravitazionale della Luna e del Sole", "Dal nucleo terrestre"], corretta: 2 },
    { domanda: "Cosa succede all'acqua liquida se viene esposta al vuoto dello spazio (senza pressione atmosferica)?", risposte: ["Rimane liquida", "Bolle ed evapora istantaneamente per la mancanza di pressione, per poi congelare come neve", "Diventa rossa", "Esplode"], corretta: 1 },
    { domanda: "Esiste acqua oggi sul pianeta Marte?", risposte: ["No, è totalmente secco", "Sì, ma solo intrappolata sotto forma di ghiaccio ai poli e nel sottosuolo", "Sì, ci sono fiumi caldi", "Solo come gas"], corretta: 1 },
    { domanda: "Come si chiama la potente corrente oceanica calda che mitiga il clima dell'Europa occidentale?", risposte: ["Corrente di Humboldt", "Corrente del Golfo", "Corrente del Niño", "Corrente Artica"], corretta: 1 },
    { domanda: "Cos'è il 'Permafrost' artico?", risposte: ["Un tipo di grandine", "Un terreno costantemente ghiacciato da millenni che trattiene enormi quantità di acqua e gas serra", "Un ghiacciaio mobile", "Una nuvola fredda"], corretta: 1 },

    // --- CURIOSITÀ E MISCELLANEA ---
    { domanda: "Quanti fiocchi di neve esattamente identici sono stati trovati dai ricercatori fino ad oggi?", risposte: ["Milioni", "Esattamente due", "Nessuno, la loro struttura di cristalli di ghiaccio è sempre unica", "Circa mille"], corretta: 2 },
    { domanda: "Che cos'è l'acqua 'effervescente naturale'?", risposte: ["Acqua con aggiunta chimica di gas in fabbrica", "Acqua che sgorga dal sottosuolo già naturalmente ricca di anidride carbonica per origini vulcaniche o minerali", "Acqua inquinata", "Acqua bollita"], corretta: 1 },
    { domanda: "Per quale motivo chimico l'acqua liquida spegne i normali fuochi (non elettrici o chimici)?", risposte: ["Perché ha un cattivo odore per il fuoco", "Perché evaporando sottrae velocemente calore e crea una barriera di vapore che blocca l'ossigeno", "Perché nutre la fiamma", "Perché pesa di più"], corretta: 1 },
    { domanda: "Quale avventuroso sport estremo consiste nello scendere fiumi turbolenti e rapide a bordo di speciali gommoni?", risposte: ["Surf", "Rafting", "Waterpolo", "Immersione"], corretta: 1 },
    { domanda: "Cosa significa esattamente la sigla 'H2O'?", risposte: ["Due atomi di Ossigeno e uno di Idrogeno", "Un atomo di Elio e due di Ossigeno", "Due atomi di Idrogeno e un atomo di Ossigeno", "Acqua pura al 20%"], corretta: 2 },
    { domanda: "In quale triste ma bellissima fiaba di Hans Christian Andersen la protagonista desidera disperatamente vivere fuori dall'acqua?", risposte: ["Cenerentola", "Biancaneve", "La Sirenetta", "La Bella Addormentata"], corretta: 2 },
    { domanda: "In quale religione millenaria l'immersione nel fiume Gange è considerata un fondamentale rito di purificazione?", risposte: ["Buddhismo", "Induismo", "Islam", "Cristianesimo"], corretta: 1 },
    { domanda: "Come si chiama in psicologia l'intensa paura o fobia delle acque profonde e di ciò che si nasconde sotto la superficie?", risposte: ["Aracnofobia", "Talassofobia", "Claustrofobia", "Acrofobia"], corretta: 1 },
    { domanda: "Strano ma vero (Effetto Mpemba): in certe specifiche condizioni, quale acqua si congela prima mettendola nel freezer?", risposte: ["L'acqua a temperatura ambiente", "L'acqua molto fredda", "L'acqua inizialmente calda", "Non fa differenza"], corretta: 2 },
    { domanda: "Come si chiama lo strumento usato dai rabdomanti (nelle credenze popolari) per trovare le vene d'acqua sotterranee?", risposte: ["Bussola", "Un ramo a forma di Y (Verga o bacchetta magica)", "Un pendolo di ferro", "Un telescopio"], corretta: 1 }
];