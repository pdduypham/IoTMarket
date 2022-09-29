import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import {ChatsScreen} from '~/features/Chats'
import {HomeScreen} from '~/features/Home'
import {SettingScreen} from '~/features/More'
import {ProductsScreen, UploadProductScreen} from '~/features/Products'
import {PRIMARY_COLOR, SECONDARY_COLOR} from '../constants'

const Tab = createBottomTabNavigator()

const screenOptions = () => ({
    tabBarStyle: {
        backgroundColor: SECONDARY_COLOR,
        height: 50,
        justifyContent: 'center',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    headerStyle: {backgroundColor: PRIMARY_COLOR},
    headerTitleStyle: {
        color: 'white',
    },
    hearderTintColor: 'white',
    headerTitleAlign: 'center',
    headerShown: false,
})

const CustomTabBarButton = ({children, onPress}) => (
    <TouchableOpacity
        style={{
            top: -15,
            justifyContent: 'center',
            alignItems: 'center',
        }}
        onPress={onPress}>
        <View
            style={{
                width: 64,
                height: 64,
                borderRadius: 35,
                marginHorizontal: 5,
                backgroundColor: 'white',
            }}>
            {children}
        </View>
    </TouchableOpacity>
)

const BottomNavBar = () => {
    return (
        <Tab.Navigator screenOptions={screenOptions} initialRouteName="Home">
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={styles.viewContainer}>
                            <Icon
                                name="home"
                                size={focused ? 36 : 24}
                                color={focused ? PRIMARY_COLOR : '#999999'}
                                solid={false}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Products"
                component={ProductsScreen}
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={styles.viewContainer}>
                            <Icon
                                name="store"
                                size={focused ? 36 : 24}
                                color={focused ? PRIMARY_COLOR : '#999999'}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="UploadProduct"
                component={UploadProductScreen}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Icon
                            name="plus-circle"
                            size={62}
                            color={PRIMARY_COLOR}
                        />
                    ),
                    tabBarButton: props => <CustomTabBarButton {...props} />,
                }}
            />
            <Tab.Screen
                name="Chats"
                component={ChatsScreen}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Icon
                            name="comment-alt"
                            size={focused ? 36 : 24}
                            color={focused ? PRIMARY_COLOR : '#999999'}
                            solid={true}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="More"
                component={SettingScreen}
                options={{
                    tabBarIcon: ({focused}) => (
                        <Icon
                            name="cog"
                            size={focused ? 36 : 24}
                            color={focused ? PRIMARY_COLOR : '#999999'}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

export default BottomNavBar

const styles = StyleSheet.create({
    viewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    hideTabNavigation: {
        display: 'none',
    },
})
