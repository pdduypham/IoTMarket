import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import React, {useLayoutEffect} from 'react'
import {
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import {Avatar} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Ion from 'react-native-vector-icons/Ionicons'
import {useSelector, useDispatch} from 'react-redux'
import {globalStyles} from '../../../assets/styles/globalStyles'
import {
    API_URL,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
} from '../../../components/constants'
import {signOut} from '../../Users/userSlice'

const MoreScreen = ({navigation}) => {
    const currentUser = useSelector(state => state.user)
    const dispatch = useDispatch()

    const deleteRememberAccount = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            axios({
                method: 'patch',
                url: `${API_URL}/user/changeonlinestatus`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
                data: {
                    status: 'Offline',
                },
            }).then(async () => {
                await AsyncStorage.removeItem('account')
                await AsyncStorage.removeItem('password')
                await AsyncStorage.removeItem('accountType')
                await AsyncStorage.removeItem('token')
            })
        } catch (error) {
            console.log('Error when delete remember account', error)
        }
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerStyle: {
                backgroundColor: PRIMARY_COLOR,
            },
            headerTitle: '',
        })
    }, [])

    const handleSignOutClick = () => {
        Alert.alert('Confirm Sign Out?', '', [
            {
                text: 'Yes',
                onPress: () => {
                    axios({
                        method: 'post',
                        url: `${API_URL}/auth/logout`,
                        data: {
                            email: currentUser.email,
                        },
                    }).then(res => {
                        const action = signOut()
                        res.status == 200 && dispatch(action)

                        deleteRememberAccount()

                        navigation.navigate('SignIn')
                    })
                },
            },

            {
                text: 'Cancel',
            },
        ])
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                }}>
                <Avatar
                    rounded
                    size={64}
                    source={{uri: currentUser.avatar}}
                    avatarStyle={{
                        borderWidth: 1,
                        borderColor: 'gray',
                    }}
                />
                <View
                    style={{
                        marginLeft: 10,
                    }}>
                    <Text
                        style={{
                            fontWeight: 'bold',
                            fontSize: 20,
                            color: 'black',
                        }}>
                        {currentUser.fullName || ''}
                    </Text>
                    <Text>See your profile.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.container}>
                <Ion name="people-outline" size={30} color={'blue'} />
                <Text style={styles.textStyle}>Follow</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.container}>
                <Image
                    source={require('~/assets/images/buy.png')}
                    style={{
                        tintColor: 'red',
                    }}
                />
                <Text style={styles.textStyle}>Bought Products</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.container}>
                <Image
                    source={require('~/assets/images/sell.png')}
                    style={{
                        tintColor: 'green',
                    }}
                />
                <Text style={styles.textStyle}>Sold Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.container}
                onPress={() => navigation.navigate('Favorite')}>
                <Icon name="heart" color={'#FF4122'} solid={true} size={24} />
                <Text style={styles.textStyle}>Favorite Products</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('ChangeInfo')}
                style={styles.container}>
                <Icon
                    name="info-circle"
                    color={'#45B8FE'}
                    solid={true}
                    size={24}
                />
                <Text style={styles.textStyle}>Change Your Infomation</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSignOutClick}
                style={styles.container}>
                <Icon
                    name="sign-out-alt"
                    color={'black'}
                    solid={true}
                    size={24}
                />
                <Text style={styles.textStyle}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default MoreScreen

const styles = StyleSheet.create({
    textStyle: {
        color: 'black',
        fontSize: 16,
        marginLeft: 10,
    },

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
})
