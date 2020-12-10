import React, { useEffect, useState, useContext} from 'react'
import { View, Text } from 'react-native'
import { List, ListItem, Container, Content, Left, Right} from 'native-base'
import styles from '../../styles'
import axios from 'axios'
import { UserContext } from '../contexts/UserContext.js'



export default function AttendanceLogs() {
    
    const [logs, setLogs] = useState([])

    const {user} = useContext(UserContext)
    
    let row = 0

    useEffect(() => {        
        getAttendanceLogs()  
        console.log('attendance use effect');
    }, [])

    const getAttendanceLogs = async () => {
        const url = 'http://139.162.9.124:1369'
        await axios.get(`${url}/api/attendance-logs?token=${user.token}`)
        .then(res => {            
            setLogs(res.data.logs)
            // console.log(res);
        })
    }

    return (
        // <View><Text>Hello, World</Text></View>
        <Container>
            <Content>
                <List>
                    {logs.map(item => {
                        row++
                        return (
                        <ListItem key={item.id.toString()} style={{ backgroundColor: row%2 !== 0? "#c9c9c9": "#f0f0f0" }}> 
                                <Left>
                                    <Text >{row} </Text>
                                </Left>
                                <Text style={styles.logText}>{item.date_time}</Text>
                                <Right />
                            {/* <Right><Text>{item.date_time}</Text></Right> */}
                            
                        </ListItem>
                    )})}
                </List>
            </Content>
        </Container>
    )
}

AttendanceLogs.navigationOptions = ({navigation}) => ({
    headerBackTitleVisible: true,
    // headerTitle: navigation.getParam("user"),
    headerTitle: navigation.getParam("user"),
    headerLeft: () => <Text>Title</Text>,
    headerTitleAlign: 'center',
})
