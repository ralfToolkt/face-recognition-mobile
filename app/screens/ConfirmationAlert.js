import React from 'react'
import { View, Text, Alert } from 'react-native'

export default function ConfirmationAlert(props) {
    if (props.visible) {
        Alert.alert(props.title, props.message, props.buttons);
    }

    return null;
}