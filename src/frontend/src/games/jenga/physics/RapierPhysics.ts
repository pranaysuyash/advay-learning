import RAPIER from '@dimforge/rapier3d-compat';
import { JENGA_CONSTANTS } from '../config/constants';

export interface PhysicsWorldConfig {
  gravity: { x: number; y: number; z: number };
  timestep: number;
  substeps: number;
}

export interface SupportInfo {
  supportCount: number;
  supportingBlocks: string[];
}

export class RapierPhysics {
  world: RAPIER.World;
  rapierModule: typeof RAPIER;
  
  private eventQueue: RAPIER.EventQueue;
  private bodies: Map<string, RAPIER.RigidBody> = new Map();
  private colliders: Map<string, RAPIER.Collider> = new Map();
  private colliderOwners: Map<number, string> = new Map();
  private supportMap: Map<string, Set<string>> = new Map();
  private frameCount: number = 0;
  private supportMapDirty: boolean = true;
  private lastSupportRecomputeFrame: number = 0;
  
  constructor(rapierModule: typeof RAPIER, config: PhysicsWorldConfig) {
    this.rapierModule = rapierModule;
    // Note: Rapier shows deprecation warning but this is the correct API for this version
    this.world = new RAPIER.World(config.gravity);
    this.eventQueue = new RAPIER.EventQueue(true);
  }
  
  step(): void {
    this.world.step(this.eventQueue);
    this.frameCount += 1;
    const shouldRefreshSupport =
      this.supportMapDirty ||
      this.frameCount - this.lastSupportRecomputeFrame >= 20 ||
      (this.frameCount % 4 === 0 && this.hasActiveBodies());
    if (shouldRefreshSupport) {
      this.recomputeSupportMap();
      this.supportMapDirty = false;
      this.lastSupportRecomputeFrame = this.frameCount;
    }
    this.eventQueue.drainCollisionEvents((_handle1, _handle2, _started) => {
      // Could add collision sound effects here
    });
  }
  
  createGround(): void {
    const RAPIER = this.rapierModule;
    
    const groundDesc = RAPIER.RigidBodyDesc
      .fixed()
      .setTranslation(0, -0.1, 0);
    
    const ground = this.world.createRigidBody(groundDesc);
    
    const colliderDesc = RAPIER.ColliderDesc
      .cuboid(50, 0.1, 50)
      .setFriction(1.0)
      .setRestitution(0.0);
    
    this.world.createCollider(colliderDesc, ground);
  }
  
  createBlock(
    _id: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number; w: number }
  ): RAPIER.RigidBody {
    const RAPIER = this.rapierModule;
    const { WIDTH, HEIGHT, LENGTH } = JENGA_CONSTANTS.BLOCK;
    const { MASS, FRICTION, RESTITUTION, CCD_ENABLED } = JENGA_CONSTANTS.PHYSICS;
    
    const bodyDesc = RAPIER.RigidBodyDesc
      .dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setRotation(rotation)
      .setCcdEnabled(CCD_ENABLED)
      .setLinearDamping(JENGA_CONSTANTS.PHYSICS.LINEAR_DAMPING)
      .setAngularDamping(JENGA_CONSTANTS.PHYSICS.ANGULAR_DAMPING);
    
    const body = this.world.createRigidBody(bodyDesc);
    
    const colliderDesc = RAPIER.ColliderDesc
      .cuboid(WIDTH, HEIGHT, LENGTH)
      .setMass(MASS)
      .setFriction(FRICTION)
      .setRestitution(RESTITUTION);
    
    const collider = this.world.createCollider(colliderDesc, body);
    
    this.bodies.set(_id, body);
    this.colliders.set(_id, collider);
    this.colliderOwners.set(collider.handle, _id);
    this.supportMap.set(_id, new Set());
    
    return body;
  }
  
  removeBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      this.world.removeRigidBody(body);
      this.bodies.delete(id);
      const collider = this.colliders.get(id);
      if (collider) {
        this.colliderOwners.delete(collider.handle);
      }
      this.colliders.delete(id);
      this.supportMap.delete(id);
    }
  }
  
  getBody(id: string): RAPIER.RigidBody | undefined {
    return this.bodies.get(id);
  }
  
  setBodyPosition(id: string, position: { x: number; y: number; z: number }): void {
    const body = this.bodies.get(id);
    if (body) {
      body.setTranslation(position, true);
      this.supportMapDirty = true;
    }
  }
  
  setBodyRotation(id: string, rotation: { x: number; y: number; z: number; w: number }): void {
    const body = this.bodies.get(id);
    if (body) {
      body.setRotation(rotation, true);
      this.supportMapDirty = true;
    }
  }
  
  setBodyVelocity(id: string, velocity: { x: number; y: number; z: number }): void {
    const body = this.bodies.get(id);
    if (body) {
      body.setLinvel(velocity, true);
      this.supportMapDirty = true;
    }
  }
  
  wakeUpBody(id: string): void {
    const body = this.bodies.get(id);
    if (body) {
      body.wakeUp();
      this.supportMapDirty = true;
    }
  }
  
  setBodyDamping(id: string, linear: number, angular: number): void {
    const body = this.bodies.get(id);
    if (body) {
      body.setLinearDamping(linear);
      body.setAngularDamping(angular);
    }
  }
  
  reset(): void {
    // Remove all bodies
    for (const [_id, body] of this.bodies) {
      this.world.removeRigidBody(body);
    }
    this.bodies.clear();
    this.colliders.clear();
    this.colliderOwners.clear();
    this.supportMap.clear();
    this.frameCount = 0;
    this.supportMapDirty = true;
    this.lastSupportRecomputeFrame = 0;
  }

  private hasActiveBodies(): boolean {
    for (const body of this.bodies.values()) {
      if (!body.isSleeping()) {
        return true;
      }
      const velocity = body.linvel();
      const angular = body.angvel();
      const speedSq = velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z;
      const angularSq = angular.x * angular.x + angular.y * angular.y + angular.z * angular.z;
      if (speedSq > 0.0001 || angularSq > 0.0001) {
        return true;
      }
    }
    return false;
  }

  private recomputeSupportMap(): void {
    for (const supports of this.supportMap.values()) {
      supports.clear();
    }

    for (const [blockId, collider] of this.colliders) {
      const supportSet = this.supportMap.get(blockId);
      if (!supportSet) {
        continue;
      }

      this.world.contactPairsWith(collider, (otherCollider) => {
        const otherId = this.colliderOwners.get(otherCollider.handle);
        if (!otherId || otherId === blockId) {
          return;
        }

        // Avoid double-processing pairs.
        if (blockId > otherId) {
          return;
        }

        const body = collider.parent();
        const otherBody = otherCollider.parent();
        if (!body || !otherBody) {
          return;
        }

        this.world.contactPair(collider, otherCollider, (manifold) => {
          if (manifold.numContacts() === 0) {
            return;
          }

          const bodyPos = body.translation();
          const otherPos = otherBody.translation();
          const verticalDelta = bodyPos.y - otherPos.y;
          const normal = manifold.normal();
          const absNormalY = Math.abs(normal.y);

          // Support should be mostly vertical contact with a clear lower/upper relation.
          if (absNormalY < 0.45 || Math.abs(verticalDelta) < JENGA_CONSTANTS.BLOCK.HEIGHT * 0.6) {
            return;
          }

          if (verticalDelta > 0) {
            this.supportMap.get(blockId)?.add(otherId);
          } else {
            this.supportMap.get(otherId)?.add(blockId);
          }
        });
      });
    }
  }

  getSupportInfo(blockId: string): SupportInfo {
    if (this.supportMapDirty) {
      this.recomputeSupportMap();
      this.supportMapDirty = false;
      this.lastSupportRecomputeFrame = this.frameCount;
    }

    const supportSet = this.supportMap.get(blockId);
    if (!supportSet) {
      return { supportCount: 0, supportingBlocks: [] };
    }

    return {
      supportCount: supportSet.size,
      supportingBlocks: Array.from(supportSet),
    };
  }
  
  // Raycast from screen coordinates
  raycast(
    origin: { x: number; y: number; z: number },
    direction: { x: number; y: number; z: number }
  ): { body: RAPIER.RigidBody; point: { x: number; y: number; z: number }; distance: number } | null {
    const RAPIER = this.rapierModule;
    const ray = new RAPIER.Ray(origin, direction);
    const hit = this.world.castRay(ray, 100, true);
    
    if (hit) {
      const body = hit.collider.parent();
      if (!body) return null;
      const point = ray.pointAt(hit.timeOfImpact);
      return {
        body,
        point: { x: point.x, y: point.y, z: point.z },
        distance: hit.timeOfImpact,
      };
    }
    
    return null;
  }
  
  // Get all bodies
  getAllBodies(): RAPIER.RigidBody[] {
    return Array.from(this.bodies.values());
  }
}

// Initialize Rapier (must be called before creating physics)
export async function initRapier(): Promise<typeof RAPIER> {
  const RAPIER = await import('@dimforge/rapier3d-compat');
  await (RAPIER.init as unknown as (options?: Record<string, never>) => Promise<void>)({});
  return RAPIER;
}
