import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { countries, languages } from "../constants/searchData";
import { setCountryFilter, setLanguageFilter } from "../redux/DataSlice";

export const SearchList = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const { SearchKey } = useSelector((state) => state.data);

    const dispatch = useDispatch();

    useEffect(() => {
        if (SearchKey == 'country') {
            setItems(countries);
        } else if (SearchKey == 'language') {
            setItems(languages);
        }
    }, []);

    const handleSelection = (item) => {
        if (item !== null) {
            if (SearchKey == 'country') {
                dispatch(setCountryFilter(item));
            } else if (SearchKey == 'language') {
                dispatch(setLanguageFilter(item));
            }
        }
        navigation.goBack();
    }

    const filterItems = (text) => {
        const originalSearchList = SearchKey == 'country' ? countries : languages;
        setSearchValue(text);
        const filteredItems = originalSearchList.filter((item) => {
            return item.toLowerCase().includes(text.toLowerCase());
        });
        setItems(filteredItems);
    }

    return (
        <View
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#202020'
            }}>
            <View
                style={{
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                    backgroundColor: '#f5f5f5',
                    marginTop: 30,
                    marginHorizontal: 15,
                    borderRadius: 30
                }}>
                <Image
                    source={require('../assets/images/search_icon.png')}
                    style={{
                        width: 24,
                        height: 24,
                        marginLeft: 10,
                        alignSelf: 'center'
                    }}
                />
                <TextInput
                    placeholder={`Search for a ${SearchKey}`}
                    placeholderTextColor={'grey'}
                    style={{
                        width: '100%',
                        padding: 10,
                        color: 'black'
                    }}
                    value={searchValue}
                    onChangeText={(text) => filterItems(text)}
                />
            </View>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                style={{
                    marginTop: 10
                }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                    key={index}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                            paddingVertical: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#404040'
                        }}
                        onPress={() => handleSelection(item)}
                    >
                        <Text
                            style={{
                                color: 'white',
                                fontSize: 16
                            }}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};