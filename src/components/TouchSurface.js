import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../utils/definitions';

class TouchSurface extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - x (left screen coordinate of the component)
    // - y (top screen coordinate of the component)
    // - width (width of the component)
    // - height (height of the component)
    // - radius (radius of the touch cursor)
    // - color (color of the touch cursor)

    // const { width, height, normTouchX, normTouchY } = this.props;
    // const whRatio = width / height;
    // let touchX, touchY;

    // if (whRatio > 1) {
    //   touchX = width * (normTouchX + whRatio) / (2 * whRatio);
    //   touchY = height * (normTouchY + 1) / 2;
    // } else {
    //   touchX = width * (normTouchX + 1) / 2;
    //   touchY = height * (normTouchY + 1 / whRatio) / (2 / whRatio);
    // }

    this.onTouchEvent = this.onTouchEvent.bind(this);

    this.state = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      whRatio: 1,
      touchX: -1000,
      touchY: -1000
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // if (this.props.width !== prevProps.width ||
    //     this.props.height !== prevProps.height) {

    if (this.state.width !== prevState.width ||
        this.state.height !== prevState.height) {

      const { width, height } = this.state;
      const { normTouchX, normTouchY } = this.props;

      // const { width, height, normTouchX, normTouchY } = this.props;
      const whRatio = width / height;
      let touchX, touchY;

      if (whRatio > 1) {
        touchX = width * (normTouchX + whRatio) / (2 * whRatio);
        touchY = height * (-1 * normTouchY + 1) / 2;
      } else {
        touchX = width * (normTouchX + 1) / 2;
        touchY = height * (-1 * normTouchY + 1 / whRatio) / (2 / whRatio);
      }

      this.setState({ whRatio, touchX, touchY });
    }
  }

  // onLayout(event) {
  //   const { x, y, width, height } = event.nativeEvent.layout;
  //   console.log('layout');
  //   console.log(x, y, width, height);    
  // }

  onTouchEvent(event) {
    // we use pageX and pageY because locationX and locationY are buggy
    // when reaching the edges (folding on top and wrapping on bottom
    // + erratic x coordinate jumps when touch move outside)
    const { pageX, pageY } = event.nativeEvent;

    // const minX = this.props.x;
    // const maxX = this.props.x + this.props.width;
    // const minY = this.props.y;
    // const maxY = this.props.y + this.props.height;

    // const touchX = Math.min(Math.max(pageX, minX), maxX) - minX;
    // const touchY = Math.min(Math.max(pageY, minY), maxY) - minY;

    const { x, y, width, height, whRatio } = this.state;

    const touchX = Math.min(Math.max(pageX, x), x + width) - x;
    const touchY = Math.min(Math.max(pageY, y), y + height) - y;

    this.setState({ touchX, touchY });

    let normTouchX, normTouchY;

    // if (this.state.whRatio > 1) {
    //   normTouchX = (2 * touchX / this.props.width - 1) * this.state.whRatio;
    //   normTouchY = -1 * (2 * touchY / this.props.height - 1);
    // } else {
    //   normTouchX = 2 * touchX / this.props.width - 1;
    //   normTouchY = -1 * (2 * touchY / this.props.height - 1) / this.state.whRatio;
    // }

    if (whRatio > 1) {
      normTouchX = (2 * touchX / width - 1) * whRatio;
      normTouchY = -1 * (2 * touchY / height - 1);
    } else {
      normTouchX = 2 * touchX / width - 1;
      normTouchY = -1 * (2 * touchY / height - 1) / whRatio;
    }

    this.props.onTouchEvent({ normTouchX, normTouchY });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          // width: this.props.width,
          // height: this.props.height,
        }}
        ref={c => { this.view = c; }}
        onLayout={event => {
          const { x, y, width, height } = event.nativeEvent.layout;
          this.view.measure((x, y, width, height, pageX, pageY) => {
            // console.log(pageX, pageY, width, height);
            this.setState({ x: pageX, y: pageY, width, height });
          });
        }}
        onStartShouldSetResponder={event => true}
        onStartShouldSetResponderCapture={event => false}
        onMoveShouldSetResponder={event => false}
        onMoveShouldSetResponderCapture={event => false}
        onResponderGrant={event => {
          // this is touch start event
          this.onTouchEvent(event);
        }}
        onResponderReject={event => {}}
        onResponderMove={event => {
          this.onTouchEvent(event);
        }}
        onResponderRelease={event => {}}
        onResponderTerminationRequest={event => {}}
        onResponderTerminate={event => {}}>

        <Svg
          width={this.state.width}
          height={this.state.height}
          viewBox={`0 0 ${this.state.width} ${this.state.height}`}>
          <Circle
            cx={this.state.touchX} cy={this.state.touchY} r={this.props.radius}
            fill={this.props.color} strokeWidth="0"/>
        </Svg>

      </View>
    );
  }
};

export default TouchSurface;