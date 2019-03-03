/*
 * Copyright (c) 2018 Peter Flynn
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*jshint esnext: true */
/*globals console, require, exports */

var sg = require("scenegraph");
var clipboard = require("clipboard");
var color = require("./util");


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


function createContainer(selection) {
    for (let i = 0; i < 5; i++) {
        let rectangle = new Rectangle();
        rectangle.width = 30 * i;
        rectangle.height = 20 * i;
        rectangle.fill = new color("gray");
        selection.insertionParent.addChild(rectangle);
        rectangle.moveInParentCoordinates(50 * i, 50 * i);

        let ellipse = new Ellipse();
        ellipse.radiusX = 20 * i;
        ellipse.radiusY = 20 * i;
        ellipse.fill = new color("gray");
        selection.insertionParent.addChild(ellipse);
        ellipse.moveInParentCoordinates(100 * i, 200 * i);

        let text = new Text();
        text.text = `example text ${i}`
        text.styleRanges = [
            {
                length: text.text.length,
                fill: new color("gray"),
                fontSize: 20
            }
        ];
        selection.insertionParent.addChild(text);
        text.moveInParentCoordinates(200 * i, 100 * i);
    }
}

function styleToWeight(fontStyle) {
    if (fontStyle.match(/\bBold\b/i)) {
        return "bold";
    } else if (fontStyle.match(/\bBlack\b/i) || fontStyle.match(/\bHeavy\b/i)) {  // TODO: "extra bold"? (move precedence higher if so)
        return "w900";
    } else if (fontStyle.match(/\bSemi[- ]?bold\b/i) || fontStyle.match(/\bDemi[- ]?bold\b/i)) {
        return "w600";
    } else if (fontStyle.match(/\bMedium\b/i)) {
        return "w500";
    } else if (fontStyle.match(/\bLight\b/i)) {
        return "w300";
    } else if (fontStyle.match(/\bUltra[- ]light\b/i)) {
        return "w200";
    } else {
        return "normal";
    }
}

function styleIsItalic(fontStyle) {
    return (fontStyle.match(/\bItalic\b/i) || fontStyle.match(/\bOblique\b/i));
}




function HexToColor( colorStr) {

    console.log(colorStr);
    colorStr = colorStr.split("#").join("");
    colorStr = "FF" + Hexfix(colorStr);
    console.log(colorStr);

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

    return "0x"+ val.toString(16).toUpperCase();
}
function colorToCSS(solidColor) {
    if (solidColor.a !== 255) {
        `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, ${num(solidColor.a / 255)
         
            })`;
    } else {
        return solidColor.toHex();
    }
}

function num(value) {
    return Math.round(value * 100) / 100;
}

// TODO: omit "px" suffix from 0s

function eq(num1, num2) {
    return (Math.abs(num1 - num2) < 0.001);
}

function copyflutter(selection) {
    var node = selection.items[0];
    if (!node) {
        return;
    }
    var css = "";

    // Size - for anything except point text
    if (!(node instanceof sg.Text && !node.areaBox)) {
        var bounds = node.localBounds;
        // css += `width: ${num(bounds.width)}px;\n`;
        // css += `height: ${num(bounds.height)}px;\n`;
        css += `Container( 
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
      )`
    }

    // Corner metrics
    if (node.hasRoundedCorners) {
        var corners = node.effectiveCornerRadii;
        var tlbr = eq(corners.topLeft, corners.bottomRight);
        var trbl = eq(corners.topRight, corners.bottomLeft);
        if (tlbr && trbl) {
            if (eq(corners.topLeft, corners.topRight)) {
                css += `border-radius: ${num(corners.topLeft)}px;\n`;
            } else {
                css += `border-radius: ${num(corners.topLeft)}px ${num(corners.topRight)}px;\n`;
            }
        } else {
            css += `border-radius: ${num(corners.topLeft)}px ${num(corners.topRight)}px ${num(corners.bottomRight)}px ${num(corners.bottomLeft)}px;\n`;
        }
    }

    // Text styles
    if (node instanceof sg.Text) {
        var textStyles = node.styleRanges[0];
        // css += `font-size: ${num(textStyles.fontSize)}px;\n`;
        // css += `font-weight: ${styleToWeight(textStyles.fontStyle)};\n`;


        if (textStyles.fontFamily.includes(" ")) {
            // css += `font-family: "${textStyles.fontFamily}";\n`;
            css += `TextStyle(
                fontSize: ${num(textStyles.fontSize)},
                fontWeight: ${styleToWeight(textStyles.fontStyle)},
                fontFamily: "${textStyles.fontFamily}",`
        }
        else {
            css += `TextStyle(
                fontSize: ${num(textStyles.fontSize)},
                fontWeight: ${styleToWeight(textStyles.fontStyle)},
                fontFamily: "${textStyles.fontFamily}",\n`
            // css += `font-family: ${textStyles.fontFamily};\n`;
        }

        if (styleIsItalic(textStyles.fontStyle)) {
            // css += `font-style: italic;\n`;
            css += `fontStyle: FontStyle.italic,\n`;
        }
        if (textStyles.underline) {
            // css += `text-decoration: underline,\n`;
            css += 'decoration: TextDecoration.underline,\n';
        }

        if (textStyles.charSpacing !== 0) {
            // css += `letter-spacing: ${num(textStyles.charSpacing / 1000)}em;\n`;
            css += `letterSpacing: ${num(textStyles.charSpacing / 1000*16)},\n`;
        }
        if (node.lineSpacing !== 0) {
            //To-do check out what is line spacing
            // css += `line-height: ${num(node.lineSpacing)}px;\n`;
        }
        // css += `text-align: ${node.textAlign};\n`;
    }

    // Fill
    var hasBgBlur = (node.blur && node.blur.visible && node.blur.isBackgroundEffect);
    var fillName = (node instanceof sg.Text) ? "color" : "background";
    if (node.fill && node.fillEnabled && !hasBgBlur) {
        var fill = node.fill;
        if (fill instanceof sg.Color) {
            // css += `${fillName}: ${colorToCSS(fill)};\n`;
            css += `color: ${Colors.colorToFlutter(fill)};,\n`;
        } else if (fill.colorStops) {
            var stops = fill.colorStops.map(stop => {
                return colorToCSS(stop.color) + " " + num(stop.stop * 100) + "%";
            });
            css += `${fillName}: linear-gradient(${ stops.join(", ") });\n`;  // TODO: gradient direction!
        } else if (fill instanceof sg.ImageFill) {
            css += `/* background: url(...); */\n`;
        }
    } else {
        // css += `${fillName}: transparent;\n`; //background transparent
    }

    // Stroke
    if (node.stroke && node.strokeEnabled) {
        var stroke = node.stroke;
        css += `border: ${num(node.strokeWidth)}px solid ${colorToCSS(stroke)};\n`;
        // TODO: dashed lines!
    }

    // Opacity
    if (node.opacity !== 1) {
        css += `opacity: ${num(node.opacity)};\n`;
    }

    // Dropshadow
    if (node.shadow && node.shadow.visible) {
        var shadow = node.shadow;
        var shadowSettings = `${num(shadow.x)}px ${num(shadow.y)}px ${num(shadow.blur)}px ${colorToCSS(shadow.color)}`;
        if (node instanceof sg.Text) {
            css += `text-shadow: ${shadowSettings};\n`;
        } else if (node instanceof sg.Rectangle) {
            css += `box-shadow: ${shadowSettings};\n`;
        } else {
            css += `filter: drop-shadow(${shadowSettings});\n`;
        }
    }

    // Blur
    if (node.blur && node.blur.visible) {
        var blur = node.blur;
        if (blur.isBackgroundEffect) {
            // Blur itself
            var backdropCSS = `backdrop-filter: blur(${blur.blurAmount}px);\n`;
            css += `/* Note: currently only Safari supports backdrop-filter */\n`;
            css += backdropCSS;
            css += `--webkit-` + backdropCSS;

            // Brightness slider
            // XD background blur brightness setting is essentially blending black/white with the blurred background: equivalent to translucent
            // background-color in CSS. (Can't use 'backdrop-filter: brightness()', which just multiplies each RGB value & also causes hue
            // shifts when some channels become saturated).
            if (blur.brightnessAmount > 0) {
                css += `background-color: rgba(255, 255, 255, ${num(blur.brightnessAmount / 100)});\n`;
            } else if (blur.brightnessAmount < 0) {
                css += `background-color: rgba(0, 0, 0, ${-num(blur.brightnessAmount / 100)});\n`;
            }

            // Fill opacity
            if (blur.fillOpacity > 0) {
                // This blends the shape's fill on top of the blurred background (fill itself is unblurred).
                // TODO: support this for solid & gradient fills by baking alpha (& brightnessAmount color) into fill!
                css += `/* (plus shape's fill blended on top as a separate layer with ${num(blur.fillOpacity * 100)}% opacity) */\n`;
            }
        } else {
            css += `filter: ${blur.blurAmount}px;\n`;
        }
    }

    clipboard.copyText(css);
    console.log(css);
}

exports.commands = {
    copyflutter: copyflutter,
    createContainer: createContainer,
};