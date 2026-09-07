/**
 * Cinematic 3D WebGL Stage Engine (Three.js)
 * Restored to Premium Stylized Aesthetic:
 * Sleek silhouettes, smooth silk materials, cinematic lighting, and 80-kali ghagra cloth simulation.
 */

class Story3DScene {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.currentSceneIndex = 1;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Scene Elements
    this.maleCharacter = null;
    this.femaleCharacter = null;
    this.ghagraSkirt = null;
    this.ghagraFlares = [];
    this.pixelPhone = null;
    this.memoryItems = [];
    this.bridge = null;
    this.gardenTable = null;
    this.petalsSystem = null;
    this.spotLight = null;
    this.moonLight = null;
    this.ambientLight = null;
    this.windowFrame = null;
    this.glassDivider = null;

    // Character Elevation & Framing
    this.baseCharY = 0.35;
    this.cameraTarget = new THREE.Vector3(0, 1.35, 0);
    this.targetCameraPos = new THREE.Vector3(0, 1.45, 3.5);
    this.targetLookAt = new THREE.Vector3(0, 1.35, 0);
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.init();
  }

  init() {
    if (!this.container) return;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02040a);
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.08);

    // 2. Camera with responsive FOV
    const w = window.innerWidth;
    const h = window.innerHeight;
    const fov = w < h ? 54 : 44;
    this.camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
    this.camera.position.set(0, 1.45, 3.5);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);

    // 4. Setup Lighting, Ground, Characters & Props
    this.setupLighting();
    this.setupGround();
    this.setupAestheticCharacters();
    this.setupScenicProps();
    this.setupPetals();

    // 5. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });

    // 6. Animation Loop
    this.animate();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x0f1c42, 2.2);
    this.scene.add(this.ambientLight);

    this.moonLight = new THREE.DirectionalLight(0x93c5fd, 3.0);
    this.moonLight.position.set(4, 8, 3.5);
    this.moonLight.castShadow = true;
    this.scene.add(this.moonLight);

    this.spotLight = new THREE.SpotLight(0x60a5fa, 6.0, 18, Math.PI / 4, 0.35, 1.4);
    this.spotLight.position.set(0, 6, 2);
    this.spotLight.target.position.set(0, 1.35, 0);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);

    this.warmPoint = new THREE.PointLight(0xfbbf24, 0, 6);
    this.warmPoint.position.set(0, 1.3, 0);
    this.scene.add(this.warmPoint);
  }

  setupGround() {
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050a18,
      roughness: 0.25,
      metalness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = this.baseCharY;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createAestheticCharacter(isFemale = false) {
    const group = new THREE.Group();

    // Clean, aesthetic porcelain & silk materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: isFemale ? 0xf7e8df : 0xe8d5c8,
      roughness: 0.35,
      metalness: 0.08,
      emissive: 0x1e293b,
      emissiveIntensity: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: isFemale ? 0x0f0e14 : 0x16151e,
      roughness: 0.3,
      metalness: 0.2
    });

    const suitNavyMat = new THREE.MeshStandardMaterial({
      color: 0x08132b,
      roughness: 0.4,
      metalness: 0.3
    });

    const royalBlueSilk = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.18,
      metalness: 0.48
    });

    // Head
    const headGroup = new THREE.Group();
    const faceGeo = new THREE.SphereGeometry(0.125, 32, 32);
    faceGeo.scale(1, 1.25, 1.05);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.position.y = 1.56;
    face.castShadow = true;
    headGroup.add(face);

    // Hair
    if (isFemale) {
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.138, 28, 28), hairMat);
      hairTop.scale.set(1.06, 1.15, 1.12);
      hairTop.position.set(0, 1.6, -0.02);
      headGroup.add(hairTop);

      const hairStrandGeo = new THREE.CylinderGeometry(0.038, 0.02, 0.38, 14);
      const leftStrand = new THREE.Mesh(hairStrandGeo, hairMat);
      leftStrand.position.set(-0.1, 1.4, 0.04);
      leftStrand.rotation.z = -0.15;
      headGroup.add(leftStrand);

      const rightStrand = new THREE.Mesh(hairStrandGeo, hairMat);
      rightStrand.position.set(0.1, 1.4, 0.04);
      rightStrand.rotation.z = 0.15;
      headGroup.add(rightStrand);
    } else {
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.136, 28, 28), hairMat);
      hairTop.scale.set(1.04, 1.08, 1.08);
      hairTop.position.set(0, 1.62, -0.01);
      headGroup.add(hairTop);
    }

    group.add(headGroup);
    group.headMesh = headGroup;

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(isFemale ? 0.12 : 0.18, isFemale ? 0.1 : 0.15, 0.44, 24);
    const torso = new THREE.Mesh(torsoGeo, isFemale ? royalBlueSilk : suitNavyMat);
    torso.position.y = 1.18;
    torso.castShadow = true;
    group.add(torso);
    group.torsoMesh = torso;

    // Limbs / Lower Body
    if (!isFemale) {
      const legMat = new THREE.MeshStandardMaterial({ color: 0x070d1e, roughness: 0.4 });
      const legGeo = new THREE.CylinderGeometry(0.058, 0.05, 0.82, 18);

      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.08, 0.44, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.08, 0.44, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);

      const armGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.42, 16);
      const leftArm = new THREE.Mesh(armGeo, suitNavyMat);
      leftArm.position.set(-0.22, 1.12, 0.08);
      leftArm.rotation.x = Math.PI / 4;
      leftArm.rotation.z = -Math.PI / 12;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, suitNavyMat);
      rightArm.position.set(0.22, 1.12, 0.08);
      rightArm.rotation.x = Math.PI / 4;
      rightArm.rotation.z = Math.PI / 12;
      group.add(rightArm);

      // Glowing phone
      const phoneGroup = new THREE.Group();
      const phoneGeo = new THREE.BoxGeometry(0.055, 0.11, 0.009);
      const phoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const phone = new THREE.Mesh(phoneGeo, phoneMat);

      const screenGeo = new THREE.PlaneGeometry(0.05, 0.1);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.005;
      phone.add(screen);

      phoneGroup.add(phone);
      phoneGroup.position.set(0, 1.02, 0.22);
      phoneGroup.rotation.x = -Math.PI / 5;
      group.add(phoneGroup);
      group.phoneMesh = phoneGroup;
    } else {
      // 80-Kali Ghagra Simulation
      const skirtGroup = new THREE.Group();
      const kaliCount = 36;
      const skirtHeight = 0.94;
      const topRadius = 0.12;
      const bottomRadius = 0.88;

      const ghagraMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.18,
        metalness: 0.48,
        side: THREE.DoubleSide
      });

      const silverHemMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x93c5fd,
        emissiveIntensity: 0.4
      });

      for (let i = 0; i < kaliCount; i++) {
        const angle = (i / kaliCount) * Math.PI * 2;
        const panelGeo = new THREE.PlaneGeometry(0.13, skirtHeight, 4, 8);
        const panel = new THREE.Mesh(panelGeo, ghagraMat);

        const px = Math.cos(angle) * (topRadius + bottomRadius) * 0.46;
        const pz = Math.sin(angle) * (topRadius + bottomRadius) * 0.46;
        panel.position.set(px, 0.47, pz);
        panel.rotation.y = -angle + Math.PI / 2;
        panel.rotation.x = 0.34;
        panel.castShadow = true;

        const hemGeo = new THREE.BoxGeometry(0.13, 0.032, 0.014);
        const hem = new THREE.Mesh(hemGeo, silverHemMat);
        hem.position.set(0, -skirtHeight / 2 + 0.02, 0.01);
        panel.add(hem);

        skirtGroup.add(panel);
        this.ghagraFlares.push(panel);
      }

      group.add(skirtGroup);
      this.ghagraSkirt = skirtGroup;
      group.skirtMesh = skirtGroup;
    }

    return group;
  }

  setupAestheticCharacters() {
    this.maleCharacter = this.createAestheticCharacter(false);
    this.maleCharacter.position.set(-0.45, this.baseCharY, 0);
    this.scene.add(this.maleCharacter);

    this.femaleCharacter = this.createAestheticCharacter(true);
    this.femaleCharacter.position.set(0.45, this.baseCharY, 0);
    this.femaleCharacter.rotation.y = -Math.PI / 6;
    this.scene.add(this.femaleCharacter);
  }

  setupScenicProps() {
    // 1. Night Window
    const windowGroup = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(2.2, 2.6, 0.08);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x091124, roughness: 0.7 });
    const winMesh = new THREE.Mesh(frameGeo, frameMat);
    winMesh.position.set(0, 1.8, -1.6);
    windowGroup.add(winMesh);

    const bokehGeo = new THREE.BufferGeometry();
    const bokehCount = 40;
    const bokehPos = new Float32Array(bokehCount * 3);
    for (let i = 0; i < bokehCount * 3; i += 3) {
      bokehPos[i] = (Math.random() - 0.5) * 3.5;
      bokehPos[i + 1] = Math.random() * 2.2 + 0.8;
      bokehPos[i + 2] = -2.2 - Math.random() * 1.5;
    }
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    const bokehMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const bokeh = new THREE.Points(bokehGeo, bokehMat);
    windowGroup.add(bokeh);
    this.scene.add(windowGroup);
    this.windowFrame = windowGroup;

    // 2. Memory Bubbles
    this.memoryItemsGroup = new THREE.Group();
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75
    });
    for (let i = 0; i < 5; i++) {
      const bubble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 1), bubbleMat);
      bubble.position.set((i - 2) * 0.55, 1.8 + Math.sin(i) * 0.25, (Math.random() - 0.5) * 0.6);
      this.memoryItemsGroup.add(bubble);
      this.memoryItems.push(bubble);
    }
    this.memoryItemsGroup.visible = false;
    this.scene.add(this.memoryItemsGroup);

    // 3. Glass Divider
    const divideGeo = new THREE.BoxGeometry(0.035, 2.8, 2.8);
    const divideMat = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      ior: 1.5
    });
    this.glassDivider = new THREE.Mesh(divideGeo, divideMat);
    this.glassDivider.position.set(0, 1.7, 0);
    this.glassDivider.visible = false;
    this.scene.add(this.glassDivider);

    // 4. Google Pixel 9a 3D Model
    this.pixelPhoneGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.34, 0.68, 0.034);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 });
    const phoneBody = new THREE.Mesh(bodyGeo, bodyMat);
    phoneBody.castShadow = true;

    const visorGeo = new THREE.BoxGeometry(0.34, 0.12, 0.05);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.1, emissive: 0x3b82f6, emissiveIntensity: 0.3 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.2, 0.014);
    phoneBody.add(visor);

    const lensMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const lens1 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 16), lensMat);
    lens1.rotation.x = Math.PI / 2;
    lens1.position.set(-0.05, 0.2, 0.04);
    phoneBody.add(lens1);

    const lens2 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 16), lensMat);
    lens2.rotation.x = Math.PI / 2;
    lens2.position.set(0.01, 0.2, 0.04);
    phoneBody.add(lens2);

    const haloGeo = new THREE.TorusGeometry(0.46, 0.008, 16, 44);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.6 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    phoneBody.add(halo);

    this.pixelPhoneGroup.add(phoneBody);
    this.pixelPhoneGroup.position.set(0.5, 1.5, 0.5);
    this.pixelPhoneGroup.visible = false;
    this.scene.add(this.pixelPhoneGroup);
    this.pixelPhone = this.pixelPhoneGroup;

    // 5. Bridge
    const bridgeGeo = new THREE.BoxGeometry(1.5, 0.07, 4.5);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x2563eb,
      emissiveIntensity: 0.45,
      roughness: 0.3,
      metalness: 0.7
    });
    this.bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    this.bridge.position.set(0, this.baseCharY + 0.05, -0.8);
    this.bridge.visible = false;
    this.scene.add(this.bridge);

    // 6. Garden Table
    this.gardenTableGroup = new THREE.Group();
    const tableGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.035, 24);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const tableTop = new THREE.Mesh(tableGeo, tableMat);
    tableTop.position.y = 0.8;
    this.gardenTableGroup.add(tableTop);

    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.8, 16);
    const tableLeg = new THREE.Mesh(legGeo, tableMat);
    tableLeg.position.y = 0.4;
    this.gardenTableGroup.add(tableLeg);

    const vaseGeo = new THREE.CylinderGeometry(0.07, 0.045, 0.2, 16);
    const vaseMat = new THREE.MeshPhysicalMaterial({ color: 0x60a5fa, transmission: 0.8, opacity: 0.7, transparent: true });
    const vase = new THREE.Mesh(vaseGeo, vaseMat);
    vase.position.set(0, 0.92, 0);
    this.gardenTableGroup.add(vase);

    const roseGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const roseMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    const rose = new THREE.Mesh(roseGeo, roseMat);
    rose.position.set(0, 1.05, 0);
    this.gardenTableGroup.add(rose);

    this.gardenTableGroup.position.set(0, this.baseCharY, 0);
    this.gardenTableGroup.visible = false;
    this.scene.add(this.gardenTableGroup);
    this.gardenTable = this.gardenTableGroup;
  }

  setupPetals() {
    const count = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 5 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speeds.push({
        y: Math.random() * 0.007 + 0.003,
        x: (Math.random() - 0.5) * 0.002,
        rot: Math.random() * 0.02
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.07,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.petalsSystem = new THREE.Points(geometry, material);
    this.petalsSpeeds = speeds;
    this.scene.add(this.petalsSystem);
  }

  setScene(sceneNum) {
    this.currentSceneIndex = sceneNum;

    switch (sceneNum) {
      case 1:
        this.targetCameraPos.set(0, 1.45, 3.4);
        this.targetLookAt.set(-0.2, 1.35, 0);
        this.maleCharacter.position.set(-0.35, this.baseCharY, 0);
        this.maleCharacter.rotation.y = Math.PI / 8;
        this.femaleCharacter.visible = false;
        this.windowFrame.visible = true;
        this.memoryItemsGroup.visible = false;
        this.glassDivider.visible = false;
        this.pixelPhone.visible = false;
        this.bridge.visible = false;
        this.gardenTable.visible = false;
        this.spotLight.intensity = 2.2;
        this.spotLight.position.set(-0.4, 5, 1.5);
        this.spotLight.target.position.set(-0.35, 1.35, 0);
        break;

      case 2:
        this.targetCameraPos.set(0, 1.45, 3.6);
        this.targetLookAt.set(0, 1.35, 0);
        this.maleCharacter.visible = true;
        this.femaleCharacter.visible = true;
        this.maleCharacter.position.set(-0.45, this.baseCharY, 0);
        this.femaleCharacter.position.set(0.45, this.baseCharY, 0);
        this.maleCharacter.rotation.y = Math.PI / 10;
        this.femaleCharacter.rotation.y = -Math.PI / 10;
        this.windowFrame.visible = false;
        this.memoryItemsGroup.visible = true;
        this.glassDivider.visible = false;
        this.pixelPhone.visible = false;
        this.bridge.visible = false;
        this.gardenTable.visible = false;
        this.spotLight.intensity = 3.6;
        break;

      case 3:
        this.targetCameraPos.set(0, 1.45, 3.5);
        this.targetLookAt.set(0, 1.35, 0);
        this.maleCharacter.position.set(-0.7, this.baseCharY, 0);
        this.femaleCharacter.position.set(0.7, this.baseCharY, 0);
        this.femaleCharacter.rotation.y = Math.PI * 0.85;
        this.maleCharacter.rotation.y = Math.PI / 4;
        this.windowFrame.visible = false;
        this.memoryItemsGroup.visible = false;
        this.glassDivider.visible = true;
        this.pixelPhone.visible = false;
        this.bridge.visible = false;
        this.gardenTable.visible = false;
        this.spotLight.intensity = 2.8;
        break;

      case 4:
        this.targetCameraPos.set(-0.3, 1.4, 2.6);
        this.targetLookAt.set(-0.3, 1.3, 0);
        this.maleCharacter.position.set(-0.3, this.baseCharY, 0);
        this.maleCharacter.rotation.y = 0;
        if (this.maleCharacter.headMesh) {
          this.maleCharacter.headMesh.rotation.x = 0.32;
        }
        this.femaleCharacter.visible = false;
        this.glassDivider.visible = false;
        this.spotLight.intensity = 5.5;
        this.spotLight.position.set(-0.3, 5.5, 1);
        this.spotLight.target.position.set(-0.3, 1.3, 0);
        break;

      case 5:
        this.targetCameraPos.set(0, 1.4, 3.2);
        this.targetLookAt.set(0, 1.3, 0);
        this.maleCharacter.visible = false;
        this.femaleCharacter.visible = true;
        this.femaleCharacter.position.set(0, this.baseCharY, 0);
        this.femaleCharacter.rotation.y = 0;
        this.glassDivider.visible = false;
        this.pixelPhone.visible = true;
        this.spotLight.intensity = 4.8;
        this.spotLight.position.set(0, 5.5, 2);
        this.spotLight.target.position.set(0, 1.3, 0);
        break;

      case 6:
        this.targetCameraPos.set(0, 1.45, 3.4);
        this.targetLookAt.set(0, 1.35, 0);
        this.maleCharacter.visible = true;
        this.maleCharacter.position.set(0, this.baseCharY, 0);
        this.femaleCharacter.visible = false;
        this.pixelPhone.visible = false;
        this.glassDivider.visible = false;
        this.spotLight.intensity = 3.6;
        break;

      case 7:
        this.targetCameraPos.set(0, 1.55, 4.0);
        this.targetLookAt.set(0, 1.35, -0.8);
        this.maleCharacter.visible = true;
        this.femaleCharacter.visible = true;
        this.maleCharacter.position.set(0, this.baseCharY, 0.6);
        this.femaleCharacter.position.set(0, this.baseCharY, -2.2);
        this.femaleCharacter.rotation.y = 0;
        this.bridge.visible = true;
        this.pixelPhone.visible = false;
        this.gardenTable.visible = false;
        this.spotLight.intensity = 3.8;
        break;

      case 8:
        this.targetCameraPos.set(0, 1.4, 3.0);
        this.targetLookAt.set(0, 1.25, 0);
        this.maleCharacter.visible = true;
        this.femaleCharacter.visible = true;
        this.maleCharacter.position.set(-0.6, this.baseCharY, 0);
        this.maleCharacter.rotation.y = Math.PI / 3;
        this.femaleCharacter.position.set(0.6, this.baseCharY, 0);
        this.femaleCharacter.rotation.y = -Math.PI / 3;
        this.bridge.visible = false;
        this.gardenTable.visible = true;
        this.spotLight.intensity = 3.5;
        this.warmPoint.intensity = 2.5;
        break;

      case 9:
      case 10:
        this.targetCameraPos.set(-0.25, 1.4, 2.4);
        this.targetLookAt.set(-0.25, 1.35, 0);
        this.maleCharacter.visible = true;
        this.femaleCharacter.visible = false;
        this.maleCharacter.position.set(-0.25, this.baseCharY, 0);
        this.maleCharacter.rotation.y = 0;
        if (this.maleCharacter.headMesh) this.maleCharacter.headMesh.rotation.x = -0.05;
        this.gardenTable.visible = false;
        this.spotLight.intensity = 4.5;
        break;
    }
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.fov = w < h ? 54 : 44;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 0.35;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 0.25;
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.25;
      this.mouse.targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.15;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.camera.position.x += (this.targetCameraPos.x + this.mouse.x - this.camera.position.x) * 0.04;
    this.camera.position.y += (this.targetCameraPos.y - this.mouse.y - this.camera.position.y) * 0.04;
    this.camera.position.z += (this.targetCameraPos.z - this.camera.position.z) * 0.04;

    this.cameraTarget.lerp(this.targetLookAt, 0.04);
    this.camera.lookAt(this.cameraTarget);

    if (this.femaleCharacter && this.femaleCharacter.visible) {
      if (this.currentSceneIndex === 5) {
        this.femaleCharacter.rotation.y = time * 0.45;
        if (this.ghagraFlares && this.ghagraFlares.length > 0) {
          this.ghagraFlares.forEach((flare, idx) => {
            const wave = Math.sin(time * 3 + idx * 0.25) * 0.08;
            flare.rotation.x = 0.34 + wave;
          });
        }
      }
    }

    if (this.pixelPhone && this.pixelPhone.visible) {
      this.pixelPhone.position.y = 1.45 + Math.sin(time * 1.8) * 0.06;
      this.pixelPhone.rotation.y = time * 0.6;
      this.pixelPhone.rotation.x = Math.sin(time * 1.2) * 0.1;
    }

    if (this.memoryItems && this.memoryItems.length > 0) {
      this.memoryItems.forEach((item, i) => {
        item.position.y = 1.8 + Math.sin(time * 2 + i * 1.2) * 0.12;
        item.rotation.x += 0.01;
        item.rotation.y += 0.015;
      });
    }

    if (this.petalsSystem) {
      const positions = this.petalsSystem.geometry.attributes.position.array;
      for (let i = 0; i < this.petalsSpeeds.length; i++) {
        positions[i * 3 + 1] -= this.petalsSpeeds[i].y;
        positions[i * 3] += Math.sin(time + i) * 0.002;
        if (positions[i * 3 + 1] < this.baseCharY - 0.2) {
          positions[i * 3 + 1] = 5;
        }
      }
      this.petalsSystem.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global 3D Manager
window.story3D = null;
document.addEventListener('DOMContentLoaded', () => {
  window.story3D = new Story3DScene();
});
