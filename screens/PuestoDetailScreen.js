// screens/PuestoDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, FlatList, Alert } from 'react-native';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAuth } from 'firebase/auth'; // Importar getAuth

export default function PuestoDetailScreen({ route, navigation }) {
  const { puestoId } = route.params;
  const [puesto, setPuesto] = useState(null);
  const [opiniones, setOpiniones] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Obtener la instancia de Auth
  const user = auth.currentUser; // Obtener el usuario actual

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener datos del puesto
      const docRef = doc(db, "puestos", puestoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPuesto({ id: docSnap.id, ...docSnap.data() });
      }

      // Obtener opiniones de la subcolección
      const opinionsQuery = query(collection(db, "puestos", puestoId, "opiniones"), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(opinionsQuery);
      const opinionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOpiniones(opinionsList);

    } catch (error) {
      console.error("Error al obtener los datos: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Escuchar cambios en la navegación para recargar datos si el usuario inicia sesión
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe; // Limpiar el listener al desmontar
  }, [navigation, puestoId]);

  // Componente para renderizar cada opinión
  const renderOpinion = ({ item }) => (
    <View style={styles.opinionBox}>
      <Text style={styles.opinionUser}>{item.nombreUsuario} - {'★'.repeat(item.puntuacion)}{'☆'.repeat(5 - item.puntuacion)}</Text>
      <Text>{item.comentario}</Text>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (!puesto) {
    return <View style={styles.center}><Text>No se encontró el puesto.</Text></View>;
  }

  return (
    <FlatList
      data={opiniones}
      renderItem={renderOpinion}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {puesto.nombre} - {'★'} {puesto.promedioPuntaje ? puesto.promedioPuntaje.toFixed(1) : '0.0'}</Text>
            {/* ... otros detalles del puesto ... */}
            <Text style={styles.detail}>
              {puesto.cantidadOpiniones || 0} opinión{(puesto.cantidadOpiniones === 1) ? '' : 'es'}</Text>

            <Text style={styles.detail}>Tipo de comida: {puesto.tipoComida}</Text>
            
            <View style={styles.buttonSpacing}>
              <Button
                title="Dejar una Opinión"
                onPress={() => {
                  if (user) {
                    navigation.navigate('AddReview', { puestoId: puesto.id });
                  } else {
                    Alert.alert("Acción Requerida", "Debes iniciar sesión para dejar una opinión.", [
                      { text: "Ir a Login", onPress: () => navigation.navigate('Login') },
                      { text: "Cancelar", style: 'cancel' }
                    ]);
                  }
                }}
              />
            </View>
            <Button
              title="Hacer un Encargo (proximamente)"
              onPress={() => console.log("Navegando a encargos...")}
              color="#28a745"
              disabled={true} // Deshabilitado por ahora
            />
          </View>
          <Text style={styles.subtitle}>Opiniones Recientes</Text>
        </>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>Todavía no hay opiniones. ¡Sé el primero!</Text>}
      contentContainerStyle={styles.container}
    />
  );
}

// ... (tus estilos existentes, más estos nuevos)
const styles = StyleSheet.create({
    container: { paddingBottom: 20 },
    headerContainer: { paddingHorizontal: 20, paddingTop: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, paddingHorizontal: 20 },
    detail: { fontSize: 16, marginBottom: 5 },
    buttonSpacing: { marginVertical: 15 },
    opinionBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 20,
        borderRadius: 5,
    },
    opinionUser: { fontWeight: 'bold', marginBottom: 5 },
    emptyText: { textAlign: 'center', marginTop: 20, color: 'gray', paddingHorizontal: 20 }
});