import React from 'react';

import '../styles/globals.css';

const MyApp: React.FC<any> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
