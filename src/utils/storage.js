import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
};

const removeData = key => {
  try {
    AsyncStorage.removeItem(key);
  } catch (e) {
    console.log(e);
  }
};

const getData = async key => {
  try {
    const user = await AsyncStorage.getItem(key);
    return user != null ? JSON.parse(user) : null;
  } catch (error) {
    return {result: 'E'};
  }
};

export {storeData, getData, removeData};