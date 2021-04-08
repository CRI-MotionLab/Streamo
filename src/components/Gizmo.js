import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../utils/definitions';
import { hexToRgba } from '../utils/functions';

class Gizmo extends React.Component {
  constructor(props) {
    super(props);
    
    // props :
    // - size
    // - width
    // - height
    // - x (for yellow horizontal line)
    // - y (for blue vertical line)
    // - z (to compute angle for red arcs)
    // NB : x, y, and z should be in the [-1, 1] range

    this.radius = 30; // on a 100 x 100 basis, center on 50,50
    this.yellowCenterPtRadius = 5;
    this.coordEndPtRadius = 2.5;
    this.blackPtRadius = 1;
    this.startPt1 = this.getPosFromAngle(5 * Math.PI / 4);
    this.startPt2 = this.getPosFromAngle(Math.PI / 4);

    const alpha = 0.9;
    this.alphaYellow = hexToRgba(colors.yellow, alpha);
    this.alphaBlue = hexToRgba(colors.blue, alpha);
    this.alphaRed = hexToRgba(colors.red, alpha);
  }

  getPosFromAngle(a) {
    const x = Math.cos(a) * this.radius + 50;
    const y = 100 - (Math.sin(a) * this.radius + 50);
    return { x, y };
  }

  render() {
    // start and end points of dimension z's red arcs
    const start1 = this.startPt1;
    const start2 = this.startPt2;
    const end1 = this.getPosFromAngle(5 * Math.PI / 4 - this.props.z * Math.PI);
    const end2 = this.getPosFromAngle(Math.PI / 4 - this.props.z * Math.PI);

    // x coordinate of dimension x's yellow line end point
    const x = 50 + this.props.x * this.radius;

    // y coordinate of dimension y's blue line end point
    const y = 100 - (50 + this.props.y * this.radius);

    // large arc is > PI
    const largeArc = Math.abs(this.props.z) > 1 ? 1 : 0;

    // sweep flag telling dimension z's red arcs direction from its sign
    const sweepFlag = this.props.z > 0 ? 1 : 0;

    return (
      <Svg
        width={this.props.width}
        height={this.props.height}
//        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`
          0 ${50 * (1 - this.props.height / this.props.width)}
          100 ${100 * this.props.height / this.props.width}
        `}
        >

        <Circle
          cx="50" cy="50" r={this.yellowCenterPtRadius}
          fill={this.alphaYellow} strokeWidth="0"/>

        <Circle
          cx={x} cy="50" r={this.coordEndPtRadius}
          fill={this.alphaYellow} strokeWidth="0"/>
        <Path
          d={`M50 50 L${x} 50`}
          stroke={this.alphaYellow} strokeWidth={this.blackPtRadius * 2}
          strokeLinecap="round"/>

        <Circle
          cx="50" cy={y} r={this.coordEndPtRadius}
          fill={this.alphaBlue} strokeWidth="0"/>
        <Path
          d={`M50 50 L50 ${y}`}
          stroke={this.alphaBlue} strokeWidth={this.blackPtRadius * 2}
          strokeLinecap="round"/>

        <Circle
          cx={end1.x} cy={end1.y} r={this.coordEndPtRadius}
          fill={this.alphaRed} strokeWidth="0"/>
        <Path
          d={`
            M${start1.x} ${start1.y}
            A${this.radius} ${this.radius}
            0 ${largeArc} ${sweepFlag}
            ${end1.x} ${end1.y}
          `}
          stroke={this.alphaRed} strokeWidth={this.blackPtRadius * 2}
          strokeLinecap="round"/>

        <Circle
          cx={end2.x} cy={end2.y} r={this.coordEndPtRadius}
          fill={this.alphaRed} strokeWidth="0"/>
        <Path
          d={`
            M${start2.x} ${start2.y}
            A${this.radius} ${this.radius}
            0 ${largeArc} ${sweepFlag}
            ${end2.x} ${end2.y}
          `}
          stroke={this.alphaRed} strokeWidth={this.blackPtRadius * 2}
          strokeLinecap="round"/>

        <Path
          d={`M${start1.x} ${start1.y} L${start2.x} ${start2.y}`}
          stroke="black" strokeWidth="0.5"/>
        <Circle
          cx="50" cy="50" r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
        <Circle
          cx={start1.x} cy={start1.y} r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
        <Circle
          cx={start2.x} cy={start2.y} r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
        <Circle
          cx={end1.x} cy={end1.y} r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
        <Circle
          cx={end2.x} cy={end2.y} r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
        <Circle
          cx={x} cy="50" r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
        <Circle
          cx="50" cy={y} r={this.blackPtRadius}
          fill="black" strokeWidth="0"/>
      </Svg>
    );
  }
};

export default Gizmo;