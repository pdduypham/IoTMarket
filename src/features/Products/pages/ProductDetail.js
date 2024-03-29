import {firebase} from '@react-native-firebase/messaging'
import {useIsFocused} from '@react-navigation/native'
import axios from 'axios'
import React, {useEffect, useLayoutEffect, useState} from 'react'
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Carousel from 'react-native-anchor-carousel'
import {Avatar, Badge, Card, Divider, Rating} from 'react-native-elements'
import * as Progress from 'react-native-progress'
import Toast from 'react-native-toast-message'
import Ant from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Ion from 'react-native-vector-icons/Ionicons'
import Material from 'react-native-vector-icons/MaterialIcons'
import {useDispatch, useSelector} from 'react-redux'
import ModalLoading from '~/components/utils/ModalLoading'
import {globalStyles} from '../../../assets/styles/globalStyles'
import {
    AlertForSignIn,
    API_URL,
    AVATAR_BORDER,
    convertTime,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
} from '../../../components/constants'
import {deleteAPI, getAPI, patchAPI} from '../../../components/utils/base_API'
import {addFollow, removeFollow} from '../../Users/userSlice'
import {
    ProductItem,
    ReviewItemHorizontal,
    SimplePaginationDot,
} from '../components'
import BottomMenuBar from '../components/BottomMenuBar'
import {addFavorite, removeFavorite} from '../favoriteSlice'

const ProductDetail = ({navigation, route}) => {
    const currentUser = useSelector(state => state.user)
    const dispatch = useDispatch()

    const _id = route.params._id
    const [product, setProduct] = useState([])
    const [productOwner, setProductOwner] = useState([])
    const [modalLoading, setModalLoading] = useState(true)
    const [listImages, setListImages] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [favorite, setFavorite] = useState(false)
    const [rating, setRating] = useState({})
    const [isFollow, setIsFollow] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [storeInfo, setStoreInfo] = useState([])
    const [isStore, setIsStore] = useState(false)
    const [modalBuyVisible, setModalBuyVisible] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [miniListReview, setMiniListReview] = useState([])
    const [listReview, setListReview] = useState([])
    const [listProduct, setListProduct] = useState([])
    const [modalEdit, setModalEdit] = useState(false)
    const [bucketPath, setBucketPath] = useState('')
    const isFocus = useIsFocused()

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Detail',
            headerStyle: {backgroundColor: PRIMARY_COLOR},
            headerTintColor: 'white',
            headerShown: true,
            headerBackTitleStyle: {
                color: 'white',
            },
            headerRight: () => (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {!isOwner && (
                        <TouchableOpacity
                            onPress={() => {
                                Object.keys(currentUser).length !== 0
                                    ? navigation.navigate('Favorite')
                                    : AlertForSignIn({navigation})
                            }}
                            style={{
                                marginRight: 5,
                            }}>
                            <Icon
                                name="heart"
                                size={24}
                                color="white"
                                solid={true}
                            />
                        </TouchableOpacity>
                    )}

                    {!isOwner && (
                        <TouchableOpacity
                            onPress={() => {
                                Object.keys(currentUser).length !== 0
                                    ? navigation.navigate('Cart')
                                    : AlertForSignIn({navigation})
                            }}>
                            <Ion name="cart-outline" size={30} color="white" />
                        </TouchableOpacity>
                    )}

                    {isOwner && (
                        <TouchableOpacity onPress={() => setModalEdit(true)}>
                            <Material
                                name="more-vert"
                                size={30}
                                color="white"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            ),
        })
    }, [isOwner])

    //Get Product Detail
    useEffect(() => {
        getProduct()

        getReview()
    }, [isFocus])

    const getProduct = () => {
        setModalLoading(true)

        axios({
            method: 'get',
            url: `${API_URL}/product/${_id}`,
        })
            .then(res => {
                if (res.status == 200) {
                    setProduct(res.data.product)

                    setBucketPath(res.data.product.detailImages.shift())
                    setListImages(res.data.product.detailImages)

                    setRating(res.data.product.rating)

                    getAPI({
                        url: `product/category/${res.data.product.categoryId}`,
                    }).then(
                        res =>
                            res.status === 200 &&
                            setListProduct(res.data.products),
                    )

                    res.data.product.peopleFavoriteThisProduct.forEach(id => {
                        id == currentUser._id && setFavorite(true)
                    })

                    if (
                        res.data.product.ownerId == currentUser._id ||
                        res.data.product.ownerId == currentUser.storeId
                    ) {
                        setIsOwner(true)
                    } else {
                        setIsOwner(false)
                    }

                    if (res.data.product.isStore) {
                        axios({
                            method: 'get',
                            url: `${API_URL}/store/${res.data.product.ownerId}`,
                        })
                            .then(res => {
                                setStoreInfo(res.data.store)
                                setIsStore(true)

                                //Get User Infomation
                                axios({
                                    method: 'get',
                                    url: `${API_URL}/user/${res.data.store.ownerId}`,
                                })
                                    .then(res => {
                                        if (res.status === 200) {
                                            setProductOwner(res.data.userInfo)
                                            currentUser.follows.forEach(
                                                id =>
                                                    id ==
                                                        res.data.userInfo
                                                            .storeId &&
                                                    setIsFollow(true),
                                            )
                                        }
                                    })
                                    .then(() => setModalLoading(false))
                                    .catch(error => {
                                        console.log(error.response)
                                        setModalLoading(false)
                                    })
                            })
                            .catch(error => {
                                setModalLoading(false)
                                console.log(error.response)
                            })
                    } else {
                        setIsStore(false)
                        axios({
                            method: 'get',
                            url: `${API_URL}/user/${res.data.product.ownerId}`,
                        })
                            .then(res => {
                                if (res.status === 200) {
                                    setProductOwner(res.data.userInfo)
                                    currentUser.follows.forEach(
                                        id =>
                                            id == res.data.userInfo.storeId &&
                                            setIsFollow(true),
                                    )
                                    setModalLoading(false)
                                }
                            })
                            .catch(error => {
                                console.log(error.response)
                                setModalLoading(false)
                            })
                    }
                }
            })
            .catch(error => {
                setModalLoading(false)
                console.log(error.response.data)
            })
    }

    const getReview = () => {
        setModalLoading(true)
        getAPI({url: `review/${_id}`})
            .then(res => {
                if (res.status === 200) {
                    setMiniListReview([
                        res.data.reviews[0],
                        res.data.reviews[1],
                        res.data.reviews[2],
                    ])

                    setListReview(res.data.reviews)

                    setModalLoading(false)
                }
            })
            .catch(err => console.log('Get Reviews: ', err))
    }

    const onRefresh = () => {
        getProduct()
        getReview()

        setTimeout(() => {
            setRefreshing(false)
        }, 2000)
    }

    function handleCarouselScrollEnd(item, index) {
        setCurrentIndex(index)
    }

    const handleAddCartClick = () => {
        Object.keys(currentUser).length !== 0
            ? patchAPI({
                  url: 'user/addcart',
                  data: {
                      productId: _id,
                      quantity: 1,
                  },
              })
                  .then(
                      res =>
                          res.status === 200 &&
                          Toast.show({
                              type: 'success',
                              text1: 'Added to cart.',
                          }),
                  )
                  .catch(err => console.log('Add Cart: ', err))
            : AlertForSignIn({navigation})
    }

    const handleFavoriteClick = () => {
        Object.keys(currentUser).length !== 0
            ? !favorite
                ? patchAPI({url: `user/favorite/${_id}`})
                      .then(res => {
                          if (res.status === 200) {
                              setFavorite(!favorite)

                              Toast.show({
                                  type: 'success',
                                  text1: 'Added to your favorite.',
                              })

                              dispatch(addFavorite(product))
                          }
                      })
                      .catch(err => console.log('Add Favorite: ', err))
                : patchAPI({url: `user/unfavorite/${_id}`})
                      .then(res => {
                          if (res.status === 200) {
                              setFavorite(false)

                              Toast.show({
                                  type: 'success',
                                  text1: 'Removed from your favorite.',
                              })

                              dispatch(removeFavorite(product._id))
                          }
                      })
                      .catch(err => console.log('Remove Favorite: ', err))
            : AlertForSignIn({navigation})
    }

    const handleFollowClick = () => {
        Object.keys(currentUser) !== 0
            ? !isFollow
                ? patchAPI({url: `user/follow/${productOwner.storeId}`})
                      .then(res => {
                          if (res.status === 200) {
                              setIsFollow(true)

                              Toast.show({
                                  type: 'success',
                                  text1: 'Followed',
                              })

                              dispatch(addFollow(productOwner.storeId))
                          }
                      })
                      .catch(err => console.log('Follow: ', err))
                : patchAPI({url: `unfollow/${productOwner.storeId}`})
                      .then(res => {
                          if (res.status === 200) {
                              setIsFollow(false)

                              Toast.show({
                                  type: 'success',
                                  text1: 'Unfollowed',
                              })

                              dispatch(removeFollow(productOwner.storeId))
                          }
                      })
                      .catch(err => console.log('Unfollow: ', err))
            : AlertForSignIn({navigation})
    }

    const setVisible = isVisible => {
        setModalBuyVisible(isVisible)
    }

    const handleDeleteClick = () => {
        Alert.alert('Delete this product?', '', [
            {
                text: 'Yes',
                onPress: () => {
                    setModalLoading(true)
                    deleteAPI({url: `product/${product._id}`})
                        .then(async res => {
                            if (res.status === 200) {
                                await firebase
                                    .storage()
                                    .ref(bucketPath)
                                    .list()
                                    .then(result => {
                                        result.items.forEach(item =>
                                            console.log(item.delete()),
                                        )
                                    })
                                    .then(() => {
                                        setModalLoading(false)
                                        navigation.goBack()
                                    })
                            }
                        })
                        .catch(err => console.log('Delete:', err))
                },
            },
            {
                text: 'No',
            },
        ])
    }

    const handleEditClick = () => {
        getAPI({url: 'category'})
            .then(res => {
                if (res.status === 200) {
                    res.data.categories.forEach(category => {
                        category._id === product.categoryId &&
                            navigation.navigate('UploadDetail', {
                                category: category,
                                isEdit: true,
                                product: product,
                                bucketPath: bucketPath,
                            })
                    })
                    setModalEdit(false)
                }
            })
            .catch(err => console.log('Get Sub: ', err))
    }

    return !modalLoading ? (
        <SafeAreaView
            style={{
                ...globalStyles.container,
                opacity: modalLoading + modalBuyVisible ? 0.3 : 1,
            }}>
            <ModalLoading visible={modalLoading} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }>
                <View
                    style={{
                        height: 300,
                    }}>
                    {listImages.length == 1 ? (
                        <View>
                            <Image
                                source={{uri: listImages[0]}}
                                resizeMethod="scale"
                                resizeMode="contain"
                                style={styles.imageStyle}
                            />
                        </View>
                    ) : (
                        <Carousel
                            autoplay={true}
                            lockScrollWhileSnapping={true}
                            autoplayInterval={1000}
                            data={listImages}
                            style={{
                                marginBottom: 10,
                            }}
                            initialIndex={0}
                            onScrollEnd={handleCarouselScrollEnd}
                            itemWidth={Dimensions.get('window').width * 0.95}
                            containerWidth={
                                Dimensions.get('window').width * 0.95
                            }
                            separatorWidth={2}
                            inActiveOpacity={0.5}
                            onSnapToItem={index => setIndex(index)}
                            renderItem={({item}) => (
                                <Image
                                    source={{
                                        uri: item,
                                    }}
                                    resizeMethod="scale"
                                    resizeMode="contain"
                                    style={{
                                        width: '100%',
                                        height: 250,
                                        borderRadius: 10,
                                        shadowColor: 'black',
                                        shadowOffset: {width: -2, height: 4},
                                        shadowOpacity: 0.5,
                                        shadowRadius: 3,
                                        elevation: 10,
                                    }}
                                />
                            )}
                        />
                    )}
                    <SimplePaginationDot
                        currentIndex={currentIndex}
                        length={listImages.length}
                    />
                </View>

                <Card
                    containerStyle={{
                        ...globalStyles.cardContainer,
                        marginTop: 12,
                    }}>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('StoreProfile', {
                                store: storeInfo,
                                ownerInfo: productOwner,
                            })
                        }>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <View>
                                <Avatar
                                    rounded
                                    size={'medium'}
                                    source={{
                                        uri: isStore
                                            ? storeInfo.shopImage
                                            : productOwner.avatar,
                                    }}
                                    avatarStyle={{
                                        borderWidth: 1,
                                        borderColor: AVATAR_BORDER,
                                    }}
                                />

                                <Badge
                                    value=" "
                                    status={
                                        productOwner.onlineStatus == 'Online'
                                            ? 'success'
                                            : 'warning'
                                    }
                                    containerStyle={{
                                        position: 'absolute',
                                        bottom: 2,
                                        right: 5,
                                    }}
                                />
                            </View>

                            <View style={{flex: 1}}>
                                <Text
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    style={{
                                        fontWeight: 'bold',
                                        color: 'black',
                                        marginLeft: 10,
                                        fontSize: 16,
                                    }}>
                                    {isStore
                                        ? storeInfo.displayName
                                        : productOwner.fullName}
                                </Text>
                                <Text style={{color: 'black', marginLeft: 10}}>
                                    {productOwner.onlineStatus == 'Online'
                                        ? 'Online'
                                        : convertTime(
                                              Date.parse(
                                                  productOwner.updatedAt,
                                              ),
                                          )}
                                </Text>
                            </View>
                            {!isOwner && (
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    {isStore && (
                                        <TouchableOpacity
                                            onPress={handleFollowClick}
                                            style={{
                                                ...styles.touchStyle,
                                                borderColor: isFollow
                                                    ? 'red'
                                                    : PRIMARY_COLOR,
                                                marginRight: 5,
                                                borderWidth: 1,
                                            }}>
                                            {isFollow ? (
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    }}>
                                                    <Ant
                                                        name="minuscircleo"
                                                        size={14}
                                                        color="red"
                                                    />
                                                    <Text
                                                        style={{
                                                            color: 'red',
                                                            marginLeft: 5,
                                                        }}>
                                                        Follow
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    }}>
                                                    <Ant
                                                        name="pluscircleo"
                                                        size={14}
                                                        color={PRIMARY_COLOR}
                                                    />
                                                    <Text
                                                        style={{
                                                            color: PRIMARY_COLOR,
                                                            marginLeft: 5,
                                                        }}>
                                                        Follow
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Card>

                <Card
                    containerStyle={{
                        ...globalStyles.cardContainer,
                        marginTop: 12,
                    }}>
                    <Text
                        style={{
                            fontWeight: 'bold',
                            color: 'black',
                            fontSize: 18,
                        }}>
                        {product.productName}
                    </Text>

                    <Text
                        style={{
                            color: 'blue',
                            fontSize: 18,
                        }}>
                        Price:{' '}
                        {Intl.NumberFormat('en-US').format(product.price)} đ
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Rating
                            type="custom"
                            readonly
                            startingValue={rating.ratingValue}
                            imageSize={16}
                            ratingColor="#FA8128"
                            fractions={false}
                        />
                        <Text
                            style={{
                                color: 'black',
                                fontSize: 16,
                                marginLeft: 5,
                            }}>
                            {rating.ratingValue} | Sold:{' '}
                            {Intl.NumberFormat('en-US').format(
                                product.soldCount,
                            )}
                        </Text>

                        <View style={{flex: 1}} />

                        {!isOwner && (
                            <TouchableOpacity
                                onPress={handleFavoriteClick}
                                style={{...styles.touchStyle}}>
                                <Icon
                                    name="heart"
                                    size={24}
                                    color={favorite ? 'red' : PRIMARY_COLOR}
                                    solid={favorite}
                                />
                            </TouchableOpacity>
                        )}

                        {!isOwner && (
                            <TouchableOpacity
                                onPress={handleAddCartClick}
                                style={styles.touchStyle}>
                                <Ion
                                    name="cart-outline"
                                    size={30}
                                    color={PRIMARY_COLOR}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>

                <Card
                    containerStyle={{
                        ...globalStyles.cardContainer,
                        marginTop: 12,
                    }}>
                    <View style={styles.viewStyle}>
                        <Text style={styles.textStyle}>Condition: </Text>
                        <Text
                            style={{
                                color:
                                    product.condition === 'New'
                                        ? PRIMARY_COLOR
                                        : product.condition ===
                                          'Used - Like New'
                                        ? 'green'
                                        : product.condition === 'Used - Good'
                                        ? '#ffbf00'
                                        : 'orange',
                                fontWeight: 'bold',
                            }}>
                            {product.condition}
                        </Text>
                    </View>

                    <View style={styles.viewStyle}>
                        <Text style={styles.textStyle}>Number in stock: </Text>
                        <Text style={{color: 'black'}}>
                            {product.numberInStock}
                        </Text>
                    </View>
                </Card>

                <Card
                    containerStyle={{
                        ...globalStyles.cardContainer,
                        marginTop: 12,
                    }}>
                    <View style={styles.viewStyle}>
                        <Text
                            numberOfLines={
                                modalLoading
                                    ? 1
                                    : Math.round(
                                          product.description.length / 45,
                                      )
                            }
                            style={{color: 'black'}}>
                            {product.description}
                        </Text>
                    </View>
                </Card>

                <Card
                    containerStyle={{
                        ...globalStyles.cardContainer,
                        marginTop: 12,
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            marginBottom: 5,
                        }}>
                        <View style={{alignItems: 'center'}}>
                            <Text
                                style={{
                                    color: 'black',
                                    fontWeight: '700',
                                    fontSize: 20,
                                    marginVertical: 10,
                                }}>
                                {rating.ratingValue}
                            </Text>

                            <Rating
                                type="custom"
                                readonly
                                startingValue={rating.ratingValue}
                                imageSize={20}
                                ratingColor="#FA8128"
                                fractions={false}
                            />

                            <Text
                                style={{color: 'black'}}>{`(${Intl.NumberFormat(
                                'en-US',
                            ).format(rating.ratingCount)} reviews)`}</Text>
                        </View>

                        <Divider
                            orientation="vertical"
                            color={PRIMARY_COLOR}
                            width={1}
                        />

                        {rating !== undefined && (
                            <View>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            color: 'black',
                                            marginRight: 10,
                                        }}>
                                        5
                                    </Text>
                                    <Progress.Bar
                                        animated={false}
                                        progress={
                                            rating.fiveStarCount /
                                                rating.ratingCount || 0
                                        }
                                        color={PRIMARY_COLOR}
                                        unfilledColor={SECONDARY_COLOR}
                                        borderColor="white"
                                        useNativeDriver={true}
                                    />
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            color: 'black',
                                            marginRight: 10,
                                        }}>
                                        4
                                    </Text>
                                    <Progress.Bar
                                        animated={false}
                                        progress={
                                            rating.fourStarCount /
                                                rating.ratingCount || 0
                                        }
                                        color={PRIMARY_COLOR}
                                        unfilledColor={SECONDARY_COLOR}
                                        borderColor="white"
                                    />
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            color: 'black',
                                            marginRight: 10,
                                        }}>
                                        3
                                    </Text>
                                    <Progress.Bar
                                        animated={false}
                                        progress={
                                            rating.threeStarCount /
                                                rating.ratingCount || 0
                                        }
                                        color={PRIMARY_COLOR}
                                        unfilledColor={SECONDARY_COLOR}
                                        borderColor="white"
                                    />
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            color: 'black',
                                            marginRight: 10,
                                        }}>
                                        2
                                    </Text>
                                    <Progress.Bar
                                        animated={false}
                                        progress={
                                            rating.twoStarCount /
                                                rating.ratingCount || 0
                                        }
                                        color={PRIMARY_COLOR}
                                        unfilledColor={SECONDARY_COLOR}
                                        borderColor="white"
                                    />
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}>
                                    <Text
                                        style={{
                                            color: 'black',
                                            marginRight: 10,
                                        }}>
                                        1
                                    </Text>
                                    <Progress.Bar
                                        animated={false}
                                        progress={
                                            rating.oneStarCount /
                                                rating.ratingCount || 0
                                        }
                                        height={10}
                                        color={PRIMARY_COLOR}
                                        unfilledColor={SECONDARY_COLOR}
                                        borderColor="white"
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    <Divider width={1} color={PRIMARY_COLOR} />

                    {listReview.length < 4
                        ? miniListReview.map((review, index) => (
                              <ReviewItemHorizontal
                                  key={index}
                                  navigation={navigation}
                                  review={review}
                              />
                          ))
                        : listReview.map((review, index) => (
                              <ReviewItemHorizontal
                                  key={index}
                                  navigation={navigation}
                                  review={review}
                              />
                          ))}

                    {rating.ratingCount > 3 && (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('AllReview', {
                                    listReview,
                                })
                            }
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 10,
                            }}>
                            <Text
                                style={{
                                    color: PRIMARY_COLOR,
                                    fontSize: 16,
                                    alignSelf: 'center',
                                }}>
                                See all {rating.ratingCount} reviews.
                            </Text>

                            <Ion
                                name="chevron-forward-outline"
                                size={20}
                                color="black"
                                style={{position: 'absolute', right: 10}}
                            />
                        </TouchableOpacity>
                    )}
                </Card>

                {listProduct.length > 0 && (
                    <View
                        style={{
                            marginBottom: 60,
                            marginTop: 12,
                        }}>
                        <Text
                            style={{
                                color: 'black',
                                fontWeight: '700',
                                fontSize: 18,
                            }}>
                            Products In Same Category
                        </Text>

                        <ScrollView
                            horizontal
                            style={{marginTop: 5}}
                            showsHorizontalScrollIndicator={false}>
                            {listProduct.map((item, index) => (
                                <ProductItem
                                    navigation={navigation}
                                    key={index}
                                    data={item}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>

            <Toast position="bottom" bottomOffset={70} />

            <Modal visible={modalEdit} animationType="none" transparent={true}>
                <Card containerStyle={styles.modalEdit}>
                    <TouchableOpacity
                        onPress={handleEditClick}
                        style={styles.touchEdit}>
                        <Text style={styles.textEdit}>Edit</Text>
                        <Material name="edit" size={20} color="black" />
                    </TouchableOpacity>

                    <Divider color={PRIMARY_COLOR} size={2} />

                    <TouchableOpacity
                        style={styles.touchEdit}
                        onPress={handleDeleteClick}>
                        <Text style={{...styles.textEdit, color: 'red'}}>
                            Delete
                        </Text>
                        <Material name="delete-outline" size={20} color="red" />
                    </TouchableOpacity>
                </Card>
            </Modal>

            {!isOwner && (
                <BottomMenuBar
                    navigation={navigation}
                    onPress={setVisible}
                    productOwner={productOwner}
                    product={product}
                />
            )}
        </SafeAreaView>
    ) : (
        <SafeAreaView
            style={{
                ...globalStyles.container,
                opacity: modalLoading ? 0.5 : 1,
            }}>
            <ModalLoading visible={modalLoading} />
        </SafeAreaView>
    )
}

export default ProductDetail

const styles = StyleSheet.create({
    touchStyle: {
        borderRadius: 10,
        padding: 5,
    },
    textStyle: {color: 'black', fontSize: 16},
    viewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageStyle: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        elevation: 3,
        marginVertical: 10,
    },
    modalEdit: {
        ...globalStyles.cardContainer,
        position: 'absolute',
        top: '9%',
        right: '2%',
        width: 120,
        flex: 1,
    },
    touchEdit: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
    },
    textEdit: {
        color: 'black',
        fontWeight: '500',
        fontSize: 16,
    },
})
