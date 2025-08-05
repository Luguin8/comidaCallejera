import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddReviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { puestoId } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const auth = getAuth();
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
      // Comentá el return si querés permitir igualmente la publicación sin comentario
      // return;
    }

    setLoading(true);

    const firestore = getFirestore();

    try {
      await addDoc(collection(firestore, 'puestos', puestoId, 'opiniones'), {
        puntuacion: rating,
        comentario: comment.trim(),
        usuario: user.uid,
        nombreUsuario: user.isAnonymous ? 'Anónimo' : user.email.split('@')[0],
        fecha: serverTimestamp(),
      });

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
