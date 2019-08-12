var sg = require("scenegraph");
var color = require("./color");
const application = require("application");
const commands = require('commands');
const fs = require("uxp").storage.localFileSystem;

function isSymbol(node) {

    console.log("Selected Symbol: "+node);
    var css = '';
    if (node instanceof sg.SymbolInstance) {

        var colors = "";
        var filename = `${node.name}.png`.toLowerCase();
        savePngOnTemp(node);
        var bounds = node.localBounds;

        css += `new Container( 
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          decoration: new BoxDecoration(
          image:new DecorationImage(
                        image: new AssetImage("assets/yoouma/${filename}"),fit: BoxFit.cover` + `)),
          child:` + css + ` new Container()` + `)`;
         return css;
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

async function savePngOnTemp(node) {


    const folder = await fs.getTemporaryFolder();
    // Exit if user doesn't select a folder
    //  if (!folder) return console.log("User canceled folder picker.");

    console.log("folder" + folder);
    var filename = `${node.name}.png`.toLowerCase();
    console.log("***filename****" + filename);
    var myfile = await folder.createFile(filename, {overwrite: true});


    // console.log("***folder"+folder);
    // var something = await folder.getEntries();
    // something.forEach(entry => console.log(entry.name));

    const renditionOptions = [
        {
            node: node,
            outputFile: myfile,
            type: application.RenditionType.PNG,    // [3]
            scale: 2
        }
    ];


    // Create the rendition(s)
    await application.createRenditions(renditionOptions)    // [1]
        .then(results => {                             // [2]
            // console.log(`PNG rendition has been saved at ${results[0].outputFile.nativePath}`);
        })
        .catch(error => {                              // [3]
            // console.log(error);
        });

    //Clean up from the text file
    // var regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    // var subst = ``;
    // const somethingelse = await filename.read();
    //
    // console.log("Something else"+somethingelse);

    // const adata = myfile.read({format: formats.binary}).then(function () {
    //     console.log("File is " + adata.byteLength + " bytes long.")
    // }); // 'data' is an ArrayBuffer


    // sendPngWebsocket(myfile,filename);
    // // console.log(markup);
    // const svgCode = markup.replace(regex, subst);
    // // console.log(svgCode);
    // await file.write(svgCode);


}

function num(value) {
    return Math.round(value * 100) / 100;
}

function eq(num1, num2) {
    return (Math.abs(num1 - num2) < 0.001);
}

module.exports = {
    isSymbol
};