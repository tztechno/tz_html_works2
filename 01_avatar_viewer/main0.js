import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- グローバル変数 ---
let scene, camera, renderer, controls;
let mixer; // アニメーションミキサー
const clock = new THREE.Clock(); // 経過時間計算用

// --- ファイルパス ---
const COMBINED_FBX_PATH = 'fbx/Jumping.fbx'; // 統合されたFBXファイル

// --- 初期化関数 ---
function init() {
    // 1. シーンとカメラ
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(100, 200, 300);

    // 2. ライト (簡略化)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 3. レンダラー
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // 4. コントロール
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    // 5. 床（グリッド）
    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    // 6. FBXロード開始
    loadCombinedFBX();

    window.addEventListener('resize', onWindowResize);
}

// --- リサイズ処理 ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- 統合型FBXのロード関数 ---
function loadCombinedFBX() {
    const loader = new FBXLoader();

    loader.load(COMBINED_FBX_PATH, (object) => {
        
        // 1. モデルのセットアップ
        object.scale.setScalar(1); 
        object.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(object);
        
        // 2. アニメーションの設定
        if (object.animations && object.animations.length > 0) {
            mixer = new THREE.AnimationMixer(object);
            
            // 統合FBX内の最初のアニメーションを適用
            const clip = object.animations[0];
            const action = mixer.clipAction(clip);
            action.play();
            
            console.log(`統合FBXロード完了。アニメーション名: ${clip.name}`);
        } else {
            console.log('統合FBXロード完了。アニメーションクリップが見つかりませんでした。');
        }
        
    }, undefined, (error) => {
        console.error('FBXロードエラー:', error);
    });
}


// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // アニメーションミキサーの更新
    if (mixer) {
        mixer.update(delta);
    }

    controls.update();
    renderer.render(scene, camera);
}


// --- 実行 ---
init();
animate();