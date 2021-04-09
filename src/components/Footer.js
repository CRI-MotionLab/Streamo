import React from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MMKV } from 'react-native-mmkv';
import {
  setOscTarget,
  // setOscTargetIsValid,
  setOscIsSending
} from '../store/actions';

import PlayButton from './PlayButton';
import { colors } from '../utils/definitions';
import { hexToRgba } from '../utils/functions';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);

    // this.state = {
    //   targetIp: this.props.osc.targetIp,
    //   ipIsValid: false,
    //   sending: false,
    // };

    this.state = {
      ip1: '',
      ip2: '',
      ip3: '',
      ip4: '',
      ip: '',
    };
  }

  componentDidMount() {
    const target = MMKV.getString('target');
    if (target) {
      this.props.setOscTarget(target);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.osc !== prevProps.osc) {
      const [ ip, port ] = this.props.osc.target.split(':');
      const [ ip1, ip2, ip3, ip4 ] = ip.split('.');
      this.setState({ ip1, ip2, ip3, ip4 }, () => {
        // console.log(ip1, ip2, ip3, ip4);
      });
    }
  }

  // deprecated
  onChangeText(text) {
    MMKV.set('target', text);
    this.props.setOscTarget(text);
  }

  onChangeIpChunk(id, chunk) {
    // if we have exactly 0 to 3 number characters
    if (/^[0-9]{0,3}$/.test(chunk)) {
      // we always remove leading zeroes
      this.setState({ [`ip${id}`]: chunk.replace(/^0+/, '') }, () => {
        const { ip1, ip2, ip3, ip4 } = this.state;
        this.setState({ ip: `${ip1}.${ip2}.${ip3}.${ip4}` }, () => {
          // console.log(this.state.ip);
          MMKV.set('target', this.state.ip);
          this.props.setOscTarget(this.state.ip);
        });
      });
    } else {
      // we check for length 1 in case we select the whole text
      // and type a non digit character, then we want to erase everything
      const res = chunk.length === 1 ? '' : this.state[`ip${id}`];
      this.setState({ [`ip${id}`]: res });
    }
  }

  render() {
    const chunks = [];
    for (let i = 1; i <= 4; i++) {
      chunks.push(
        <TextInput
          style={styles.chunk}
          selectionColor={hexToRgba(colors.darkBlue, 0.5)}
          keyboardType="numeric"
          enablesReturnKeyAutomatically={true}
          returnKeyType="done"
          maxLength={3}
          value={this.state[`ip${i}`]}
          onChangeText={chunk => this.onChangeIpChunk(i, chunk)}
          editable={!this.props.osc.isSending}/>
      );
    }

    return (
      <KeyboardAvoidingView
        //*
        style={{
          position: 'relative',
          width: '100%',
          height: 80,
          backgroundColor: colors.darkBlue,
          justifyContent: 'center',
        }}
        //*/

        /*
        // this is needed instead of style for ios :
        
        behavior="position"
        contentContainerStyle={{
          position: 'relative',
          width: '100%',
          height: 80,
          // bottom: 0,
          backgroundColor: colors.darkBlue,
          justifyContent: 'center',
        }}
        //*/
        >

        {
          false &&
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 15,
            }}>
            <Text>Send to IP :</Text>
          </View>
        }

        {
          /*
          false &&
          <View style={{ position: 'absolute', left: 15 }}>
            <TextInput
              style={{
                color: 'white',
                fontSize: 25,
                borderWidth: 0
              }}
              keyboardType="numbers-and-punctuation"
              onChangeText={text => this.onChangeText(text)}
              selectionColor="white"
              value={this.props.osc.target}
              //value={this.state.targetIp}
              placeholder=" Send to IP"
              placeholderTextColor="rgba(255,255,255,0.5)"
              editable={!this.props.osc.isSending}/>
          </View>
          //*/
        }
        {
          true &&
          <View
            style={{
              flex: 1,
              // backgroundColor: 'red',
              position: 'absolute',
              left: 15,
              right: 80,
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            { chunks[0] }
            <Text style={{ fontSize: 25, color: 'white' }}> . </Text>
            { chunks[1] }
            <Text style={{ fontSize: 25, color: 'white' }}> . </Text>
            { chunks[2] }
            <Text style={{ fontSize: 25, color: 'white' }}> . </Text>
            { chunks[3] }
          </View>
        }

        <View style={{ position: 'absolute', right: 15, top: 15, bottom: 15 }}>
          <PlayButton
            bgColor="#fff"
            fgColor={colors.darkBlue}
            size="50"
            disabled={!this.props.osc.targetIsValid}
            onPress={playing => {
              // this.setState({ sending: playing });
              this.props.setOscIsSending(playing);
            }}/>
        </View>
      </KeyboardAvoidingView>
    );
  }
};

const styles = StyleSheet.create({
  chunk: {
    flex: 1,
    textAlign: 'center',
    fontSize: 25,
    borderWidth: 0,
    borderRadius: 5,
    padding: 2,
    color: colors.darkBlue,
    backgroundColor: 'white',
  }
});

const mapStateToProps = state => {
  const { osc } = state;
  return { osc };
}


const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    setOscTarget,
    // setOscTargetIsValid,
    setOscIsSending,
  }, dispatch)
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
