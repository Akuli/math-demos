document.addEventListener('DOMContentLoaded', () => {
  const WIDTH = 500;
  const HEIGHT = 300;
  const CORNER_SIZE = 0.3;

  const fixedVector = (new THREE.Vector3(0, 0, 5)).multiplyScalar(0.3);
  const movingVector = (new THREE.Vector3(5, 0, 5)).multiplyScalar(0.2);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(14, WIDTH / HEIGHT, 1, 10000);
  camera.position.set(10, 6, -10);
  camera.lookAt(scene.position);
  camera.updateMatrix();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  document.getElementById('container').appendChild(renderer.domElement);

  function draw90DegreeMark(vector1, vector2) {
    // ==0 with floats doesn't do the right thing
    const shouldBeAlmostZero = vector1.dot(vector2);
    if (Math.abs(shouldBeAlmostZero) > 0.0000001) {
      throw new Error("attempt to draw |_ symbol in a non-90-degree corner");
    }

    const startPoint = (new THREE.Vector3()).copy(vector1).setLength(CORNER_SIZE);
    const endPoint   = (new THREE.Vector3()).copy(vector2).setLength(CORNER_SIZE);
    const middlePoint = (new THREE.Vector3()).add(startPoint).add(endPoint);

    const geometry = new THREE.Geometry();
    geometry.vertices.push(startPoint);
    geometry.vertices.push(middlePoint);
    geometry.vertices.push(endPoint);

    scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff })));
  }

  function render() {
    // clear everything
    scene.children.map(object => object.id).forEach(id => scene.remove(scene.getObjectById(id)));

    const crossProduct = (new THREE.Vector3()).copy(fixedVector).cross(movingVector);
    scene.add(commonStuff.createArrow3(fixedVector, 0x6666ff));
    scene.add(commonStuff.createArrow3(movingVector, 0xff0000));
    scene.add(commonStuff.createArrow3(crossProduct, 0xcc00cc));
    scene.add(commonStuff.createParallelogram3(
      fixedVector, movingVector, commonStuff.ZERO3, { color: 0xff00ff, opacity: 0.4 }
    ));
    draw90DegreeMark(fixedVector, crossProduct);
    draw90DegreeMark(movingVector, crossProduct);

    movingVector.applyMatrix4(new THREE.Matrix4().makeRotationY(0.005));

    renderer.render(scene, camera);

    const parallelogramCenter = new THREE.Vector3().addVectors(fixedVector, movingVector).multiplyScalar(0.5);
    commonStuff.setTextLocation3(renderer, camera, 'fixed-vector-text', fixedVector);
    commonStuff.setTextLocation3(renderer, camera, 'moving-vector-text', movingVector);
    commonStuff.setTextLocation3(renderer, camera, 'cross-product-text', crossProduct);
    commonStuff.setTextLocation3(renderer, camera, 'parallelogram-text', parallelogramCenter);

    window.requestAnimationFrame(render);
  }

  render();
});
