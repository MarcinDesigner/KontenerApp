import AsyncStorage from '@react-native-async-storage/async-storage';

// Klucz do przechowywania historii wyszukanych kontenerów w AsyncStorage
const SEARCH_RESULTS_STORAGE_KEY = '@container_app_search_results';

/**
 * Pobiera wszystkie wyszukane kontenery
 * @returns {Promise<Array>} Lista wyszukanych kontenerów
 */
export const getSearchResults = async () => {
  try {
    const resultsJson = await AsyncStorage.getItem(SEARCH_RESULTS_STORAGE_KEY);
    if (resultsJson) {
      return JSON.parse(resultsJson);
    }
    return [];
  } catch (error) {
    console.error('Błąd podczas pobierania historii wyszukanych kontenerów:', error);
    return [];
  }
};

/**
 * Dodaje kontener do historii wyszukiwań
 * @param {Array} containers Lista kontenerów do dodania
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const addSearchResults = async (containers) => {
  if (!containers || containers.length === 0) return false;
  
  try {
    // Pobierz aktualną historię
    let searchResults = await getSearchResults();
    
    // Dodaj nowe kontenery (ale unikaj duplikatów)
    containers.forEach(newContainer => {
      // Sprawdź, czy kontener już istnieje w historii
      const existingIndex = searchResults.findIndex(container => container.id === newContainer.id);
      
      if (existingIndex !== -1) {
        // Jeśli istnieje, usuń stary wpis
        searchResults.splice(existingIndex, 1);
      }
      
      // Dodaj nowy kontener na początek listy
      searchResults.unshift({
        ...newContainer,
        searchedAt: new Date().toISOString()
      });
    });
    
    // Zapisz zaktualizowaną historię
    await AsyncStorage.setItem(SEARCH_RESULTS_STORAGE_KEY, JSON.stringify(searchResults));
    return true;
  } catch (error) {
    console.error('Błąd podczas dodawania do historii wyszukanych kontenerów:', error);
    return false;
  }
};

/**
 * Usuwa kontener z historii wyszukiwań
 * @param {string} containerId ID kontenera do usunięcia
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const removeSearchResult = async (containerId) => {
  try {
    const searchResults = await getSearchResults();
    const updatedResults = searchResults.filter(container => container.id !== containerId);
    
    await AsyncStorage.setItem(SEARCH_RESULTS_STORAGE_KEY, JSON.stringify(updatedResults));
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
export const clearSearchResults = async () => {
  try {
    await AsyncStorage.removeItem(SEARCH_RESULTS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Błąd podczas czyszczenia historii wyszukiwań:', error);
    return false;
  }
};