import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl,
  AppState
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import ContainerItem from '../components/ContainerItem';
import MapModal from '../components/MapModal';
import { getSearchResults, removeSearchResult, clearSearchResults } from '../services/searchResultsService';
import { searchContainers } from '../api/containerApi';  // Dodane do odświeżania danych

const SEARCH_RESULTS_STORAGE_KEY = '@container_app_search_results';

const HomeScreen = ({ navigation }) => {
  // Wszystkie stany definiujemy na początku komponentu
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Referencja do AppState
  const appState = useRef(AppState.currentState);
  // Referencja do intervalu odświeżania
  const refreshInterval = useRef(null);
  
  // Definiujemy funkcje w stałej kolejności
  const loadSearchResults = useCallback(async () => {
    try {
      const results = await getSearchResults();
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Błąd podczas ładowania historii wyszukiwań:', error);
      return [];
    }
  }, []);
  
  // Funkcja do odświeżania danych kontenerów z API
  const refreshContainersData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Pobierz aktualne wyniki wyszukiwań
      const currentResults = await getSearchResults();
      
      if (!currentResults || currentResults.length === 0) {
        setRefreshing(false);
        return;
      }
      
      let hasChanges = false;
      
      // Dla każdego kontenera, pobierz aktualne dane
      const updatedResults = await Promise.all(
        currentResults.map(async (container) => {
          try {
            // Pobierz aktualne dane dla tego kontenera
            const results = await searchContainers(container.number);
            
            // Jeśli znaleziono dane, użyj ich, w przeciwnym razie zachowaj stare
            if (results && results.length > 0) {
              // Znajdź pasujący kontener
              const matchingContainer = results.find(
                result => result.number === container.number
              );
              
              if (matchingContainer) {
                // Sprawdź, czy dane się zmieniły
                if (
                  matchingContainer.status !== container.status ||
                  matchingContainer.progress !== container.progress ||
                  matchingContainer.terminal !== container.terminal
                ) {
                  hasChanges = true;
                }
                
                // Zachowaj id z oryginalnego kontenera
                return { ...matchingContainer, id: container.id };
              }
            }
            
            // Jeśli nie znaleziono aktualizacji, zachowaj stary kontener
            return container;
          } catch (error) {
            console.error(`Błąd podczas aktualizacji kontenera ${container.number}:`, error);
            return container;
          }
        })
      );
      
      // Aktualizuj stan wyników wyszukiwań tylko jeśli są zmiany
      if (hasChanges) {
        setSearchResults(updatedResults);
        
        // Zapisz aktualizacje w pamięci
        await updateResultsInStorage(updatedResults);
        console.log('Dane kontenerów zostały zaktualizowane');
      } else {
        console.log('Brak zmian w statusach kontenerów');
      }
      
    } catch (error) {
      console.error('Błąd podczas odświeżania danych:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  // Funkcja aktualizująca dane w pamięci
  const updateResultsInStorage = async (updatedResults) => {
    if (!updatedResults || updatedResults.length === 0) return;
    
    try {
      // Zapisz zaktualizowane wyniki w pamięci
      const resultsString = JSON.stringify(updatedResults);
      await AsyncStorage.setItem(SEARCH_RESULTS_STORAGE_KEY, resultsString);
      console.log('Dane zapisane w pamięci');
    } catch (error) {
      console.error('Błąd podczas aktualizacji danych w pamięci:', error);
    }
  };
  
  // Funkcja ustawiająca interwał odświeżania
  const setupRefreshInterval = useCallback(() => {
    // Wyczyść istniejący interwał, jeśli istnieje
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    
    // Ustaw nowy interwał odświeżania co 5 minut (300000 ms)
    refreshInterval.current = setInterval(() => {
      console.log('Automatyczne odświeżanie danych...');
      refreshContainersData();
    }, 300000);
    
    console.log('Ustawiono automatyczne odświeżanie');
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    };
  }, [refreshContainersData]);
  
  // Główny useEffect - wywoływany tylko raz przy montowaniu
  useEffect(() => {
    // Załaduj początkowe dane
    loadSearchResults();
    
    // Dodaj nasłuchiwanie na zmiany stanu aplikacji
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        console.log('Aplikacja wróciła na pierwszy plan - odświeżam dane...');
        refreshContainersData();
        // Resetuj interwał przy powrocie z tła
        setupRefreshInterval();
      }
      
      appState.current = nextAppState;
    });
    
    // Ustaw interwał odświeżania
    const cleanupInterval = setupRefreshInterval();
    
    // Funkcja czyszcząca
    return () => {
      subscription.remove();
      cleanupInterval();
    };
  }, [loadSearchResults, refreshContainersData, setupRefreshInterval]);
  
  // useFocusEffect powinien być zawsze wywoływany po innych hookach
  useFocusEffect(
    useCallback(() => {
      console.log('Ekran główny aktywny - ładuję dane...');
      loadSearchResults();
      
      // Odśwież dane przy wejściu na ekran
      refreshContainersData();
      
      return () => {
        // Funkcja czyszcząca (opcjonalna)
      };
    }, [loadSearchResults, refreshContainersData])
  );
  
  // Efekt filtrowania - zależny od searchResults i activeFilter
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredResults(searchResults);
    } else {
      const filtered = searchResults.filter(container => 
        container.type && container.type.toLowerCase() === activeFilter.toLowerCase()
      );
      setFilteredResults(filtered);
    }
  }, [searchResults, activeFilter]);
  
  // Funkcja obsługująca pull-to-refresh
  const onRefresh = useCallback(() => {
    refreshContainersData();
  }, [refreshContainersData]);
  
  // Funkcje obsługujące zdarzenia
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ContainerList', { 
        query: searchQuery,
        filter: activeFilter
      });
    }
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  const handleOpenMap = (container) => {
    setSelectedContainer(container);
    setMapModalVisible(true);
  };
  
  const handleRemoveContainer = async (containerId) => {
    try {
      await removeSearchResult(containerId);
      loadSearchResults(); // Odświeżenie listy
    } catch (error) {
      console.error('Błąd podczas usuwania kontenera z historii:', error);
    }
  };
  
  const handleClearHistory = () => {
    Alert.alert(
      'Wyczyścić historię?',
      'Czy na pewno chcesz wyczyścić całą historię wyszukiwań?',
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Wyczyść',
          onPress: async () => {
            try {
              await clearSearchResults();
              loadSearchResults(); // Odświeżenie listy
            } catch (error) {
              console.error('Błąd podczas czyszczenia historii:', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };
  
  const refreshContainerList = useCallback(() => {
    loadSearchResults();
  }, [loadSearchResults]);
  
  // Funkcje renderujące komponenty
  const renderContainerItem = ({ item }) => (
    <ContainerItem 
      item={item}
      onMapPress={() => handleOpenMap(item)}
      onRemove={handleRemoveContainer}
      refreshFavorites={refreshContainerList}
    />
  );
  
  const renderEmptyHistory = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="inventory-2" size={80} color="#E0E0E0" />
      <Text style={styles.emptyStateText}>
        Brak historii wyszukiwań
      </Text>
      <Text style={styles.emptyStateSubText}>
        Wyszukaj kontener, aby zobaczyć wyniki
      </Text>
    </View>
  );
  
  // Renderowanie głównej zawartości
  const renderContent = () => {
    return (
      <>
        {filteredResults.length > 0 && (
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {activeFilter === 'all' ? 'Wyszukane kontenery' : 
                activeFilter === 'import' ? 'Filtrujesz: Import' : 'Filtrujesz: Export'}
            </Text>
            {filteredResults.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory}>
                <Text style={styles.clearHistoryText}>Wyczyść</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <FlatList
          data={filteredResults}
          renderItem={renderContainerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.containerList}
          ListEmptyComponent={renderEmptyHistory}
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
      </>
    );
  };
  
  // Renderowanie komponentu
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      
      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje kontenery</Text>
      </View>
      
      {/* Komponent wyszukiwarki */}
      <View style={{ backgroundColor: '#FFFFFF' }}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      
        {/* Komponent przycisków filtrów */}
        <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </View>
      
      {/* Zawartość główna */}
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>
      
      {/* Modal mapy */}
      <MapModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        containerData={selectedContainer}
      />
      
      {/* Dolne menu nawigacyjne */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
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
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF', // Nagłówek pozostaje biały
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#1976D2',
  },
  containerList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
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

export default HomeScreen;