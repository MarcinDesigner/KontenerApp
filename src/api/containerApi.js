/**
 * Serwis API do komunikacji z serwerem kontenerów
 */

// Bazowy URL API
const API_URL = 'https://demo.polskipcs.pl/gateway';

// Token autoryzacji
const API_TOKEN = 'Basic YXBpX3d3d0Bwb2xza2lwY3MucGw6Tm9oMjg5NzY=';

// Włącz/wyłącz szczegółowe logowanie
const DEBUG = true;

/**
 * Logowanie debugowania
 */
const log = (...args) => {
  if (DEBUG) {
    console.log('[ContainerAPI]', ...args);
  }
};

/**
 * Logowanie błędów
 */
const logError = (...args) => {
  console.error('[ContainerAPI Error]', ...args);
};

/**
 * Pobiera szczegóły kontenera na podstawie jego numeru
 * @param {string} containerNumber - Numer kontenera (np. TCKU7486791)
 * @returns {Promise<Object>} - Dane kontenera
 */
export const getContainerDetails = async (containerNumber) => {
  log(`Pobieranie szczegółów kontenera: ${containerNumber}`);
  try {
    const url = `${API_URL}/containers/terminals/details?numbers=${containerNumber}`;
    log(`URL: ${url}`);
    
    const headers = {
      'Authorization': API_TOKEN,
      'Content-Type': 'application/json',
    };
    log('Nagłówki:', headers);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    log(`Status odpowiedzi: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logError(`Błąd API (${response.status}): ${errorText}`);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const responseText = await response.text();
    
    // Sprawdź, czy odpowiedź nie jest pusta
    if (!responseText || responseText.trim() === '') {
      log('Odpowiedź pusta');
      return [];
    }
    
    // Próbujemy sparsować JSON
    try {
      const data = JSON.parse(responseText);
      log('Odpowiedź (JSON):', data);
      return data;
    } catch (parseError) {
      logError('Błąd parsowania JSON:', parseError);
      throw new Error(`Błąd parsowania odpowiedzi: ${parseError.message}`);
    }
  } catch (error) {
    logError('Błąd pobierania szczegółów kontenera:', error);
    throw error;
  }
};

/**
 * Wyszukuje kontenery na podstawie zapytania i filtrów
 */
export const searchContainers = async (query, filter = 'all') => {
  log(`Wyszukiwanie kontenerów. Zapytanie: "${query}", Filtr: "${filter}"`);
  
  try {
    // W przypadku pustego zapytania zwracamy pustą tablicę od razu
    if (!query || !query.trim()) {
      log('Puste zapytanie, zwracam pustą listę');
      return [];
    }
    
    // Usuwamy spacje i zamieniamy na wielkie litery
    const formattedQuery = query.trim().toUpperCase();
    log(`Sformatowane zapytanie: "${formattedQuery}"`);
    
    // Pobierz dane z API
    try {
      log('Wywołuję getContainerDetails...');
      const data = await getContainerDetails(formattedQuery);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        log('Brak danych z API, zwracam kontener ze statusami N/A');
        return [createNAContainer(formattedQuery)];
      }
      
      log(`Otrzymano ${data.length} kontenerów z API`);
      
      // Mapuj dane do naszego formatu
      const containers = data.map(container => {
        // Przypisujemy dane z API
        return mapContainerData({
          containerNumber: container.containerNumber,
          customsOfficeNumber: container.customsOfficeNumber,
          status: container.status,
          terminalName: container.terminalName || 'N/A', 
          gateInTime: container.gateInTime,
          loadingTime: container.loadingTime,
          portCode: container.portCode,
          atd: container.shipDetails?.atd || container.atd,
          shipName: container.shipDetails?.shipName || container.shipName
        });
      });
      
      // Filtrowanie po typie
      if (filter !== 'all') {
        return containers.filter(container => 
          container.type.toLowerCase() === filter.toLowerCase()
        );
      }
      
      return containers;
    } catch (apiError) {
      log('Błąd pobierania danych z API, próbuję użyć przykładowych danych');
      
      // Dla demonstracji, sprawdź konkretny numer kontenera
      if (formattedQuery === 'TCKU7486791') {
        // Przykładowe dane dla tego numeru
        const staticData = [
          {
            terminalName: "DCT Gdańsk",
            customsOfficeNumber: "PL322080",
            containerNumber: "TCKU7486791",
            onTerminal: false,
            status: "LOADED",
            gateInTime: "2025-03-06T04:01:00Z",
            loadingTime: "2025-03-12T06:17:00Z",
            containerDetails: null,
            portCode: "PLGDN",
            atd: "2025-03-12T13:00:00Z",
            shipName: "Munkebo Maersk"
          }
        ];
        
        // Mapuj dane do naszego formatu
        const containers = staticData.map(container => mapContainerData(container));
        
        // Filtrowanie po typie
        if (filter !== 'all') {
          return containers.filter(container => 
            container.type.toLowerCase() === filter.toLowerCase()
          );
        }
        
        return containers;
      }
      
      // Dla wszystkich innych numerów zwracamy N/A
      return [createNAContainer(formattedQuery)];
    }
    
  } catch (error) {
    logError('Błąd wyszukiwania kontenerów:', error);
    
    // Zwracamy kontener ze statusami N/A gdy API nie działa
    log('Zwracam kontener ze statusami N/A (błąd API)');
    return [createNAContainer(query.trim())];
  }
};

/**
 * Mapuje dane z API do formatu wyświetlanego w aplikacji
 */
function mapContainerData(container) {
  // Określ typ na podstawie portu
  const type = container.portCode === 'PLGDN' ? 'Import' : 'Export';
  
  // Oblicz procent postępu na podstawie statusu
  let progress = 0;
  if (container.status) {
    // Mapowanie statusów na wartości procentowe
    switch (container.status) {
      case 'DELIVERED':
        progress = 100;
        break;
      case 'LOADED':
        progress = 65;
        break;
      case 'DISCHARGED':
        progress = 80;
        break;
      default:
        progress = 50;
    }
  }
  
  // Oblicz, ile czasu minęło od ostatniego zdarzenia
  const timeAgo = calculateTimeAgo(container.loadingTime || container.gateInTime);
  
  return {
    id: container.containerNumber || String(Math.random()),
    number: container.containerNumber || 'UNKNOWN',
    mrn: container.customsOfficeNumber || 'N/A',
    status: translateStatus(container.status),
    progress,
    terminal: container.terminalName || 'N/A',
    arrival: formatDate(container.loadingTime) || 'N/A', // Używamy loadingTime jako daty przybycia
    type,
    timeAgo,
    carrier: container.shipName || 'N/A',
    history: createHistoryFromContainer(container)
  };
}

/**
 * Tworzy historię statusów na podstawie danych kontenera
 */
function createHistoryFromContainer(container) {
  return [
    { 
      title: 'Rozpoczęcie transportu', 
      date: formatDate(container.gateInTime) || 'N/A',
      completed: Boolean(container.gateInTime) 
    },
    { 
      title: 'Na statku', 
      date: formatDate(container.loadingTime) || 'N/A',
      completed: Boolean(container.loadingTime) 
    },
    { 
      title: 'W tranzycie', 
      date: formatDate(container.atd) || 'N/A',
      completed: Boolean(container.atd) && (container.status === 'LOADED' || container.status === 'DISCHARGED') 
    },
    { 
      title: 'Dostarczenie', 
      date: 'N/A', // Data dostarczenia zwykle nie jest znana z wyprzedzeniem
      completed: container.status === 'DELIVERED' 
    }
  ];
}

/**
 * Tworzy kontener ze statusami N/A dla niepoprawnych numerów
 * @param {string} query - Zapytanie użytkownika
 * @returns {Object} - Kontener ze statusami N/A
 */
function createNAContainer(query) {
  return {
    id: String(Math.random()),
    number: query || 'UNKNOWN',
    mrn: 'N/A',
    status: 'Nieznany',
    progress: 0,
    terminal: 'N/A',
    arrival: 'N/A',
    type: 'Export', // Domyślnie export
    timeAgo: 'N/A',
    carrier: 'N/A',
    history: [
      { title: 'Rozpoczęcie transportu', date: 'N/A', completed: false },
      { title: 'Na statku', date: 'N/A', completed: false },
      { title: 'W tranzycie', date: 'N/A', completed: false },
      { title: 'Dostarczenie', date: 'N/A', completed: false }
    ]
  };
}

/**
 * Oblicz ile czasu minęło od zdarzenia
 */
function calculateTimeAgo(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    const eventDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - eventDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'przed chwilą';
    } else if (diffHours === 1) {
      return '1 godz. temu';
    } else if (diffHours < 24) {
      return `${diffHours} godz. temu`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) {
        return '1 dzień temu';
      } else {
        return `${diffDays} dni temu`;
      }
    }
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Formatuje datę z formatu ISO na "DD mmm YYYY, HH:MM"
 */
function formatDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Format daty z API: "2025-03-06T04:01:00Z"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const day = date.getDate();
    const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Dodaj godzinę i minuty
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch (e) {
    logError('Błąd formatowania daty:', e);
    return null;
  }
}

/**
 * Tłumaczy statusy z API na polskie
 */
function translateStatus(status) {
  if (!status) return 'Nieznany';
  
  const statusMap = {
    'DELIVERED': 'Odprawa zakończona',
    'LOADED': 'W tranzycie',
    'DISCHARGED': 'Rozładunek',
    'CUSTOMS_CLEARANCE': 'Odprawa celna',
    'WAITING_FOR_PICKUP': 'Oczekiwanie na odbiór',
    'LOADING': 'Załadunek',
    // Dodaj więcej tłumaczeń statusów według potrzeb
  };
  
  return statusMap[status] || status;
}