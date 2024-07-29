import {useEffect} from 'react';
import {Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setReports} from '../redux/DataSlice';

export const BlockedScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setReports(10));
  }, []);
  return (
    <View
      style={{
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
        marginTop: 40,
        minHeight: 400,
        paddingHorizontal: 20,
      }}>
      <Text
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: 'white',
          paddingVertical: 20,
        }}>{`Your account\nis temporarily\nblocked for\n12 hours`}</Text>
      <View
        style={{
          height: 55,
          padding: 10,
          backgroundColor: '#051EFF',
        }}>
        <Text
          style={{
            fontSize: 24,
            color: 'white',
            fontWeight: 700,
          }}>
          {`10/10 reports`}
        </Text>
      </View>
    </View>
  );
};
