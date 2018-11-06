var webpack = require('webpack');
var path = require('path');
var { resolve } = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var postcssModulesValues = require('postcss-modules-values');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var VirtualModulePlugin = require('virtual-module-webpack-plugin');
var translationTable = require('./settings/translation_table.json');

const settingsJSON = Object.assign(
	require('./settings/general_settings.json'),
	require('./settings/development_settings.json')
)

console.log(settingsJSON);

module.exports = {
	mode: 'development',
	devtool: 'eval-source-map',
	entry: [
		'./support/polyfill.js',
		'./main/BeachHut.js'
	],
	devServer: {
	  contentBase: path.resolve(__dirname, 'dist'),
	  compress: true,
	  inline: true, 
	  hot: true,
	  port: 3000,
	  host: '0.0.0.0'
	},
	output: {
		path: require("path").resolve("./dist"),
		filename: '[name].bundle.js',
		publicPath: '/'
	},
	plugins: [
		new HtmlWebpackPlugin(Object.assign({ template: 'main/index.ejs'}, Object.assign({ description: translationTable.en["41"]}, settingsJSON))),
		new VirtualModulePlugin({
      		moduleName: 'settings/settings.json',
      		contents: JSON.stringify(settingsJSON),
    	}),
    	new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin()
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: { // you didn't need to do it this way (it worked your old way)
							presets: [
								[
									"env", {
										"targets": {
											"ie": 10
										},
									}
								],
								"react",
							],
							plugins: ['react-hot-loader/babel', 'transform-class-properties'],
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							hmr: true
						}
					},
					{
						loader: 'css-loader',
						options: {
							modules: true,
							localIdentName: "[name]-[local]-[hash:base64:6]"
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: [postcssModulesValues, autoprefixer]
						}
					}
				]
			}
		]
	}
}
