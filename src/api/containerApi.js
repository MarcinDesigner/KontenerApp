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
    
    // Pobieramy dane kontenera
    log('Wywołuję getContainerDetails...');
    const data = await getContainerDetails(formattedQuery);
    
    // Sprawdzamy, czy mamy dane
    if (!data || !Array.isArray(data) || data.length === 0) {
      log('Brak danych w odpowiedzi lub pusta tablica');
      return [];
    }
    
    log(`Otrzymano ${data.length} rekordów z API`);
    
    // Mapowanie danych do naszego formatu
    const containers = data.map(container => {
      // Ustal typ (import/export) na podstawie danych
      // FIXME: To jest założenie, w realnym API trzeba sprawdzić, jak określany jest kierunek
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
      
      // Tworzenie obiektu kontenera w naszym formacie
      return {
        id: container.containerNumber || String(Math.random()),
        number: container.containerNumber || 'UNKNOWN',
        mrn: container.customsOfficeNumber || 'N/A',
        status: translateStatus(container.status),
        progress,
        terminal: container.terminalName || 'Terminal DCT Gdańsk',
        arrival: formatDate(container.atd) || '22 mar 2025',
        type,
        timeAgo: '2 godz. temu', // FIXME: Obliczyć na podstawie danych
        carrier: container.shipName || 'Maersk Line',
        // Historia statusów
        history: [
          { 
            title: 'Przybycie do terminala', 
            date: formatDate(container.gateInTime),
            completed: true 
          },
          { 
            title: 'Załadunek', 
            date: formatDate(container.loadingTime),
            completed: true 
          },
          { 
            title: 'Transport morski', 
            date: formatDate(container.atd),
            completed: container.status === 'LOADED' || container.status === 'DISCHARGED' 
          },
          { 
            title: 'Dostarczenie', 
            date: '24 mar 2025',
            completed: container.status === 'DELIVERED' 
          }
        ]
      };
    });
    
    log(`Zmapowano ${containers.length} kontenerów`);
    
    // Filtrowanie wyników jeśli potrzeba
    let filteredContainers = containers;
    if (filter !== 'all') {
      filteredContainers = containers.filter(container => 
        container.type.toLowerCase() === filter.toLowerCase()
      );
      log(`Po filtrowaniu pozostało ${filteredContainers.length} kontenerów`);
    }
    
    return filteredContainers;
  } catch (error) {
    logError('Błąd wyszukiwania kontenerów:', error);
    
    // Tworzymy przykładowe dane testowe gdy API nie działa
    log('Zwracam przykładowe dane testowe');
    return [
      {
        id: '1',
        number: query.trim() || 'MSCU1234567',
        mrn: 'PL322080',
        status: 'W trakcie odprawy',
        progress: 65,
        terminal: 'Terminal DCT Gdańsk',
        arrival: '22 mar 2025',
        type: 'Import',
        timeAgo: '2 godz. temu',
        carrier: 'Munkebo Maersk',
        history: [
          { title: 'Przybycie do terminala', date: '6 mar 2025', completed: true },
          { title: 'Załadunek', date: '12 mar 2025', completed: true },
          { title: 'Transport morski', date: '12 mar 2025', completed: true },
          { title: 'Dostarczenie', date: '24 mar 2025', completed: false }
        ]
      }
    ];
  }
};

// Funkcja pomocnicza formatująca datę 
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
    
    return `${day} ${month} ${year}`;
  } catch (e) {
    logError('Błąd formatowania daty:', e);
    return null;
  }
}

// Funkcja pomocnicza do formatowania czasu
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
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
}

// Funkcja tłumacząca statusy z API na polskie
function translateStatus(status) {
  if (!status) return 'Nieznany';
  
  const statusMap = {
    'DELIVERED': 'Odprawa zakończona',
    'LOADED': 'W trakcie odprawy',
    'DISCHARGED': 'Rozładunek',
    'CUSTOMS_CLEARANCE': 'Odprawa celna',
    'WAITING_FOR_PICKUP': 'Oczekiwanie na odbiór',
    'LOADING': 'Załadunek',
    // Dodaj więcej tłumaczeń statusów według potrzeb
  };
  
  return statusMap[status] || status;
}