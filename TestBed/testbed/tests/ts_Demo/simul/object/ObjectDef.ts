import * as Box2D from "@box2d";

export class ObjectDefBase {
  public objectBodyDef : Box2D.BodyDef;
  public objectFixtureDef : Box2D.FixtureDef;
  constructor (){
    this.objectBodyDef = new Box2D.BodyDef();
    this.objectFixtureDef = new Box2D.FixtureDef();
  }
}

export class BallDef extends ObjectDefBase{
  constructor(){
    super();
    this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
    this.objectFixtureDef.shape = new Box2D.CircleShape().Set(new Box2D.Vec2(0,0),2);
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0.2 // temp
    this.objectFixtureDef.restitution = 1;
  }
}

export class GroundDef extends ObjectDefBase{
  constructor(){
    super();
    const vs : Box2D.Vec2[] = [
      new Box2D.Vec2(-50,25),
      new Box2D.Vec2(50,25),
      new Box2D.Vec2(50,-25),
      new Box2D.Vec2(-50,-25),
    ]; // game box 크기 나중에 조절 해야함
    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs);//맞나?
    this.objectFixtureDef.friction = 0;
  }
}

export class PaddleDef extends ObjectDefBase {
  constructor (x: number, y: number){
    super();
    //this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
    this.objectBodyDef.position.Set(x, y);
    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(1, 5);//temp 값 이라 수정 해야함
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0.3;
    this.objectFixtureDef.restitution = 0.8;
  }
}

export class ItemDef extends ObjectDefBase {
  constructor(){
    super();
    this.objectFixtureDef.shape = new Box2D.CircleShape();
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0 // temp
    this.objectFixtureDef.isSensor = true;
  }
}