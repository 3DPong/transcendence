interface RenderInterface {
  objectId : string; // object identifier, id must be unique
  x : number;         // initial pos x
  y : number;         // initial pos x
  angle : number;     // initial angle
}

export class RenderData implements RenderInterface {
  public objectId : string;
  public x : number;
  public y : number;
  public angle : number;

}