import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ShoppingList } from '@/components/ShoppingList';
import { PersonalList } from '@/components/PersonalList';
import { ItemInputModal } from '@/components/ItemInputModal';
import { useLogin } from '../auth/LoginContext';
import Header from '../../components/Header';
import config from '../../config';

interface ShoppingItem {
  _id: string;
  itemName: string;
  qty: number;
  days: number;
}

interface PersonalItem {
  _id: string;
  itemName: string;
}

export default function TabTwoScreen() {
  const { userId } = useLogin();
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [personalList, setPersonalList] = useState<PersonalItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isShoppingList, setIsShoppingList] = useState(true);

  // Fetch shopping and personal lists
    useEffect(() => {
      const fetchShoppingList = async () => {
        try {
          const shoppingResponse = await fetch(`${config.SERVER_API}/shopping-list/alllist/${userId}`, {
            method: 'GET',
          });
          const shoppingData = await shoppingResponse.json();
          if (shoppingResponse.ok) {
            if (Array.isArray(shoppingData)) {
              setShoppingList(shoppingData);
            } else {
              console.error('Unexpected shopping data format:', shoppingData);
              Alert.alert('Error', 'Invalid shopping list data.');
            }
          } else {
            console.error('Failed to fetch shopping list:', shoppingData.error || 'Unknown error');
            Alert.alert('Error', shoppingData.error || 'Failed to load the shopping list.');
          }
        } catch (error) {
          console.error('Error fetching shopping list:', error);
          Alert.alert('Error', 'Failed to load the shopping list.');
        }
      };
      
    
      const fetchPersonalList = async () => {
        try {
          const personalResponse = await fetch(
            `${config.SERVER_API}/users/${userId}/personal-items`,
            { method: 'GET' }
          );
          const personalData = await personalResponse.json();    
          if (personalResponse.ok) {
            setPersonalList(personalData.personalItems || []);
          } else {
            console.error('Failed to fetch personal list:', personalData.error);
            Alert.alert('Error', personalData.error || 'Failed to load the personal list.');
          }
        } catch (error) {
          console.error('Error fetching personal list:', error);
          Alert.alert('Error', 'Failed to load the personal list.');
        }
      };
    
      // Call both functions independently
      fetchShoppingList();
      fetchPersonalList();
    }, [userId]);
    

  // Add item to personal list
  const handleAddPersonalItem = async (name: string) => {
    const newItem = { itemName: name };

    try {
      const response = await fetch(`${config.SERVER_API}/users/${userId}/personal-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();
      if (response.ok && data.item) {
        setPersonalList((prev) => [
          ...prev,
          { _id: data.item._id, itemName: data.item.itemName },
        ]);
      } else {
        console.error('Server Error:', data.error);
        Alert.alert('Error', 'Failed to save personal item.');
      }
    } catch (error) {
      console.error('Error adding personal item:', error);
      Alert.alert('Error', 'Failed to save the personal item.');
    }
  };

  // Add item to shopping list
  const handleAddShoppingItem = async (name: string, quantity: number, averageDays: number) => {
    const newItem = { itemName: name, qty: quantity, days: averageDays };

    try {
      const response = await fetch(`${config.SERVER_API}/shopping-list/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const data = await response.json().catch(() => {
        console.error('Error parsing response JSON');
        return { error: 'Invalid JSON response from server' };
      });
      if (response.ok && data.newItem) {
        setShoppingList((prev) => [
          ...prev,
          { _id: data.newItem._id, itemName: data.newItem.itemName, qty: data.newItem.qty, days: data.newItem.days },
        ]);
      } else {
        console.error('Server Error:', data.error || 'Unknown error');
        Alert.alert('Error', data.error || 'Failed to save shopping item.');
      }
    } catch (error) {
      console.error('Error adding shopping item:', error);
      Alert.alert('Error', 'Failed to save the shopping item.');
    }
  };
  const handleUpdatePersonalItem = (updatedPersonalItem: {
    _id: string;
    itemName: string;
  }) => {
    fetch(`${config.SERVER_API}/personal-items/${updatedPersonalItem._id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedPersonalItem),
})
  .then((res) => {
    return res.json().then((data) => ({ ok: res.ok, data }));
  })
  .then(({ ok, data }) => {
    if (ok) {
      setPersonalList((prev) =>
        prev.map((item) =>
          item._id === updatedPersonalItem._id ? updatedPersonalItem : item
        )
      );
    } else {
      console.error('Server Error:', data.error || 'Unknown error');
      Alert.alert('Error', data.error || 'Failed to update the personal item.');
    }
  })
  .catch((err) => {
    console.error('Failed to update personal item:', err);
  });

  };
  

  const handleUpdateItem = (updatedItem: {
    _id: string;
    itemName: string;
    qty: number;
    days: number;
  }) => {
    fetch(`${config.SERVER_API}/shopping-list/${updatedItem._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    })
      .then((res) => {
        if (res.ok) {
          setShoppingList((prev) =>
            prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
          );
        } else {
          Alert.alert('Error', 'Failed to update the item.');
        }
      })
      .catch((err) => console.error('Failed to update item:', err));
  };


  // Remove item from shopping list
  const handleRemoveShoppingItem = async (id: string) => {
    try {
      const response = await fetch(`${config.SERVER_API}/shopping-list/${userId}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShoppingList((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        console.error('Server Error:', data.error);
        Alert.alert('Error', 'Failed to delete shopping item.');
      }
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      Alert.alert('Error', 'Failed to delete the shopping item.');
    }
  };

  // Remove item from personal list
  const handleRemovePersonalItem = async (id: string) => {
    try {
      const response = await fetch(`${config.SERVER_API}/personal-items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPersonalList((prev) => prev.filter((item) => item._id !== id));
      } else {
        const data = await response.json();
        console.error('Server Error:', data.error);
        Alert.alert('Error', 'Failed to delete personal item.');
      }
    } catch (error) {
      console.error('Error deleting personal item:', error);
      Alert.alert('Error', 'Failed to delete the personal item.');
    }
  };

  const handleClearShoppingList = async () => {
    try {
      // מחיקת כל הפריטים אחד-אחד
      await Promise.all(
        shoppingList.map(async (item) => {
          await fetch(`${config.SERVER_API}/shopping-list/${userId}/${item._id}`, {
            method: 'DELETE',
          });
        })
      );
      setShoppingList([]); // עדכון ה-state לאחר מחיקה
    } catch (error) {
      console.error('Error clearing shopping list:', error);
      Alert.alert('Error', 'Failed to clear shopping list.');
    }
  };
  
  const handleClearPersonalList = async () => {
    try {
      // מחיקת כל הפריטים אחד-אחד
      await Promise.all(
        personalList.map(async (item) => {
          await fetch(`${config.SERVER_API}/personal-items/${item._id}`, {
            method: 'DELETE',
          });
        })
      );
      setPersonalList([]); // עדכון ה-state לאחר מחיקה
    } catch (error) {
      console.error('Error clearing personal list:', error);
      Alert.alert('Error', 'Failed to clear personal list.');
    }
  };
  

  return (
    <>
      <View style={styles.headerStyle}> 
        <Header />
      </View>
  
      <View style={styles.container}>
        <Text style={styles.title}>{isShoppingList ? 'Shopping List' : 'Personal List'}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.switchButton, isShoppingList && styles.activeButton]}
            onPress={() => setIsShoppingList(true)}
          >
            <Text style={[styles.switchButtonText, isShoppingList && styles.activeButtonText]}>
              Shopping List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchButton, !isShoppingList && styles.activeButton]}
            onPress={() => setIsShoppingList(false)}
          >
            <Text style={[styles.switchButtonText, !isShoppingList && styles.activeButtonText]}>
              Personal List
            </Text>
          </TouchableOpacity>
        </View>
  
        {isShoppingList ? (
          <ShoppingList
            items={shoppingList}
            onAddItem={() => setModalVisible(true)}
            onRemoveAll={handleClearShoppingList}
            onRemoveItem={handleRemoveShoppingItem}
            onUpdateItem={handleUpdateItem}
          />
        ) : (
          <PersonalList
            items={personalList}
            onAddItem={() => setModalVisible(true)}
            onRemoveAll={handleClearPersonalList}
            onRemoveItem={handleRemovePersonalItem}
            onUpdateItem={handleUpdatePersonalItem}
          />
        )}
  
        <ItemInputModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAddItem={(name, quantity, averageDays) =>
            isShoppingList ? handleAddShoppingItem(name, quantity, averageDays) : handleAddPersonalItem(name)
          }
          isShoppingList={isShoppingList}
        />
      </View>
    </>
  );
  
}

const styles = StyleSheet.create({
  headerStyle:{
    width : '100%', 
    paddingBottom: 20,
    backgroundColor:'white'
  },
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff'},
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#DF6316' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  switchButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, borderWidth: 1, borderColor: '#DF6316' },
  activeButton: { backgroundColor: '#DF6316' },
  switchButtonText: { fontSize: 16, color: '#DF6316' },
  activeButtonText: { color: '#fff' },
});