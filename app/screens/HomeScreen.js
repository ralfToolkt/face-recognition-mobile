import React, { useState, useEffect, useContext} from 'react'
import { ActivityIndicator, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import styles from '../../styles'
import axios from 'axios'

import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Asset } from 'expo-asset';
import * as FaceDetector from 'expo-face-detector'
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import { UserContext } from '../contexts/UserContext.js'

const API_KEY = "AIzaSyBTp9sgdaeSKyXQVn3qBBLR_yBYS19Q05w";
const URL_GEO = `https://maps.google.com/maps/api/geocode/json?key=${API_KEY}&latlng=`;

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

    // for geocode
    const [address, setAddress] = useState();
    const [longitude, setLongitude] = useState();
    const [latitude, setLatitude] = useState();

    //  permision 
    useEffect(() => {
        function setPosition({ coords: { latitude, longitude } }) {
            setLongitude(longitude);
            setLatitude(latitude);
            axios.post(`${URL_GEO}${latitude},${longitude}`)
                .then(res => {
                    console.log(res.data.results[0].formatted_address);
                    setAddress(res.data.results[0].formatted_address);
                });
        }
        navigator.geolocation.getCurrentPosition(setPosition);

        let watcher = navigator.geolocation.watchPosition(
            setPosition,
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );
        
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setCamera(prevState => ({ ...prevState, hasCameraPermission: status === 'granted'}))
        })();    
        return () => {
            navigator.geolocation.clearWatch(watcher);
        }
    }, []);

    // get location
    // async function setPosition() {
    //     await axios.get(`${URL_GEO}${latitude},${longitude}`)
    //         .then(res => {
    //             console.log(res.data.results[0].formatted_address);
    //             setAddress(res.data.results[0].formatted_address.toString());
    //             console.log(address);
    //         });
    // }

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
            // console.log(res);
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


    async function attendance(image) {
        console.log('attendance');
        // setPosition()
        console.log(address);
        const url = 'http://139.162.9.124:1369'
        let bodyFormData = new FormData();
        bodyFormData.append('token', user.token);
        bodyFormData.append('image', image);
        bodyFormData.append('longitude', longitude);
        bodyFormData.append('latitude', latitude);
        bodyFormData.append('address', address);
        await axios({
            method: 'post',
            url: `${url}/api/attendance`,
            data: bodyFormData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => {
                // console.log(res.data);

                alert(res.data.result)
            })
            .catch(e => {
                Alert('error ' + e);
                // console.log('error ' + e);
            }) 
    }


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

    if (address) {
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
                                    onPress={() => snap()}>
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
            );
        }
        
    } else {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00ff00" />
            </View>
        )
    } 
    
}
