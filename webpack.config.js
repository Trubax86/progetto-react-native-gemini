const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Aggiungi alias per react-native-web e moduli nativi
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    // Mock specifici per moduli nativi
    '@react-native-google-signin/google-signin$': path.resolve(__dirname, './src/mocks/react-native-google-signin.ts'),
    '@react-native-google-signin/google-signin/lib/module/RNGoogleSiginButton': path.resolve(__dirname, './src/mocks/react-native-google-signin.ts'),
    '@react-native-google-signin/google-signin/lib/module/GoogleSignin': path.resolve(__dirname, './src/mocks/react-native-google-signin.ts')
  };

  // Aggiungi regole per gestire i file .web.tsx
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.jsx',
    '.web.js',
    ...config.resolve.extensions
  ];

  // Gestisci i moduli nativi non supportati
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules\/@react-native-google-signin\/google-signin/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          ['module-resolver', {
            alias: {
              'react-native': 'react-native-web'
            }
          }]
        ]
      }
    }
  });

  return config;
};
