import {createSlice} from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'user',
    initialState: {},
    reducers: {
        signIn: (state, action) => {
            return (state = action.payload)
        },

        signOut: state => {
            return (state = {})
        },

        updatePhoneNumber: (state, action) => {
            updatedUser = state
            updatedUser.phoneNumber = action.payload
            return updatedUser
        },

        updateAddress: (state, action) => {
            updatedUser = state
            updatedUser.address = action.payload
            return updatedUser
        },

        updateGender: (state, action) => {
            updatedUser = state
            updatedUser.gender = action.payload
            return updatedUser
        },

        updateAvatar: (state, action) => {
            updatedUser = state
            updatedUser.avatar = action.payload
            return updatedUser
        },

        updateOnlineStatus: (state, action) => {
            updatedUser = state
            updatedUser.onlineStatus = action.payload
            return updatedUser
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    updatePhoneNumber,
    signIn,
    signOut,
    updateAddress,
    updateGender,
    updateAvatar,
    updateOnlineStatus,
} = userSlice.actions

export default userSlice.reducer
