import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { hexToRgba } from '../utils/functions';

class ArrowButton extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - size
    // - orientation ('left' or 'right')
    // - backgroundColor (hex)
    // - arrowColor (hex)
    // - onPress (method)
    this.state = { pressed: false };
  }

  render() {
    return (
      <Pressable
        onPressIn={() => { this.setState({ pressed: true }); }}
        onPressOut={() => { this.setState({ pressed: false }); }}
        onPress={this.props.onPress}>
        <Svg
          width={this.props.size}
          height={this.props.size}
          viewBox="0 0 100 100"
          fill="none"
          stroke={this.props.fgColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round">

          <Circle
            cx="50" cy="50" r="50"
            strokeWidth="0"
            fill={
              this.state.pressed ?
              hexToRgba(this.props.bgColor, 0.5) :
              this.props.bgColor
            }/>

          {
            this.props.orientation === 'left' &&
            <Path d="M55 65 L35 50 L55 35"/>
          }
          {
            this.props.orientation === 'right' &&
            <Path d="M45 65 L65 50 L45 35"/>
          }
        </Svg>
      </Pressable>
    );
  }
};

export default ArrowButton;
