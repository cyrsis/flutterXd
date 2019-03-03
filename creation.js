function createContainer(selection) {
    for (let i = 0; i < 5; i++) {
        let rectangle = new Rectangle();
        rectangle.width = 30 * i;
        rectangle.height = 20 * i;
        rectangle.fill = new Color("gray");
        selection.insertionParent.addChild(rectangle);
        rectangle.moveInParentCoordinates(50 * i, 50 * i);

        let ellipse = new Ellipse();
        ellipse.radiusX = 20 * i;
        ellipse.radiusY = 20 * i;
        ellipse.fill = new Color("gray");
        selection.insertionParent.addChild(ellipse);
        ellipse.moveInParentCoordinates(100 * i, 200 * i);

        let text = new Text();
        text.text = `example text ${i}`
        text.styleRanges = [
            {
                length: text.text.length,
                fill: new Color("gray"),
                fontSize: 20
            }
        ];
        selection.insertionParent.addChild(text);
        text.moveInParentCoordinates(200 * i, 100 * i);
    }
}