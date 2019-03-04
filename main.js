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
var color = require("./color");
var creation = require("./creation");
var textWidget = require("./text");
var recetangleWidget = require("./rectangle");


function styleIsItalic(fontStyle) {
    return (fontStyle.match(/\bItalic\b/i) || fontStyle.match(/\bOblique\b/i));
}


function copyflutter(selection) {

    var css = "";
    var node = selection.items[0];
    if (!node) {
        return;
    }
    //*** Debug
    console.log("The selected node is a: " + node.constructor.name);
    console.log("Node has " + node.children.length + " children");

    // Print out types of all child nodes (if any)
    node.children.forEach(function (childNode, i) {
        console.log("---- 1 LEVEL Child " + i + " is a " + childNode.constructor.name);
        css += textWidget.isText(childNode);

        childNode.children.forEach((element,i) => {
                console.log(element);
                console.log("-- 2 level Child " + i + " is a " + element.constructor.name);
                css += textWidget.isText(element);
            }
        )

    });


    // Size - for anything except point text
    // if (!(node instanceof sg.Text && !node.areaBox)) {
    //     var bounds = node.localBounds;
    //     // css += `width: ${num(bounds.width)}px;\n`;
    //     // css += `height: ${num(bounds.height)}px;\n`;
    //     css += `Container(
    //       width: ${num(bounds.width)},
    //       height:${num(bounds.height)},\n`
    //
    //
    //     //     static get BorderRadius10BrightOrgangeGm => new BoxDecoration(
    //     //         color: AppColors.BrightOrgangeGM,
    //     //         borderRadius: new BorderRadius.circular(10.0),
    //     // );
    //     if (node.hasRoundedCorners) {
    //         css += `decoration: new BoxDecoration( \n`;
    //         css += color.isColor(node);  //color: AppColors.BrightOrgangeGM,
    //         var corners = node.effectiveCornerRadii;
    //         var tlbr = eq(corners.topLeft, corners.bottomRight);
    //         var trbl = eq(corners.topRight, corners.bottomLeft);
    //         if (tlbr && trbl) {
    //             if (eq(corners.topLeft, corners.topRight)) {
    //                 css += `borderRadius: BorderRadius.circular(${num(corners.topLeft)}),\n`;
    //             } else {
    //                 css += `border-radius: ${num(corners.topLeft)}px ${num(corners.topRight)}px;\n`;
    //             }
    //         } else {
    //             css += `border-radius: ${num(corners.topLeft)}px ${num(corners.topRight)}px ${num(corners.bottomRight)}px ${num(corners.bottomLeft)}px;\n`;
    //         }
    //         css += `),`
    //     }
    //
    //     css += `),\n`;
    // }


     css+=textWidget.isText(node);
     //css+=recetangleWidget.isRectangle(node);

    // Text styles


    // Fill


    // Stroke
    if (node.stroke && node.strokeEnabled) {
        var stroke = node.stroke;
        css += `border: ${num(node.strokeWidth)}px solid ${color.colorToCSS(stroke)};\n`;
        // TODO: dashed lines!
    }

    // Opacity
    if (node.opacity !== 1) {
        css += `opacity: ${num(node.opacity)};\n`;
    }

    // Dropshadow
    if (node.shadow && node.shadow.visible) {
        var shadow = node.shadow;
        var shadowSettings = `${num(shadow.x)}px ${num(shadow.y)}px ${num(shadow.blur)}px ${color.colorToCSS(shadow.color)}`;
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

function num(value) {
    return Math.round(value * 100) / 100;
}

// TODO: omit "px" suffix from 0s
function eq(num1, num2) {
    return (Math.abs(num1 - num2) < 0.001);
}

exports.commands = {
    copyflutter: copyflutter,
    createContainer: creation.createContainer,
};