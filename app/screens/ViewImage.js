import React from 'react'
import { View, Dimensions, Image, Modal } from 'react-native'

export default function ViewImage({ imageUri, visible}) {
    // if (imgVisible) {
    //     return (
    //         <View>
    //             <Image
    //                 source={{
    //                     uri: imageUri.uri,
    //                     width: Dimensions.get("window").width,
    //                     height: Dimensions.get("window").height
    //                 }}
    //                 style={{ resizeMode: 'contain' }}
    //                 isVisible={imgVisible}
    //             />
    //         </View>
    //     )
    // }
    // else { return null}
    return (
        <Modal 
            visible={visible}
        >
            <Image
                source={{
                    uri: imageUri.uri,
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height
                }}
                style={{ resizeMode: 'contain' }}
            />
        </Modal>
    )
}
