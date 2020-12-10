import React, { useState, useEffect, useContext} from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import styles from '../../styles'
import axios from 'axios'


import { Camera } from 'expo-camera';
import { Asset } from 'expo-asset';
import * as FaceDetector from 'expo-face-detector'
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import { UserContext } from '../contexts/UserContext.js'

export default function HomeScreen() {
    const [camera, setCamera] = useState({
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        faceDetected: false,
    });

    const [cameraSnap, setCameraSnap] = useState({})
    const [faces, setFaces] = useState({})
    const [photoBase64, setPhotoBase64] = useState('')
    const [imageUri, setImageUri] = useState('')

    const { user } = useContext(UserContext)

    const askPermission = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        setCamera(prevState => ({ ...prevState, hasCameraPermission: status === 'granted' }));
    }

    const snap = async () => {
        // console.log(snap);
        if (camera) {
            await cameraSnap.takePictureAsync()
            .then(data => {
                cropImage(Asset.fromModule(data.uri))
                if (photoBase64){
                    attendance(photoBase64)
                }
            })
        }
    };

    

    const cropImage = async (image) => {
        const options = { mode: FaceDetector.Constants.Mode.fast, detectLandmarks: FaceDetector.Constants.Landmarks.all };
        await FaceDetector.detectFacesAsync(image.uri, options)
        .then(res => {
            console.log(res);
            ImageManipulator.manipulateAsync(
                image.uri,
                [{
                    crop: {
                        originX: res.faces[0].bounds.origin.x,
                        originY: res.faces[0].bounds.origin.y,
                        width:  res.faces[0].bounds.size.width, 
                        height: res.faces[0].bounds.size.height,
                    }
                }],
                { base64: true, compress: .3}
                ).then(res => setPhotoBase64(res.base64))
            // ).then(res => setImageUri(res.uri))
            .catch(e => alert('Try to center to get better image'))
        })
        
    }

    const attendance = async (image) => {
        const url = 'http://139.162.9.124:1369'
        let bodyFormData = new FormData();
        bodyFormData.append('token', user.token);
        bodyFormData.append('image', image);
        await axios({
            method: 'post',
            url: `${url}/api/attendance`,
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
        // await axios.post(`${url}/api/attendance?token=${token}&image=${image}`)
        //     .then(res => {
        //         console.log(res);
        //     })
        //     .catch(e => {
        //         console.log('error ' + e);
        //     }) 
    }

    useEffect(() => {
        askPermission()
    }, []);


    const handleFacesDetected = ({ faces }) => {
        
        if (faces.length > 0) {
            setCamera({
                ...camera,
                faceDetected: true
            })
        }
        else {
            setCamera({
                ...camera,
                faceDetected: false
            })
        }
    };

    if (camera.hasCameraPermission === null) {
        return <Text>Null</Text>;
    } else if (camera.hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
    } else {
        return (
            <View style={{ flex: 1 }}>
                {/* <Image
                    source={{ uri: imageUri }}
                    style={{ width: 300, height: 300, resizeMode: 'contain' }}
                /> */}
                <Camera style={{ flex: 1 }} type={camera.type}
                    ref={ref => setCameraSnap(ref)}
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
                        {camera.faceDetected ? 
                            <TouchableOpacity
                                onPress={() => snap(false)}>
                                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                                    {' '}Check Attendance{' '}
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
                                setCamera({
                                    type:
                                        camera.type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back,
                                });
                            }}>
                            <Text style={{ fontSize: 24, marginBottom: 10, color: 'white' }}>
                                {' '}
                                Flip{' '}
                            </Text>
                        </TouchableOpacity>
                    </View>                    
                </Camera>
            </View>
        )

        
    }
}
