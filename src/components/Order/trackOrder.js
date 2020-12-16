import React, { Component } from 'react';
import { Alert, Dimensions, StyleSheet, PermissionsAndroid, ToastAndroid, TouchableOpacity, Text, View, ActivityIndicator, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
navigator.geolocation = require('@react-native-community/geolocation');
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 22.2856;
const LONGITUDE = 70.7561;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAAyBoIK3-3psCrVDMpZCKj5zaMmDAPp0I';
import { connect, disconnect } from '../../utils/socket';
export default class TrackOrderComp extends Component {

    state = {
        source: {
            latitude: LATITUDE,
            longitude: LONGITUDE
        },
        destination: {
            latitude: this.props.navigation.state.params.latitudeself,
            longitude: this.props.navigation.state.params.longitudeself
        },
        isReached: false,
        isDirection: false,
        isLoading: false,
        code: '',
        markerangel:0,

        isCustomerappshow: false
    }
    componentWillMount = async () => {

        console.log("deliveryboyid", this.props.navigation.state.params.deliveryboyid)
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'Example App',
                    'message': 'Example App access to your location '
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // alert("You can use the location");
                this.startTimer();
                // this.getLocation();

            } else {
                alert("Location permission denied");
            }
        } catch (err) {
        }
    }
    startTimer = () => {

        let timer = setInterval(this.manageTimer, 2000);
        this.setState({ timer });

    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
    }

    manageTimer = () => {

        var states = this.state

        if (states.isReached) {
            clearInterval(this.state.timer);
        }
        else {
            console.log("call=============================")
            this.getLocation()
        }
    }

    getLocation = async () => {
        this.socket = connect();
        console.log("deliveryboyid", this.props.navigation.state.params.deliveryboyid)
        let id = this.props.navigation.state.params.deliveryboyid

        const result = await new Promise(async (resolve, reject) => {
            await this.socket.emit('getDeliveryBoyLatLong', id, function (data) {
                console.log("On customer app socket response", data, data.detail.lat, data.detail.long)
                if (data.success) {
                    resolve(data.detail);

                } else {
                    reject(data.detail);
                }
            });
        })
        console.log('Result: ', result);
        this.setState({
            source: {
                latitude: result.lat,
                longitude: result.long
            }
        })

        this.findangle(result.lat, result.long )



    }
    findangle = (sourceLat, sourceLong) => {
        var PI = 3.14159;
        var lat1 = parseFloat(sourceLat) * PI / 180;
        var long1 = parseFloat(sourceLong) * PI / 180;
        var lat2 = parseFloat(this.state.destination.latitude) * PI / 180;
        var long2 = parseFloat(this.state.destination.longitude) * PI / 180;
    
        var dLon = (long2 - long1);
    
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
                * Math.cos(lat2) * Math.cos(dLon);
    
        var brng = Math.atan2(y, x);

        console.log("brng-----------------------", brng)
    
        brng =  brng * (180 / Math.PI); // Math.toDegrees(brng);
        brng = (brng + 360) % 360;
    
        console.log(brng);
        this.setState({markerangel:brng })
        return brng
    }

    render() {
        const { source, destination, isDirection, isCustomerappshow, markerangel } = this.state;
        console.log("sorce=============", source, destination)
        return (
            <>
                <MapView
                    initialRegion={{
                        latitude: source.latitude,
                        longitude: source.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    }}
                    style={StyleSheet.absoluteFill}
                    // ref={mapRef}
                    ref={c => this.mapView = c}
                    onPress={this.onMapPress}
                    toolbarEnabled={true}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    provider={PROVIDER_GOOGLE}
                    // showsTraffic={true}
                    showsCompass={true}
                    // maxZoomLevel={30}
                    minZoomLevel={15}
                >
                    <Marker rotation={markerangel} draggable coordinate={source} title='You' onDragEnd={(e) => console.log("dreg marker", e.nativeEvent.coordinate)} >
                        <Image source={require('../../../assets/images/dboy.png')} style={{ height: 75, width: 75 }} />
                    </Marker>

                    <Marker key={`coordinate_destination`} title='ABC medical' coordinate={this.state.destination} />
                    <MapViewDirections
                        origin={source}
                        waypoints={[source, destination]}
                        destination={destination}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor="red"
                        optimizeWaypoints={true}

                        onStart={(params) => {
                            // waypoints={[source, destination] }
                            // ToastAndroid.show(params.origin + params.destination, 3000);
                        }}
                        onReady={result => {
                            // ToastAndroid.show(result.distance + 'km', 3000);


                            this.mapView.fitToCoordinates(result.coordinates, {
                                edgePadding: {
                                    right: (width / 20),
                                    bottom: (height / 20),
                                    left: (width / 20),
                                    top: (height / 20),

                                },
                                animated: true
                            });
                        }}
                        onError={(errorMessage) => {
                        }}
                    />

                </MapView>



            </>
        );
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    },
    mainView: {
        position: 'absolute',
        top: -50,
        bottom: 0,
        left: 0,
        right: 0,
        // backgroundColor: '#F7F9FC',
        justifyContent: 'center',
        flex: 1,
        padding: 20,
    },
    userMainView: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        margin: 15,
        marginBottom: 17,
        elevation: 5,
        position: 'absolute',
        bottom: 0,
        width: '90%'
    },


});

