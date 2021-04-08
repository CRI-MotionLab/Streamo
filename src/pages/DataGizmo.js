import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentRoute, setGizmoCurrentStream } from '../store/actions';

import Page from '../components/Page';
import Header from '../components/Header';
import HorizontalTextMenu from '../components/HorizontalTextMenu';
import Gizmo from '../components/Gizmo';
import GizmoView from '../components/GizmoView';
import CircleValue from '../components/CircleValue';
import Footer from '../components/Footer';
import { colors } from '../utils/definitions';
import { hexToRgba, normalizeVector } from '../utils/functions';

const window = Dimensions.get('window');


// see https://aboutreact.com/react-native-show-superscript-and-subscript/
const styles = StyleSheet.create({
  'unitView': {
    position: 'absolute',
    right: 15,
    bottom: 20,
    width: 50,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  unit: {
    color: 'white',
    fontSize: 14,
    lineHeight: 21,
  },
  'unitSuperscript': {
    color: 'white',
    fontSize: 10,
    lineHeight: 15
  }
});

class DataGizmo extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - acc ({ x, y, z })
    // - gyr ({ x, y, z })
    // - mag ({ x, y, z })

    this.gizmoMappers = {
      acc: ({ x, y, z }) => ({
        x: -1.5 * (x / 9.8),
        y: -1.5 * (y / 9.8),
        z: 0.5 * (z / 9.8),
      }),
      gyr: ({ x, y, z }) => ({
        x: x / (2 * Math.PI),
        y: y / (2 * Math.PI),
        z: z / (2 * Math.PI),
      }),
      // mag: ({ x, y, z }) => ({
      //   x: x * 0.02,
      //   y: y * 0.02,
      //   z: z * 0.02,
      // }),
      mag: ({ x, y, z }) => normalizeVector(x, y, z),
    };

    // eventually change units here
    this.valueMappers = {
      // we are in m.s-1 so this is ok
      acc: ({ x, y, z }) => ({
        x: x,
        y: y,
        z: z,
      }),
      // what are these units ???
      gyr: ({ x, y, z }) => ({
        x: x,
        y: y,
        z: z,
      }),
      // what are these units ???
      mag: ({ x, y, z }) => ({
        x: x,
        y: y,
        z: z,
      }),
    }

    // const { currentStream } = this.props.gizmo;
    const currentStream = 'acc';
    const currentStreamIndex = [
      'acc',
      'gyr',
      'mag'
    ].indexOf(currentStream);

    this.state = {
      currentStream,
      currentStreamIndex,
      gizmoCoords: { x: 0, y: 0, z: 0 },
      valueCoords: { x: 0, y: 0, z: 0 },
    };

    this.rafId = null;
    this.lastFrameDate = 0;
    this.intervalId = null;
    this.timeoutId = null
    this.updateAnimation = this.updateAnimation.bind(this);
  }

  componentDidMount() {
    this.updateAnimation();
    // this.intervalId = setInterval(this.updateAnimation, 100);
    // this.timeoutId = setTimeout(this.updateAnimation, 100);
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (this.props.enabled && !prevProps.enabled) {
      this.updateAnimation();
      // this.intervalId = setInterval(this.updateAnimation, 100);
      //this.timeoutId = setTimeout(this.updateAnimation, 100);
    } else if (!this.props.enabled && prevProps.enabled) {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;

      // if (this.intervalId !== null) {
      //   clearInterval(this.intervalId);
      // }
      // this.intervalId = null;

      // if (this.timeoutId !== null) {
      //   clearTimeout(this.timeoutId);
      // }
      // this.timeoutId = null;
    }
    return null;
  }

  componentDidUpdate() {
    // just here to avoid warning due to presence of getSnapshotBeforeUpdate
  }

  // componentDidUpdate(prevProps, prevState) {
  //   // if (this.props.enabled && (!prevProps.enabled || this.rafId === null)) {
  //   //   this.rafId = requestAnimationFrame(this.updateAnimation);
  //   // } else if (!this.props.enabled && prevProps.enabled) {
  //   //   cancelAnimationFrame(this.rafId);
  //   //   this.rafId = null;
  //   // }

  //   return;

  //   const s = this.state.currentStream;

  //   if (this.props[s] !== prevProps[s]) {
  //     const { x, y, z } = this.props[s];
  //     this.setState({
  //       gizmoCoords: this.gizmoMappers[s]({ x, y, z }),
  //       valueCoords: this.valueMappers[s]({ x, y, z }),
  //     });
  //   }
  // }

  componentWillUnmount() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);    
      this.rafId = null;
    }
    // clearInterval(this.intervalId);
    // clearTimeout(this.timeoutId);
  }

  updateAnimation() {
    this.rafId = requestAnimationFrame(this.updateAnimation);
    // this.timeoutId = setTimeout(this.updateAnimation, 100);

    if (Date.now() - this.lastFrameDate > 33) {
      const s = this.state.currentStream;

      this.setState({ valueCoords: this.props[s] });
      this.lastFrameDate = Date.now();
    } 
  }

  render() {
    return (
      <Page enabled={this.props.enabled}>
        <Header
          title="Data gizmo"
          nbDots="3"
          activeDot="0"
          hasLeftArrow={false}
          hasRightArrow={true}
          onPressRight={() => {
            this.props.setCurrentRoute('playground');
          }}/>

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

          <View
            style={{
              position: 'relative',
              flex: 1,
              width: '100%', // this is required, otherwise GLView context is never created
              justifyContent: 'center',
            }}>
            {
              false &&
              <Gizmo
                width={window.width}
                height={window.width}
                x={this.state.gizmoCoords.x}
                y={this.state.gizmoCoords.y}
                z={this.state.gizmoCoords.z}
                // x={this.props[this.state.currentStream].x}
                // y={this.props[this.state.currentStream].y}
                // z={this.props[this.state.currentStream].z}
              />
            }
            {
              true &&
              <GizmoView
                enabled={this.props.enabled}
                stream={this.state.currentStream}
                data={this.props[this.state.currentStream]}
                // x={this.state.gizmoCoords.x}
                // y={this.state.gizmoCoords.y}
                // z={this.state.gizmoCoords.z}
                // x={this.props[this.state.currentStream].x}
                // y={this.props[this.state.currentStream].y}
                // z={this.props[this.state.currentStream].z}
              />
            }
          </View>

          <View
            style={{
              position: 'absolute',
              width: '100%',
              flex: 1,
              top: 0, left: 0
            }}>
            <HorizontalTextMenu
              items={[
                { text: 'Accelerometer', event: 'acc' },
                { text: 'Gyroscope', event: 'gyr' },
                { text: 'Magnetometer', event: 'mag' },
              ]}
              activeItemIndex={this.state.currentStreamIndex}
              onPress={(event, i) => {
                this.setState({ currentStream: event });
                // this.props.setGizmoCurrentStream(event);
              }}/>
          </View>

          <View
            style={{
              position: 'relative',
              backgroundColor: colors.darkBlue,
              width: '100%',
              height: 40,
            }}>
          </View>

          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: 80,
              bottom: 0,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}>
            <CircleValue
              size={60}
              circleColor={colors.yellow}
              label="X"
              labelHeight={20}
              textColor="black"
              //value={0}
              value={this.state.valueCoords.x}
              //value={this.props[this.state.currentStream].x}
              sideMargins={15}/>
            <CircleValue
              size={60}
              circleColor={colors.blue}
              label="Y"
              labelHeight={20}
              textColor="black"
              //value={0}
              value={this.state.valueCoords.y}
              //value={this.props[this.state.currentStream].y}
              sideMargins={15}/>
            <CircleValue
              size={60}
              circleColor={colors.red}
              label="Z"
              labelHeight={20}
              textColor="black"
              //value={0}
              value={this.state.valueCoords.z}
              //value={this.props[this.state.currentStream].z}
              sideMargins={15}/>
            {
              this.state.currentStream === 'acc' &&
              <View style={styles.unitView}>
                <Text style={styles.unit}>m.s</Text>
                <Text style={styles.unitSuperscript}>-2</Text>
              </View>
            }
            {
              this.state.currentStream === 'gyr' &&
              <View style={styles.unitView}>
                <Text style={styles.unit}>deg.s</Text>
                <Text style={styles.unitSuperscript}>-1</Text>
              </View>
            }
            {
              this.state.currentStream === 'mag' &&
              <View style={styles.unitView}>
                <Text style={styles.unit}>µT</Text>
              </View>
            }
          </View>
        </View>

      </Page>
    );
  }
};

const mapStateToProps = state => {
  const { gizmo } = state;
  return { gizmo };
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    setCurrentRoute,
    setGizmoCurrentStream,
  }, dispatch)
};


export default connect(mapStateToProps, mapDispatchToProps)(DataGizmo);