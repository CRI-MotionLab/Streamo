import React from 'react';
import { View } from 'react-native';

// todo :
// update this to use Animated.View instead of View
// as in OpenHealthBandReactNativeApp

/**
 * @example :
 *
 * <Page enabled={this.props.enabled}>
 *  <PageContentComponent /> // use enabled prop here too 
 * </Page>
 */

class Page extends React.Component {
  constructor(props) {
    super(props);
    // props:
    // - enabled (boolean)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.enabled || nextProps.enabled;
  }

  render() {
    return (
      <View
        pointerEvents={this.props.enabled ? 'auto' : 'none'}
        style={{
          // pointerEvents: this.props.enabled ? 'auto' : 'none',
          flex: 1,
          //flexGrow: 1,
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: this.props.enabled ? 1 : 0
        }}>

        { this.props.children }
      </View>
    );
  }
};

export default Page;