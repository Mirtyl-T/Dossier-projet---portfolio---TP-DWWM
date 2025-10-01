import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-character-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-viewer.component.html',
  styleUrl: './character-viewer.component.css'
})
export class CharacterViewerComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls; 
  private animationId?: number;
  private loader = new GLTFLoader();
  private currentModel?: THREE.Group;
  private currentModelName: string = '';
  
  private availableModels = [
    { name: 'rook', path: 'assets/models/rook.glb', displayName: 'Tour' },
    { name: 'pawn', path: 'assets/models/pawn.glb', displayName: 'Pion' },
    { name: 'WoodenSword', path: 'assets/models/WoodenSword.glb', displayName: 'Epee en bois' }
  ];
 
  ngOnInit() {
    this.initThreeJS();
    this.setupLighting();
    this.setupControls();
    this.loadModel('rook'); // Charge automatiquement la tour au démarrage
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.controls?.dispose();
    this.renderer?.dispose();
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333); 
    
    this.camera = new THREE.PerspectiveCamera(
      45,    
      canvas.clientWidth / canvas.clientHeight, 
      0.1,   
      1000  
    );
    this.camera.position.set(3, 3, 5); 
    
    // Créer d'abord le renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // Puis configurer les ombres
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupLighting() {
    // Lumière ambiante (éclaire fort)
    const ambientLight = new THREE.AmbientLight(0x404040, 13);
    this.scene.add(ambientLight);

    // Lumière pour casser les ombre (éclaire fort)
    const spotLight = new THREE.SpotLight(0xffffff, 15);
    spotLight.position.set(-2, 8, -3);
    spotLight.target.position.set(0, 1, 0); // ← Vers où elle pointe
    spotLight.angle = Math.PI / 1; // ← Angle du cône
    spotLight.penumbra = 0.2; // ← Douceur des bords
    spotLight.distance = 20;
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);
    
    // Lumière directionnelle (comme le soleil)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Sol simple pour poser le personnage
    const groundGeometry = new THREE.PlaneGeometry(15, 15);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.name = 'ground';
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0,2,0);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private setupControls() {
    const canvas = this.canvasRef.nativeElement;
    this.controls = new OrbitControls(this.camera, canvas);
    
    this.controls.enableDamping = true; // Animation fluide
    this.controls.dampingFactor = 0.05; // Vitesse de l'animation
    this.controls.enableZoom = true;    // Zoom avec la molette
    this.controls.enableRotate = true;  // Rotation avec clic gauche
    this.controls.enablePan = true;     // Déplacement avec clic droit
    this.controls.target.set(0, 1, 0);
  }

  // Charge un modèle par son nom
  loadModel(modelName: string) {
    const model = this.availableModels.find(m => m.name === modelName);
    
    if (!model) {
      console.error(`Modèle "${modelName}" introuvable`);
      return;
    }

    console.log(` Chargement de ${model.displayName}...`);
    this.currentModelName = modelName;
    
    this.loader.load(
      model.path,
      (gltf) => {
        console.log(` ${model.displayName} chargé avec succès!`, gltf);
        
        // Supprime l'ancien modèle
        if (this.currentModel) {
          this.scene.remove(this.currentModel);
        }
        
        // Ajoute le nouveau modèle
        this.currentModel = gltf.scene;        
        // Active les ombres
        this.currentModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(this.currentModel);
        this.centerModel();
        
        // Met à jour l'interface
        this.updateActiveButton(modelName);
      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log(` ${model.displayName} : ${percent}%`);
      },
      (error) => {
        console.error(` Erreur chargement ${model.displayName}:`, error);
        alert(`Impossible de charger ${model.displayName}. Vérifie que le fichier existe dans assets/models/`);
      }
    );
  }

  // Met à jour le bouton actif
  private updateActiveButton(modelName: string) {
    // Retire la classe active de tous les boutons
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Trouve le bon bouton et ajoute la classe active
    const buttons = document.querySelectorAll('.model-btn');
    buttons.forEach((btn) => {
      const buttonText = btn.textContent?.toLowerCase();
      const modelDisplayName = this.availableModels.find(m => m.name === modelName)?.displayName.toLowerCase();
      
      if (buttonText && modelDisplayName && buttonText.includes(modelDisplayName.split(' ')[0])) {
        btn.classList.add('active');
      }
    });
  }


  private centerModel() {
    if (!this.currentModel) return;
    
    const box = new THREE.Box3().setFromObject(this.currentModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const ground = this.scene.getObjectByName('ground'); // On nomme le sol

    this.currentModel.position.sub(center);
    this.currentModel.position.y = size.y / 2; 

    if (ground) {
      const lowestPoint = size.y / 2; 
      ground.position.y = lowestPoint - 0.01; 
    }
   
    const distance = Math.max(size.x, size.y, size.z) * 2;
    this.camera.position.set(distance, distance , distance);
    this.controls.target.set(0, size.y * 0.4, 0);
    this.controls.update();
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}