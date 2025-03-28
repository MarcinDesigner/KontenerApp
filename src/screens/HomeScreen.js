import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SearchBar from '../components/SearchBar';
import FilterButtons from '../components/FilterButtons';
import ContainerItem from '../components/ContainerItem';
import MapModal from '../components/MapModal';
import { getSearchResults, removeSearchResult, clearSearchResults } from '../services/searchResultsService';

const HomeScreen = ({ navigation }) => {
  // Wszystkie stany definiujemy na początku komponentu
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  
  // Definiujemy funkcje w stałej kolejności
  const loadSearchResults = useCallback(async () => {
    try {
      const results = await getSearchResults();
      setSearchResults(results);
    } catch (error) {
      console.error('Błąd podczas ładowania historii wyszukiwań:', error);
    }
  }, []);
  
  // Główny useEffect - wywoływany tylko raz przy montowaniu
  useEffect(() => {
    loadSearchResults();
  }, [loadSearchResults]);
  
  // useFocusEffect powinien być zawsze wywoływany po innych hookach
  useFocusEffect(
    useCallback(() => {
      loadSearchResults();
      return () => {
        // Funkcja czyszcząca (opcjonalna)
      };
    }, [loadSearchResults])
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