// arsrates/static/js/wuLandmarks.js
// Landmarks for the WU location finder (/wu-locations): pick one to list WU
// locations by distance from it. The dropdown lists the "popular: true" ones
// first, then Downtown / Centro (Monserrat, San Nicolás, Retiro and Puerto Madero;
// DOWNTOWN_BARRIOS in wu_locations.html), then each other barrio in the order
// below. Edit freely:
// - name: shown in the list
// - barrio: official CABA barrio, from the city's barrio boundaries
//   (static/data/barrios.geojson), so "Palermo" also covers Soho, Hollywood,
//   Las Cañitas, etc.; outside CABA, the partido and province
// - lat/lon: from openstreetmap.org (right-click the spot > "Show address")
// - also (optional): other words that match while typing in the address box
//   (case and accents don't matter)
window.WU_LANDMARKS = [
  // Almagro
  { name: "Confitería Las Violetas", barrio: "Almagro", lat: -34.61127, lon: -58.42092 },

  // Balvanera
  { name: "Congreso", barrio: "Balvanera", lat: -34.6098, lon: -58.39271, also: ["Congress"] },
  { name: "Once (Plaza Miserere)", barrio: "Balvanera", lat: -34.60975, lon: -58.40636, also: ["Once"] },
  { name: "Abasto Shopping", barrio: "Balvanera", lat: -34.60295, lon: -58.41069 },
  { name: "Casa Carlos Gardel", barrio: "Balvanera", lat: -34.60167, lon: -58.40781, also: ["Gardel", "tango"] },

  // Barracas
  { name: "Pasaje Lanín", barrio: "Barracas", lat: -34.64029, lon: -58.37973, also: ["Calle Lanín", "mosaics"] },
  { name: "Iglesia Santa Felicitas", barrio: "Barracas", lat: -34.6372, lon: -58.37327 },

  // Belgrano
  { name: "River Plate stadium (Monumental)", barrio: "Belgrano", lat: -34.54529, lon: -58.44974, also: ["Mâs Monumental", "River"] },
  { name: "Barrio Chino", barrio: "Belgrano", lat: -34.5552, lon: -58.4525, also: ["Chinatown", "Arribeños"] },
  { name: "Barrancas de Belgrano", barrio: "Belgrano", lat: -34.55876, lon: -58.44967 },
  { name: "La Redonda (Plaza Belgrano)", barrio: "Belgrano", lat: -34.56208, lon: -58.45557, also: ["Inmaculada Concepción"] },
  { name: "Belgrano (Cabildo y Juramento)", barrio: "Belgrano", lat: -34.56316, lon: -58.456 },
  { name: "Avenida Melián (Belgrano R)", barrio: "Belgrano", lat: -34.56796, lon: -58.46871, also: ["Belgrano R"] },
  { name: "Museo Larreta", barrio: "Belgrano", lat: -34.56079, lon: -58.45554 },
  { name: "Parque de la Memoria", barrio: "Belgrano", lat: -34.53941, lon: -58.44224 },
  { name: "Ciudad Universitaria (UBA)", barrio: "Belgrano", lat: -34.54307, lon: -58.44777, also: ["UBA", "university"] },

  // Boedo
  { name: "Esquina Homero Manzi", barrio: "Boedo", lat: -34.62528, lon: -58.41641, also: ["Boedo", "tango"] },

  // Caballito
  { name: "Parque Centenario", barrio: "Caballito", lat: -34.60652, lon: -58.43557 },
  { name: "Parque Rivadavia", barrio: "Caballito", lat: -34.61784, lon: -58.43348 },
  { name: "Tranvía Histórico (Caballito)", barrio: "Caballito", lat: -34.62795, lon: -58.44309, also: ["tram", "streetcar"] },

  // Chacarita
  { name: "Anchoita", barrio: "Chacarita", lat: -34.58941, lon: -58.44539, also: ["Palermo Hollywood"] },
  { name: "Chacarita Cemetery", barrio: "Chacarita", lat: -34.59105, lon: -58.4583, also: ["Chacarita"] },

  // Colegiales
  { name: "Mercado de Pulgas", barrio: "Colegiales", lat: -34.58301, lon: -58.44438, also: ["flea market"] },
  { name: "Plaza Mafalda (Colegiales)", barrio: "Colegiales", lat: -34.58073, lon: -58.44557, also: ["Colegiales", "Plaza Clemente"] },

  // Constitución
  { name: "Constitución station", barrio: "Constitución", lat: -34.62888, lon: -58.37929 },

  // La Boca
  { name: "La Bombonera (Boca Juniors)", barrio: "La Boca", lat: -34.63552, lon: -58.36492, also: ["Boca"] },
  { name: "Caminito", barrio: "La Boca", lat: -34.63936, lon: -58.36257, also: ["La Boca"], popular: true },
  { name: "Fundación PROA", barrio: "La Boca", lat: -34.6399, lon: -58.3621, also: ["PROA"] },
  { name: "Usina del Arte", barrio: "La Boca", lat: -34.62876, lon: -58.35712 },

  // Liniers
  { name: "Vélez Sarsfield stadium", barrio: "Liniers", lat: -34.63534, lon: -58.52068, also: ["Velez", "Fortín"] },

  // Mataderos
  { name: "Feria de Mataderos", barrio: "Mataderos", lat: -34.66246, lon: -58.50003, also: ["gaucho"] },

  // Monserrat
  { name: "Café Tortoni", barrio: "Monserrat", lat: -34.60869, lon: -58.37814 },
  { name: "Plaza de Mayo", barrio: "Monserrat", lat: -34.60845, lon: -58.37218, popular: true },
  { name: "Casa Rosada", barrio: "Monserrat", lat: -34.60806, lon: -58.37027, also: ["Pink House"], popular: true },
  { name: "Cabildo", barrio: "Monserrat", lat: -34.60888, lon: -58.37367 },
  { name: "Palacio Barolo", barrio: "Monserrat", lat: -34.60966, lon: -58.38573 },
  { name: "Mafalda statue (Paseo de la Historieta)", barrio: "Monserrat", lat: -34.61594, lon: -58.37128, also: ["Mafalda"] },

  // Palermo
  { name: "Plaza Serrano (Plazoleta Cortázar)", barrio: "Palermo", lat: -34.58875, lon: -58.43017, also: ["Palermo Soho", "Plaza Serrano"], popular: true },
  { name: "Plaza Armenia", barrio: "Palermo", lat: -34.58879, lon: -58.42524, also: ["Palermo Soho"] },
  { name: "Don Julio", barrio: "Palermo", lat: -34.58629, lon: -58.42428, also: ["parrilla"] },
  { name: "El Preferido de Palermo", barrio: "Palermo", lat: -34.58544, lon: -58.42539 },
  { name: "Pasaje Russell / Pasaje Soria", barrio: "Palermo", lat: -34.58738, lon: -58.42911, also: ["street art"] },
  { name: "Mercado Soho", barrio: "Palermo", lat: -34.58891, lon: -58.42677 },
  { name: "Palermo Hollywood", barrio: "Palermo", lat: -34.58336, lon: -58.43558 },
  { name: "MALBA", barrio: "Palermo", lat: -34.57688, lon: -58.40339, also: ["Museo de Arte Latinoamericano"] },
  { name: "Museo Evita", barrio: "Palermo", lat: -34.58075, lon: -58.41474, also: ["Eva Perón"] },
  { name: "Museo Nacional de Arte Decorativo", barrio: "Palermo", lat: -34.58261, lon: -58.40108 },
  { name: "Casa Victoria Ocampo", barrio: "Palermo", lat: -34.5807, lon: -58.40239 },
  { name: "Palacio Alcorta", barrio: "Palermo", lat: -34.57741, lon: -58.40309 },
  { name: "Campo Argentino de Polo", barrio: "Palermo", lat: -34.57146, lon: -58.42702, also: ["polo"] },
  { name: "Hipódromo de Palermo", barrio: "Palermo", lat: -34.5664, lon: -58.42573, also: ["racetrack", "horse racing", "casino"] },
  { name: "La Imprenta", barrio: "Palermo", lat: -34.5653, lon: -58.43624 },
  { name: "Solar de la Abadía", barrio: "Palermo", lat: -34.56789, lon: -58.43777, also: ["Las Cañitas"] },
  { name: "Las Cañitas", barrio: "Palermo", lat: -34.57217, lon: -58.43111 },
  { name: "Jardín Japonés", barrio: "Palermo", lat: -34.57514, lon: -58.40926, also: ["Japanese Garden"] },
  { name: "El Rosedal", barrio: "Palermo", lat: -34.57301, lon: -58.4134, also: ["Rose Garden", "Parque Tres de Febrero"] },
  { name: "Jardín Botánico", barrio: "Palermo", lat: -34.58259, lon: -58.41726, also: ["Botanical Garden"] },
  { name: "Ecoparque", barrio: "Palermo", lat: -34.57751, lon: -58.41574, also: ["zoo"] },
  { name: "Planetario", barrio: "Palermo", lat: -34.56965, lon: -58.41172, also: ["planetarium"] },
  { name: "Plaza Italia", barrio: "Palermo", lat: -34.58146, lon: -58.42111 },
  { name: "Lago de Regatas", barrio: "Palermo", lat: -34.55807, lon: -58.43285 },
  { name: "Golf de Palermo", barrio: "Palermo", lat: -34.55813, lon: -58.43772, also: ["golf"] },
  { name: "Alto Palermo Shopping", barrio: "Palermo", lat: -34.58795, lon: -58.4102 },
  { name: "Distrito Arcos", barrio: "Palermo", lat: -34.58124, lon: -58.42851, also: ["outlet", "Palermo Pacifico"] },
  { name: "Islamic Center King Fahd", barrio: "Palermo", lat: -34.57283, lon: -58.42541, also: ["mosque"] },
  { name: "Aeroparque airport (AEP)", barrio: "Palermo", lat: -34.55944, lon: -58.41463, also: ["Jorge Newbery"], popular: true },

  // Parque Patricios
  { name: "Huracán stadium", barrio: "Parque Patricios", lat: -34.64345, lon: -58.3965, also: ["Huracan"] },

  // Puerto Madero
  { name: "Puente de la Mujer", barrio: "Puerto Madero", lat: -34.60802, lon: -58.36513, also: ["Puerto Madero"], popular: true },
  { name: "Reserva Ecológica Costanera Sur", barrio: "Puerto Madero", lat: -34.60695, lon: -58.35274, also: ["ecological reserve"] },
  { name: "Fragata Sarmiento", barrio: "Puerto Madero", lat: -34.60889, lon: -58.36567 },
  { name: "Colección Fortabat", barrio: "Puerto Madero", lat: -34.59954, lon: -58.36499 },
  { name: "Faena Arts Center", barrio: "Puerto Madero", lat: -34.61116, lon: -58.36219, also: ["Faena"] },
  { name: "Fuente de las Nereidas", barrio: "Puerto Madero", lat: -34.61693, lon: -58.35675, also: ["Lola Mora"] },

  // Recoleta
  { name: "El Ateneo Grand Splendid", barrio: "Recoleta", lat: -34.59598, lon: -58.39426, also: ["bookstore"] },
  { name: "Recoleta Cemetery", barrio: "Recoleta", lat: -34.58766, lon: -58.3936, also: ["Cementerio", "Evita"], popular: true },
  { name: "Museo Nacional de Bellas Artes", barrio: "Recoleta", lat: -34.58392, lon: -58.39292, also: ["MNBA", "Fine Arts"] },
  { name: "Floralis Genérica", barrio: "Recoleta", lat: -34.58169, lon: -58.394, also: ["flower sculpture"] },
  { name: "Basílica del Pilar", barrio: "Recoleta", lat: -34.58672, lon: -58.3922 },
  { name: "Biblioteca Nacional", barrio: "Recoleta", lat: -34.58439, lon: -58.39797, also: ["National Library"] },
  { name: "Centro Cultural Recoleta", barrio: "Recoleta", lat: -34.5863, lon: -58.39251 },
  { name: "Plaza Francia", barrio: "Recoleta", lat: -34.58668, lon: -58.39122 },

  // Retiro
  { name: "Retiro station", barrio: "Retiro", lat: -34.59016, lon: -58.37392, also: ["Estación Retiro", "bus terminal"], popular: true },
  { name: "Plaza San Martín", barrio: "Retiro", lat: -34.59464, lon: -58.3759 },
  { name: "Torre Monumental", barrio: "Retiro", lat: -34.59218, lon: -58.37374, also: ["Torre de los Ingleses"] },
  { name: "Edificio Kavanagh", barrio: "Retiro", lat: -34.59532, lon: -58.3746, also: ["Kavanagh"] },
  { name: "Buquebus terminal", barrio: "Retiro", lat: -34.59718, lon: -58.36822, also: ["ferry", "Dársena Norte"] },

  // San Nicolás
  { name: "Luna Park", barrio: "San Nicolás", lat: -34.60243, lon: -58.36869 },
  { name: "Teatro Gran Rex", barrio: "San Nicolás", lat: -34.60314, lon: -58.37896 },
  { name: "Teatro Opera", barrio: "San Nicolás", lat: -34.60371, lon: -58.37895 },
  { name: "Palacio Libertad (ex CCK)", barrio: "San Nicolás", lat: -34.60356, lon: -58.36948, also: ["CCK", "Centro Cultural Kirchner"] },
  { name: "Obelisco", barrio: "San Nicolás", lat: -34.60371, lon: -58.38163, also: ["9 de Julio", "Microcentro"], popular: true },
  { name: "Teatro Colón", barrio: "San Nicolás", lat: -34.60109, lon: -58.38319 },
  { name: "Calle Florida / Galerías Pacífico", barrio: "San Nicolás", lat: -34.59924, lon: -58.37476, popular: true },
  { name: "Calle Corrientes theaters", barrio: "San Nicolás", lat: -34.6042, lon: -58.38783, also: ["theater district"] },
  { name: "Plaza Lavalle", barrio: "San Nicolás", lat: -34.59984, lon: -58.3847, also: ["Tribunales"] },
  { name: "Catedral Metropolitana", barrio: "San Nicolás", lat: -34.60747, lon: -58.37328, also: ["cathedral"] },

  // San Telmo
  { name: "Plaza Dorrego", barrio: "San Telmo", lat: -34.62049, lon: -58.37178, also: ["San Telmo"], popular: true },
  { name: "Mercado de San Telmo", barrio: "San Telmo", lat: -34.61905, lon: -58.37251, also: ["San Telmo market"] },
  { name: "El Zanjón de Granados", barrio: "San Telmo", lat: -34.61666, lon: -58.3718 },
  { name: "Parque Lezama", barrio: "San Telmo", lat: -34.62712, lon: -58.36928 },
  { name: "Russian Orthodox Church", barrio: "San Telmo", lat: -34.6251, lon: -58.37004, also: ["Iglesia Ortodoxa Rusa"] },

  // Villa Crespo
  { name: "Movistar Arena", barrio: "Villa Crespo", lat: -34.59426, lon: -58.44814 },
  { name: "Calle Murillo leather shops", barrio: "Villa Crespo", lat: -34.60162, lon: -58.4428, also: ["leather"] },

  // Villa Riachuelo
  { name: "Autódromo de Buenos Aires", barrio: "Villa Riachuelo", lat: -34.69025, lon: -58.45303, also: ["racetrack"] },

  // Villa Soldati
  { name: "Parque de la Ciudad (Torre Espacial)", barrio: "Villa Soldati", lat: -34.67141, lon: -58.45032 },

  // Ezeiza (Buenos Aires province)
  { name: "Ezeiza airport (EZE)", barrio: "Ezeiza (Buenos Aires province)", lat: -34.81681, lon: -58.54742, also: ["international airport", "Pistarini"], popular: true },
];
