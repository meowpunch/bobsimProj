import React, { Component } from "react";
import { View, Text } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from "expo-camera"
import {NavigationInjectedProps, withNavigation} from "react-navigation"
import {Item, initialNewItem} from "../../../context/ItemData";

import styles from './styles';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';

type Props =  NavigationInjectedProps & {
    newItem: Item
    resetItem: () => void
}

type State = {

}
  
class CaptureItems extends Component<Props, State> {
    constructor(props) {
        super(props);
    }   
    
    
    camera = null;

    state = {
        captures: [],
        capturing: null,
        hasCameraPermission: null,
        cameraType: Camera.Constants.Type.back,
        flashMode: Camera.Constants.FlashMode.off,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.props.newItem.uri = photoData.uri
        this.setState({ capturing: false, captures: [photoData, ...this.state.captures] })
        this.props.navigation.navigate("AddItems", {
            photoItem: photoData
        })  
    };

    /* handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    }; */

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission });
    };

    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        return (
            <React.Fragment>
                <View>
                    <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}
                    />
                </View>

                {/* {captures.length > 0 && <Gallery captures={captures}/>} */}

                <Toolbar 
                    capturing={capturing}
                    flashMode={flashMode}
                    cameraType={cameraType}
                    setFlashMode={this.setFlashMode}
                    setCameraType={this.setCameraType}
                    onCaptureIn={this.handleCaptureIn}
                    onCaptureOut={this.handleCaptureOut}
                    /* onLongCapture={this.handleLongCapture} */
                    onShortCapture={this.handleShortCapture}
                />
            </React.Fragment>
        );
    };
};

export default withNavigation(CaptureItems)