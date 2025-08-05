import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const AddReviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { puestoId } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const firestore = getFirestore();
  const auth = getAuth();

  // Función para actualizar el promedio de puntaje solo con opiniones de usuarios logueados
  const actualizarPromedio = async (puestoId) => {
    try {
      const opinionesRef = collection(firestore, "puestos", puestoId, "opiniones");
      const q = query(opinionesRef, where("usuarioLogueado", "==", true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const puestoRef = doc(firestore, "puestos", puestoId);
        await updateDoc(puestoRef, { promedioPuntaje: 0, cantidadOpiniones: 0 });
        return;
      }

      let suma = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        suma += data.puntuacion || 0;
      });

      const promedio = suma / querySnapshot.size;
      const puestoRef = doc(firestore, "puestos", puestoId);
      await updateDoc(puestoRef, {
        promedioPuntaje: Number(promedio.toFixed(1)),
        cantidadOpiniones: querySnapshot.size
      });
    } catch (error) {
      console.error("Error actualizando promedio:", error);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para dejar una opinión.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Puntuación requerida', 'Por favor, seleccioná una puntuación antes de publicar.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Comentario vacío', 'Aunque es opcional, tu experiencia ayuda a otros.');
      // Puedes comentar el return si querés permitir publicar sin comentario
      // return;
    }

    setLoading(true);

    try {
      await addDoc(collection(firestore, 'puestos', puestoId, 'opiniones'), {
        puntuacion: rating,
        comentario: comment.trim(),
        usuario: user.uid,
        nombreUsuario: user.isAnonymous ? 'Anónimo' : user.email.split('@')[0],
        usuarioLogueado: !user.isAnonymous, // <-- Aquí: true si no es anónimo
        fecha: serverTimestamp(),
      });

      // Actualizar promedio después de guardar la opinión
      await actualizarPromedio(puestoId);

      Alert.alert('Opinión publicada', 'Gracias por dejar tu reseña.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar la opinión:', error);
      Alert.alert('Error', 'Hubo un problema al publicar tu opinión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calificá este puesto</Text>

      <StarRating rating={rating} onRate={setRating} />

      <TextInput
        style={styles.input}
        placeholder="Escribí tu comentario (opcional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        maxLength={300}
      />

      <Button
        title={loading ? 'Publicando...' : 'Publicar Opinión'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};

const StarRating = ({ rating, onRate }) => (
  <View style={styles.starContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => onRate(star)}
        accessible
        accessibilityLabel={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
      >
        <Text style={star <= rating ? styles.starFilled : styles.star}>★</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  star: {
    fontSize: 40,
    color: '#ccc',
    marginHorizontal: 5,
  },
  starFilled: {
    fontSize: 40,
    color: '#ffd700',
    marginHorizontal: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});

export default AddReviewScreen;
