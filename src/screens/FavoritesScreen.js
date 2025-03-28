import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  RefreshControl  // Dodane dla obsługi pull-to-refresh
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ContainerItem from '../components/ContainerItem';
import MapModal from '../components/MapModal';
import { getFavorites, removeFromFavorites } from '../services/favoritesService';
import { searchContainers } from '../api/containerApi';  // Dodane do odświeżania danych

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [refreshing, setRefreshing] = useState(false);  // Stan dla pull-to-refresh
  
  // Funkcja pobierająca ulubione kontenery
  const loadFavorites = useCallback(async () => {
    try {
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Błąd podczas ładowania ulubionych:', error);
      Alert.alert('Błąd', 'Nie udało się załadować ulubionych kontenerów.');
    }
  }, []);
  
  // Funkcja odświeżająca dane kontenerów z API
  const refreshContainersData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Pobierz aktualne ulubione
      const currentFavorites = await getFavorites();
      
      // Dla każdego kontenera, pobierz aktualne dane
      const updatedFavorites = await Promise.all(
        currentFavorites.map(async (container) => {
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
      
      // Aktualizuj stan ulubionych
      setFavorites(updatedFavorites);
      
      // Zapisz aktualizacje w pamięci
      await updateFavoritesInStorage(updatedFavorites);
      
    } catch (error) {
      console.error('Błąd podczas odświeżania danych:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  // Funkcja aktualizująca dane w pamięci
  const updateFavoritesInStorage = async (updatedFavorites) => {
    try {
      // Zapisz zaktualizowane ulubione w pamięci
      const favoritesString = JSON.stringify(updatedFavorites);
      await AsyncStorage.setItem('@container_app_favorites', favoritesString);
    } catch (error) {
      console.error('Błąd podczas aktualizacji danych w pamięci:', error);
    }
  };
  
  // Funkcja obsługująca pull-to-refresh
  const onRefresh = useCallback(() => {
    refreshContainersData();
  }, [refreshContainersData]);
  
  // Pobierz ulubione przy pierwszym renderowaniu
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  
  // Odświeżaj ulubione przy każdym wejściu na ekran
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );
  
  // Funkcja otwierająca modal mapy
  const handleOpenMap = (container) => {
    setSelectedContainer(container);
    setMapModalVisible(true);
  };
  
  // Funkcja usuwająca kontener z ulubionych
  const handleRemoveContainer = async (containerId) => {
    try {
      await removeFromFavorites(containerId);
      loadFavorites(); // Odświeżenie listy
    } catch (error) {
      console.error('Błąd podczas usuwania kontenera:', error);
      Alert.alert('Błąd', 'Nie udało się usunąć kontenera z ulubionych.');
    }
  };
  
  // Renderowanie pojedynczego kontenera
  const renderContainerItem = ({ item }) => (
    <ContainerItem 
      item={item}
      onMapPress={() => handleOpenMap(item)}
      onRemove={handleRemoveContainer}
      refreshFavorites={loadFavorites}
    />
  );
  
  // Renderowanie stanu pustego
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="star-border" size={80} color="#E0E0E0" />
      <Text style={styles.emptyStateText}>
        Nie masz jeszcze zapisanych kontenerów
      </Text>
      <Text style={styles.emptyStateSubText}>
        Dodaj kontenery do ulubionych, aby śledzić je tutaj
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
      
      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zapisane kontenery</Text>
      </View>
      
      {/* Lista kontenerów */}
      <View style={styles.contentWrapper}>
        <FlatList
          data={favorites}
          renderItem={renderContainerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.containerList}
          ListEmptyComponent={renderEmptyState}
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
      </View>
      
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
          <MaterialIcons name="search" size={24} color="#9E9E9E" />
          <Text style={styles.tabText}>Śledzenie</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="star" size={24} color="#1976D2" />
          <Text style={[styles.tabText, styles.activeTabText]}>Zapisane</Text>
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
    backgroundColor: '#FFFFFF',
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
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100, // Dodatkowy margines
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

export default FavoritesScreen;