import { Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { ActivityIndicator } from "react-native";

export const ConfirmationPopup = ({ 
    isVisible,
    title, 
    positiveLabel, 
    negativeLabel, 
    positiveCallback, 
    negativeCallback,
    positiveCallbackParams = [],
    negativeCallbackParams = [],
    popupLoader,
    singleOption = false
}) => {
    return (
        <Modal
            visible={isVisible}
            style={{ marginTop: 100 }}
            animationType="none"
            transparent={true}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                }}>
                <View style={styles.popupContainer}>
                    <Image 
                        source={require('../assets/images/exit_popup.jpg')}
                        style={{
                            width: 256,
                            height: 170,
                            alignSelf: 'center',
                            marginBottom: 20,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            marginLeft: 2,
                            marginRight: 2,
                        }}
                    />
                    <Text style={styles.title}>{title}</Text>
                    <View style={[{...styles.buttonBlock}, {justifyContent: singleOption ? 'flex-end' : 'space-between'}]}>
                        {!singleOption && <TouchableOpacity style={[{...styles.button}, {backgroundColor: '#051EFF'}]} onPress={() => negativeCallback(...negativeCallbackParams)}>
                            <Text style={styles.buttonLabel}>{negativeLabel}</Text>
                        </TouchableOpacity>
                        }
                        <TouchableOpacity style={[{...styles.button}, {backgroundColor: '#626367'}]} onPress={() => positiveCallback(...positiveCallbackParams)}>
                            {popupLoader ? 
                                <ActivityIndicator size="small" color="white" />
                            : <Text style={styles.buttonLabel}>{positiveLabel}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        width: 260,
        backgroundColor: '#211F1F',
        borderRadius: 23,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderWidth: 2,
        borderColor: 'white',
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
    },
    buttonBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        fontWeight: 'bold',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        paddingVertical: 2
    }
});
