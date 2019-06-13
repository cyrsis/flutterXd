var sg = require("scenegraph");
var color = require("./color");

function isText(node) {

    var css = '';
    if (node instanceof sg.Text) {
        var textStyles = node.styleRanges[0];
        console.log(`${node}`);
        console.log(`${textStyles}`);
        // css += `font-size: ${num(textStyles.fontSize)}px;\n`;
        // css += `font-weight: ${styleToWeight(textStyles.fontStyle)};\n`;

        var plaintext = node.text;

        if (textStyles.fontFamily.includes(" ")) {
            // css += `font-family: "${textStyles.fontFamily}";\n`;
            css += `new Text("${plaintext}", style: new TextStyle(
                fontSize: ${num(textStyles.fontSize)},
                fontWeight: ${styleToWeight(textStyles.fontStyle)},
                fontFamily: "${textStyles.fontFamily}",`
        }
        else {
            css += `new Text( "${plaintext}", style: TextStyle(
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
            css += `letterSpacing: ${num(textStyles.charSpacing / 1000 * 16)},\n`;
        }
        if (node.lineSpacing !== 0) {
            //To-do check out what is line spacing
            // css += `line-height: ${num(node.lineSpacing)}px;\n`;
        }
        // css += `text-align: ${node.textAlign};\n`;
        css += color.isColor(node);

        css += `),)`;

        // css += color.checkOpacity(node,css);

    }


    if ((node instanceof sg.Text && node.areaBox)) {
        var bounds = node.localBounds;
        css = `new Container( 
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          child:` + css + `)`;
        return css +`\n`;
    } else {
        return css
    }



    return css + ``;
}


function styleToWeight(fontStyle) {
    if (fontStyle.match(/\bBold\b/i)) {
        return "FontWeight.bold";
    }
    else if (fontStyle.match(/\bBlack\b/i)) {
        return "FontWeight.w900";
    }
    else if (fontStyle.match(/\bExtra[- ]?bold\b/i)) {
        return "FontWeight.w800";
    }
    else if (fontStyle.match(/\bBold\b/i)) {
        return "FontWeight.w700";
    }

    else if (fontStyle.match(/\bHeavy\b/i)) {
        return "FontWeight.w600";
    }
    else if (fontStyle.match(/\bSemi[- ]?bold\b/i) || fontStyle.match(/\bDemi[- ]?bold\b/i)) {
        return "FontWeight.w600";
    }
    else if (fontStyle.match(/\bMedium\b/i)) {
        return "FontWeight.w500";
    }
    else if (fontStyle.match(/\bLight\b/i)) {
        return "FontWeight.w300";
    }

    else if (fontStyle.match(/\bExtra[- ]light\b/i)) {
            return "FontWeight.w200";
        }
    else if (fontStyle.match(/\bUltra[- ]light\b/i)) {
        return "FontWeight.w200";
    }
    else if (fontStyle.match(/\bThin\b/i)) {
        return "FontWeight.w100";
    }
    else {
        return "FontWeight.w400";
    }
}

function styleIsItalic(fontStyle) {
    return (fontStyle.match(/\bItalic\b/i) || fontStyle.match(/\bOblique\b/i));
}

function num(value) {
    return Math.round(value * 100) / 100;
}

module.exports = {
    styleToWeight,
    styleIsItalic,
    isText,
};