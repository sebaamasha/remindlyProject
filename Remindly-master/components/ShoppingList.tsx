import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, Pressable, TextInput } from 'react-native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import config from '../config';


interface ShoppingListProps {
  items: { _id: string; itemName: string; qty: number; days: number }[];
  onAddItem: () => void;
  onRemoveAll: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (updatedItem: { _id: string; itemName: string; qty: number; days: number }) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onAddItem,
  onRemoveAll,
  onRemoveItem,
  onUpdateItem,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    _id: string;
    itemName: string;
    qty: number;
    days: number;
  } | null>(null);

  const [shoppingList, setShoppingList] = useState(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setShoppingList((prevList) => {
        return prevList.map((item) => {
          if (item.days > 1) {
            const newDays = item.days - 1;

            // 🔹 שליחת עדכון לשרת (שמירת הנתונים)
            fetch(`${config.SERVER_API}/shopping-list/${item._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ days: newDays }),
            }).catch((err) => console.error('Error updating item:', err));

            return { ...item, days: newDays };
          } else if (item.days === 1) {
            // 🔹 נעצור את ההורדה כאשר days = 1
            return item;
          }
          return item;
        });
      });
    }, 86400000); // מתבצע כל 24 שעות (86400000 מילי-שניות)

    return () => clearInterval(interval); // ניקוי ה-interval כשמתנתקים
  }, []);

  // 🔔 התראה כשהימים מגיעים ל-0
  useEffect(() => {
    shoppingList.forEach((item) => {
      if (item.days === 0) {
        Alert.alert('Reminder', ` ${item.itemName} is running out!`);
      }
    });
  }, [shoppingList]);
  
  // Handle editing an item
  const handleEdit = (item: { _id: string; itemName: string; qty: number; days: number }) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  // Save the edited item
  const handleSaveEdit = () => {
    if (editingItem) {
      onUpdateItem(editingItem);
      setEditingItem(null);
      setIsEditing(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* Modal for Editing Items */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditing}
        onRequestClose={() => {
          setIsEditing(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Item</Text>
            <TextInput
              placeholder="Enter quantity"
              keyboardType="numeric"
              style={styles.input}
              value={editingItem?.qty?.toString() || ''}
              onChangeText={(text) =>
                setEditingItem((prev) => {
                  if (!prev) return null; // Safeguard in case prev is null
                  return { ...prev, qty: parseInt(text, 10) || 0 }; // Ensure all fields exist
    })
  }
/>
<TextInput
  placeholder="Average days until it runs out"
  keyboardType="numeric"
  style={styles.input}
  value={editingItem?.days?.toString() || ''}
  onChangeText={(text) =>
    setEditingItem((prev) => {
      if (!prev) return null; // Safeguard in case prev is null
      return { ...prev, days: parseInt(text, 10) || 0 }; // Ensure all fields exist
    })
  }
/>
      <View style={styles.editButtons}>
            <Pressable style={[styles.button, styles.buttonSave]} onPress={handleSaveEdit}>
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsEditing(false)}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
        </View>
      </View>
        </View>
      </Modal>

      {/* Shopping List */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>
              {item.itemName} - Quantity: {item.qty}, Days: {item.days}
            </Text>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <MaterialIcons name="edit" size={24} color="#DF6316" />
              </TouchableOpacity>
                <TouchableOpacity
                                onPress={() =>
                                  Alert.alert(
                                    "Delete Item",
                                    `Are you sure you want to delete "${item.itemName}"?`,
                                    [
                                      { text: "Cancel", style: "cancel" },
                                      { text: "Yes", onPress: () => onRemoveItem(item._id) },
                                    ]
                                  )
                                }
                  >
                <Entypo name="trash" size={20} color="#ff0000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No items in the shopping list</Text>}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert('Delete All Items', 'Are you sure you want to clear the shopping list?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Yes', onPress: onRemoveAll },
            ])
          }>
          <Text style={styles.deleteButtonText}>Clear List</Text>
        </TouchableOpacity>
      </View>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1},
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemText: { fontSize: 18 },
  itemActions: { flexDirection: 'row', gap: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#888' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 , bottom : 100},
  addButton: { backgroundColor: '#DF6316', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 5 },
  addButtonText: { color: '#fff', fontSize: 18 },
  deleteButton: { backgroundColor: '#FF4C4C', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontSize: 18 },
  separator: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: 200,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 15,
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  buttonSave: { backgroundColor: '#4CAF50' },
  buttonClose: { backgroundColor: '#FF4C4C' },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButtons:{
    flexDirection: 'row', justifyContent: 'space-around',
    gap: 80,
  },
});