import AsyncStorage from '@react-native-async-storage/async-storage'
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import axios from 'axios'
import React, {useEffect, useState} from 'react'
import {AppState, StyleSheet} from 'react-native'
import {Provider} from 'react-redux'
import {API_URL} from './src/components/constants'
import BottomNavBar from './src/components/utils/BottomNavBar'
import {HomeScreen} from './src/features/Home'
import {
    FollowingScreen,
    OrderDetailScreen,
    OrderScreen,
    SettingStoreScreen,
    UpdateStoreScreen,
} from './src/features/More'
import FavoriteScreen from './src/features/More/pages/FavoriteScreen'
import MoreScreen from './src/features/More/pages/MoreScreen'
import StoreScreen from './src/features/More/pages/StoreScreen'
import {
    CartScreen,
    PaymentCartScreen,
    PaymentScreen,
    ProductDetail,
    UploadDetailScreen,
} from './src/features/Products'
import {ProductItem, WebViewPayment} from './src/features/Products/components'
import {
    ChangeAddressScreen,
    ChangeInfoScreen,
    ChangePasswordScreen,
    FilterByCategoryScreen,
    ProfileScreen,
    RecoverPasswordScreen,
    SignInScreen,
    SignUpScreen,
    SplashScreen,
    StoreProfileScreen,
} from './src/features/Users'
import {store} from './store'

const Stack = createNativeStackNavigator()
const globalSreenOptions = {
    headerShown: false,
}

export default function App() {
    const [onlineStatus, setOnlineStatus] = useState('')

    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange)

        return () => {
            AppState.removeEventListener('change', _handleAppStateChange)
        }
    }, [])

    const _handleAppStateChange = async () => {
        if (AppState.currentState == 'active') {
            try {
                const token = await AsyncStorage.getItem('token')
                axios({
                    method: 'patch',
                    url: `${API_URL}/user/changeonlinestatus`,
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                    data: {
                        status: 'Online',
                    },
                }).then(res => {
                    if (res.status == 200) {
                        setOnlineStatus('Online')
                    }
                })
            } catch (error) {
                console.log('Error', error.message)
            }
        } else {
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
                }).then(res => {
                    if (res.status == 200) {
                        setOnlineStatus('Offline')
                    }
                })
            } catch (error) {
                console.log('Error', error.message)
            }
        }
    }

    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={globalSreenOptions}
                    initialRouteName="Splash">
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="SignIn" component={SignInScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen
                        name="RecoverPassword"
                        component={RecoverPasswordScreen}
                    />
                    <Stack.Screen
                        name="BottomNavBar"
                        component={BottomNavBar}
                    />
                    <Stack.Screen name="ProductItem" component={ProductItem} />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetail}
                    />
                    <Stack.Screen name="More" component={MoreScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen
                        name="ChangeInfo"
                        component={ChangeInfoScreen}
                    />
                    <Stack.Screen
                        name="ChangeAddress"
                        component={ChangeAddressScreen}
                    />
                    <Stack.Screen
                        name="ChangePassword"
                        component={ChangePasswordScreen}
                    />
                    <Stack.Screen name="Cart" component={CartScreen} />
                    <Stack.Screen name="Favorite" component={FavoriteScreen} />
                    <Stack.Screen
                        name="UploadDetail"
                        component={UploadDetailScreen}
                    />
                    <Stack.Screen name="Store" component={StoreScreen} />
                    <Stack.Screen
                        name="UpdateStore"
                        component={UpdateStoreScreen}
                    />
                    <Stack.Screen
                        name="SettingStore"
                        component={SettingStoreScreen}
                    />
                    <Stack.Screen
                        name="FilterByCategory"
                        component={FilterByCategoryScreen}
                    />
                    <Stack.Screen
                        name="Following"
                        component={FollowingScreen}
                    />
                    <Stack.Screen
                        name="StoreProfile"
                        component={StoreProfileScreen}
                    />
                    <Stack.Screen name="Payment" component={PaymentScreen} />
                    <Stack.Screen
                        name="PaymentCart"
                        component={PaymentCartScreen}
                    />
                    <Stack.Screen
                        name="WebViewPayment"
                        component={WebViewPayment}
                    />
                    <Stack.Screen name="Order" component={OrderScreen} />
                    <Stack.Screen
                        name="OrderDetail"
                        component={OrderDetailScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    )
}

const styles = StyleSheet.create({})
