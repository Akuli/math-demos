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

  function drawParallelepiped(vector1, vector2, vector3) {
    // faces
    const zero = new THREE.Vector3();
    const color = 0xff00ff;
    const opa = 0.4;

    scene.add(commonStuff.createParallelogram3(vector1, vector2, zero,    { color: color*1.0, opacity: opa }));
    scene.add(commonStuff.createParallelogram3(vector1, vector3, zero,    { color: color*0.9, opacity: opa }));
    scene.add(commonStuff.createParallelogram3(vector2, vector3, zero,    { color: color*0.8, opacity: opa }));
    scene.add(commonStuff.createParallelogram3(vector1, vector2, vector3, { color: color*0.7, opacity: opa }));
    scene.add(commonStuff.createParallelogram3(vector2, vector3, vector1, { color: color*0.6, opacity: opa }));
    scene.add(commonStuff.createParallelogram3(vector3, vector1, vector2, { color: color*0.5, opacity: opa }));

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

  function render() {
    // clear everything
    scene.children.map(object => object.id).forEach(id => scene.remove(scene.getObjectById(id)));

    scene.add(commonStuff.createArrow3(fixedVector1, 0x6666ff));
    scene.add(commonStuff.createArrow3(fixedVector2, 0xff0000));
    scene.add(commonStuff.createArrow3(movingVector, 0x00cc00));
    drawParallelepiped(fixedVector1, fixedVector2, movingVector);

    movingVector.applyMatrix4(new THREE.Matrix4().makeRotationZ(0.005));

    renderer.render(scene, camera);

    const detValue = (new THREE.Matrix3()).set(
      fixedVector1.x, fixedVector1.y, fixedVector1.z,
      fixedVector2.x, fixedVector2.y, fixedVector2.z,
      movingVector.x, movingVector.y, movingVector.z,
    ).determinant()


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
