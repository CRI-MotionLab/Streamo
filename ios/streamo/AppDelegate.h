#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

// this :
//@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

// is replaced by that in accordance to https://docs.expo.io/bare/installing-unimodules/
#import <UMCore/UMAppDelegateWrapper.h>
@interface AppDelegate : UMAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
