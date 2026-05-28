import { Alert } from "react-native";

export const errorAlert = (message: string) => {
  Alert.alert("Error  :(", message, [{ text: "OK" }], { cancelable: false });
};

export const deleteAlert = (itemName: string, deleteItem: () => void, msg?: string) => {
  Alert.alert(
    "Delete " + itemName,
    msg ? msg : "Are you sure you want to delete this item? This action cannot be undone.", // Alert Message
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          deleteItem();
        },
        style: "destructive",
      },
    ],
    {
      cancelable: true,
    },
  );
};
