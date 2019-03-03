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