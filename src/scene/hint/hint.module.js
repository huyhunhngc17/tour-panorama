function Hint(name, positionX, positionY, positionZ, infoType, tag, endState) {
    this.name = name;
    this.positionX = positionX;
    this.positionY = positionY;
    this.positionZ = positionZ;
    this.infoType = infoType;
    this.tag = tag
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