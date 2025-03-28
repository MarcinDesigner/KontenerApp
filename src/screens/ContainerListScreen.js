import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  BackHandler,
  RefreshControl  // Dodane dla obsługi pull-to-refresh
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import ContainerItem from '../components/ContainerItem';
import MapModal from '../components/MapModal';
import { searchContainers } from '../api/containerApi';
import { removeFromFavorites } from '../services/favoritesService';
import { addToSearchHistory } from '../services/searchHistoryService';
import { addSearchResults, removeSearchResult } from '../services/searchResultsService';

// Klucz do przechowywania ostatniego wyszukiwania
const LAST_SEARCH_STORAGE_KEY = '@container_app_last_search';

const ContainerListScreen = ({ navigation, route }) => {
  // Pobierz parametry z nawigacji, jeśli są dostępne
  const initialQuery = route.params?.query || '';
  const initialFilter = route.params?.filter || 'all';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  
  // Stany do obsługi danych kontenerów
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // Stan dla pull-to-refresh
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false); // Czy użytkownik wykonał wyszukiwanie
  
  // Załaduj ostatnie wyszukiwanie przy pierwszym renderowaniu
  useEffect(() => {
    const loadLastSearch = async () => {
      try {
        const lastSearchJson = await AsyncStorage.getItem(LAST_SEARCH_STORAGE_KEY);
        if (lastSearchJson) {
          const lastSearch = JSON.parse(lastSearchJson);
          setContainers(lastSearch.containers || []);
          
          // Ustaw zapytanie i filtr tylko jeśli nie zostały przekazane przez nawigację
          if (!initialQuery) {
            setSearchQuery(lastSearch.query || '');
          }
          if (!route.params?.filter) {
            setActiveFilter(lastSearch.filter || 'all');
          }
          
          setSearched(true);
        }
      } catch (error) {
        console.error('Błąd podczas ładowania ostatniego wyszukiwania:', error);
      }
    };
    
    loadLastSearch();
  }, []);
  
  // Obsługa przycisku "wstecz" na Android
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        navigation.navigate('Home');
        return true;
      });
      
      return () => backHandler.remove();
    }, [])
  );
  
  // Aktualizuj zapytanie, gdy zmieni się parametr w nawigacji
  useEffect(() => {
    if (route.params?.query) {
      console.log('Parametr zapytania z nawigacji:', route.params.query);
      setSearchQuery(route.params.query);
      
      // Jeśli mamy filtr z parametrów, aktualizujemy go
      if (route.params?.filter) {
        setActiveFilter(route.params.filter);
      }
      
      // Wykonujemy wyszukiwanie
      handleSearch(route.params.query, route.params?.filter || activeFilter);
    }
  }, [route.params?.query, route.params?.filter]);
  
  // Funkcja zapisująca ostatnie wyszukiwanie
  const saveLastSearch = async (query, filter, searchResults) => {
    try {
      const lastSearch = {
        query,
        filter,
        containers: searchResults,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(LAST_SEARCH_STORAGE_KEY, JSON.stringify(lastSearch));
    } catch (error) {
      console.error('Błąd podczas zapisywania ostatniego wyszukiwania:', error);
    }
  };
  
  // Funkcja obsługująca wyszukiwanie
  const handleSearch = async (query = searchQuery, filter = activeFilter) => {
    console.log(`Rozpoczynam wyszukiwanie. Zapytanie: "${query}", Filtr: "${filter}"`);
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      console.log('Wywołuję searchContainers...');
      const results = await searchContainers(query, filter);
      console.log(`Otrzymałem ${results.length} wyników`);
      
      if (results.length > 0) {
        setContainers(results);
        
        // Zapisz ostatnie wyszukiwanie
        saveLastSearch(query, filter, results);
        
        // Dodaj wyszukiwanie do historii
        await addToSearchHistory(query, filter);
        
        // Dodaj wyniki wyszukiwania do historii wyników
        const savedSuccessfully = await addSearchResults(results);
        console.log(`Wyniki zapisane do historii: ${savedSuccessfully ? 'tak' : 'nie'}`);
      } else {
        setContainers([]);
        // Nadal dodajemy wyszukiwanie do historii zapytań, ale nie do wyników
        await addToSearchHistory(query, filter);
      }
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      
      // Utwórz bardziej szczegółowy komunikat błędu
      let errorMessage = 'Nie udało się wyszukać kontenerów. ';
      
      if (error.message) {
        if (error.message.includes('Network request failed')) {
          errorMessage += 'Sprawdź połączenie z internetem.';
        } else if (error.message.includes('JSON')) {
          errorMessage += 'Błąd przetwarzania odpowiedzi z serwera.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Spróbuj ponownie później.';
      }
      
      setError(errorMessage);
      setContainers([]);
    } finally {
      setLoading(false);
      setRefreshing(false); // Zakończ odświeżanie
    }
  };
  
  // Funkcja obsługująca pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Jeśli jest aktywne wyszukiwanie, odśwież dane
    if (searchQuery.trim() && searched) {
      handleSearch(searchQuery, activeFilter);
    } else {
      setRefreshing(false);
    }
  }, [searchQuery, activeFilter, searched]);
  
  // Funkcja obsługująca zmianę filtra
  const handleFilterChange = (filter) => {
    console.log(`Zmiana filtra na: ${filter}`);
    setActiveFilter(filter);
    
    // Jeśli mamy już jakieś wyniki, filtrujemy ponownie
    if (searchQuery.trim() && searched) {
      handleSearch(searchQuery, filter);
    }
  };
  
  // Funkcja otwierająca modal mapy
  const handleOpenMap = (container) => {
    setSelectedContainer(container);
    setMapModalVisible(true);
  };
  
  // Funkcja usuwająca kontener z listy (po przesunięciu)
  const handleRemoveContainer = async (containerId) => {
    try {
      // Usuń z listy lokalnie
      const updatedContainers = containers.filter(container => container.id !== containerId);
      setContainers(updatedContainers);
      
      // Aktualizuj ostatnie wyszukiwanie
      saveLastSearch(searchQuery, activeFilter, updatedContainers);
      
      // Usuń z historii wyszukiwań
      await removeSearchResult(containerId);
      
      // Usuń również z ulubionych, jeśli był dodany
      await removeFromFavorites(containerId);
      
      console.log(`Kontener ${containerId} usunięty z listy i historii`);
    } catch (error) {
      console.error('Błąd podczas usuwania kontenera:', error);
      Alert.alert('Błąd', 'Nie udało się usunąć kontenera.');
    }
  };
  
  // Funkcja odświeżająca listę kontenerów (używana po zmianie statusu ulubionych)
  const refreshContainerList = useCallback(() => {
    // Po zmianie statusu ulubionych nie trzeba odświeżać listy w ekranie wyszukiwania
    // ponieważ zmiany są tylko w stanie komponentu ContainerItem
  }, []);
  
  // Render pojedynczego kontenera
  const renderContainerItem = ({ item }) => (
    <ContainerItem 
      item={item}
      onMapPress={() => handleOpenMap(item)}
      onRemove={handleRemoveContainer}
      refreshFavorites={refreshContainerList}
    />
  );

  // Renderowanie różnych stanów ekranu
  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Wyszukiwanie kontenerów...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={50} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => handleSearch()}
          >
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (containers.length === 0 && searchQuery.trim() && searched) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="search-off" size={50} color="#9E9E9E" />
          <Text style={styles.emptyText}>Nie znaleziono kontenerów dla "{searchQuery}"</Text>
          <Text style={styles.emptySubText}>Sprawdź czy wpisany numer jest poprawny i spróbuj ponownie</Text>
        </View>
      );
    }
    
    if (containers.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="inventory-2" size={100} color="#E0E0E0" />
          <Text style={styles.emptyText}>
            Wyszukaj pierwszy kontener!
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={containers}
        renderItem={renderContainerItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.containerList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1976D2"]}
            tintColor="#1976D2"
            title="Odświeżanie..."
            titleColor="#757575"
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      
      {/* Nagłówek z przyciskiem powrotu */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wyszukiwanie</Text>
      </View>
      
      {/* Komponent wyszukiwarki */}
      <View style={{ backgroundColor: '#FFFFFF' }}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          onSubmitEditing={() => handleSearch()}
        />
      
        {/* Komponent przycisków filtrów */}
        <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </View>
      
      {/* Zawartość główna */}
      {renderContent()}
      
      {/* Modal mapy */}
      <MapModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        containerData={selectedContainer}
      />
      
      {/* Dolne menu nawigacyjne */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="search" size={24} color="#1976D2" />
          <Text style={[styles.tabText, styles.activeTabText]}>Śledzenie</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <MaterialIcons name="star-border" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Zapisane</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="map" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Ruch statków</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  containerList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: 60,
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  activeTabText: {
    color: '#1976D2',
  },
});

export default ContainerListScreen;