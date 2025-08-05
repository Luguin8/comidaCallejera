import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AntDesign } from '@expo/vector-icons';
import { mapStyle } from '../styles/mapStyle';

export default function HomeScreen({ navigation }) {
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filteredPuestos, setFilteredPuestos] = useState([]);
  const [showingAbiertos, setShowingAbiertos] = useState(false);

  useEffect(() => {
    fetchPuestos();
    getUserLocation();
  }, []);

  const fetchPuestos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'puestos'));
      const puestosList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPuestos(puestosList);
      setFilteredPuestos(puestosList);
      setShowingAbiertos(false);
    } catch (error) {
      console.error('Error al obtener los puestos: ', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permiso de ubicación denegado');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const mostrarAbiertosCerca = () => {
    if (!userLocation) {
      console.warn('Ubicación no disponible');
      return;
    }

    const abiertos = puestos.filter((p) => p.estado === 'abierto');

    const cercanos = abiertos
      .map((p) => ({
        ...p,
        distancia: getDistance(
          userLocation.latitude,
          userLocation.longitude,
          p.ubicacion.latitude,
          p.ubicacion.longitude
        ),
      }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 10);

    setFilteredPuestos(cercanos);
    setShowingAbiertos(true);
  };

  const mostrarTodos = () => {
    setFilteredPuestos(puestos);
    setShowingAbiertos(false);
  };

  const toggleAuth = () => {
    if (auth.currentUser) {
      auth.signOut();
    } else {
      navigation.navigate('Login');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando puestos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider="google"
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: -27.4698,
          longitude: -58.8304,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        {filteredPuestos.map((puesto) => (
          <Marker
            key={puesto.id}
            coordinate={{
              latitude: puesto.ubicacion.latitude,
              longitude: puesto.ubicacion.longitude,
            }}
            title={puesto.nombre}
            description={`Estado: ${puesto.estado}`}
            pinColor={puesto.estado === 'abierto' ? 'green' : '#808080'}
            onCalloutPress={() =>
              navigation.navigate('PuestoDetail', {
                puestoId: puesto.id,
              })
            }
          />
        ))}
      </MapView>

      {filteredPuestos.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No hay puestos cercanos disponibles.</Text>
        </View>
      )}

      {/* Botón login/logout a la izquierda arriba */}
      <TouchableOpacity
        style={styles.authButton}
        onPress={toggleAuth}
      >
        <AntDesign
          name={auth.currentUser ? 'logout' : 'user'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Botón “Abiertos cerca” (desactivado si ya mostrando abiertos) */}
      <TouchableOpacity
        style={[styles.abiertosCercaButton, showingAbiertos && styles.disabledButton]}
        onPress={mostrarAbiertosCerca}
        disabled={showingAbiertos}
      >
        <Text style={styles.abiertosCercaText}>Abiertos cerca</Text>
      </TouchableOpacity>

      {/* Botón “Ver todos” (desactivado si mostrando todos) */}
      <TouchableOpacity
        style={[styles.verTodosButton, !showingAbiertos && styles.disabledButton]}
        onPress={mostrarTodos}
        disabled={!showingAbiertos}
      >
        <Text style={styles.verTodosText}>Ver todos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    backgroundColor: '#333',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    zIndex: 10,
  },
  abiertosCercaButton: {
    position: 'absolute',
    bottom: 70, // subido un poco más
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
  },
  verTodosButton: {
    position: 'absolute',
    bottom: 70, // subido un poco más
    left: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 5,
  },
  abiertosCercaText: { color: '#fff', fontWeight: 'bold' },
  verTodosText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: {
    opacity: 0.5,
  },
  noResults: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  noResultsText: {
    color: '#444',
    fontWeight: 'bold',
  },
});
