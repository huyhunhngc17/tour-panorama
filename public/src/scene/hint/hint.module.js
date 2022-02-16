function Hint(name, positionX, positionY, positionZ, infoType, tag, navigateState) {
    this.name = name;
    this.positionX = positionX;
    this.positionY = positionY;
    this.positionZ = positionZ;
    this.infoType = infoType;
    this.tag = tag;
	this.navigateState = navigateState;
}
Hint.prototype.name = function() {
    return this.name;
};
Hint.prototype.positionX = function() {
    return this.positionX;
};
Hint.prototype.positionY = function() {
    return this.positionY;
};
Hint.prototype.positionZ = function() {
    return this.positionZ;
};

function Panorama(name, panoName, infoSpot, location, tag) {
    this.name = name;
    this.panoName = panoName;
    this.infoSpot = infoSpot;
	this.location = location;
    this.tag = tag
}