import { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { setIsBlocked, setReports } from "../redux/DataSlice";
import { getUserDailyReports } from "../utils/api";

export const AccountHealth = ({ route, navigation }) => {

    const dispatch = useDispatch();
    const { Reports, IP } = useSelector(state => state.data);

    useEffect(() => {
        async function fetchData() {
            const { reports, isBlocked } = await getUserDailyReports(IP);
            dispatch(setReports(reports.length));
            dispatch(setIsBlocked(isBlocked));
        }

        fetchData();
    }, []);

    return (
        <ScrollView
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#211F1F',
                paddingVertical: 40,
                paddingHorizontal: 20
            }}
        >
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image
                    source={require('../assets/images/back_icon.png')}
                    style={{
                        width: 90,
                        height: 20
                    }}
                />
            </TouchableOpacity>
            <Text
                style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    color: 'white',
                    marginTop: 20
                }}
            >
                {`Account \nhealth`}
            </Text>
            <Text
                style={{
                    fontSize: 15,
                    color: 'white',
                    fontWeight: 500,
                    marginTop: 10
                }}
            >
                {`If your account receive 10 reports in a day your account will be temporarily block for 12 hours`}
            </Text>

            <View
                style={{
                    marginTop: 15,
                    backgroundColor: '#051EFF',
                    height: 55,
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                        padding: 4,
                        color: 'white',
                        fontWeight: 700,
                        paddingHorizontal: 10,
                        paddingVertical: 10
                    }}
                >
                    {`${Reports}/10 reports`}
                </Text>
            </View>
            {Reports.length ? <>
                <Text
                    style={{
                        fontSize: 15,
                        color: 'white',
                        fontWeight: 500,
                        marginTop: 30
                    }}
                >
                    {`If you fell someone reported you by mistake you can appeal`}
                </Text>
                <TouchableOpacity
                    style={{
                        marginTop: 15,
                        backgroundColor: '#051EFF',
                        height: 55,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 24,
                            padding: 4,
                            color: 'white',
                            fontWeight: 700,
                            paddingHorizontal: 10,
                            paddingVertical: 10
                        }}
                    >
                        {`Appeal now`}
                    </Text>
                </TouchableOpacity>
            </>
                : null
            }
        </ScrollView>
    )
}