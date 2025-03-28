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
import SearchHistoryItem from '../components/SearchHistoryItem';
import { getSearchHistory, removeFromSearchHistory, clearSearchHistory } from '../services/searchHistoryService';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Pobierz historię wyszukiwań przy pierwszym renderowaniu
  useEffect(() => {
    loadSearchHistory();
  }, []);
  
  // Odświeżaj historię przy każdym wejściu na ekran
  useFocusEffect(
    useCallback(() => {
      loadSearchHistory();
    }, [])
  );
  
  // Funkcja pobierająca historię wyszukiwań
  const loadSearchHistory = async () => {
    try {
      const history = await getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Błąd podczas ładowania historii wyszukiwań:', error);
    }
  };
  
  // Funkcja do obsługi wyszukiwania
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Gdy mamy zapytanie, przejdź do ekranu wyników z parametrami wyszukiwania
      navigation.navigate('ContainerList', { 
        query: searchQuery,
        filter: activeFilter
      });
    }
  };
  
  // Funkcja obsługująca zmianę filtra
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  // Obsługa wyboru elementu z historii
  const handleSelectHistoryItem = (item) => {
    navigation.navigate('ContainerList', { 
      query: item.query,
      filter: item.filter
    });
  };
  
  // Funkcja usuwająca element z historii
  const handleRemoveHistoryItem = async (id) => {
    try {
      await removeFromSearchHistory(id);
      loadSearchHistory(); // Odświeżenie listy
    } catch (error) {
      console.error('Błąd podczas usuwania z historii:', error);
    }
  };
  
  // Funkcja czyszcząca całą historię
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
              await clearSearchHistory();
              loadSearchHistory(); // Odświeżenie listy
            } catch (error) {
              console.error('Błąd podczas czyszczenia historii:', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };
  
  // Renderowanie elementu historii
  const renderHistoryItem = ({ item }) => (
    <SearchHistoryItem 
      item={item}
      onPress={handleSelectHistoryItem}
      onRemove={handleRemoveHistoryItem}
    />
  );
  
  // Renderowanie pustej historii
  const renderEmptyHistory = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="history" size={80} color="#E0E0E0" />
      <Text style={styles.emptyStateText}>
        Brak historii wyszukiwań
      </Text>
      <Text style={styles.emptyStateSubText}>
        Wyszukaj kontener, aby zobaczyć historię
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje kontenery</Text>
      </View>
      
      {/* Komponent wyszukiwarki */}
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      
      {/* Komponent przycisków filtrów */}
      <FilterButtons activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      
      {/* Nagłówek sekcji historii */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historia wyszukiwań</Text>
        
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearHistoryText}>Wyczyść</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Lista historii wyszukiwań */}
      <FlatList
        data={searchHistory}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={renderEmptyHistory}
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#1976D2',
  },
  historyList: {
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