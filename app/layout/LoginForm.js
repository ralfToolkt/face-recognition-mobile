import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import styles from '../../styles'

export default function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return (
        <ScrollView>
            <TextInput 
                styles={styles.input}
                value={username}
                onChangeText={text => setUsername(text)}
                placeholder='Username'
            />
            <TextInput 
                styles={styles.input}
                value={password}
                onChangeText={text => setpassword(text)}
                placeholder='password'
                secureTextEntry
            />
            <Button title={buttonText} onPress={submit} />
        </ScrollView>
    )
}
