import * as Box2D from "../../Box2D";
import { MAP_HEIGHT, MAP_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH } from "../../enum/GameEnv";
import { v4 as uuidv4} from 'uuid';
import { InGameData } from "../../gameData";

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
    this.objectBodyDef.userData = new InGameData(uuidv4(), "ball");
    this.objectFixtureDef.shape = new Box2D.CircleShape().Set(new Box2D.Vec2(0,0),1);
    //density 특별한 경우가 아니면 물의 밀도 1000g/cm^3 적용
    this.objectFixtureDef.userData = "ball";
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0 // temp
    this.objectFixtureDef.restitution = 1;
  }
}

export class GroundDef extends ObjectDefBase{
  constructor(){
    super();
    const vs : Box2D.Vec2[] = [
      new Box2D.Vec2(-MAP_WIDTH,MAP_HEIGHT),
      new Box2D.Vec2(MAP_WIDTH,MAP_HEIGHT),
      new Box2D.Vec2(MAP_WIDTH,-MAP_HEIGHT),
      new Box2D.Vec2(-MAP_WIDTH,-MAP_HEIGHT),
    ]; // game box 크기 나중에 조절 해야함
    this.objectBodyDef.userData = new InGameData(uuidv4(), "ground");
    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs);
    this.objectFixtureDef.userData = "ground";
    this.objectFixtureDef.friction = 0;
  }
}

export class PaddleDef extends ObjectDefBase {
  constructor (x: number, y: number, id : string){
    super();
    //this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
    this.objectBodyDef.position.Set(x, y);
    this.objectBodyDef.userData = new InGameData(uuidv4(), "paddle");
    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(PADDLE_WIDTH, PADDLE_HEIGHT);
    this.objectFixtureDef.userData = "paddle";
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0;
    this.objectFixtureDef.restitution = 1;
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

export class PinDef extends ObjectDefBase {
  constructor(posX: number, posY: number){
    super();
    this.objectBodyDef.position.Set(posX, posY); //temp
    this.objectBodyDef.userData = new InGameData(uuidv4(), "pin");
    this.objectFixtureDef.shape = new Box2D.CircleShape();
    this.objectFixtureDef.userData = "pin";
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0; // temp
    this.objectFixtureDef.isSensor = true;
  }
}

export class RectangleDef extends ObjectDefBase {
  constructor(posX: number, posY: number){
    super();
    this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
    this.objectBodyDef.position.Set(posX, posY);
    this.objectBodyDef.userData = new InGameData(uuidv4(), "rectangle");
    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(2,1);
    this.objectFixtureDef.userData = "rectangle";
    this.objectFixtureDef.friction = 0;
    this.objectFixtureDef.restitution = 1;
    this.objectFixtureDef.density = 1000;
  }
}