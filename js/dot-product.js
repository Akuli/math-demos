document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  context.translate(100, 100);

  const fixedVector = new THREE.Vector2(200, 0);
  const spinningVector = new THREE.Vector2(80, 0);

  function drawAllTheThings() {
    context.clearRect(-1000, -1000, 2000, 2000);
    spinningVector.applyMatrix3(new THREE.Matrix3().rotate(0.01));
    const spinningVectorRotated90 = new THREE.Vector2()
      .copy(spinningVector)
      .rotateAround(commonStuff.ZERO2, Math.PI/2);

    const projectionLength = fixedVector.dot(spinningVector) / fixedVector.length();
    const projectionVector = (new THREE.Vector2()).copy(fixedVector).setLength(projectionLength);

    if (fixedVector.dot(spinningVector) > 0) {
      context.fillStyle = '#990';
    } else {
      context.fillStyle = '#339';
    }
    context.fill(commonStuff.createParallelogramPath(fixedVector, spinningVectorRotated90));

    // dot product is huge because pixel counts are big
    // so scale it down to make it more user-friendly
    const userFriendlyDotProductValue = fixedVector.dot(spinningVector) / 7000;

    const cdotCharacter = '\u22C5';
    const centerTextVector = commonStuff.averageVector2(fixedVector, spinningVectorRotated90);

    context.fillStyle = '#fff';
    context.textAlign = 'start';
    context.fillText(
      `v${cdotCharacter}w = x|v| = ${commonStuff.round(userFriendlyDotProductValue, 2)}`,
      centerTextVector.x, centerTextVector.y);

    context.stroke(commonStuff.createVectorPath(fixedVector));
    context.stroke(commonStuff.createVectorPath(spinningVector));

    context.fillStyle = '#000';

    context.textAlign = 'start';
    context.fillText("  v", fixedVector.x, fixedVector.y);
    context.fillText("  w", spinningVector.x, spinningVector.y);

    context.setLineDash([5, 5]);
    context.stroke(commonStuff.createLinePath(projectionVector, spinningVector));

    const xSignTextLocation = (new THREE.Vector2()).copy(projectionVector).multiplyScalar(0.5);
    xSignTextLocation.y += 10;
    context.textAlign = 'center';

    if (fixedVector.dot(spinningVector) > 0) {
      context.fillText("x > 0", xSignTextLocation.x, xSignTextLocation.y);
    } else {
      context.stroke(commonStuff.createLinePath(commonStuff.ZERO2, projectionVector));
      context.fillText("x < 0", xSignTextLocation.x, xSignTextLocation.y);
    }
    context.setLineDash([]);

    window.requestAnimationFrame(drawAllTheThings);
  }

  drawAllTheThings();
});
