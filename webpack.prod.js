var webpack = require('webpack');
var MiniCSSExtractPlugin = require('mini-css-extract-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var postcssModulesValues = require('postcss-modules-values');
var VirtualModulePlugin = require('virtual-module-webpack-plugin');
var autoprefixer = require('autoprefixer');
var { resolve } = require('path');
var translationTable = require('./settings/translation_table.json');


const settingsJSON = Object.assign(
	require('./settings/general_settings.json'),
	require('./settings/production_settings.json')
)

module.exports = {
	mode: 'production',
	context: resolve(__dirname),
	entry: ['./support/polyfill.js', './main/BeachHut.js'],
	output: {
		path: require("path").resolve("./dist"),
		filename: '[name].[chunkhash:6].js',
		publicPath: '/'
	},
	plugins: [
		new MiniCSSExtractPlugin({ filename: 'style.css', chunkFilename: "[id].css" }),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new HtmlWebpackPlugin(Object.assign({ template: 'main/index.ejs'}, Object.assign({ description: translationTable.en["41"]}, settingsJSON))),
		new VirtualModulePlugin({
			moduleName: 'settings/settings.json',
			contents: JSON.stringify(settingsJSON)
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					query: {
						presets: [
							[
								"env", {
									"targets": {
										"ie": 10
									},
								}
							],
							"react"
						],
						plugins: ['transform-class-properties']
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCSSExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							modules: true,
							localIdentName: "[name]-[local]-[hash:base64:6]"
						}
					}
				]
			}
		]
	},
}
