const path = require('path');
const Dotenv = require("dotenv-webpack");
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');

module.exports = {
	entry: {
		index: './src/js/index.js'
	},
	devServer: {
		static: './public'
	},
	devtool: 'inline-source-map',
	output: {
		clean: true,
		filename: '[name].bundle.js',
		path: path.join(__dirname, 'public')
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource'
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource'
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new HtmlMinimizerPlugin(),
			new CssMinimizerPlugin(),
			new TerserPlugin()
		],
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'all',
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
			title: 'GeoNames - A List of Popular API\'s',
		}),
		new ESLintPlugin(),
		new MiniCssExtractPlugin(),
		new Dotenv({
			systemvars: true
		})
	],
	watch: true
};