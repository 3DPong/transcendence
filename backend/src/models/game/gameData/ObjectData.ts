import * as Box2D from '../Box2D';

interface ObjectInterface {
  objectId: string; // object identifier, id must be unique
  shapeType: Box2D.ShapeType; // object type(원, 폴리곤, 체인..)
  x: number; // initial pos x
  y: number; // initial pos x
  angle: number; // initial angle
  radius?: number; // initial radius
  vertex?: Box2D.Vec2[]; // initial vertex (shape e_polygon or e_chain)
}

export class ObjectData implements ObjectInterface {
  public objectId: string;
  public shapeType: Box2D.ShapeType;
  public x: number;
  public y: number;
  public angle: number;
  public radius: number;
  public vertex: Box2D.Vec2[];
}
