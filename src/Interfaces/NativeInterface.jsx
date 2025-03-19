import Serializer from 'src/utils/Serializer';
export default {
  postMessage(data) {
    const serializedData = Serializer.serialize(data);
    console.log('Native Request Serializded', serializedData);
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(serializedData);
  },
};
