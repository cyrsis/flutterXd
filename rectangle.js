var sg = require("scenegraph");
var color = require("./color");

function isRectangle(node) {

    console.log("Selected Rectangle: "+node);

    var css = '';
    var childrencss = ` new Container()`;
    if (node instanceof sg.Rectangle) {

        var colors = "";
        var bounds = node.localBounds;
        css += "//";
        css += `${node.name}`
        css += "\n";
        css += `new Container( 
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          ${hasColor(node)}
          child:` +childrencss ;
        // return css;
        /**/
    }


    return css;
    // }
}

function hasColor(node) {
    var hasBgBlur = (node.blur && node.blur.visible && node.blur.isBackgroundEffect);
    if (node.fill && node.fillEnabled && !hasBgBlur) {
        return `decoration: new BoxDecoration(
                 ${color.isColor(node)}` +
            hasBorder(node) +
            hasRadius(node) +
            hasShadow(node) +
            `),`

            ;

        //     color: Color(0xFFFF7B6E),
    }


}

function hasBorder(node) {
    var css='';
    // Stroke
    if (node.stroke && node.strokeEnabled) {
        css += `border: `;
        var stroke = node.stroke;
        css += `Border.all(color: Color(${color.colorToFlutter(stroke)}) , width: ${num(node.strokeWidth)})`;
        // css += `border: ${num(node.strokeWidth)}px solid ${color.colorToFlutter(stroke)};\n`;
        // TODO: dashed lines!
        css += `,`
    }
    return css;

}

function hasShadow(node) {

    // console.log("Node Shadow Color");
    // console.log(node.shadow.color);
    var css = ''; //Opening
    // Dropshadow
    if (node.shadow && node.shadow.visible) {
        css += 'boxShadow: [';
        var shadow = node.shadow;
        var shadowSettings = `${num(shadow.x)}px ${num(shadow.y)}px ${num(shadow.blur)}px ${color.colorToFlutter(shadow.color)}`;
        // css+= shadowSettings;
        if (node instanceof sg.Text) {
            // css += `text-shadow: ${shadowSettings};\n`;
        } else if (node instanceof sg.Rectangle) {
            css += ` 
          new BoxShadow(
          color: Color(${color.colorToFlutter(shadow.color)}),
          offset: new Offset(${num(shadow.x)}, ${num(shadow.y)}),
          blurRadius: ${num(shadow.blur)},
        ),\n`;
        } else {
            css += `filter: drop-shadow(${shadowSettings});\n`;
        }
        css += `]`;
    }

    return css //Closing
}

function hasRadius(node) {
    var css = '';
    if (node.hasRoundedCorners) {
        var corners = node.effectiveCornerRadii;
        var tlbr = eq(corners.topLeft, corners.bottomRight);
        var trbl = eq(corners.topRight, corners.bottomLeft);
        if (tlbr && trbl) {
            if (eq(corners.topLeft, corners.topRight)) {
                css += `borderRadius: BorderRadius.circular(${num(corners.topLeft)}),\n`;
            } else {
                css += `borderRadius: new BorderRadius.only(topLeft:${num(corners.topLeft)} topRight:${num(corners.topRight)};\n`;
            }
        } else {
            css += `borderRadius: new BorderRadius.only(topLeft:Radius.circular(${num(corners.topLeft)}), topRight:Radius.circular(${num(corners.topRight)}), bottomRight:Radius.circular(${num(corners.bottomRight)}), bottomLeft:Radius.circular(${num(corners.bottomLeft)})),\n`;
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
    isRectangle
};