function Hint(name, positionX, positionY, positionZ, infoType, tag, endState) {
    this.name = name;
    this.positionX = positionX;
    this.positionY = positionY;
    this.positionZ = positionZ;
    this.infoType = infoType;
    this.tag = tag
}
Hint.prototype.describe = function() {
    return this.name;
};

module.exports = Hint;