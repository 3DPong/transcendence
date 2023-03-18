import * as Box2D from '../../Box2D';

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
    this.objectFixtureDef.shape = new Box2D.CircleShape();
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0 // temp
  }
}

export class GroundDef extends ObjectDefBase{
  constructor(){
    super();
    const vs : Box2D.Vec2[] = Box2D.Vec2[4];
    vs[0].Set(0,0);
    vs[1].Set(50,0);
    vs[2].Set(50,50);
    vs[3].Set(0,50); // game box 크기 나중에 조절 해야함
    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs);//맞나?
    this.objectFixtureDef.friction = 0;
  }
}