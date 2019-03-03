module.exports = {
    foo: function () {
        // whatever
    },
    colorToFlutter: function colorToFlutter(solidColor) {
        if (solidColor.a !== 255) {
            return `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, ${num(solidColor.a / 255)})`;
        } else {
            // return solidColor.toHex();
            return HexToColor(solidColor.toHex());
        }
    }
};
