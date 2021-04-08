import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { hexToRgba } from '../utils/functions';

class PlayButton extends React.Component {
  constructor(props) {
    super(props);
    // props :
    // - size
    // - backgroundColor (hex)
    // - foregroundColor (hex)
    // - onPress (method)
    // - disabled (bool)

    this.state = {
      pressed: false,
      playing: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.disabled !== prevProps.disabled) {
      if (this.props.disabled === true) {
        this.setState({ playing: false });
      } 
    }
  }

  render() {
    return (
      <Pressable
        onPressIn={() => { this.setState({ pressed: true }); }}
        onPressOut={() => { this.setState({ pressed: false }); }}
        onPress={() => {
          if (this.props.disabled === true) return;
          const playing = !this.state.playing;
          this.setState({ playing });
          this.props.onPress(playing);
        }}>
        <Svg
          width={this.props.size}
          height={this.props.size}
          viewBox="0 0 100 100"
          fill={this.props.fgColor}
          strokeWidth="0">
          <Circle
            cx="50" cy="50" r="50"
            fill={
              this.state.pressed || this.props.disabled ?
              hexToRgba(this.props.bgColor, 0.5) :
              this.props.bgColor
            }/>
          {
            this.state.playing &&
            <Path d="M30 30 L70 30 L70 70 L30 70 Z" />
          }
          {
            !this.state.playing &&
            <Path d="M40 30 L70 50 L40 70 Z" />
          }
        </Svg>
      </Pressable>
    );
  }
};

export default PlayButton;
