import InAppBilling from "react-native-billing";
const GoogleInAppPurchase = () => {
       
    const purchaseProduct = async (productId) => {
        try {
        const purchase = await InAppPurchase.purchase(productId);
        setPurchased((prev) => [...prev, purchase]);
        } catch (error) {
        console.log(error);
        }
    };
    
    return (
        <View >
        
        </View>
    );
    }
    export default GoogleInAppPurchase;