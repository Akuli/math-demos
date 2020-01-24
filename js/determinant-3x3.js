document.addEventListener('DOMContentLoaded', () => {
  const WIDTH = 1000;
  const HEIGHT = 500;

  const fixedVector1 = (new THREE.Vector3(-1.5, 0, -3)).multiplyScalar(1);   // blue
  const fixedVector2 = (new THREE.Vector3(-1, 0, 1)).multiplyScalar(2);   // red
  const movingVector = (new THREE.Vector3(0, 1, 0)).multiplyScalar(1.5);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(14, WIDTH / HEIGHT, 1, 10000);
  camera.position.set(0, 5, -20);
  camera.lookAt(scene.position);
  camera.updateMatrix();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  document.getElementById('container-3x3').appendChild(renderer.domElement);

  // this function is evil ikr
  function darkenColor(color, howMuch) {
    return (Math.round(((color & 0xff0000) >> 16)*howMuch) << 16 |
            Math.round(((color & 0x00ff00) >> 8)*howMuch) << 8 |
            Math.round(((color & 0x0000ff) >> 0)*howMuch) << 0);
  }

  function drawParallelepiped(vector1, vector2, vector3, color) {
    // faces
    const zero = new THREE.Vector3();
    const opa = 0.4;

    function draw(vec1, vec2, vec3, brightness) {
      scene.add(commonStuff.createParallelogram3(
        vec1, vec2, vec3, {
          color: darkenColor(color, brightness),
          opacity: 0.4,
        }
      ));
    }

    draw(vector1, vector2, zero,    1.00);
    draw(vector1, vector3, zero,    0.85);
    draw(vector2, vector3, zero,    0.70);
    draw(vector1, vector2, vector3, 0.55);
    draw(vector2, vector3, vector1, 0.40);
    draw(vector3, vector1, vector2, 0.25);

    var parallelogramGeometry = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(1,1,1));

    // move it to the right place
    parallelogramGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5,0.5,0.5));

    // this matrix maps unit square to vector1,vector2 parallelogram
    // third unit vector to cross product (wouldn't matter as long as resulting matrix is invertible)
    parallelogramGeometry.applyMatrix(new THREE.Matrix4().makeBasis(vector1, vector2, vector3));
    
    scene.add(new THREE.LineSegments(parallelogramGeometry,
      new THREE.MeshBasicMaterial({
      color: 0x000000,
    })));
  }

  function addArrowBetweenVectors(vector1, vector2) {
    const arcRadius = 0.6;
    const arrowSize = 0.2;

    const curveArray = [
      new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI/2, false, 0),
      new THREE.LineCurve(new THREE.Vector3(0, 1, 0), new THREE.Vector3(arrowSize, 1 - arrowSize, 0)),
      new THREE.LineCurve(new THREE.Vector3(0, 1, 0), new THREE.Vector3(arrowSize, 1 + arrowSize, 0)),
    ];

    for (const curve of curveArray) {
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const crossProduct = (new THREE.Vector3()).copy(vector1).cross(vector2);

      // this matrix makes the curve go to the right place unit square to vector1,vector2 parallelogram
      // third unit vector to cross product (wouldn't matter as long as resulting matrix is invertible)
      geometry.applyMatrix(new THREE.Matrix4().makeBasis(
        new THREE.Vector3().copy(vector1).setLength(arcRadius),
        new THREE.Vector3().copy(vector2).setLength(arcRadius),
        new THREE.Vector3().copy(vector1).cross(vector2),   // makes resulting matrix invertible
      ));

      scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: 0xffffff,
      })));
    }
  }

  function render() {
    // clear everything
    scene.children.map(object => object.id).forEach(id => scene.remove(scene.getObjectById(id)));

    const detValue = (new THREE.Matrix3()).set(
      fixedVector1.x, fixedVector1.y, fixedVector1.z,
      fixedVector2.x, fixedVector2.y, fixedVector2.z,
      movingVector.x, movingVector.y, movingVector.z,
    ).determinant()

    scene.add(commonStuff.createArrow3(fixedVector1, 0x6666ff));
    scene.add(commonStuff.createArrow3(fixedVector2, 0xff0000));
    scene.add(commonStuff.createArrow3(movingVector, 0x00cc00));
    drawParallelepiped(
      fixedVector1, fixedVector2, movingVector,
      detValue > 0 ? 0x999900 : 0x3366ff,
    );

    addArrowBetweenVectors(fixedVector1, fixedVector2);

    movingVector.applyMatrix4(new THREE.Matrix4().makeRotationZ(-0.005));

    renderer.render(scene, camera);

    const centerVector = commonStuff.parallelepipedComVector(fixedVector1, fixedVector2, movingVector);

    commonStuff.setTextLocation3(renderer, camera, 'fixed-vector-1-text', fixedVector1);
    commonStuff.setTextLocation3(renderer, camera, 'fixed-vector-2-text', fixedVector2);
    commonStuff.setTextLocation3(renderer, camera, 'moving-vector-text', movingVector);
    commonStuff.setTextLocation3(renderer, camera, 'det-text-container-3x3', centerVector);
    document.getElementById('det-text-3x3').textContent = commonStuff.round(detValue, 1) + '';

    window.requestAnimationFrame(render);
  }

  render();
});
