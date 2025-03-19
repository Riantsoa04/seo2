import axios from 'axios';

// Récupère le token d'accès OAuth 2.0 (vous pouvez aussi l'obtenir via une variable d'environnement)
const ACCESS_TOKEN = '4/0AQSTgQEbG-juGADCImsYM68947hdYiu6cpdZkB2h0XmVOg3_ZlYr8M_vrBAQr0ymwUxXNw';  // Remplacez par votre token d'accès obtenu via OAuth 2.0

// ID de la propriété GA4
const PROPERTY_ID = '4/0AQSTgQEbG-juGADCImsYM68947hdYiu6cpdZkB2h0XmVOg3_ZlYr8M_vrBAQr0ymwUxXNw';  // Votre Property ID GA4

// URL de l'API Google Analytics Data
const API_URL = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`;


// Définition des interfaces pour les types de données attendus
interface MetricValue {
  value: string;
}

interface AnalyticsRow {
  metricValues: MetricValue[];
}

interface AnalyticsResponse {
  rows?: AnalyticsRow[];
}

// Fonction pour récupérer les données Google Analytics
export const fetchAnalyticsData = async () => {
  try {
    console.log("🏠 ID Propriété GA4:", PROPERTY_ID);
    console.log("🔑 Token d'accès:", ACCESS_TOKEN);

    const response = await axios.post<AnalyticsResponse>(
      API_URL,
      {
        "metrics": [
          { "name": "screenPageViews" },
          { "name": "sessions" },
          { "name": "averageSessionDuration" },
          { "name": "bounceRate" }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,  // Ajoute le token d'accès dans l'en-tête
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Données reçues de Google Analytics:", response.data);

    // Vérifier si les données sont valides
    if (!response.data || !response.data.rows || response.data.rows.length === 0) {
      throw new Error("Données Analytics non valides !");
    }

    // Extraire les valeurs des métriques
    const [pageViews, sessions, avgSessionDuration, bounceRate] =
      response.data.rows[0].metricValues.map((m: MetricValue) => m.value) || [0, 0, '0', '0'];

    return {
      pageViews: parseInt(pageViews, 10),
      sessions: parseInt(sessions, 10),
      avgSessionDuration: formatDuration(parseFloat(avgSessionDuration)),
      bounceRate: parseFloat(bounceRate).toFixed(2) + '%'
    };

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données GA4:", error);
    throw error;
  }
};

// Fonction pour formater la durée (secondes → mm:ss)
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${minutes}:${sec.toString().padStart(2, '0')}`;
};
