module.exports = {
    syntax: 'postcss-scss',
    plugins: [
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer'),
        require('cssnano')({
            preset: 'default',
        }),
    ],
};