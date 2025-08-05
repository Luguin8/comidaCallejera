// /screens/PuestoDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function PuestoDetailScreen({ route, navigation }) {
  const { puestoId } = route.params; // Obtenemos el ID pasado por la navegación
  const [puesto, setPuesto] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPuesto = async () => {
    try {
      const docRef = doc(db, "puestos", puestoId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPuesto({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No se encontró el documento!");
      }
    } catch (error) {
      console.error("Error al obtener el puesto: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuesto();
  }, [puestoId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!puesto) {
    return (
      <View style={styles.center}>
        <Text>No se pudo cargar la información del puesto.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{puesto.nombre}</Text>
      <Text style={styles.detail}>Estado: <Text style={{ color: puesto.estado === 'abierto' ? 'green' : 'red' }}>{puesto.estado}</Text></Text>
      <Text style={styles.detail}>Tipo de comida: {puesto.tipoComida}</Text>
      <Text style={styles.subtitle}>Menú:</Text>
      {/* Aquí mapearías el menú si es un array o un objeto */}
      <Text style={styles.detail}>- Hamburguesa Simple: $1500</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Opiniones:</Text>
        {/* Aquí mostraremos las opiniones en la FASE 2.3 */}
        <Text>Aún no hay opiniones.</Text>
      </View>

      <Button
        title="Hacer un Encargo"
        onPress={() => {
          // Navegar a la pantalla de encargos en la FASE 2.4
          console.log("Navegando a la pantalla de encargos...");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  }
});