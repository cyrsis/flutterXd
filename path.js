const application = require("application");
const fs = require("uxp").storage.localFileSystem;
var sg = require("scenegraph");
var color = require("./color");

function isPath(node) {


    if (node instanceof sg.Path) {
        var colors = "";
        var css ="";
        var filename = `${node.name}path.svg`.toLowerCase();

        console.log(node);

        saveSvg(node).then(function (val){
        });

        var bounds = node.localBounds;

        css += `new SvgPicture.asset(
          'assets/svg/${filename}',
          ${color.isColor(node)}
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          allowDrawingOutsideViewBox: true,
          ),
          //- assets/svg/${filename}
      
          `;

        // console.log("css"+css);
         return css;

        /**/
    }


    return "";
    // }
}

async function saveSvg(node) {
    const folder = await fs.getFolder();
    // Exit if user doesn't select a folder
    if (!folder) return console.log("User canceled folder picker.");

    var filename = `${node.name}path.svg`.toLowerCase();
    const file = await folder.createFile(filename, {overwrite: true});

    const renditionOptions = [
        {
            node: node,
            outputFile: file,
            type: application.RenditionType.SVG,
            minify: true,
            embedImages: true,
            background: false,
            scale: 1
        }
    ];


    // Create the rendition(s)
    await application.createRenditions(renditionOptions);
    var regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    var subst = ``;
    const markup = await file.read();
    // console.log(markup);
    const svgCode = markup.replace(regex,subst);
    // console.log(svgCode);
    await file.write(svgCode);

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
    var css = '';
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

        return css
    }
    return css
     //Closing
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
            css += `borderRadius: new BorderRadius.only(topLeft:${num(corners.topLeft)} topRight:${num(corners.topRight)} bottomRight${num(corners.bottomRight)} bottomLeft:${num(corners.bottomLeft)} );\n`;
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
    isPath
};