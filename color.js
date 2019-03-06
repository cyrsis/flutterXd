var sg = require("scenegraph");

function colorToFlutter(solidColor) {
    if (solidColor.a !== 255) {
        //return `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, ${num(solidColor.a / 255)})`;
        return HexToColor(solidColor.toHex());
    } else {
        // return solidColor.toHex();
        return HexToColor(solidColor.toHex());
    }
}

function HexToColor(colorStr) {

     console.log("before"+colorStr);
    colorStr = colorStr.split("#").join("");
    colorStr = "FF" + Hexfix(colorStr);
    var fix = Hexfix(colorStr);
     console.log("after"+fix);

    var val = 0;
    var len = colorStr.length;
    for (var i = 0; i < len; i++) {
        var hexDigit = colorStr.charCodeAt(i).toFixed(16);
        if (hexDigit >= 48 && hexDigit <= 57) {
            val += (hexDigit - 48) * (1 << (4 * (len - 1 - i)));
        } else if (hexDigit >= 65 && hexDigit <= 70) {
            // A..F
            val += (hexDigit - 55) * (1 << (4 * (len - 1 - i)));
        } else if (hexDigit >= 97 && hexDigit <= 102) {
            // a..f
            val += (hexDigit - 87) * (1 << (4 * (len - 1 - i)));
        } else {
            throw new Error("An error occurred when converting a color");
        }
    }

    // return "0x" + val.toString(16).toUpperCase();
    return "0x" +fix;
}

function Hexfix(str) {
    var v, w;
    v = parseInt(str, 16);	// in rrggbb
    if (str.length == 3) {
        // nybble colors - fix to hex colors
        //  0x00000rgb              -> 0x000r0g0b
        //  0x000r0g0b | 0x00r0g0b0 -> 0x00rrggbb
        w = ((v & 0xF00) << 8) | ((v & 0x0F0) << 4) | (v & 0x00F);
        v = w | (w << 4);
    }
    return v.toString(16).toUpperCase();
}

function num(value) {
    return Math.round(value * 100) / 100;
}
function colorToCSS(solidColor) {
    if (solidColor.a !== 255) {
        `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, ${num(solidColor.a / 255)

            })`;
    } else {
        return solidColor.toHex();
    }
}

function isColor(node)
{
    var hasBgBlur = (node.blur && node.blur.visible && node.blur.isBackgroundEffect);
    var fillName = (node instanceof sg.Text) ? "color" : "background";
    var css ="";
    if (node.fill && node.fillEnabled && !hasBgBlur) {
        var fill = node.fill;
        if (fill instanceof sg.Color) {
            // css += `${fillName}: ${colorToCSS(fill)};\n`;
            console.log(colorToFlutter(fill));
            css += `color: Color(${colorToFlutter(fill)}),\n`;
        } else if (node.fill.colorStops) {
            var stops = fill.colorStops.map(stop => {
                return colorToCSS(stop.color) + " " + num(stop.stop * 100) + "%";
            });
            // css+=stops;

            var linearStops = fill.colorStops.map(
                stops =>{
                    return num(stops.stop)
                }
            )
            var linearGradientColor = fill.colorStops.map( colors =>{
                  return 'Color('+"somethinbg"+colorToFlutter(colors.color)+`)`
                }

            );
            css += `gradient: new LinearGradient(colors: [${ linearGradientColor.join(", ") }],
            stops:[${ linearStops.join(", ") }],
            begin: FractionalOffset( ${node.fill.startX},${node.fill.startY}),
            end: FractionalOffset( ${node.fill.endX},${node.fill.endY}),
            ),\n`;  // TODO: gradient direction!
        }
        else if (fill instanceof sg.ImageFill) {
            css += `image:new DecorationImage(
                        image: NetworkImage("https://images.unsplash.com/photo-1537815749002-de6a533c64db?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=845&q=80"),fit: BoxFit.cover`+`),`;
        }
    } else {
        // css += `${fillName}: transparent;\n`; //background transparent
    }
    return css;
}

module.exports = {
    colorToFlutter,
    Hexfix,
    HexToColor,
    colorToCSS,
    isColor,
};

