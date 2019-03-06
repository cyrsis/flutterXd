var sg = require("scenegraph");
var color = require("./color");

function isEllipse(node) {

    var css = '';
    if (node instanceof sg.Ellipse) {

        var colors="";


        var bounds = node.localBounds;
        css = `new Container( 
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          ${hasColor(node)}
          child:` + css + ` new Container()`+`)`;
        // return css;
        /**/}


    return css;
    // }
}

function hasColor(node){
    var hasBgBlur = (node.blur && node.blur.visible && node.blur.isBackgroundEffect);
    if (node.fill && node.fillEnabled && !hasBgBlur) {
        return `decoration: new BoxDecoration(
                ${color.isColor(node)}`+
            `borderRadius: new BorderRadius.all(new Radius.circular(30.0)),`+
            `),`

            ;

        //     color: Color(0xFFFF7B6E),
    }
}

function hasRadius(node){
    var css ='';
    if (node.hasRoundedCorners) {
        var corners = node.effectiveCornerRadii;
        var tlbr = eq(corners.topLeft, corners.bottomRight);
        var trbl = eq(corners.topRight, corners.bottomLeft);
        if (tlbr && trbl) {
            if (eq(corners.topLeft, corners.topRight)) {
                css += `borderRadius: BorderRadius.circular(${num(corners.topLeft)}),\n`;
            } else {
                css += `border-radius: ${num(corners.topLeft)}px ${num(corners.topRight)};\n`;
            }
        } else {
            css += `border-radius: ${num(corners.topLeft)}px ${num(corners.topRight)}px ${num(corners.bottomRight)}px ${num(corners.bottomLeft)}px;\n`;
        }

    }
    return css;
}


function num(value) {
    return Math.round(value * 100) / 100;
}
function eq(num1, num2) {
    return (Math.abs(num1 - num2) < 0.001);
}

module.exports = {
    isEllipse
};