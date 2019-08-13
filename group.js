var sg = require("scenegraph");
var color = require("./color");
const application = require("application");
var ellipse = require("./ellipse");
const commands = require('commands');
var clipboard = require("clipboard");
var textWidget = require("./text");
var symbol = require('./symbol');
var recetangleWidget = require("./rectangle");
const fs = require("uxp").storage.localFileSystem;

function isGroup(node) {

    var groupCss = "";

    if (node instanceof sg.Group) {
        // Print out types of all child nodes (if any)

        if (node.name.includes("Row")) {

            walkDownRowTree(node);

            groupCss += ` 
                   
              )`;//groupCss
            return groupCss;

        }

        else{
            walkDownColumnTree(node);
            groupCss += `, 
                    ),
              )`;//groupCss
            return groupCss;
        }





        function walkDownColumnTree(node, command, value = null) {
            // command(node, value);

            var bounds = node.localBounds;

            var position = node.boundsInParent;

            var PreviousChildYPosition = position.y;

            console.log("**LOCAL GROUP POSITION**");
            console.log(position);
            console.log(position.y);
            console.log("****************");
            groupCss += "//";
            groupCss += `${node.name}`
            groupCss += "\n";
            groupCss += `new Container(
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.start,
        children: <Widget>[ \n`;

            // function checkForEachLeft(node) {
            //     node.children.forEach(function (childNode, index) {
            //
            //         if (parseInt(childNode.boundsInParent.y - PreviousChildYPosition) < 0) {
            //
            //             console.log(`Should be Foreach left`)
            //
            //         }
            //
            //
            //         PreviousChildYPosition = childNode.boundsInParent.y + childNode.localBounds.height;
            //
            //     });
            //
            // }
            //
            // checkForEachLeft(node)

            node.children.forEach(function (childNode, index) {

                console.log("------------------------------------------------");
                console.log("Current Child " + index + " is a " + childNode.constructor.name);

                console.log("Previous: " + ((0 == index) ? "START" : node.children.at(index - 1)));

                console.log("Next: " + ((node.children.length - 1 == index) ? "END" : node.children.at(index + 1)));
                console.log("------------------------------------------------");

                if (childNode instanceof sg.Rectangle) {
                    groupCss += recetangleWidget.isRectangle(childNode)
                    groupCss += `)`
                    ;
                }
                else if (childNode instanceof sg.Text) {


                    if (0 === index) {

                        if ((Math.abs(childNode.boundsInParent.y) - Math.abs(PreviousChildYPosition))!=0) {
                            groupCss += `\nAppWidget.SizeBoxH` + (Math.abs(childNode.boundsInParent.y) - Math.abs(PreviousChildYPosition)) + `,\n`;
                        }

                    } else {

                        groupCss += `\nAppWidget.SizeBoxH` + (Math.abs(childNode.boundsInParent.y) - Math.abs(PreviousChildYPosition)) + `,\n`;

                    }

                    groupCss += textWidget.isText(childNode) + ', ';



                    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
                    console.log("Bounds in parent y " + childNode.boundsInParent.y);
                    console.log("height in  " + childNode.localBounds.height);
                    PreviousChildYPosition = childNode.boundsInParent.y + childNode.localBounds.height;
                    console.log(`PreviousChildYPosition` + PreviousChildYPosition)
                    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

                }
                else if (childNode instanceof sg.Group) {

                    if (parseInt(childNode.boundsInParent.y - PreviousChildYPosition) != 0) {

                        groupCss += `\nAppWidget.SizeBoxW` + parseInt(childNode.boundsInParent.y - PreviousChildYPosition) + `,\n`;

                    }

                    groupCss += isGroup(childNode);
                    groupCss += `,`;

                    console.log("Bounds in parent Y " + childNode.boundsInParent.y);
                    console.log("Width in  " + childNode.localBounds.height);
                    PreviousChildYPosition = childNode.boundsInParent.y + childNode.localBounds.height;

                    console.log(`PreviousChildYPosition` + PreviousChildYPosition)

                }


            });

            groupCss += `]`;

        }

        function walkDownRowTree(node, command, value = null) {
            // command(node, value);

            var bounds = node.localBounds;

            var position = node.boundsInParent;


            var PreviousChildXPosition = 0;


            groupCss += "//";
            groupCss += `${node.name}`
            groupCss += "\n";
            groupCss += `new Container(
          width: ${num(bounds.width)},
          height:${num(bounds.height)},
          child: new Row(
          crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
        children: <Widget>[ \n`;

            node.children.forEach(function (childNode, index) {

                // console.log("Current Child " + index + " is a " + childNode.constructor.name);
                //
                // console.log("Previous: " + ((0 === index) ? "START" : node.children.at(index - 1)));
                //
                // console.log("Next: " + ((childNode.length - 1 === index) ? "END" : node.children.at(index + 1)));


                if (childNode instanceof sg.Rectangle) {
                    groupCss += recetangleWidget.isRectangle(childNode)
                    groupCss += `)`
                    ;
                } else if (childNode instanceof sg.Text) {

                    if (parseInt(childNode.boundsInParent.x - PreviousChildXPosition) != 0) {

                        groupCss += `\nAppWidget.SizeBoxW` + parseInt(childNode.boundsInParent.x - PreviousChildXPosition) + `,\n`;

                    }


                    groupCss += textWidget.isText(childNode) + ', ';

                    console.log("Bounds in parent x " + childNode.boundsInParent.x);
                    console.log("Width in  " + childNode.localBounds.width);
                    PreviousChildXPosition = childNode.boundsInParent.x + childNode.localBounds.width;

                    console.log(`PreviousChildYPosition` + PreviousChildXPosition)

                } else if (childNode instanceof sg.SymbolInstance) {

                    if (parseInt(childNode.boundsInParent.x - PreviousChildXPosition) != 0) {

                        groupCss += `\nAppWidget.SizeBoxW` + parseInt(childNode.boundsInParent.x - PreviousChildXPosition) + `,\n`;

                    }
                    groupCss += symbol.isSymbol(childNode);
                    groupCss += `,`;

                    console.log("Bounds in parent x " + childNode.boundsInParent.x);
                    console.log("Width in  " + childNode.localBounds.width);
                    PreviousChildXPosition = childNode.boundsInParent.x + childNode.localBounds.width;

                    console.log(`PreviousChildYPosition` + PreviousChildXPosition)


                } else if (childNode instanceof sg.Ellipse) {

                    if (parseInt(childNode.boundsInParent.x - PreviousChildXPosition) != 0) {

                        groupCss += `\nAppWidget.SizeBoxW` + parseInt(childNode.boundsInParent.x - PreviousChildXPosition) + `,\n`;

                    }

                    groupCss += ellipse.isEllipse(childNode);
                    groupCss += `,`;

                    console.log("Bounds in parent x " + childNode.boundsInParent.x);
                    console.log("Width in  " + childNode.localBounds.width);
                    PreviousChildXPosition = childNode.boundsInParent.x + childNode.localBounds.width;

                    console.log(`PreviousChildYPosition` + PreviousChildXPosition)

                } else if (childNode instanceof sg.Group) {

                    if (parseInt(childNode.boundsInParent.x - PreviousChildXPosition) != 0) {

                        groupCss += `\nAppWidget.SizeBoxW` + parseInt(childNode.boundsInParent.x - PreviousChildXPosition) + `,\n`;

                    }

                    groupCss += isGroup(childNode);
                    groupCss += `,`;

                    console.log("Bounds in parent x " + childNode.boundsInParent.x);
                    console.log("Width in  " + childNode.localBounds.width);
                    PreviousChildXPosition = childNode.boundsInParent.x + childNode.localBounds.width;

                    console.log(`PreviousChildYPosition` + PreviousChildXPosition)

                }


            });

            groupCss += `]
      
      )`;

        }


        groupCss += ` )`;//groupCss




        return groupCss;
    }
}

function num(value) {
    return Math.round(value * 100) / 100;
}


module.exports = {
    isGroup
};