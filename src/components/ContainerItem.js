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

  // Sprawdź, czy którykolwiek z głównych elementów ma wartość N/A
  const isNotAvailable = 
    item.status === 'Nieznany' || 
    item.terminal === 'N/A' ||
    item.arrival === 'N/A' ||
    item.carrier === 'N/A' ||
    item.timeAgo === 'N/A';

  // Ustawienie koloru paska postępu i tekstu statusu
  let progressBarColor = '#4285F4'; // domyślny niebieski dla statusu "W trakcie"
  if (item.progress === 100) {
    progressBarColor = '#34A853'; // zielony dla zakończonych
  } else if (item.progress === 0 && isNotAvailable) {
    progressBarColor = '#9E9E9E'; // szary dla N/A
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
  
  // Definicja historii statusów - używamy tylko pierwszych trzech elementów, usuwając "Dostarczenie"
  const statusHistory = item.history && item.history.length > 0 
    ? item.history.filter(point => point.title !== 'Dostarczenie')
    : [];
  
  // Renderuje punkt historii statusów
  const renderHistoryPoint = (point, index) => {
    return (
      <View key={`history-${index}`} style={styles.historyPoint}>
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
      <View style={[styles.containerCard, isNotAvailable && styles.naContainer]}>
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

        <Text style={styles.mrnText}>Kod: {item.mrn}</Text>

        <View style={styles.timeContainer}>
          <MaterialIcons name="access-time" size={16} color="#757575" />
          <Text style={styles.timeText}>{item.timeAgo}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status: {item.status}</Text>
          <Text style={styles.progressText}>{isNotAvailable ? 'N/A' : `${item.progress}%`}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: isNotAvailable ? '100%' : `${item.progress}%`,
                backgroundColor: progressBarColor 
              }
            ]} 
          />
          {isNotAvailable && (
            <View style={styles.notAvailableOverlay}>
              <Text style={styles.notAvailableText}>Nieznany numer kontenera</Text>
            </View>
          )}
        </View>
        
        {isNotAvailable && (
          <View style={styles.naInfoContainer}>
            <MaterialIcons name="info-outline" size={18} color="#757575" />
            <Text style={styles.naInfoText}>
              Nie znaleziono danych dla podanego numeru
            </Text>
          </View>
        )}

        {/* Stopka kontenera ze strzałką rozwijania */}
        <TouchableOpacity style={styles.containerFooter} onPress={toggleExpand}>
          <View>
            <Text style={[styles.terminalText, isNotAvailable && styles.naText]}>Terminal: {item.terminal}</Text>
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
                <MaterialIcons name="directions-boat" size={16} color="#4285F4" />
                <Text style={styles.carrierText}>{item.carrier}</Text>
              </View>
            </View>
            
            <View style={styles.historyContainer}>
              {isNotAvailable ? (
                <View style={styles.notAvailableHistoryContainer}>
                  <MaterialIcons name="error-outline" size={24} color="#9E9E9E" />
                  <Text style={styles.notAvailableHistoryText}>
                    Nieprawidłowy numer kontenera. Nie można wyświetlić historii.
                  </Text>
                </View>
              ) : (
                statusHistory.map((point, index) => renderHistoryPoint(point, index))
              )}
            </View>

            <TouchableOpacity 
              style={[
                styles.mapButton,
                isNotAvailable && styles.disabledMapButton
              ]}
              onPress={onMapPress}
              disabled={isNotAvailable}
            >
              <MaterialIcons name="map" size={20} color={isNotAvailable ? "#9E9E9E" : "#4285F4"} />
              <Text style={[
                styles.mapButtonText,
                isNotAvailable && styles.disabledMapButtonText
              ]}>
                {isNotAvailable ? 'Mapa niedostępna' : 'Pokaż na mapie'}
              </Text>
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
  naContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#9E9E9E',
    backgroundColor: '#FAFAFA',
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
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  notAvailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  notAvailableText: {
    color: '#9E9E9E',
    fontSize: 8,
    fontWeight: 'bold',
  },
  naText: {
    color: '#9E9E9E',
  },
  naInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  naInfoText: {
    color: '#757575',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
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
  notAvailableHistoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 10,
  },
  notAvailableHistoryText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#757575',
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
  disabledMapButton: {
    backgroundColor: '#F5F5F5',
  },
  mapButtonText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
    marginLeft: 8,
  },
  disabledMapButtonText: {
    color: '#9E9E9E',
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