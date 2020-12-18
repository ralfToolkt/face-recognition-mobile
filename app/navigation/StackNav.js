import Login from '../screens/Login'
import HomeScreen from '../screens/HomeScreen.js'
import AttendanceLogs from '../screens/AttendanceLogs.js'
import RegisterFace from '../screens/RegisterFace.js'

import { UserContext } from '../contexts/UserContext'

import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'
import { createDrawerNavigator } from 'react-navigation-drawer';

import React, { useContext, useEffect, useState } from 'react'



export default function StackNav() {
    // const {user} = useContext(UserContext)
    

    const drawerNav = createDrawerNavigator({
        AttendanceLogs,
        HomeScreen, 
        RegisterFace
    }, {
        unmountInactiveRoutes: true
    })

    const drawerNavClient = createDrawerNavigator({
        AttendanceLogs,
        RegisterFace
    }, {
        unmountInactiveRoutes: true
    })

    // const HomeScreenCon = (user ? drawerNav : RegisterFace)

    const mainScreen = createStackNavigator({
        Login,
        HomeScreenCon: {
            screen: drawerNav,
            navigationOptions: {
                headerLeft: () => false,
                headerBackTitleVisible: true,
                headerTitleAlign: 'center',
                headerTitle: 'Attendance'
            },
        },
        HomeScreenClient: {
            screen: drawerNavClient,
            navigationOptions: {
                headerLeft: () => false,
                headerBackTitleVisible: true,
                headerTitleAlign: 'center',
                headerTitle: 'Attendance'
            },
        },
        RegisterFace: {
            screen: RegisterFace,
            navigationOptions: {
                headerLeft: () => false,
                headerBackTitleVisible: true,
                headerMode: 'none',
                header: () => false
            },
        },
    }, {
        initialRouteName: "Login",
        detachPreviousScreen: true,
        detachInactiveScreens: true,
        headerMode: 'float'
    })

    const AppContainer = createAppContainer(mainScreen)

    return <AppContainer />
}




