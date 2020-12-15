import React, { useState, useContext, useEffect } from 'react'
import { View, Text, Button, ScrollView, Alert } from 'react-native'
import {Item, Icon, Input, ListItem} from 'native-base'
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios'

import styles from '../../styles'

// import { UserProvider } from '../contexts/UserContext.js'
import { UserContext } from '../contexts/UserContext.js'


export default function Login({navigation}) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const { user, setUser } = useContext(UserContext)

    const submit = async () => {
        console.log('submit');
        const url = 'http://139.162.9.124:1369'
        if (username !== '' && password !== ''){
        await axios.post(`${url}/api/auth?user=${username}&password=${password}`)
        // await axios.post(`${url}/api/auth?user=admin&password=admin123`)
            .then(res => {
                if (res.data.token){
                    console.log(res.data);
                    setUser(res.data)
                    const navigateTo = res.data.profile ? 'HomeScreenCon' : 'RegisterFace'
                    navigation.navigate(navigateTo, {
                        user: res.data.name
                    })
                } else {
                    Alert.alert('Login Fail', 'Wrong User or Password')
                }
            })
            .catch(e => {
                console.log('error ' + e);
            })}
        else { Alert.alert('Login Fail', 'Username and Password is required')}
         
    }

    useEffect(() => {
        setPassword('')
    }, [])
 
    return (
        // <UserProvider>
        <View style={styles.container} >
            <Text>Login</Text>
            <Item style={styles.input} >
                <Icon active name="person" />
                <Input
                    placeholder="Username"
                    onChangeText={text => setUsername(text)}
                    value={username}
                    name="username"
                />
            </Item>
            <Item style={styles.input} >
                <Icon active name="eye" />
                <Input
                    placeholder="Password"
                    onChangeText={text => setPassword(text)}
                    value={password}
                    name="password"
                    secureTextEntry={!showPassword}
                />
            </Item>
            
            <ListItem>
                <CheckBox value={showPassword} onValueChange={() => setShowPassword(!showPassword)} /> 
                <Text>Show Password</Text>
            </ListItem>
            
            <Button title='Login' onPress={submit} />
            {/* <Button 
                title='Login'
                onPress={() => navigation.navigate('HomeScreen')}
            /> */}
        </View>
        // </UserProvider>
    )
}

Login.navigationOptions = {
    title: null
}
