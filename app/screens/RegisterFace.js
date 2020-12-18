import React, {useContext, useEffect, useState} from 'react'
import { View, Text, TouchableOpacity, Image, Dimensions, Alert } from 'react-native'
import axios from 'axios'
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector'
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';

import ConfirmationAlert from './ConfirmationAlert'
import ViewImage from './ViewImage'
import {UserContext} from '../contexts/UserContext'


import styles from '../../styles'
// import { Image } from 'native-base';

export default function RegisterFace({navigation}) {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.front);
    const [faceDetected, setFaceDetected] = useState(false)
    const [camera, setCamera] = useState({})
    const [imageUri, setImageUri] = useState({})
    const [imgVisible, setImgVisible] = useState(false)
    const [alertVisible, setAlertVisible] = useState(false);
    const [resizePic, setResizePic] = useState('')

    const { user } = useContext(UserContext)

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
        console.log('Change');
    }, []);

    function handleFacesDetected({faces}) {
        if (faces.length > 0) {
            setFaceDetected(true)
        }
        else {
            setFaceDetected(false)
        }
    }

    function toggleAlertYes() {
        console.log('toggleAlertYes');
        setAlertVisible(false);
        setImgVisible(false)
        postImage()
        navigation.navigate('HomeScreenCon')
    }

    async function cropImg() {
        await ImageManipulator.manipulateAsync(
            imageUri.uri,
            [{
                resize: {
                    width: 250,
                    height: 3000
                }
            }],
            { base64: true }
        ).then(res => setResizePic(res.base64))
        // setImageUri(() => resizePic)
        // console.log(resizePic.base64);
        // return resizePic.base64
    }

    const postImage = async () => {        
        const url = 'http://139.162.9.124:1369'
        let bodyFormData = new FormData();
        // const resizePic = cropImg()
        cropImg()
        console.log(resizePic);
        bodyFormData.append('token', user.token);
        bodyFormData.append('image', resizePic);
        // bodyFormData.append('image', imageUri.base64);
        await axios({
            method: 'post',
            url: `${url}/api/register-face`,
            data: bodyFormData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
            console.log(res.data);

            alert(res.data.result)
        })
        .catch(e => {
            console.log('error ' + e);
        }) 
        
        
    }

    function toggleAlertNope() {
        console.log('toggleAlertNope');
        setAlertVisible(false);
        setImgVisible(false)
        // setImageUri({})
    }

    const register = async () => {
        if (camera){
            const options = {
                base64: true, fixOrientation: true
            };
            await camera.takePictureAsync(options)
                .then(data => {
                    // console.log(data);
                    // const {base64} = data
                    // console.log(base64);
                    setImageUri(data)
                    setImgVisible(true)
                    setAlertVisible(true)
                })
        }
    }

    return (
        <View style={{flex: 1}}>    
            <ViewImage 
                animationType="fade"
                visible={imgVisible}
                imageUri={imageUri}
            />
            {/* <Image
                source={{
                    uri: imageUri.uri,
                    width: Dimensions.get("window").width, 
                    height: Dimensions.get("window").height 
                }}
                style={{ resizeMode: 'contain' }}
                isVisible={imgVisible}
            />     */}
            <ConfirmationAlert
                title="Are you sure?"
                message="Register This as Your Face?"
                visible={alertVisible}
                buttons={[
                    { text: "Nope", onPress: toggleAlertNope },
                    { text: "Yes", onPress: toggleAlertYes }
                ]}
                style={{position: 'absolute'}}
            />    
            <Camera style={{ flex: 1 }} type={type}
                ref={ref => setCamera(ref)}
                onFacesDetected={handleFacesDetected}
                faceDetectorSettings={{
                    mode: FaceDetector.Constants.Mode.accurate,
                    detectLandmarks: FaceDetector.Constants.Landmarks.none,
                    runClassifications: FaceDetector.Constants.Classifications.none,
                    minDetectionInterval: 200,
                    tracking: true,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        position: 'absolute',
                        bottom: 100,
                        left: 100
                    }}>
                    {faceDetected ?
                        <TouchableOpacity
                            onPress={() => register()}>
                            <Text style={{ fontSize: 24, marginBottom: 10, color: 'white', paddingLeft: 50 }}>
                                Register
                            </Text>
                        </TouchableOpacity>

                        : <Text style={{ color: 'red', fontSize: 25 }}>
                            No Face Detected
                        </Text>}

                </View>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                    }}>
                    <TouchableOpacity
                        style={{
                            flex: 0.1,
                            alignSelf: 'flex-end',
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            setType(
                                type === Camera.Constants.Type.back
                                    ? Camera.Constants.Type.front
                                    : Camera.Constants.Type.back
                            );
                        }}>
                        <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
                    </TouchableOpacity>
                </View>
            </Camera>
        </View>
    )
}
