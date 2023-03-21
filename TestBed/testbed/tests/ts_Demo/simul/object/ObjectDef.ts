import * as Box2D from "@box2d";
import { MAP_HEIGHT, MAP_WIDTH } from "../../gameEnv/GameEnv.js";
import {InGameData } from "./InGameObjectData.js";

export enum ObjectType{
  BALL,
  PADDLE,
  //etc..
}
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
    this.objectBodyDef.userData = new InGameData("ball", ObjectType.BALL);
    this.objectFixtureDef.shape = new Box2D.CircleShape().Set(new Box2D.Vec2(0,0),2);
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
    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs);//맞나?
    this.objectFixtureDef.friction = 0.3;
  }
}

export class PaddleDef extends ObjectDefBase {
  constructor (x: number, y: number, id : string){
    super();
    //this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
    this.objectBodyDef.position.Set(x, y);
    this.objectBodyDef.userData = new InGameData(id, ObjectType.PADDLE);
    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(1, 5);//temp 값 이라 수정 해야함
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
    this.objectFixtureDef.shape = new Box2D.CircleShape();
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.friction = 0 // temp
    this.objectFixtureDef.isSensor = true;
  }
}

export class RectangleDef extends ObjectDefBase {
  constructor(posX: number, posY: number){
    super();
    this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
    this.objectBodyDef.position.Set(posX, posY);//temp

    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(2,1);
    this.objectFixtureDef.friction = 0;
    this.objectFixtureDef.restitution = 1;
    this.objectFixtureDef.density = 1000;
    this.objectFixtureDef.userData = "rectangle";
  }
}