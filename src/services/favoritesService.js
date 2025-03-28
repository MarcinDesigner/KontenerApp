import AsyncStorage from '@react-native-async-storage/async-storage';

// Klucz do przechowywania ulubionych kontenerów w AsyncStorage
const FAVORITES_STORAGE_KEY = '@container_app_favorites';

/**
 * Pobiera listę ulubionych kontenerów
 * @returns {Promise<Array>} Lista ulubionych kontenerów
 */
export const getFavorites = async () => {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (favoritesJson) {
      return JSON.parse(favoritesJson);
    }
    return [];
  } catch (error) {
    console.error('Błąd podczas pobierania ulubionych:', error);
    return [];
  }
};

/**
 * Dodaje kontener do ulubionych
 * @param {Object} container Kontener do dodania
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const addToFavorites = async (container) => {
  try {
    const favorites = await getFavorites();
    
    // Sprawdź, czy kontener już istnieje w ulubionych
    const exists = favorites.some(fav => fav.id === container.id);
    if (exists) {
      return true; // Już dodany
    }
    
    // Dodaj kontener do listy ulubionych
    const updatedFavorites = [...favorites, container];
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Błąd podczas dodawania do ulubionych:', error);
    return false;
  }
};

/**
 * Usuwa kontener z ulubionych
 * @param {string} containerId ID kontenera do usunięcia
 * @returns {Promise<boolean>} Czy operacja się powiodła
 */
export const removeFromFavorites = async (containerId) => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(container => container.id !== containerId);
    
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Błąd podczas usuwania z ulubionych:', error);
    return false;
  }
};

/**
 * Sprawdza, czy kontener jest w ulubionych
 * @param {string} containerId ID kontenera do sprawdzenia
 * @returns {Promise<boolean>} Czy kontener jest w ulubionych
 */
export const isFavorite = async (containerId) => {
  try {
    const favorites = await getFavorites();
    return favorites.some(container => container.id === containerId);
  } catch (error) {
    console.error('Błąd podczas sprawdzania ulubionych:', error);
    return false;
  }
};