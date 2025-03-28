import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MapModal = ({ visible, onClose, containerData }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Nagłówek */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="arrow-back" size={24} color="#212121" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Śledzenie kontenera</Text>
        </View>
        
        {/* Informacje o kontenerze */}
        {containerData && (
          <View style={styles.containerInfo}>
            <Text style={styles.containerNumber}>{containerData.number}</Text>
            <View style={styles.typeContainer}>
              <Text 
                style={[
                  styles.typeText, 
                  { color: containerData.type === 'Import' ? '#F39C12' : '#E74C3C' }
                ]}
              >
                {containerData.type}
              </Text>
              <MaterialIcons 
                name={containerData.type === 'Import' ? 'arrow-forward' : 'arrow-back'} 
                size={16} 
                color={containerData.type === 'Import' ? '#F39C12' : '#E74C3C'} 
              />
            </View>
          </View>
        )}
        
        {/* Placeholder dla mapy */}
        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={64} color="#BDBDBD" />
          <Text style={styles.placeholderText}>
            Tutaj będzie mapa z lokalizacją kontenera
          </Text>
        </View>
        
        {/* Informacje o statusie */}
        {containerData && (
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Aktualna lokalizacja</Text>
            <Text style={styles.statusLocation}>
              {containerData.terminal}
            </Text>
            
            <View style={styles.statusDetails}>
              <View style={styles.statusDetail}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{containerData.status}</Text>
              </View>
              
              <View style={styles.statusDetail}>
                <Text style={styles.detailLabel}>Przewidywane przybycie</Text>
                <Text style={styles.detailValue}>{containerData.arrival}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginLeft: 16,
  },
  containerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  containerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
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
  mapPlaceholder: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statusInfo: {
    padding: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  statusLocation: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 16,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
});

export default MapModal;