import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { isFavorite, addToFavorites, removeFromFavorites } from '../services/favoritesService';

// Włączenie animacji layoutu dla Androida
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ContainerItem = ({ item, onMapPress, onRemove, refreshFavorites }) => {
  const [expanded, setExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Sprawdź, czy kontener jest w ulubionych
  const checkFavoriteStatus = useCallback(async () => {
    const favorited = await isFavorite(item.id);
    setIsFavorited(favorited);
  }, [item.id]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  // Ustawienie koloru paska postępu i tekstu statusu
  let progressBarColor = '#4285F4'; // domyślny niebieski dla statusu "W trakcie"
  if (item.progress === 100) {
    progressBarColor = '#34A853'; // zielony dla zakończonych
  }

  // Ustawienia typu kontenera (Import/Export)
  const isImport = item.type === 'Import';
  const typeColor = isImport ? '#F39C12' : '#E74C3C';
  const typeIcon = isImport ? 'arrow-forward' : 'arrow-back';

  // Obsługa rozwijania/zwijania szczegółów
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  // Obsługa dodawania/usuwania z ulubionych
  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFromFavorites(item.id);
        setIsFavorited(false);
      } else {
        await addToFavorites(item);
        setIsFavorited(true);
      }
      
      // Jeśli funkcja odświeżania jest dostępna, wywołaj ją
      if (refreshFavorites) {
        refreshFavorites();
      }
    } catch (error) {
      console.error('Błąd podczas dodawania/usuwania z ulubionych:', error);
      Alert.alert('Błąd', 'Nie udało się dodać/usunąć kontenera z ulubionych.');
    }
  };
  
  // Definicja historii statusów na podstawie danych z API lub domyślnych wartości
  const statusHistory = item.history && item.history.length > 0 
    ? item.history.map((event, index) => ({
        id: `${index}`,
        title: event.title || event.status || 'Status',
        date: event.date || formatDate(event.timestamp) || '',
        completed: event.completed !== undefined ? event.completed : true
      }))
    : [
        { id: '1', title: 'Rozpoczęcie transportu', date: '15 mar 2025', completed: true },
        { id: '2', title: 'Na statku', date: '17 mar 2025', completed: true },
        { id: '3', title: 'Dotarcie do portu', date: '18 mar 2025', completed: false },
        { id: '4', title: 'Dostarczenie', date: '24 mar 2025', completed: false },
      ];
  
  // Funkcja do formatowania daty w historii statusów
  function formatDate(timestamp) {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const day = date.getDate();
      const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return '';
    }
  }
  
  // Renderuje punkt historii statusów
  const renderHistoryPoint = (point, index) => {
    return (
      <View key={point.id} style={styles.historyPoint}>
        <View style={styles.timelineLeft}>
          <View style={[styles.timelineDot, 
            { backgroundColor: point.completed ? '#4285F4' : '#E0E0E0' }]} />
          {/* Linia pod kropką (nie dla ostatniego elementu) */}
          {index < statusHistory.length - 1 && (
            <View style={[styles.timelineLine, 
              { backgroundColor: statusHistory[index + 1].completed ? '#4285F4' : '#E0E0E0' }]} />
          )}
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>{point.title}</Text>
          <Text style={styles.historyDate}>{point.date}</Text>
        </View>
      </View>
    );
  };

  // Renderowanie akcji przesunięcia w prawo (usuwanie)
  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => onRemove && onRemove(item.id)}
      >
        <MaterialIcons name="delete" size={24} color="white" />
        <Text style={styles.deleteActionText}>Usuń</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View style={styles.containerCard}>
        {/* Nagłówek kontenera */}
        <View style={styles.containerHeader}>
          <View style={styles.containerInfo}>
            <Text style={styles.containerNumber}>{item.number}</Text>
            <TouchableOpacity style={styles.starButton} onPress={toggleFavorite}>
              <MaterialIcons 
                name={isFavorited ? "star" : "star-border"} 
                size={22} 
                color={isFavorited ? "#FFC107" : "#BDBDBD"} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.typeContainer}>
            <Text style={[styles.typeText, { color: typeColor }]}>{item.type}</Text>
            <MaterialIcons name={typeIcon} size={16} color={typeColor} />
          </View>
        </View>

        <Text style={styles.mrnText}>MRN: {item.mrn}</Text>

        <View style={styles.timeContainer}>
          <MaterialIcons name="access-time" size={16} color="#757575" />
          <Text style={styles.timeText}>{item.timeAgo}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status: {item.status}</Text>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: progressBarColor 
              }
            ]} 
          />
        </View>

        {/* Stopka kontenera ze strzałką rozwijania */}
        <TouchableOpacity style={styles.containerFooter} onPress={toggleExpand}>
          <View>
            <Text style={styles.terminalText}>{item.terminal}</Text>
            <Text style={styles.arrivalText}>Przybycie: {item.arrival}</Text>
          </View>
          <MaterialIcons 
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#757575" 
          />
        </TouchableOpacity>

        {/* Rozwinięta sekcja z historią statusów */}
        {expanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandedHeader}>
              <Text style={styles.historyHeader}>Historia statusów</Text>
              <View style={styles.carrierContainer}>
                <MaterialIcons name="local-shipping" size={16} color="#4285F4" />
                <Text style={styles.carrierText}>Przewoźnik: {item.carrier || 'Maersk Line'}</Text>
              </View>
            </View>
            
            <View style={styles.historyContainer}>
              {statusHistory.map((point, index) => renderHistoryPoint(point, index))}
            </View>

            <TouchableOpacity 
              style={styles.mapButton}
              onPress={onMapPress}
            >
              <MaterialIcons name="map" size={20} color="#4285F4" />
              <Text style={styles.mapButtonText}>Pokaż na mapie</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  containerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  starButton: {
    marginLeft: 8,
    padding: 5, // Zwiększony obszar dotyku
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  mrnText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 45,
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#757575',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  containerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  terminalText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  arrivalText: {
    fontSize: 14,
    color: '#757575',
  },
  expandedSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  carrierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carrierText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  historyContainer: {
    marginBottom: 16,
  },
  historyPoint: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    marginRight: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 2,
  },
  historyContent: {
    flex: 1,
    marginLeft: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 14,
    color: '#757575',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F8FF',
    borderRadius: 25,
    padding: 12,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteAction: {
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  }
});

export default ContainerItem;