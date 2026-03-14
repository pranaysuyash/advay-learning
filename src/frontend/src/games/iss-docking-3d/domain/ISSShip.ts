import { Vector3, Quaternion } from 'three';

export interface ShipConfig {
  mass: number;
  linearDamping: number;
  angularDamping: number;
  maxThrust: number;
  maxTorque: number;
}

export const DEFAULT_SHIP_CONFIG: ShipConfig = {
  mass: 1000,
  linearDamping: 0.05,
  angularDamping: 0.1,
  maxThrust: 500,
  maxTorque: 200,
};

export class ISSShip {
  private config: ShipConfig;
  private position: Vector3 = new Vector3();
  private rotation: Quaternion = new Quaternion();
  private velocity: Vector3 = new Vector3();
  private angularVelocity: Vector3 = new Vector3();
  
  // Thrust states (-1, 0, 1)
  private thrust: Vector3 = new Vector3();
  private torque: Vector3 = new Vector3();

  constructor(config: Partial<ShipConfig> = {}) {
    this.config = { ...DEFAULT_SHIP_CONFIG, ...config };
  }

  public setThrust(x: number, y: number, z: number) {
    this.thrust.set(x, y, z).clampScalar(-1, 1);
  }

  public setTorque(x: number, y: number, z: number) {
    this.torque.set(x, y, z).clampScalar(-1, 1);
  }

  public getThrustVector(): Vector3 {
    return this.thrust.clone().multiplyScalar(this.config.maxThrust);
  }

  public getTorqueVector(): Vector3 {
    return this.torque.clone().multiplyScalar(this.config.maxTorque);
  }

  public updateState(pos: Vector3, quat: Quaternion, vel: Vector3, angVel: Vector3) {
    this.position.copy(pos);
    this.rotation.copy(quat);
    this.velocity.copy(vel);
    this.angularVelocity.copy(angVel);
  }

  public getPosition(): Vector3 { return this.position.clone(); }
  public getRotation(): Quaternion { return this.rotation.clone(); }
  public getVelocity(): Vector3 { return this.velocity.clone(); }
  public getAngularVelocity(): Vector3 { return this.angularVelocity.clone(); }
}
