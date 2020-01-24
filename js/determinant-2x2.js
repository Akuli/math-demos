document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas-2x2');
  const context = canvas.getContext('2d');

  context.textAlign = 'start';
  context.translate(120, 120);

  function createArcArrow(vec1, vec2, radius) {
    let angle1 = vec1.angle();
    let angle2 = vec2.angle();
    const arrowLocation = (new THREE.Vector2(radius, 0)).rotateAround(commonStuff.ZERO2, angle2);
    const arrowTipDirection = (new THREE.Vector2()).copy(arrowLocation);

    // shortest possible arrow
    if (angle2 - angle1 > Math.PI) {
      [angle1, angle2] = [angle2, angle1];
      arrowTipDirection.rotateAround(commonStuff.ZERO2, -Math.PI/2);
    } else {
      arrowTipDirection.rotateAround(commonStuff.ZERO2, Math.PI/2);
    }

    const path = new Path2D();
    path.arc(0, 0, radius, angle1, angle2);
    commonStuff.addArrow(path, arrowLocation, arrowTipDirection);
    return path;
  }

  const fixedVector = new THREE.Vector2(200, 0);
  const spinningVector = new THREE.Vector2(100, 0);

  function drawAllTheThings() {
    context.clearRect(-1000, -1000, 2000, 2000);
    spinningVector.applyMatrix3(new THREE.Matrix3().rotate(0.01));

    // dot product is huge because pixel counts are big
    // so scale it down to make it more user-friendly
    // also need to flip sign because y axis upside down issue
    const userFriendlyDetValue = -(new THREE.Matrix3()).set(
      fixedVector.x, fixedVector.y, 0,
      spinningVector.x, spinningVector.y, 0,
      0, 0, 1,
    ).determinant() / 7000;

    if (userFriendlyDetValue > 0) {
      context.fillStyle = '#990';
    } else {
      context.fillStyle = '#339';
    }
    context.fill(commonStuff.createParallelogramPath(fixedVector, spinningVector));

    context.stroke(commonStuff.createVectorPath(fixedVector));
    context.stroke(commonStuff.createVectorPath(spinningVector));

    context.strokeStyle = '#fff';
    context.stroke(createArcArrow(fixedVector, spinningVector, 20));
    context.strokeStyle = '#000';

    context.fillStyle = '#000';
    context.textBaseline = 'top';

    context.fillText("  a", fixedVector.x, fixedVector.y);
    context.fillText("  b", spinningVector.x, spinningVector.y);

    commonStuff.setTextLocation2(context, 'det-text-container-2x2', commonStuff.averageVector2(fixedVector, spinningVector));
    document.getElementById('det-text-2x2').textContent = commonStuff.round(userFriendlyDetValue, 2);

    window.requestAnimationFrame(drawAllTheThings);
  }

  drawAllTheThings();
});
