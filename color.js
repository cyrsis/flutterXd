var sg = require("scenegraph");
const application = require("application");
const commands = require('commands');
const fs = require("uxp").storage.localFileSystem;



function colorToFlutter(solidColor) {
    if (solidColor.a !== 255) {
        //return `rgba(${solidColor.r}, ${solidColor.g}, ${solidColor.b}, ${num(solidColor.a / 255)})`;
        return HexToColor(solidColor.toHex(true));
    } else {
        // return solidColor.toHex();
        return HexToColor(solidColor.toHex(true));
    }
}

function checkOpacity(node,css) {

// Opacity
    if (node.opacity !== 1) {
        css = `new Opacity(
          opacity: ${num(node.opacity)}, child:` + css + '),';

        return css
    }

    return css
}
function HexToColor(colorStr) {

    // console.log("before"+colorStr);
    colorStr = colorStr.split("#").join("");
    // console.log("mioddle"+colorStr);
    colorStr = "FF" + colorStr;
    // console.log("mioddle 2"+colorStr);
    var fix = Hexfix(colorStr);
    // console.log("after"+fix);

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
    return "0x" + fix;
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
        return solidColor.toHex(true);
    }
}

function isColor(node) {

    var filename = `${node.name}.png`.toLowerCase().trim();
    var hasBgBlur = (node.blur && node.blur.visible && node.blur.isBackgroundEffect);
    var fillName = (node instanceof sg.Text) ? "color" : "background";
    var css = "";
    if (node.fill && node.fillEnabled && !hasBgBlur) {
        var fill = node.fill;
        if (fill instanceof sg.Color) {
            // css += `${fillName}: ${colorToCSS(fill)};\n`;
            // console.log("Color to Flutter Fill 2"+fill.toHex(true));
            css += `color: Color(${colorToFlutter(fill)}),\n`;
        } else if (node.fill.colorStops) {
            var stops = fill.colorStops.map(stop => {
                return colorToCSS(stop.color) + " " + num(stop.stop * 100) + "%";
            });
            // css+=stops;

            var linearStops = fill.colorStops.map(
                stops => {
                    return num(stops.stop)
                }
            )
            var linearGradientColor = fill.colorStops.map(colors => {
                    return 'Color(' + colorToFlutter(colors.color) + `)`
                }
            );
            css += `gradient: new LinearGradient(colors: [${linearGradientColor.join(", ")}],
            stops:[${linearStops.join(", ")}],
            begin: FractionalOffset( ${node.fill.startX},${node.fill.startY}),
            end: FractionalOffset( ${node.fill.endX},${node.fill.endY}),
            ),\n`;  // TODO: gradient direction!
        } else if (fill instanceof sg.ImageFill) {
            // css += `image:new DecorationImage(
            //             image: NetworkImage("https://images.unsplash.com/photo-1537815749002-de6a533c64db?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=845&q=80"),fit: BoxFit.cover` + `),`;

            // console.log("*****Image Fill****");

            savePngOnTemp(node);
            // savePng(node);
            // savePng(node).then(function (val) {
            // });
            // css += `image:new DecorationImage(
            //             image: new AssetImage("assets/png/${filename}"),fit: BoxFit.cover` + `),`;

            css += `image:new DecorationImage(
                        image: NetworkImage("http://localhost:8899/image/${filename}"),fit: BoxFit.cover` + `),`;


        }

    } else {
        // css += `${fillName}: transparent;\n`; //background transparent
    }
    return css;
}

function sendPngWebsocket(file, filename) {

    var fileData = {name: filename, path: ""};
    console.log(fileData);
    console.log("-------Send message 2 call");
    var imgfile = file;
    var host = "127.0.0.1";

    var msg = 'Send message';
    var port = 8899;
    var protocol = "string";

    // var websocket = new WebSocket("wss://echo.websocket.org");//Test remote server, works great
    //  var websocket = new WebSocket("ws://localhost:5000/socket.io/?EIO=3&transport=websocket","xmpp");//Test remote server, works great

    var websocket = new WebSocket("ws://localhost:8080");

    // webSocket.binaryType = 'arraybuffer'; //allow both text and image to transfer

    // var websocket = await new WebSocket('ws://demos.kaazing.com/echo","xmpp', "xmpp");
    websocket.onerror = function () {
        console.log("Something went wrong");
    };


    websocket.onopen = function (imgfile, fileData) {

        console.log("XXXx Sending Something Good XXXX");
        // websocket.send("Send Something good");
        // console.log(imgfile.data);

        // console.log(JSON.stringify(fileData));
        // websocket.send(JSON.stringify(fileData));
        // websocket.send("newFilenname.png");
        websocket.send(imgfile);
        // websocket.send('some');
        // websocket.send(new Float32Array([ 5, 2, 1, 3, 6, -1 ]));
        // websocket.send(new Int32Array([5,-1]).buffer)
        // // websocket.send(JSON.stringify({
        //     id: "client1"
        // }));
        // websocket.send('upload-image', {
        //     name: "Reactsample",
        //     data:  imgfile
        // })

    };

    websocket.onmessage = function (evt) {
        console.log('Recieve message:' + evt.data);
    }


    //     document.getElementById('status').style.backgroundColor = '#40ff40';
    //     document.getElementById('status').textContent = 'Connection opened';
    //
    // websocket.onmessage = function(str) {
    //     console.log("Someone sent: ", str);
    // };

// Tell the server this is client 1 (swap for client 2 of course)
//     websocket.send("Something good");

// Tell the server we want to send something to the other client


    // try {
    //
    //     websocket.onopen = function () {
    //         console.log("-----Connection Open");
    //         websocket.send(JSON.stringify({
    //             to: "client2",
    //             data: "foo"
    //         }));
    //         //     document.getElementById('status').style.backgroundColor = '#40ff40';
    //     document.getElementById('status').textContent = 'Connection opened';
    // }
    // }
    //
    //
    //         webSocket.onmessage = function (msg) {
    //             var arrayBuffer = msg.data;
    //             var bytes = new Uint8Array(arrayBuffer);
    //
    //             // var image = document.getElementById('image');
    //             image.src = 'data:image/png;base64,' + encode(bytes);
    //
    //         },
    //
    //
    //         webSocket.onclose = function () {
    //             console.log("Connecgtion Close");
    //             // document.getElementById('status').style.backgroundColor = '#ff4040';
    //             // document.getElementById('status').textContent = 'Connection closed';
    //         }
    // } catch (exception) {
    //     console.log(exception);
    // }
}

async function savePngOnTemp(node) {


    const folder = await fs.getTemporaryFolder();
    // Exit if user doesn't select a folder
    //  if (!folder) return console.log("User canceled folder picker.");

    // console.log("folder" + folder);
    var filename = `${node.name}.png`.toLowerCase().replace(/ /g,'');
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
            console.log(`PNG rendition has been saved at ${results[0].outputFile.nativePath}`);
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

async function savePng(node) {

    const folder = await fs.getFolder();
    // Exit if user doesn't select a folder
    if (!folder) return console.log("User canceled folder picker.");

    var filename = `${node.name}.png`.toLowerCase().replace(/ /g,'');
    const file = await folder.createFile(filename, {overwrite: true});

    const renditionOptions = [
        {
            node: node,
            outputFile: file,
            type: application.RenditionType.PNG,
            scale: 1
        }
    ];


    // Create the rendition(s)
    await application.createRenditions(renditionOptions);


    const markup = await file.read();
    // console.log(markup);
    const svgCode = markup.replace(regex, subst);
    // console.log(svgCode);
    await file.write(svgCode);
    //Clean up from the text file
    // var regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    // var subst = ``;
    // const markup = await file.read();
    // // console.log(markup);
    // const svgCode = markup.replace(regex, subst);
    // // console.log(svgCode);
    // await file.write(svgCode);


}

module.exports = {
    colorToFlutter,
    Hexfix,
    HexToColor,
    colorToCSS,
    isColor,
    checkOpacity,
}
