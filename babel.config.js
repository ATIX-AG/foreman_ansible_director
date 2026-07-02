module.exports = {
  presets: [
    [require.resolve('@babel/preset-env'), { modules: 'commonjs' }],
    require.resolve('@babel/preset-react'),
  ],
  plugins: []
};
