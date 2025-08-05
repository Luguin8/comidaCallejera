// /screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

import { mapStyle } from '../styles/mapStyle'; // Asegúrate de tener un archivo de estilos para el mapa

export default function HomeScreen({ navigation }) {
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Función para obtener los datos de Firestore
  const fetchPuestos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "puestos"));
      const puestosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPuestos(puestosList);
    } catch (error) {
      console.error("Error al obtener los puestos: ", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  // useEffect se ejecuta una vez cuando el componente se monta
  useEffect(() => {
    fetchPuestos();
  }, []);

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
        style={{ flex: 1 }}
        provider="google"
        customMapStyle={mapStyle}
         initialRegion={{
          latitude: -27.4698, // Latitud inicial (ej. Corrientes, Argentina)
          longitude: -58.8304, // Longitud inicial
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {puestos.map(puesto => (
          <Marker
            key={puesto.id}
            coordinate={{
              latitude: puesto.ubicacion.latitude,
              longitude: puesto.ubicacion.longitude,
            }}
            title={puesto.nombre}
            description={`Estado: ${puesto.estado}`}
            pinColor={puesto.estado === 'abierto' ? 'green' : '#808080'} // Verde si está abierto, gris si cerrado
            onCalloutPress={() => navigation.navigate('PuestoDetail', { puestoId: puesto.id })}
          />
        ))}
      </MapView>
      {/* Aquí irían los filtros en el futuro */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});