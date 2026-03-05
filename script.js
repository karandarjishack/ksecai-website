import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';

const statusEl = document.querySelector('#three-status');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 1, 8);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#cyber-scene'), antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
if (statusEl) statusEl.textContent = '3D active';

scene.add(new THREE.AmbientLight(0x4ab8ff, 0.9));
const point = new THREE.PointLight(0x3cffcb, 1.4, 90);
point.position.set(7, 5, 7);
scene.add(point);

const aiShield = new THREE.Group();
scene.add(aiShield);

const neuralCore = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 28, 28),
  new THREE.MeshStandardMaterial({
    color: 0x25c7ff,
    wireframe: true,
    emissive: 0x0b2d49,
    roughness: 0.25,
  })
);
aiShield.add(neuralCore);

const orbitRingA = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.03, 18, 120),
  new THREE.MeshStandardMaterial({ color: 0x6fffd4, emissive: 0x0a4c3e, roughness: 0.2, metalness: 0.6 })
);
orbitRingA.rotation.x = Math.PI * 0.42;
aiShield.add(orbitRingA);

const orbitRingB = new THREE.Mesh(
  new THREE.TorusGeometry(2.2, 0.02, 18, 120),
  new THREE.MeshStandardMaterial({ color: 0x51b8ff, emissive: 0x0d2d5f, roughness: 0.2, metalness: 0.5 })
);
orbitRingB.rotation.y = Math.PI * 0.3;
orbitRingB.rotation.x = Math.PI * 0.08;
aiShield.add(orbitRingB);

const shieldBody = new THREE.Mesh(
  new THREE.ConeGeometry(0.75, 1.25, 6, 1),
  new THREE.MeshStandardMaterial({ color: 0x6fe6ff, emissive: 0x154257, roughness: 0.3, metalness: 0.4 })
);
shieldBody.position.set(0, -0.25, -1.35);
shieldBody.rotation.x = Math.PI;
aiShield.add(shieldBody);

const lockBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.35, 0.33, 0.14),
  new THREE.MeshStandardMaterial({ color: 0xeffaff, emissive: 0x28434f, roughness: 0.28, metalness: 0.18 })
);
lockBody.position.set(0, -0.2, -0.95);
aiShield.add(lockBody);

const lockArc = new THREE.Mesh(
  new THREE.TorusGeometry(0.14, 0.03, 16, 46, Math.PI),
  new THREE.MeshStandardMaterial({ color: 0xd6f7ff, emissive: 0x203d49, roughness: 0.25 })
);
lockArc.position.set(0, 0.01, -0.95);
lockArc.rotation.z = Math.PI;
aiShield.add(lockArc);

const linkNodes = [];
const nodeGeometry = new THREE.SphereGeometry(0.06, 12, 12);
const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x8cfde1, emissive: 0x125a48, roughness: 0.2 });
for (let i = 0; i < 12; i += 1) {
  const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
  const a = (i / 12) * Math.PI * 2;
  node.position.set(Math.cos(a) * 2.45, Math.sin(a) * 0.8, Math.sin(a * 1.7) * 1.1);
  aiShield.add(node);
  linkNodes.push(node.position.clone());
}

const linkPoints = [];
for (let i = 0; i < linkNodes.length; i += 1) {
  const curr = linkNodes[i];
  const next = linkNodes[(i + 1) % linkNodes.length];
  linkPoints.push(curr, next);
}
const linkGeometry = new THREE.BufferGeometry().setFromPoints(linkPoints);
const linkLines = new THREE.LineSegments(
  linkGeometry,
  new THREE.LineBasicMaterial({ color: 0x43d1ff, transparent: true, opacity: 0.52 })
);
aiShield.add(linkLines);

const particlesGeo = new THREE.BufferGeometry();
const particleCount = 700;
const pos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i += 1) {
  pos[i * 3] = (Math.random() - 0.5) * 36;
  pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
  pos[i * 3 + 2] = (Math.random() - 0.5) * 42;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ color: 0x7fd6ff, size: 0.03, transparent: true, opacity: 0.65 })
);
scene.add(particles);

const pointer = { x: 0, y: 0 };
addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
});

const cameraPresets = {
  hero: { x: 0, y: 1, z: 8, lookX: 0, lookY: 0, lookZ: 0 },
  services: { x: -2.1, y: 1.6, z: 6.4, lookX: 0.4, lookY: 0, lookZ: -0.4 },
  products: { x: -1.2, y: 2.05, z: 5.9, lookX: 0.15, lookY: 0.2, lookZ: -0.65 },
  footprint: { x: 2.3, y: 1.7, z: 6.2, lookX: -0.2, lookY: -0.05, lookZ: -0.5 },
  score: { x: 2.2, y: 1.35, z: 5.2, lookX: -0.2, lookY: -0.15, lookZ: -0.8 },
};

const cameraTarget = { ...cameraPresets.hero };
const lookTarget = new THREE.Vector3(0, 0, 0);
const sections = [...document.querySelectorAll('.section[data-cam]')];

function updateCameraTargetByScroll() {
  const mid = innerHeight * 0.48;
  let active = sections[0];
  let best = Number.POSITIVE_INFINITY;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - mid);
    if (distance < best) {
      best = distance;
      active = section;
    }
  });

  sections.forEach((section) => section.classList.toggle('active', section === active));
  Object.assign(cameraTarget, cameraPresets[active.dataset.cam] ?? cameraPresets.hero);
}

addEventListener('scroll', updateCameraTargetByScroll, { passive: true });
updateCameraTargetByScroll();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  updateCameraTargetByScroll();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId) return;
    const target = targetId === '#top' ? document.body : document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    const top = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

const animate = () => {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  aiShield.rotation.y = t * 0.25 + pointer.x * 0.17;
  aiShield.rotation.x = pointer.y * 0.12;
  neuralCore.rotation.y = t * 0.45;
  orbitRingA.rotation.z = t * 0.5;
  orbitRingB.rotation.z = -t * 0.38;
  lockArc.rotation.y = Math.sin(t * 0.9) * 0.15;
  particles.rotation.y = t * 0.025;
  camera.position.x += (((cameraTarget.x + pointer.x * 0.7)) - camera.position.x) * 0.035;
  camera.position.y += (((cameraTarget.y + pointer.y * 0.35)) - camera.position.y) * 0.035;
  camera.position.z += ((cameraTarget.z) - camera.position.z) * 0.032;

  lookTarget.x += (cameraTarget.lookX - lookTarget.x) * 0.045;
  lookTarget.y += (cameraTarget.lookY - lookTarget.y) * 0.045;
  lookTarget.z += (cameraTarget.lookZ - lookTarget.z) * 0.045;
  camera.lookAt(lookTarget);
  renderer.render(scene, camera);
};
animate();

const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const box = card.getBoundingClientRect();
    const cx = event.clientX - box.left;
    const cy = event.clientY - box.top;
    const rx = ((cy / box.height) - 0.5) * -10;
    const ry = ((cx / box.width) - 0.5) * 14;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
});

const form = document.querySelector('#score-form');
const dial = document.querySelector('#dial');
const scoreValue = document.querySelector('#score-value');
const grade = document.querySelector('#grade');
const advice = document.querySelector('#advice');
const bars = document.querySelectorAll('#bars i');

const scoreConfig = {
  identity: 0.3,
  soc: 0.3,
  response: 0.25,
  research: 0.15,
};

function renderScore() {
  const data = Object.fromEntries(new FormData(form).entries());
  const values = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Number(value)]));

  form.querySelectorAll('label').forEach((label) => {
    const slider = label.querySelector('input');
    label.querySelector('output').textContent = slider.value;
  });

  const total = Math.round(
    values.identity * scoreConfig.identity +
      values.soc * scoreConfig.soc +
      values.response * scoreConfig.response +
      values.research * scoreConfig.research
  );

  dial.style.setProperty('--score', total);
  scoreValue.textContent = total;

  let label = 'C';
  let hint = 'Core controls need hardening. Start with identity and SOC visibility.';
  if (total >= 85) {
    label = 'A';
    hint = 'High maturity. Focus on advanced simulation and AI threat preemption.';
  } else if (total >= 70) {
    label = 'B';
    hint = 'Balanced baseline. Prioritize SOC tuning and automated response playbooks.';
  }

  grade.textContent = `Grade: ${label}`;
  advice.textContent = hint;

  const barsData = [
    values.identity,
    values.soc,
    values.response,
    values.research,
    Math.min(100, values.soc + 8),
    Math.max(20, values.identity - 10),
  ];
  bars.forEach((bar, idx) => {
    bar.style.setProperty('--h', `${barsData[idx]}%`);
  });
}

form.addEventListener('input', renderScore);
renderScore();
