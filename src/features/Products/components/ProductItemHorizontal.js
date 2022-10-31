import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import React, {useState} from 'react'
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import {Card} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome5'
import {useDispatch} from 'react-redux'
import {globalStyles} from '../../../assets/styles/globalStyles'
import {API_URL} from '../../../components/constants'
import {removeFavorite} from '../favoriteSlice'

const ProductItemHorizontal = ({navigation, product, type}) => {
    const dispatch = useDispatch()
    const [quantity, setQuantity] = useState(product.quantity)

    console.log(product)

    const handleRemoveFavoriteClick = async () => {
        try {
            const token = await AsyncStorage.getItem('token')

            axios({
                method: 'patch',
                url: `${API_URL}/user/unfavorite/${product._id}`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }).then(res => {
                if (res.status == 200) {
                    dispatch(removeFavorite(product._id))
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteAllClick = async () => {
        Alert.alert('Do you want to remove this product from your cart?', '', [
            {text: 'Yes', onPress: () => removeCart(quantity)},
            {text: 'No'},
        ])
    }

    const removeCart = async amount => {
        try {
            const token = await AsyncStorage.getItem('token')
            axios({
                method: 'patch',
                url: `${API_URL}/user/removecart`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
                data: {
                    productId: product.productId._id,
                    quantity: amount,
                },
            })
                .then(res => {
                    if (res.status == 200) {
                        quantity != amount
                            ? setQuantity((parseInt(quantity) - 1).toString())
                            : setQuantity(0)
                    }
                })
                .catch(error => {
                    console.log('Cart: ', error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    const addToCart = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            axios({
                method: 'patch',
                url: `${API_URL}/user/addcart`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
                data: {
                    productId: product.productId._id,
                    quantity: 1,
                },
            })
                .then(res => {
                    if (res.status == 200) {
                        setQuantity((parseInt(quantity) + 1).toString())
                    }
                })
                .catch(error => {
                    Alert.alert('Run out of product.')
                    console.log('Cart: ', error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    const subQuantity = () => {
        if (quantity > 1) {
            removeCart(1)
        } else {
            Alert.alert(
                'Do you want to remove this product from your cart?',
                '',
                [{text: 'Yes', onPress: () => removeCart(1)}, {text: 'No'}],
            )
        }
    }

    return quantity >= 1 || type == 'favorite' ? (
        <Card
            containerStyle={{
                ...globalStyles.cardContainer,
                marginBottom: 5,
            }}>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('ProductDetail', {
                        _id:
                            type == 'favorite'
                                ? product._id
                                : product.productId._id,
                    })
                }
                style={{flexDirection: 'row'}}>
                <Image
                    source={{
                        uri:
                            type == 'favorite'
                                ? product.thumbnailImage
                                : product.productId.thumbnailImage,
                    }}
                    style={{
                        width: 100,
                        height: 80,
                    }}
                    resizeMethod="resize"
                    resizeMode="contain"
                />

                <View style={{marginLeft: 5, flex: 1}}>
                    <Text
                        style={{
                            color: 'black',
                            fontSize: 18,
                            fontWeight: 'bold',
                            width: '100%',
                        }}>
                        {type == 'favorite'
                            ? product.productName
                            : product.productId.productName}
                    </Text>
                    <Text
                        style={{
                            color: 'blue',
                            fontSize: 16,
                        }}>
                        {type == 'favorite'
                            ? Intl.NumberFormat('en-US').format(product.price)
                            : Intl.NumberFormat('en-US').format(
                                  product.productId.price,
                              )}{' '}
                        đ
                    </Text>

                    {type == 'cart' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <TouchableOpacity
                                onPress={subQuantity}
                                style={styles.touchStyle}>
                                <Text style={styles.textStyle}>-</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={{
                                    paddingHorizontal: 5,
                                    fontSize: 20,
                                }}
                                defaultValue={quantity.toString()}
                                value={quantity}
                                textAlign="center"
                                onChangeText={text => setQuantity(text)}
                            />
                            <TouchableOpacity
                                onPress={addToCart}
                                style={styles.touchStyle}>
                                <Text style={styles.textStyle}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                {type == 'cart' ? (
                    <TouchableOpacity
                        onPress={handleDeleteAllClick}
                        style={{
                            justifyContent: 'center',
                            marginRight: 5,
                        }}>
                        <Icon name="trash" color={'#FA8072'} size={24} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleRemoveFavoriteClick}
                        style={{
                            justifyContent: 'center',
                            marginRight: 5,
                        }}>
                        <Icon
                            name="heart"
                            color={'red'}
                            size={24}
                            solid={true}
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Card>
    ) : (
        <View />
    )
}

export default ProductItemHorizontal

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 20,
        color: 'black',
    },
    touchStyle: {
        borderRadius: 5,
        borderColor: 'black',
        borderRadius: 5,
        borderWidth: 0.7,
        paddingHorizontal: 15,
    },
})
