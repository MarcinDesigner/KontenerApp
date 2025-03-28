import AsyncStorage from '@react-native-async-storage/async-storage';

// Klucz do przechowywania historii wyszukiwań w AsyncStorage
const SEARCH_HISTORY_STORAGE_KEY = '@container_app_search_history';

// Maksymalna liczba przechowywanych wyszukiwań
const MAX_SEARCH_HISTORY = 10;

/**
 * Pobiera historię wyszukiwań
 * @returns {Promise<Array>} Lista wyszukiwań
 */
export const getSearchHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    if (historyJson) {
      return JSON.parse(historyJson);
    }
    return [];
  } catch (error) {
    console.error('Błąd podczas pobierania historii wyszukiwań:', error);
    return [];
  }
};

/**
 * Dodaje zapytanie do historii wyszukiwań
 * @param {string} query Wyszukiwane zapytanie
 * @param {string} filter Użyty filtr (all, import, export)
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const addToSearchHistory = async (query, filter = 'all') => {
  if (!query || !query.trim()) return false;
  
  try {
    // Pobierz aktualną historię
    let searchHistory = await getSearchHistory();
    
    // Utwórz nowy wpis
    const newEntry = {
      id: String(Date.now()),
      query: query.trim().toUpperCase(),
      filter,
      timestamp: new Date().toISOString()
    };
    
    // Sprawdź czy istnieje już podobne wyszukiwanie
    const existingIndex = searchHistory.findIndex(item => 
      item.query === newEntry.query && item.filter === newEntry.filter
    );
    
    // Jeśli istnieje, usuń je (będzie dodane na początek)
    if (existingIndex !== -1) {
      searchHistory.splice(existingIndex, 1);
    }
    
    // Dodaj nowe wyszukiwanie na początek
    searchHistory.unshift(newEntry);
    
    // Ogranicz liczbę wyszukiwań
    if (searchHistory.length > MAX_SEARCH_HISTORY) {
      searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
    }
    
    // Zapisz zaktualizowaną historię
    await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searchHistory));
    return true;
  } catch (error) {
    console.error('Błąd podczas dodawania do historii wyszukiwań:', error);
    return false;
  }
};

/**
 * Usuwa wyszukiwanie z historii
 * @param {string} id ID wyszukiwania do usunięcia
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const removeFromSearchHistory = async (id) => {
  try {
    const searchHistory = await getSearchHistory();
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    
    await AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Błąd podczas usuwania z historii wyszukiwań:', error);
    return false;
  }
};

/**
 * Czyszczenie całej historii wyszukiwań
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const clearSearchHistory = async () => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Błąd podczas czyszczenia historii wyszukiwań:', error);
    return false;
  }
};