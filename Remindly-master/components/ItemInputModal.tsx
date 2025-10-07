import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';

interface ItemInputModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (name: string, quantity: number, averageDays: number) => void;
  isShoppingList: boolean;
}

export const ItemInputModal: React.FC<ItemInputModalProps> = ({
  visible,
  onClose,
  onAddItem,
  isShoppingList,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averageDays, setAverageDays] = useState('');

  const handleAdd = () => {
    if (!inputValue.trim() || (isShoppingList && (!quantity || !averageDays))) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (isShoppingList && (isNaN(Number(quantity)) || isNaN(Number(averageDays)))) {
      Alert.alert('Error', 'Quantity and average days must be numbers.');
      return;
    }

    // הוספת פריט חדש
    onAddItem(inputValue, Number(quantity), Number(averageDays));
    setInputValue('');
    setQuantity('');
    setAverageDays('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isShoppingList ? 'Add Shopping Item' : 'Add Personal Item'}
          </Text>

          {/* שם הפריט */}
          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            value={inputValue}
            onChangeText={setInputValue}
          />

          {/* שדות נוספים לרשימת הקניות */}
          {isShoppingList && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Average days until it runs out"
                value={averageDays}
                onChangeText={setAverageDays}
                keyboardType="numeric"
              />
            </>
          )}

          {/* כפתורי פעולה */}
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#DF6316',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DF6316',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#DF6316',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 15,
    color: '#DF6316',
    fontSize: 16,
  },
});