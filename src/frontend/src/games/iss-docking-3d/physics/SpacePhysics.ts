import type { World, RigidBody } from '@dimforge/rapier3d-compat';
import { Vector3, Quaternion } from 'three';

export class SpacePhysics {
  private world: World;
  private shipBody: RigidBody;
  private issBody: RigidBody;

  constructor(world: World) {
    this.world = world;
    this.world.gravity = { x: 0, y: 0, z: 0 };
    
    // Initialize ship
    const RAPIER = (globalThis as any).RAPIER;
    const shipDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 0, 50)
      .setLinearDamping(0.05)
      .setAngularDamping(0.1);
    this.shipBody = this.world.createRigidBody(shipDesc);
    
    // Shape for the ship (capsule or box)
    const shipColliderDesc = RAPIER.ColliderDesc.cuboid(1, 1, 2);
    this.world.createCollider(shipColliderDesc, this.shipBody);

    // Initialize ISS (fixed or kinematic)
    const issDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(0, 0, 0);
    this.issBody = this.world.createRigidBody(issDesc);
    
    const issColliderDesc = RAPIER.ColliderDesc.cuboid(5, 5, 5);
    this.world.createCollider(issColliderDesc, this.issBody);
  }

  public step() {
    this.world.step();
  }

  public applyShipForce(thrust: { x: number, y: number, z: number }, torque: { x: number, y: number, z: number }) {
    // Get ship's current rotation
    const rot = this.shipBody.rotation();
    const q = new Quaternion(rot.x, rot.y, rot.z, rot.w);
    
    // Transform local thrust into world-space force
    const v = new Vector3(thrust.x, thrust.y, thrust.z);
    v.applyQuaternion(q);

    this.shipBody.applyImpulse({ x: v.x, y: v.y, z: v.z }, true);
    this.shipBody.applyTorqueImpulse(torque, true);
  }

  public getShipState() {
    return {
      translation: this.shipBody.translation(),
      rotation: this.shipBody.rotation(),
      linvel: this.shipBody.linvel(),
      angvel: this.shipBody.angvel(),
    };
  }

  public getISSState() {
    return {
      translation: this.issBody.translation(),
      rotation: this.issBody.rotation(),
    };
  }
}

export const initSpacePhysics = async () => {
  const RAPIER = await import('@dimforge/rapier3d-compat');
  await RAPIER.init();
  (globalThis as any).RAPIER = RAPIER;
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  return new SpacePhysics(world);
};
