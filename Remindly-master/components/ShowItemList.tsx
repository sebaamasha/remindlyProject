import React, { useState, useEffect } from "react";
import { Modal, View, Text, Button, StyleSheet, Switch, Alert,TouchableOpacity } from "react-native";
import { useLogin } from "../app/auth/LoginContext";
import config from "@/config";

type Item = {
  itemName: string;
};

interface ShowItemListProps {
  visible: boolean;
  onClose: () => void;
}
const ShowItemList: React.FC<ShowItemListProps> = ({ visible, onClose }) => {
  const { userId } = useLogin();
  const [fetchedItems, setFetchedItems] = useState<Item[]>([]);
  const [itemStates, setItemStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (visible) {
      setItemStates({});
      fetchPersonalList();
    }
  }, [visible]);

  const fetchPersonalList = async () => {
    try {
      const personalResponse = await fetch(
        `${config.SERVER_API}/users/${userId}/personal-items`,
        { method: "GET" }
      );
      const personalData = await personalResponse.json();
      if (personalResponse.ok) {
        setFetchedItems(personalData.personalItems || []);

        const initialStates: Record<number, boolean> = {};
        personalData.personalItems.forEach((item: Item, index: number) => {
          initialStates[index] = false;
        });
        setItemStates(initialStates);
      } else {
        console.error("Failed to fetch personal list:", personalData.error);
        Alert.alert("Error", personalData.error || "Failed to load the personal list.");
      }
    } catch (error) {
      console.error("Error fetching personal list:", error);
      Alert.alert("Error", "Failed to load the personal list.");
    }
  };

  const handleSwitchChange = (index: number) => {
    setItemStates((prevStates) => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };

  const handleClose = () => {
    setItemStates({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={true}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Personal Items List:</Text>
          <Text style={styles.itemText}>Check if u forgot any of this items:</Text>

          {fetchedItems.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemText}>{String(item.itemName)}</Text>
              <Switch
                value={itemStates[index] ?? false}
                onValueChange={() => handleSwitchChange(index)}
              />
            </View>
          ))}
<TouchableOpacity style={styles.closeButton} onPress={handleClose}>
  <Text style={styles.closeButtonText}>Close</Text>
</TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10, 
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color:"#DF6316",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    marginTop: 10,
  },
  itemText: {
    fontSize: 16,
    color: "black",
  },
  closeButton: {
    backgroundColor: "#DF6316",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ShowItemList;
